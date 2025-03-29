const express = require("express");
const router = express.Router();
const multer = require("multer");
const documentController = require("../controllers/documentController");
const authenticateToken = require("../middlewares/authMiddleware");

// Configure multer to use memory storage for AWS S3 uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload document route
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  documentController.uploadDocument
);

// Get user documents
router.get(
  "/documents",
  authenticateToken,
  documentController.getUserDocuments
);

// Download a user document
router.get("/documents/:id", documentController.downloadDocument);

// Download a sale-related document - matching the frontend URL pattern
// documentType can be 'returnForm', 'shippingLabel', or 'invoice'
router.get(
  "/sale/:saleId/:documentType",
  documentController.downloadSaleDocument
);

// Add a parallel route for order documents (same controller method)
router.get(
  "/order/:saleId/:documentType",
  documentController.downloadSaleDocument
);

// Add health check endpoint
router.get(
  "/health/:documentType",
  authenticateToken,
  documentController.checkDocumentHealth
);

module.exports = router;
