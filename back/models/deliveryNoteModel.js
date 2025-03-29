const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const DeliveryNote = sequelize.define(
  "DeliveryNote",
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
    deliveryNoteNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "DeliveryNotes",
  }
);

module.exports = DeliveryNote;
