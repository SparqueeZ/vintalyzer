const express = require("express");
const router = express.Router();
const multer = require("multer");
const filesController = require("../controllers/filesController");
const authenticateToken = require("../middlewares/authMiddleware");

// Configure multer for memory storage (needed for S3 uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to upload a file to S3
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const { file } = req;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filename = `${Date.now()}-${file.originalname}`;
      const fileUrl = await filesController.uploadToS3(
        file.buffer,
        filename,
        file.mimetype
      );

      res.status(200).json({
        message: "File uploaded successfully",
        fileUrl,
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      console.error("[ERROR] Error uploading file to S3:", error);
      res.status(500).json({ error: "Error uploading file" });
    }
  }
);

// Route to get a file from S3
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const fileBuffer = await filesController.getFileFromS3(filename);

    // You might want to set the appropriate Content-Type header here
    res.set("Content-Type", "application/octet-stream");
    res.send(fileBuffer);
  } catch (error) {
    console.error("[ERROR] Error getting file from S3:", error);
    res.status(404).json({ error: "File not found" });
  }
});

// Route to delete a file from S3
router.delete("/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    await filesController.deleteFileFromS3(filename);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("[ERROR] Error deleting file from S3:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
});

module.exports = router;
