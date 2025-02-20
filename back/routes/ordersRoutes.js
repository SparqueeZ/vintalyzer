const express = require("express");
const ordersController = require("../controllers/ordersController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Route pour obtenir toutes les ventes (protégée)
router.get("/all", authenticateToken, ordersController.getAllOrders);

// Route pour obtenir les ventes de l'utilisateur connecté
router.get("/", authenticateToken, ordersController.getUserOrders);

module.exports = router;
