const { sequelize } = require("../configs/db");
const User = require("./userModel");
const Order = require("./orderModel");
const Customer = require("./customerModel");
const ReturnForm = require("./returnFormModel");
const ShippingLabel = require("./shippingLabelModel");
const Invoice = require("./invoiceModel");
const ShopModel = require("./dashboard/shopModel");
const ExpenseModel = require("./dashboard/expenseModel");
const SaleModel = require("./dashboard/saleModel");
const ComentModel = require("./dashboard/comentModel");
const Subscription = require("./subscriptionModel");
const UserSubscription = require("./userSubscriptionModel");
const SubscriptionHistory = require("./subscriptionHistoryModel");
const Statistic = require("./dashboard/statisticModel");
const SaleWithBrand = require("./dashboard/saleWithBrandModel");
const SaleByBrand = require("./dashboard/saleByBrandModel");
const RivalShop = require("./extension/rival/rivalShopModel");
const RivalReplies = require("./extension/rival/rivalRepliesModel");
const RivalComments = require("./extension/rival/rivalCommentsModel");
const RivalArticles = require("./extension/rival/rivalArticlesModel");

const models = {
  User,
  Order,
  Customer,
  ReturnForm,
  ShippingLabel,
  Invoice,
  ShopModel,
  ExpenseModel,
  SaleModel,
  ComentModel,
  Subscription,
  UserSubscription,
  SubscriptionHistory,
  Statistic,
  SaleByBrand,
  SaleWithBrand,
  RivalShop,
  RivalReplies,
  RivalComments,
  RivalArticles,
};

// Log pour le débogage
console.log("Modèles chargés:", Object.keys(models));

// Associations
User.hasMany(Order, {
  foreignKey: "userId",
});
Order.belongsTo(User, {
  foreignKey: "userId",
});
Order.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "Customer",
});
Customer.hasMany(Order, {
  foreignKey: "customerId",
});
Order.belongsTo(ReturnForm, {
  foreignKey: "returnFormId",
  as: "ReturnForm",
});
ReturnForm.hasOne(Order, {
  foreignKey: "returnFormId",
});
Order.belongsTo(ShippingLabel, {
  foreignKey: "shippingLabelId",
  as: "ShippingLabel",
});
ShippingLabel.hasOne(Order, {
  foreignKey: "shippingLabelId",
});
Order.hasOne(Invoice, {
  foreignKey: "orderId",
});
Invoice.belongsTo(Order, {
  foreignKey: "orderId",
});

User.hasMany(ShopModel, { foreignKey: "userId" });
ShopModel.hasMany(SaleModel, { foreignKey: "shopId" });
ShopModel.hasMany(ComentModel, { foreignKey: "shopId" });
ShopModel.hasMany(ExpenseModel, { foreignKey: "shopId" });
ShopModel.hasMany(Statistic, { foreignKey: "shopId" });
SaleModel.belongsTo(ShopModel, { foreignKey: "shopId" });
ComentModel.belongsTo(ShopModel, { foreignKey: "shopId" });
ExpenseModel.belongsTo(ShopModel, { foreignKey: "shopId" });

// Associations pour les abonnements
User.belongsToMany(Subscription, {
  through: UserSubscription,
  foreignKey: "userId",
});
Subscription.belongsToMany(User, {
  through: UserSubscription,
  foreignKey: "subscriptionId",
});

// Nouvelles associations pour l'historique
SubscriptionHistory.belongsTo(UserSubscription, {
  foreignKey: "userSubscriptionId",
});
SubscriptionHistory.belongsTo(Subscription, {
  foreignKey: "subscriptionId",
});
UserSubscription.hasMany(SubscriptionHistory, {
  foreignKey: "userSubscriptionId",
});
Subscription.hasMany(SubscriptionHistory, {
  foreignKey: "subscriptionId",
});

// Associations pour les analyses de boutiques rivales
User.hasMany(RivalShop, { foreignKey: "userId" });
RivalShop.hasMany(RivalArticles, { foreignKey: "shopId", as: "articles" });
RivalShop.hasMany(RivalComments, { foreignKey: "shopId", as: "comments" });
RivalShop.hasMany(RivalReplies, { foreignKey: "shopId" });
RivalArticles.belongsTo(RivalShop, { foreignKey: "shopId", as: "shop" });
RivalComments.belongsTo(RivalShop, { foreignKey: "shopId", as: "shop" });
RivalReplies.belongsTo(RivalComments, {
  foreignKey: "commentId",
  as: "comment",
});

RivalReplies.belongsTo(RivalComments, { foreignKey: "commentId" });
RivalComments.hasMany(RivalReplies, { foreignKey: "commentId", as: "replies" });

// Associations pour les statistiques
Statistic.hasMany(SaleByBrand, { foreignKey: "statisticId" });
SaleByBrand.hasMany(SaleWithBrand, { foreignKey: "saleByBrandId" });

module.exports = models;
