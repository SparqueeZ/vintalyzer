const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/db");

const Statistic = sequelize.define(
  "Statistic",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversionRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalViews: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalSales: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalSalesPrice: {
      type: DataTypes.FLOAT,
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
  },
  {
    indexes: [
      {
        fields: ["shopId"],
      },
    ],
  }
);

module.exports = Statistic;
