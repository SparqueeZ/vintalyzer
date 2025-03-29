const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");
const bcrypt = require("bcrypt");
const UserSubscription = require("./userSubscriptionModel");
const Subscription = require("./subscriptionModel");

const SubscriptionHistory = sequelize.define(
  "SubscriptionHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userSubscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserSubscription,
        key: "id",
      },
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Subscription,
        key: "id",
      },
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
    changeReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = SubscriptionHistory;
