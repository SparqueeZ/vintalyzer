const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const documentController = require("../controllers/documentController");
const authenticateToken = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  documentController.uploadDocument
);
router.get(
  "/documents",
  authenticateToken,
  documentController.getUserDocuments
);
router.get("/documents/:id", documentController.downloadDocument);

// Route pour télécharger un document associé à une vente
// documentType peut être 'returnForm' ou 'shippingLabel'
router.get(
  "/sale/:saleId/:documentType",
  documentController.downloadSaleDocument
);

module.exports = router;
