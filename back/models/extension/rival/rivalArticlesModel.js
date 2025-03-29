const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../configs/db");

const RivalArticles = sequelize.define("RivalArticles", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceWithProtection: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  protectionFee: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  articleId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

module.exports = RivalArticles;
