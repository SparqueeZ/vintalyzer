const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const ShippingLabel = sequelize.define("ShippingLabel", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mailId: DataTypes.STRING,
  mailDate: DataTypes.DATE,
  senderEmail: DataTypes.STRING,
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ShippingLabel;
