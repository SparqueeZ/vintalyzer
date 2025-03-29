const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const authenticateToken = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Protected routes that require admin privileges
router.get(
  "/sync-documents",
  authenticateToken,
  adminMiddleware,
  maintenanceController.syncDocumentsWithS3
);

module.exports = router;
