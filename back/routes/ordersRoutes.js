const express = require("express");
const ordersController = require("../controllers/ordersController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Route pour obtenir toutes les ventes (protégée)
router.get("/all", authenticateToken, ordersController.getAllOrders);

// Route pour obtenir les ventes de l'utilisateur connecté
router.get("/", authenticateToken, ordersController.getUserOrders);

// Update order status (using orderId in the path - must match what's used in the controller)
router.put(
  "/:orderId/status",
  authenticateToken,
  ordersController.updateOrderStatus
);

module.exports = router;
