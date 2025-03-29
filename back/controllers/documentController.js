const { Order, ReturnForm, ShippingLabel, Document } = require("../models");
const filesController = require("./filesController");
const multer = require("multer");
const AWS = require("aws-sdk");

exports.uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    // The file is already uploaded to S3 by the middleware
    // We just need to save the metadata in the database
    const filename = `${Date.now()}-${file.originalname}`;
    const fileUrl = await filesController.uploadToS3(
      file.buffer,
      filename,
      file.mimetype
    );

    const document = await Document.create({
      userId: req.user.id,
      filename: file.originalname,
      filepath: filename, // We store the S3 key as the filepath
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl, // Store the full S3 URL
    });

    res
      .status(201)
      .json({ message: "Document uploaded successfully", document });
  } catch (error) {
    console.error("[ERROR] Error uploading document:", error);
    res.status(500).json({ error: "Error uploading document" });
  }
};

exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error("[ERROR] Error fetching documents:", error);
    res.status(500).json({ error: "Error fetching documents" });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findOne({
      where: { id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    try {
      // Retrieve the file from S3
      const fileBuffer = await filesController.getFileFromS3(document.filepath);

      // Set appropriate headers for the download
      res.setHeader("Content-Type", document.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.filename}"`
      );

      // Send the file
      res.send(fileBuffer);
    } catch (error) {
      return res.status(404).json({ error: "File not found in storage" });
    }
  } catch (error) {
    console.error("[ERROR] Error downloading document:", error);
    res.status(500).json({ error: "Error downloading document" });
  }
};

exports.downloadSaleDocument = async (req, res) => {
  try {
    const { saleId, documentType } = req.params;
    console.log(
      `[DOC] Request to download ${documentType} for order ${saleId}`
    );

    const documentTypes = {
      returnForm: "ReturnForm",
      shippingLabel: "ShippingLabel",
      invoice: "Invoice", // Added for future support
    };

    // Verify that the document type is valid
    if (!Object.keys(documentTypes).includes(documentType)) {
      console.log(`[DOC ERROR] Invalid document type: ${documentType}`);
      return res.status(400).json({ error: "Invalid document type" });
    }

    // Retrieve the order with associated documents
    const order = await Order.findOne({
      where: { id: saleId },
      include: [
        { model: ReturnForm, as: "ReturnForm" },
        { model: ShippingLabel, as: "ShippingLabel" },
        // { model: Invoice, as: "Invoice" } // Uncomment when Invoice model is ready
      ],
    });

    if (!order) {
      console.log(`[DOC ERROR] Order not found: ${saleId}`);
      return res.status(404).json({ error: "Order not found" });
    }

    // Get the requested document using the correct alias
    const document = order[documentTypes[documentType]];
    if (!document) {
      console.log(`[DOC ERROR] ${documentType} not found for order ${saleId}`);
      return res
        .status(404)
        .json({ error: `No ${documentType} found for this order` });
    }

    try {
      // For invoice, we'd handle differently but it's not implemented yet
      if (documentType === "invoice") {
        return res
          .status(501)
          .json({ error: "Invoice download not yet implemented" });
      }

      // Get file path from document (based on model definition)
      const filePath = document.filePath;
      console.log(`[DOC] Attempting to retrieve file from S3: ${filePath}`);

      // Check if the file path indicates a local file or S3 file
      let fileBuffer;
      try {
        if (filePath.startsWith("http")) {
          // Extract the key from the URL
          const key = filePath.split("/").pop();
          console.log(`[DOC] Detected S3 URL, extracting key: ${key}`);
          fileBuffer = await filesController.getFileFromS3(key);
        } else {
          // Handle as regular file path
          console.log(`[DOC] Using file path as S3 key: ${filePath}`);
          fileBuffer = await filesController.getFileFromS3(filePath);
        }
      } catch (s3Error) {
        console.error(`[DOC ERROR] S3 file not found: ${filePath}`, s3Error);
        // Mark the document record as broken
        document.isValid = false;
        await document.save();
        return res.status(404).json({
          error:
            "The document file could not be found in storage. Please request a new copy.",
          errorCode: "S3_FILE_NOT_FOUND",
        });
      }

      // Set appropriate headers for the download
      const fileName = document.fileName || `${documentType}-${saleId}.pdf`;
      res.setHeader("Content-Type", document.mimeType || "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      console.log(`[DOC] Successfully sending file: ${fileName}`);
      // Send the file
      return res.send(fileBuffer);
    } catch (error) {
      console.error(`[DOC ERROR] Error retrieving file from S3:`, error);
      return res.status(404).json({ error: "File not found in storage" });
    }
  } catch (error) {
    console.error(
      `[DOC ERROR] Error downloading ${req.params.documentType}:`,
      error
    );
    res.status(500).json({ error: "Error downloading document" });
  }
};

// Add a health check endpoint for document integrity
exports.checkDocumentHealth = async (req, res) => {
  try {
    const { documentType } = req.params;
    const userId = req.user.id;

    let Model;
    switch (documentType) {
      case "returnForm":
        Model = ReturnForm;
        break;
      case "shippingLabel":
        Model = ShippingLabel;
        break;
      case "invoice":
        Model = Invoice;
        break;
      default:
        return res.status(400).json({ error: "Invalid document type" });
    }

    // Get all documents for this user through orders
    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: Model, required: true }],
    });

    const results = {
      total: 0,
      valid: 0,
      invalid: 0,
      details: [],
    };

    // Check each document
    for (const order of orders) {
      const document = order[documentType];
      if (!document) continue;

      results.total++;

      try {
        let filePath = document.filePath;
        if (filePath.startsWith("http")) {
          filePath = filePath.split("/").pop();
        }

        await filesController.checkFileExistsInS3(filePath);
        results.valid++;
        document.isValid = true;
        await document.save();
      } catch (error) {
        results.invalid++;
        document.isValid = false;
        await document.save();
        results.details.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          documentId: document.id,
          filePath: document.filePath,
          error: error.message,
        });
      }
    }

    return res.json(results);
  } catch (error) {
    console.error("[DOC HEALTH ERROR]", error);
    return res.status(500).json({ error: "Failed to check document health" });
  }
};
