const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const Invoice = sequelize.define("Invoice", {
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
    defaultValue: "application/pdf",
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Orders",
      key: "id",
    },
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Invoice;
