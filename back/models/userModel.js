const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  lastname: {
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
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [8, 100],
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

User.associate = (models) => {
  User.hasMany(models.UserRole, { foreignKey: "userId" });
};

User.beforeCreate(async (user, options) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
  user.password = await bcrypt.hash(user.password, salt);
});

User.afterCreate(async (user, options) => {
  const Role = require("./roleModel");
  const UserRole = require("./userRoleModel");
  const role = await Role.findOne({ where: { name: "user" } });
  if (role) {
    await UserRole.create({ userId: user.id, roleId: role.id });
  }
});

module.exports = User;
