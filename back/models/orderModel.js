const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Customers",
      key: "id",
    },
  },
  returnFormId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "ReturnForms",
      key: "id",
    },
  },
  shippingLabelId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "ShippingLabels",
      key: "id",
    },
  },
  orderDate: DataTypes.DATE,
  orderAmount: DataTypes.DECIMAL(10, 2),
  expenses: DataTypes.DECIMAL(10, 2),
  buyerProtection: DataTypes.DECIMAL(10, 2),
  paymentMethod: DataTypes.STRING,
  mailSource: DataTypes.STRING,
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  itemName: DataTypes.STRING,
  totalAmount: DataTypes.DECIMAL(10, 2),
  status: { type: DataTypes.STRING, defaultValue: "0" },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

// Modification des associations
Order.associate = (models) => {
  Order.belongsTo(models.ReturnForm, {
    foreignKey: "returnFormId",
    as: "ReturnForm", // Majuscule au début
  });
  Order.belongsTo(models.ShippingLabel, {
    foreignKey: "shippingLabelId",
    as: "ShippingLabel", // Majuscule au début
  });
};

module.exports = Order;
