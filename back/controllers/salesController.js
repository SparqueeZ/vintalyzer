const { Sale } = require("../models");

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching all sales:", error);
    res.status(500).json({ message: "Error retrieving sales" });
  }
};

exports.getUserSales = async (req, res) => {
  console.log("[INFO] Récupération des ventes de l'utilisateur");
  try {
    const userId = req.user.id; // Obtenu du middleware d'authentification
    const sales = await Sale.findAll({
      where: { userId: userId },
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error("[ERROR] Error fetching user sales:", error);
    res.status(500).json({ message: "Error retrieving user sales" });
  }
};
