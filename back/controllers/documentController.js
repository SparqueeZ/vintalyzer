const path = require("path");
const fs = require("fs");
const { Sale, ReturnForm, ShippingLabel } = require("../models");

exports.uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    const document = await Document.create({
      userId: req.user.id,
      filename: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
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

    // Construire le chemin complet du fichier
    const fullPath = path.join(__dirname, "../uploads", document.filePath);

    // Vérifier que le fichier existe
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.download(fullPath, document.fileName);
  } catch (error) {
    console.error("[ERROR] Error downloading document:", error);
    res.status(500).json({ error: "Error downloading document" });
  }
};

exports.downloadSaleDocument = async (req, res) => {
  try {
    const { saleId, documentType } = req.params;

    const documentTypes = {
      returnForm: "ReturnForm",
      shippingLabel: "ShippingLabel",
    };

    // Vérifier que le type de document est valide
    if (!Object.keys(documentTypes).includes(documentType)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    // Récupérer la vente avec le document associé
    const sale = await Sale.findOne({
      where: { id: saleId },
      include: [
        { model: ReturnForm, as: "ReturnForm" },
        { model: ShippingLabel, as: "ShippingLabel" },
      ],
    });

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Récupérer le document demandé en utilisant l'alias correct
    const document = sale[documentTypes[documentType]];
    if (!document) {
      return res
        .status(404)
        .json({ error: `No ${documentType} found for this sale` });
    }

    // Construire le chemin complet du fichier
    const fullPath = `${__dirname}/../uploads/${document.filePath}`;

    // Vérifier que le fichier existe
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.download(fullPath, document.fileName);
  } catch (error) {
    console.error(
      `[ERROR] Error downloading ${req.params.documentType}:`,
      error
    );
    res.status(500).json({ error: "Error downloading document" });
  }
};
