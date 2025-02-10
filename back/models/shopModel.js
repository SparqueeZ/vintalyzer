const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const Shop = sequelize.define("Shop", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  localisation: {
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  company: {
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rcs: {
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  },
  stats: {
    subscribers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activeArticles: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sellsByCountry: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    sells: {
    
    }
  },
});

module.exports = Shop;
