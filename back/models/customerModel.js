const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  country: {
    type: DataTypes.STRING,
  },
});

module.exports = Customer;
