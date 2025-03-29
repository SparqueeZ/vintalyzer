const { Order, Customer, ReturnForm, ShippingLabel } = require("../models");

// Helper function to check if an order is late
const checkOrderStatus = (order) => {
  if (order.status === "0") {
    // Only check for orders that are still "pending"
    const orderDate = new Date(order.orderDate);
    const limitDate = new Date(orderDate);
    limitDate.setDate(orderDate.getDate() + 4); // 4-day deadline

    const now = new Date();

    if (now >= limitDate) {
      return "2"; // Late status
    }
  }

  return order.status; // Return existing status if not late
};

// Update multiple orders statuses based on their deadline dates
const updateOrdersStatuses = async (orders) => {
  const updatedOrders = [];

  for (const order of orders) {
    const newStatus = checkOrderStatus(order);

    if (newStatus !== order.status) {
      order.status = newStatus;
      await order.save();
      updatedOrders.push(order.id);
    }
  }

  if (updatedOrders.length > 0) {
    console.log(
      `[INFO] Auto-updated ${
        updatedOrders.length
      } orders to late status: ${updatedOrders.join(", ")}`
    );
  }

  return orders;
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();

    // Check and update statuses automatically
    await updateOrdersStatuses(orders);

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

    // Fix: Add the 'as' keyword to specify the alias for the Customer association
    const orders = await Order.findAll({
      where: { userId },
      include: [
        { model: Customer, as: "Customer" },
        { model: ReturnForm, as: "ReturnForm" },
        { model: ShippingLabel, as: "ShippingLabel" },
      ],
      order: [["orderDate", "DESC"]],
    });

    // Check and update statuses automatically
    await updateOrdersStatuses(orders);

    res.status(200).json(orders);
  } catch (error) {
    console.error("[ERROR] Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
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
    const orderId = req.params.orderId;
    const { status } = req.body;

    console.log(
      `[INFO] Updating order status for order ID: ${orderId} to status: ${status}`
    );

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only apply late check (status 2) when setting to pending (status 0)
    let finalStatus = status;
    if (status === "0") {
      const orderDate = new Date(order.orderDate);
      const limitDate = new Date(orderDate);
      limitDate.setDate(orderDate.getDate() + 4);

      if (new Date() >= limitDate) {
        console.log(
          `[INFO] Order ${orderId} is past due date, marking as late (status 2)`
        );
        finalStatus = "2"; // Late status
      }
    }

    order.status = finalStatus;
    await order.save();

    console.log(`[SUCCESS] Order ${orderId} status updated to ${finalStatus}`);
    res.status(200).json(order);
  } catch (error) {
    console.error("[ERROR] Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};
