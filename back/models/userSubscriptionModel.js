const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");
const User = require("./userModel");
const Subscription = require("./subscriptionModel");

const UserSubscription = sequelize.define("UserSubscription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "active",
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = UserSubscription;
