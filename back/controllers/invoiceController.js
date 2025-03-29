const { Order, User, Customer, Invoice } = require("../models");
const { generateInvoicePDF } = require("../services/invoiceGenerator");
const filesController = require("./filesController");
const { Op } = require("sequelize"); // Add this import

// Helper function to clean address from URLs and HTML tags
const cleanAddress = (address) => {
  return address
    .replace(/<[^>]*>/g, "")
    .split("https://")[0]
    .trim()
    .replace(/\n+/g, ", ");
};

// Helper function to clean client name from surrounding asterisks
const cleanName = (name) => {
  // Check if name starts and ends with asterisks
  if (name.startsWith("*") && name.endsWith("*")) {
    return name.slice(1, -1);
  }
  // Check if name only has asterisks at the beginning
  else if (name.startsWith("*")) {
    return name.slice(1);
  }
  // Check if name only has asterisks at the end
  else if (name.endsWith("*")) {
    return name.slice(0, -1);
  }
  // Handle multiple asterisks
  return name.replace(/\*/g, "");
};

// Helper to generate a unique invoice number
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Get count of invoices this month for sequential numbering
  const count = await Invoice.count({
    where: {
      invoiceNumber: {
        [Op.like]: `INV-${year}${month}-%`,
      },
    },
  });

  // Format: INV-YYYYMM-0001
  const sequence = String(count + 1).padStart(4, "0");
  return `INV-${year}${month}-${sequence}`;
};

exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(
      `[INVOICE] Request to generate/download invoice for order ${orderId}`
    );

    // Check if invoice already exists for this order
    let existingInvoice = await Invoice.findOne({
      where: { orderId },
    });

    // If invoice exists but file isn't in S3, we'll regenerate it
    if (existingInvoice) {
      console.log(
        `[INVOICE] Found existing invoice ${existingInvoice.id} for order ${orderId}`
      );
      try {
        await filesController.checkFileExistsInS3(existingInvoice.filePath);
        console.log(
          `[INVOICE] Invoice file exists in S3, serving existing file`
        );

        const fileBuffer = await filesController.getFileFromS3(
          existingInvoice.filePath
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${existingInvoice.fileName}"`
        );

        return res.send(fileBuffer);
      } catch (error) {
        console.log(
          `[INVOICE] Invoice file not found in S3, will regenerate: ${error.message}`
        );
        // We'll continue with generation below since the file is missing
      }
    }

    // At this point, either invoice doesn't exist or the file is missing - we need to generate it

    // Find the order with customer details
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: Customer, as: "Customer" }],
    });

    if (!order) {
      console.error(`[INVOICE ERROR] Order ${orderId} not found`);
      return res.status(404).json({
        error: "Order not found",
        details: "Unable to generate invoice for non-existent order",
      });
    }

    // Get the seller (user) information
    const user = await User.findOne({
      where: { id: order.userId },
    });

    if (!user) {
      console.error(
        `[INVOICE ERROR] User ${order.userId} not found for order ${orderId}`
      );
      return res.status(404).json({
        error: "User not found",
        details: "Unable to generate invoice without seller information",
      });
    }

    // Generate a unique invoice number
    const invoiceNumber =
      existingInvoice?.invoiceNumber || (await generateInvoiceNumber());
    console.log(`[INVOICE] Using invoice number: ${invoiceNumber}`);

    // Clean the customer address and name
    const cleanedAddress = cleanAddress(order.Customer.address);
    const cleanedName = cleanName(order.Customer.name);

    // Prepare data for the invoice
    const invoiceData = {
      invoiceNumber,
      issueDate: new Date(),
      client: {
        name: cleanedName,
        address: cleanedAddress,
        email: order.Customer.email,
      },
      company: {
        name:
          user.companyName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email,
        address: user.address || "Address not provided",
        vatNumber: user.vatNumber || "N/A",
      },
      items: [
        {
          description: order.itemName,
          quantity: 1,
          price: parseFloat(order.orderAmount),
        },
      ],
      totalHT: parseFloat(order.orderAmount),
      tvaRate: 0, // Change as needed based on country and product
      totalTVA: 0, // No VAT if not applicable
      totalTTC: parseFloat(order.totalAmount),
      buyerProtection: parseFloat(order.buyerProtection || 0).toFixed(2), // Include buyer protection fee
    };

    console.log(`[INVOICE] Generating invoice PDF for order ${orderId}`);

    // Generate PDF and save to S3
    let pdfUrl;
    try {
      pdfUrl = await generateInvoicePDF(invoiceData);
      console.log(`[INVOICE] Generated PDF URL: ${pdfUrl}`);
    } catch (error) {
      console.error(`[INVOICE ERROR] Failed to generate PDF: ${error.message}`);
      return res.status(500).json({
        error: "Invoice generation failed",
        details: error.message,
      });
    }

    // Extract filename from url
    const fileName = `invoice-${invoiceNumber}.pdf`;
    const s3Key = fileName;

    // Get the file size
    let fileBuffer;
    try {
      fileBuffer = await filesController.getFileFromS3(s3Key);
      console.log(
        `[INVOICE] Retrieved generated file from S3, size: ${fileBuffer.length} bytes`
      );
    } catch (error) {
      console.error(
        `[INVOICE ERROR] Failed to retrieve generated file from S3: ${error.message}`
      );
      return res.status(500).json({
        error: "Generated invoice file not found",
        details: error.message,
      });
    }

    const fileSize = fileBuffer.length;

    // Save or update invoice record in database
    try {
      if (existingInvoice) {
        // Update existing invoice record
        existingInvoice.fileName = fileName;
        existingInvoice.filePath = s3Key;
        existingInvoice.fileSize = fileSize;
        existingInvoice.isValid = true;
        await existingInvoice.save();
        console.log(
          `[INVOICE] Updated existing invoice record ${existingInvoice.id}`
        );
      } else {
        // Create new invoice record
        existingInvoice = await Invoice.create({
          fileName,
          filePath: s3Key,
          fileSize,
          orderId: order.id,
          invoiceNumber,
          issueDate: new Date(),
          isValid: true,
        });
        console.log(
          `[INVOICE] Created new invoice record ${existingInvoice.id}`
        );
      }
    } catch (error) {
      console.error(
        `[INVOICE ERROR] Failed to save invoice record: ${error.message}`
      );
      // We can still continue and serve the file even if DB update fails
    }

    // Send the invoice to the client
    console.log(`[INVOICE] Sending invoice file to client`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(fileBuffer);
  } catch (error) {
    console.error(
      `[INVOICE ERROR] Unhandled error in invoice generation: ${error.message}`
    );
    console.error(error.stack);
    return res.status(500).json({
      error: "Failed to generate invoice",
      details: error.message,
    });
  }
};
