const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const Sale = sequelize.define("Sale", {
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
    // Nouveau champ
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "ReturnForms",
      key: "id",
    },
  },
  shippingLabelId: {
    // Nouveau champ
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "ShippingLabels",
      key: "id",
    },
  },
  saleDate: DataTypes.DATE,
  saleAmount: DataTypes.DECIMAL(10, 2),
  expenses: DataTypes.DECIMAL(10, 2),
  paymentMethod: DataTypes.STRING,
  mailSource: DataTypes.STRING,
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  itemName: DataTypes.STRING,
  totalAmount: DataTypes.DECIMAL(10, 2),
});

// Modification des associations
Sale.associate = (models) => {
  Sale.belongsTo(models.ReturnForm, {
    foreignKey: "returnFormId",
    as: "ReturnForm", // Majuscule au début
  });
  Sale.belongsTo(models.ShippingLabel, {
    foreignKey: "shippingLabelId",
    as: "ShippingLabel", // Majuscule au début
  });
};

module.exports = Sale;
