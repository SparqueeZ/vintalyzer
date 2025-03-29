const { DataTypes, INTEGER } = require("sequelize");
const { sequelize } = require("../../../configs/db");

const RivalShop = sequelize.define("RivalShop", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  autoRatingAmount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  autoRatingRating: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  evaluationsCount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  followers: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  globalRating: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  membersRatingAmount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  membersRatingRating: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ratingNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

module.exports = RivalShop;
