const { Order } = require("../models");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Error retrieving orders" });
  }
};

exports.getUserOrders = async (req, res) => {
  console.log("[INFO] Récupération des ventes de l'utilisateur");
  try {
    const userId = req.user.id; // Obtenu du middleware d'authentification
    const orders = await Order.findAll({
      where: { userId: userId },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("[ERROR] Error fetching user orders:", error);
    res.status(500).json({ message: "Error retrieving user orders" });
  }
};
