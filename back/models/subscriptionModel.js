const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");
const bcrypt = require("bcrypt");

const Subscription = sequelize.define("Subscription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  stripePriceId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  plan: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING(100),
    allowNull: false,
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

module.exports = Subscription;
