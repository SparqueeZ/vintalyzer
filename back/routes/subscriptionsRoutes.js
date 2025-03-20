const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Route pour obtenir les ventes de l'utilisateur connecté
router.get(
  "/all",
  authenticateToken,
  subscriptionController.getAllSubscriptions
);
router.get("/", authenticateToken, subscriptionController.getUserSubscription);
router.get(
  "/history",
  authenticateToken,
  subscriptionController.getUserSubscriptionHistory
);

module.exports = router;
