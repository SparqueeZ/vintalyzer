const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const initUserModel = (sequelize) => {
  class User extends Model {}
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      displayname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      password: {
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
    },
    { sequelize, modelName: "user" }
  );

  return User;
};

module.exports = initUserModel;
