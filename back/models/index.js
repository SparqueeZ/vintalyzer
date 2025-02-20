const { sequelize } = require("../configs/db");
const User = require("./userModel");
const Order = require("./orderModel");
const Customer = require("./customerModel");
const ReturnForm = require("./returnFormModel");
const ShippingLabel = require("./shippingLabelModel");
const ShopModel = require("./dashboard/shopModel");
const ExpenseModel = require("./dashboard/expenseModel");
const SaleModel = require("./dashboard/saleModel");
const ComentModel = require("./dashboard/comentModel");

const models = {
  User,
  Order,
  Customer,
  ReturnForm,
  ShippingLabel,
  ShopModel,
  ExpenseModel,
  SaleModel,
  ComentModel,
};

// Log pour le débogage
console.log("Modèles chargés:", Object.keys(models));

// Associations
User.hasMany(Order, {
  foreignKey: "userId",
});
Customer.hasMany(Order, {
  foreignKey: "customerId",
});
Order.belongsTo(User, {
  foreignKey: "userId",
});
Order.belongsTo(Customer, {
  foreignKey: "customerId",
});
Order.belongsTo(ReturnForm, {
  foreignKey: "returnFormId",
});
Order.belongsTo(ShippingLabel, {
  foreignKey: "shippingLabelId",
});

User.hasMany(ShopModel, { foreignKey: "userId" });
ShopModel.hasMany(SaleModel, { foreignKey: "shopId" });
ShopModel.hasMany(ComentModel, { foreignKey: "shopId" });
ShopModel.hasMany(ExpenseModel, { foreignKey: "shopId" });
SaleModel.belongsTo(ShopModel, { foreignKey: "shopId" });
ComentModel.belongsTo(ShopModel, { foreignKey: "shopId" });
ExpenseModel.belongsTo(ShopModel, { foreignKey: "shopId" });

module.exports = models;
