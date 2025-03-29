const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/db");

const SaleByBrand = sequelize.define("SaleByBrand", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  count: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // totalPrice: {
  //   type: DataTypes.DATE,
  //   allowNull: false,
  // },
  // totalViews: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = SaleByBrand;
