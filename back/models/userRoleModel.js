const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");
const User = require("./userModel");
const Role = require("./roleModel");

const UserRole = sequelize.define("UserRole", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

User.belongsToMany(Role, { through: UserRole, foreignKey: "userId" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "roleId" });

module.exports = UserRole;
