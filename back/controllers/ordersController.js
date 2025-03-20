const { Order, Customer } = require("../models");

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
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId: userId },
      include: [
        {
          model: Customer,
          attributes: [
            "id",
            "name",
            "email",
            "phoneNumber",
            "address",
            "country",
          ],
        },
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("[ERROR] Error fetching user orders:", error);
    res.status(500).json({ message: "Error retrieving user orders" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Customer,
          attributes: [
            "id",
            "email",
            "name",
            "phoneNumber",
            "address",
            "country",
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("[ERROR] Error fetching order details:", error);
    res.status(500).json({ message: "Error retrieving order details" });
  }
};

exports.getOrderCustomer = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({
      where: { id: orderId },
      attributes: [], // Ne récupère pas les attributs de la commande
      include: [
        {
          model: Customer,
          attributes: [
            "id",
            "email",
            "name",
            "phoneNumber",
            "address",
            "country",
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order.Customer);
  } catch (error) {
    console.error("[ERROR] Error fetching customer details:", error);
    res.status(500).json({ message: "Error retrieving customer details" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;

    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("[ERROR] Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};
