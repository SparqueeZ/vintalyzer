const models = require("../models");
const path = require("path");
const fs = require("fs").promises;
const filesController = require("../controllers/filesController");

class DocumentProcessingService {
  constructor() {
    console.log("Modèles disponibles:", Object.keys(models));

    this.User = models.User;
    this.Customer = models.Customer;
    this.Orders = models.Order;
    this.ReturnForm = models.ReturnForm;
    this.ShippingLabel = models.ShippingLabel;

    // Vérifier que chaque modèle est bien défini
    if (
      !this.User ||
      !this.Customer ||
      !this.Orders ||
      !this.ReturnForm ||
      !this.ShippingLabel
    ) {
      throw new Error("Certains modèles sont manquants");
    }
  }

  async processOrderDocuments(orderData, sellerEmail) {
    try {
      console.log(
        `[ORDER PROCESSING] Processing order: ${orderData.orderNumber} for seller: ${sellerEmail}`
      );

      // Try to find user by email from the function parameter first
      let user = await this.User.findOne({
        where: {
          email: sellerEmail,
        },
      });

      // If not found, try using the email from returnFormInfo
      if (!user && orderData.returnFormInfo?.sellerAddress?.email) {
        console.log(
          `[ORDER PROCESSING] User not found with ${sellerEmail}, trying with ${orderData.returnFormInfo.sellerAddress.email}`
        );
        user = await this.User.findOne({
          where: {
            email: orderData.returnFormInfo.sellerAddress.email,
          },
        });
      }

      if (!user) {
        // Create a new user if none found - but only if we have a valid email
        if (!sellerEmail) {
          throw new Error("No valid seller email provided");
        }

        console.log(
          `[ORDER PROCESSING] No user found, creating new user with email: ${sellerEmail}`
        );
        user = await this.User.create({
          email: sellerEmail,
          roleId: 3, // Assuming roleId 3 is for regular users
          emailVerified: true, // Auto-verify since we received an email from them
        });

        console.log(`[ORDER PROCESSING] New user created with ID: ${user.id}`);
      }

      // Créer ou retrouver le client
      const [customer] = await this.Customer.findOrCreate({
        where: { email: orderData.orderInfo.buyerEmail },
        defaults: {
          name: orderData.orderInfo.buyerUsername,
          phoneNumber: "",
          address: orderData.orderInfo.buyerFullAddress,
          country: orderData.orderInfo.buyerCountry,
        },
      });

      let returnFormId = null;
      let shippingLabelId = null;

      // Traiter le formulaire de retour
      if (orderData.orderAttachments?.length) {
        const attachment = orderData.orderAttachments[0];

        try {
          // Upload to S3 instead of local file system
          const s3FilePath = await this.saveFileToS3(
            attachment,
            orderData.orderNumber,
            "invoice"
          );

          console.log(
            `[S3 UPLOAD] ReturnForm uploaded successfully to S3: ${s3FilePath}`
          );

          const returnForm = await this.ReturnForm.create({
            fileName: attachment.filename,
            filePath: s3FilePath,
            mimeType: attachment.contentType || "application/pdf",
            fileSize: attachment.size,
            mailId: orderData.orderEmail.messageId,
            mailDate: new Date(orderData.orderEmail.date),
            senderEmail: orderData.orderEmail.from.text,
            orderNumber: orderData.orderNumber,
            issueDate: new Date(orderData.returnFormInfo.paymentDate),
          });

          returnFormId = returnForm.id;
          console.log(
            `[SUCCESS] ReturnForm created with ID: ${returnFormId}, file path: ${s3FilePath}`
          );
        } catch (error) {
          console.error(
            `[ERROR] Failed to save ReturnForm to S3: ${error.message}`
          );
          // Create local backup as fallback
          const localFilePath = await this.saveFileLocally(
            attachment,
            orderData.orderNumber,
            "invoice"
          );
          console.log(`[FALLBACK] ReturnForm saved locally: ${localFilePath}`);

          const returnForm = await this.ReturnForm.create({
            fileName: attachment.filename,
            filePath: localFilePath,
            mimeType: attachment.contentType || "application/pdf",
            fileSize: attachment.size,
            mailId: orderData.orderEmail.messageId,
            mailDate: new Date(orderData.orderEmail.date),
            senderEmail: orderData.orderEmail.from.text,
            orderNumber: orderData.orderNumber,
            issueDate: new Date(orderData.returnFormInfo.paymentDate),
          });

          returnFormId = returnForm.id;
        }
      }

      // Traiter le bordereau d'expédition
      if (orderData.shippingAttachments?.length) {
        const attachment = orderData.shippingAttachments[0];

        try {
          // Upload to S3 instead of local file system
          const s3FilePath = await this.saveFileToS3(
            attachment,
            orderData.orderNumber,
            "delivery"
          );

          console.log(
            `[S3 UPLOAD] ShippingLabel uploaded successfully to S3: ${s3FilePath}`
          );

          const shippingLabel = await this.ShippingLabel.create({
            fileName: attachment.filename,
            filePath: s3FilePath,
            mimeType: attachment.contentType || "application/pdf",
            fileSize: attachment.size,
            mailId: orderData.shippingEmail.messageId,
            mailDate: new Date(orderData.shippingEmail.date),
            senderEmail: orderData.shippingEmail.from.text,
            orderNumber: orderData.orderNumber,
            issueDate: new Date(orderData.shippingEmail.date),
          });

          shippingLabelId = shippingLabel.id;
          console.log(
            `[SUCCESS] ShippingLabel created with ID: ${shippingLabelId}, file path: ${s3FilePath}`
          );
        } catch (error) {
          console.error(
            `[ERROR] Failed to save ShippingLabel to S3: ${error.message}`
          );
          // Create local backup as fallback
          const localFilePath = await this.saveFileLocally(
            attachment,
            orderData.orderNumber,
            "delivery"
          );
          console.log(
            `[FALLBACK] ShippingLabel saved locally: ${localFilePath}`
          );

          const shippingLabel = await this.ShippingLabel.create({
            fileName: attachment.filename,
            filePath: localFilePath,
            mimeType: attachment.contentType || "application/pdf",
            fileSize: attachment.size,
            mailId: orderData.shippingEmail.messageId,
            mailDate: new Date(orderData.shippingEmail.date),
            senderEmail: orderData.shippingEmail.from.text,
            orderNumber: orderData.orderNumber,
            issueDate: new Date(orderData.shippingEmail.date),
          });

          shippingLabelId = shippingLabel.id;
        }
      }

      // Check if this order already exists before creating a new one
      const existingOrder = await this.Orders.findOne({
        where: { orderNumber: orderData.orderNumber },
      });

      if (existingOrder) {
        console.log(
          `[ORDER PROCESSING] Order #${orderData.orderNumber} already exists (ID: ${existingOrder.id}), skipping processing`
        );
        return existingOrder;
      }

      // Créer la vente avec les références aux documents
      const order = await this.Orders.create({
        userId: user.id,
        customerId: customer.id,
        returnFormId,
        shippingLabelId,
        orderDate: new Date(orderData.returnFormInfo.paymentDate),
        orderAmount: orderData.returnFormInfo.orderDetails.itemPrice,
        expenses:
          orderData.returnFormInfo.orderDetails.shippingCost +
          orderData.returnFormInfo.orderDetails.buyerProtection,
        buyerProtection: orderData.returnFormInfo.orderDetails.buyerProtection,
        paymentMethod: "VINTED",
        mailSource: orderData.orderEmail.messageId,
        orderNumber: orderData.orderNumber,
        itemName: orderData.returnFormInfo.orderDetails.itemName,
        totalAmount: orderData.returnFormInfo.orderDetails.total,
      });

      console.log(
        `[SUCCESS] Order created with ID: ${order.id}, orderNumber: ${order.orderNumber}`
      );
      return order;
    } catch (error) {
      console.error("Erreur détaillée dans processOrderDocuments:", error);
      throw error;
    }
  }

  async saveFileToS3(attachment, orderNumber, type) {
    try {
      console.log(
        `[S3] Starting upload for ${type} - ${orderNumber} - ${attachment.filename}`
      );

      // Generate unique filename for S3
      const filePrefix = type === "invoice" ? "return-form" : "shipping-label";
      const s3FileName = `${filePrefix}-${orderNumber}-${attachment.filename}`;

      // Check if file with this name already exists in S3
      try {
        await filesController.checkFileExistsInS3(s3FileName);
        console.log(`[S3] File ${s3FileName} already exists, skipping upload`);
        return s3FileName; // Return the existing filename
      } catch (error) {
        // File doesn't exist, proceed with upload
        console.log(
          `[S3] File ${s3FileName} doesn't exist, proceeding with upload`
        );
      }

      // Upload to S3
      const fileUrl = await filesController.uploadToS3(
        attachment.content,
        s3FileName,
        attachment.contentType || "application/pdf"
      );

      console.log(`[S3] File uploaded successfully, URL: ${fileUrl}`);

      // Return the S3 filename (key) as filepath to store in database
      return s3FileName;
    } catch (error) {
      console.error(`[S3 ERROR] Error uploading file to S3:`, error);
      throw error; // Re-throw to handle in the calling function
    }
  }

  // Keep the local fallback method
  async saveFileLocally(attachment, orderNumber, type) {
    try {
      const baseDir = path.join(__dirname, "../uploads");
      const typeFolder = type === "invoice" ? "formulaires" : "bordereaux";
      const uploadDir = path.join(baseDir, typeFolder);

      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(
        uploadDir,
        `${orderNumber}-${attachment.filename}`
      );
      await fs.writeFile(filePath, attachment.content);

      return path.relative(baseDir, filePath);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du fichier en local:", error);
      throw error;
    }
  }
}

module.exports = new DocumentProcessingService();
