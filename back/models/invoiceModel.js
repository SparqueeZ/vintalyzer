const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Documents",
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
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Invoices",
  }
);

module.exports = Invoice;
