const express = require("express");
const salesController = require("../controllers/salesController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Route pour obtenir toutes les ventes (protégée)
router.get("/all", authenticateToken, salesController.getAllSales);

// Route pour obtenir les ventes de l'utilisateur connecté
router.get("/", authenticateToken, salesController.getUserSales);

router.post("/load", authenticateToken, salesController.loadSales);

// Route pour récupérer toutes les données de l'utilisateur
router.get("/data", authenticateToken, salesController.getUserData);

module.exports = router;
