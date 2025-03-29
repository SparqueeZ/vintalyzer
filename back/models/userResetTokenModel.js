const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");
const User = require("./userModel");
const ResetToken = require("./resetTokenModel");

const UserResetToken = sequelize.define("UserResetToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resetTokenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

User.belongsToMany(ResetToken, {
  through: UserResetToken,
  foreignKey: "userId",
});
ResetToken.belongsToMany(User, {
  through: UserResetToken,
  foreignKey: "resetTokenId",
});

module.exports = UserResetToken;
