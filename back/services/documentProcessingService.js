const models = require("../models");
const path = require("path");
const fs = require("fs").promises;

class DocumentProcessingService {
  constructor() {
    console.log("Modèles disponibles:", Object.keys(models));

    this.User = models.User;
    this.Customer = models.Customer;
    this.Sales = models.Sale;
    this.ReturnForm = models.ReturnForm;
    this.ShippingLabel = models.ShippingLabel;

    // Vérifier que chaque modèle est bien défini
    if (
      !this.User ||
      !this.Customer ||
      !this.Sales ||
      !this.ReturnForm ||
      !this.ShippingLabel
    ) {
      throw new Error("Certains modèles sont manquants");
    }
  }

  async checkSaleExists(orderNumber) {
    try {
      const existingSale = await this.Sales.findOne({
        where: { orderNumber: orderNumber },
      });
      return existingSale !== null;
    } catch (error) {
      console.error("Erreur lors de la vérification de la vente:", error);
      return false;
    }
  }

  async processOrderDocuments(orderData, userEmail) {
    try {
      console.log("Traitement de la commande:", orderData.orderNumber);

      // Vérifier si la vente existe déjà
      const saleExists = await this.checkSaleExists(orderData.orderNumber);
      if (saleExists) {
        console.log(`La vente ${orderData.orderNumber} existe déjà, ignorée.`);
        return null;
      }

      const user = await this.User.findOne({
        where: {
          email: orderData.returnFormInfo.sellerAddress.email,
        },
      });

      if (!user) {
        throw new Error(
          `Utilisateur non trouvé avec l'email: ${orderData.returnFormInfo.sellerAddress.email}`
        );
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
      if (orderData.saleAttachments?.length) {
        const attachment = orderData.saleAttachments[0];
        const filePath = await this.saveFile(
          attachment,
          orderData.orderNumber,
          "invoice"
        );

        const returnForm = await this.ReturnForm.create({
          fileName: attachment.filename,
          filePath: filePath,
          mimeType: attachment.contentType || "application/pdf",
          fileSize: attachment.size,
          mailId: orderData.saleEmail.messageId,
          mailDate: new Date(orderData.saleEmail.date),
          senderEmail: orderData.saleEmail.from.text,
          orderNumber: orderData.orderNumber,
          issueDate: new Date(orderData.returnFormInfo.paymentDate),
        });

        returnFormId = returnForm.id;
      }

      // Traiter le bordereau d'expédition
      if (orderData.shippingAttachments?.length) {
        const attachment = orderData.shippingAttachments[0];
        const filePath = await this.saveFile(
          attachment,
          orderData.orderNumber,
          "delivery"
        );

        const shippingLabel = await this.ShippingLabel.create({
          fileName: attachment.filename,
          filePath: filePath,
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

      // Créer la vente avec les références aux documents
      const sale = await this.Sales.create({
        userId: user.id,
        customerId: customer.id,
        returnFormId,
        shippingLabelId,
        saleDate: new Date(orderData.returnFormInfo.paymentDate),
        saleAmount: orderData.returnFormInfo.orderDetails.itemPrice,
        expenses:
          orderData.returnFormInfo.orderDetails.shippingCost +
          orderData.returnFormInfo.orderDetails.buyerProtection,
        paymentMethod: "VINTED",
        mailSource: orderData.saleEmail.messageId,
        orderNumber: orderData.orderNumber,
        itemName: orderData.returnFormInfo.orderDetails.itemName,
        totalAmount: orderData.returnFormInfo.orderDetails.total,
      });

      return sale;
    } catch (error) {
      console.error("Erreur détaillée dans processOrderDocuments:", error);
      throw error;
    }
  }

  async saveFile(attachment, orderNumber, type) {
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
      console.error("Erreur lors de la sauvegarde du fichier:", error);
      throw error;
    }
  }
}

module.exports = new DocumentProcessingService();
