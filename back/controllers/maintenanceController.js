const { Order, ReturnForm, ShippingLabel, Invoice } = require("../models");
const filesController = require("./filesController");

// Function to check if a file exists in S3 and mark as invalid if not
async function validateDocumentS3Status(document) {
  if (!document) return false;

  try {
    let key = document.filePath;
    if (key.startsWith("http")) {
      key = key.split("/").pop();
    }

    await filesController.checkFileExistsInS3(key);

    // Document is valid, ensure it's marked as such
    if (!document.isValid) {
      document.isValid = true;
      await document.save();
    }

    return true;
  } catch (error) {
    // Document is invalid, mark it as such
    document.isValid = false;
    await document.save();
    return false;
  }
}

// Schedule this to run periodically (e.g., every 30 minutes)
exports.syncDocumentsWithS3 = async (req, res) => {
  try {
    console.log("[MAINTENANCE] Starting document-S3 synchronization");

    const stats = {
      returnForms: { total: 0, valid: 0, invalid: 0 },
      shippingLabels: { total: 0, valid: 0, invalid: 0 },
      invoices: { total: 0, valid: 0, invalid: 0 },
    };

    // Check ReturnForms
    const returnForms = await ReturnForm.findAll();
    stats.returnForms.total = returnForms.length;

    for (const doc of returnForms) {
      const isValid = await validateDocumentS3Status(doc);
      isValid ? stats.returnForms.valid++ : stats.returnForms.invalid++;
    }

    // Check ShippingLabels
    const shippingLabels = await ShippingLabel.findAll();
    stats.shippingLabels.total = shippingLabels.length;

    for (const doc of shippingLabels) {
      const isValid = await validateDocumentS3Status(doc);
      isValid ? stats.shippingLabels.valid++ : stats.shippingLabels.invalid++;
    }

    // Check Invoices
    const invoices = await Invoice.findAll();
    stats.invoices.total = invoices.length;

    for (const doc of invoices) {
      const isValid = await validateDocumentS3Status(doc);
      isValid ? stats.invoices.valid++ : stats.invoices.invalid++;
    }

    console.log("[MAINTENANCE] Document-S3 synchronization complete", stats);

    // If this was called via API, return the stats
    if (res) {
      return res.json({
        message: "Document synchronization complete",
        stats,
      });
    }

    return stats;
  } catch (error) {
    console.error(
      "[MAINTENANCE ERROR] Failed to sync documents with S3:",
      error
    );

    // If this was called via API, return the error
    if (res) {
      return res.status(500).json({ error: "Failed to synchronize documents" });
    }

    throw error;
  }
};

// Additional maintenance functions can be added here
