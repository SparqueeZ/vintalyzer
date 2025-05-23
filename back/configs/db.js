require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_ADDRESS,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: process.env.DB_LOGGING === "true",
  }
);

module.exports = { sequelize };
