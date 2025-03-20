const express = require("express");
const extensionController = require("../controllers/extensionController");
const authenticateExtToken = require("../middlewares/extensionMiddleware");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/data", authenticateExtToken, extensionController.saveData);
router.get(
  "/data",
  authenticateToken,
  extensionController.getRivalShopDataByUserId
);

module.exports = router;
