const { sequelize } = require("../configs/db");
const User = require("./userModel");
const Sale = require("./saleModel");
const Customer = require("./customerModel");
const ReturnForm = require("./returnFormModel");
const ShippingLabel = require("./shippingLabelModel");

const models = {
  User,
  Sale,
  Customer,
  ReturnForm,
  ShippingLabel,
};

// Log pour le débogage
console.log("Modèles chargés:", Object.keys(models));

// Associations
User.hasMany(Sale, {
  foreignKey: "userId",
});

Customer.hasMany(Sale, {
  foreignKey: "customerId",
});

Sale.belongsTo(User, {
  foreignKey: "userId",
});

Sale.belongsTo(Customer, {
  foreignKey: "customerId",
});

Sale.belongsTo(ReturnForm, {
  foreignKey: "returnFormId",
});

Sale.belongsTo(ShippingLabel, {
  foreignKey: "shippingLabelId",
});

module.exports = models;
