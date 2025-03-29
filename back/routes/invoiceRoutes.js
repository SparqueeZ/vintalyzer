const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authenticateToken = require("../middlewares/authMiddleware");

// Generate or fetch an invoice for an order - ensure route matches exactly
router.get("/:orderId", authenticateToken, invoiceController.generateInvoice);

// Add a route for checking if invoice exists without downloading
router.head("/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const existingInvoice = await require("../models").Invoice.findOne({
      where: { orderId },
    });

    if (!existingInvoice) {
      return res.status(404).send();
    }

    try {
      await require("../controllers/filesController").checkFileExistsInS3(
        existingInvoice.filePath
      );
      return res.status(200).send();
    } catch (error) {
      return res.status(404).send();
    }
  } catch (error) {
    console.error("[INVOICE ERROR] Error checking invoice:", error);
    return res.status(500).send();
  }
});

module.exports = router;
