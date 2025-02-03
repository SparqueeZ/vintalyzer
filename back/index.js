const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./configs/db.js");

dotenv.config(); // Load environment variables

const { Sequelize, DataTypes } = require("sequelize");
const app = express();
const PORT = 3001;

app.use(cookieParser());
app.use(express.json());

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log(
      "[SUCCESS] Connection to the database has been established successfully."
    );
    return sequelize.sync();
  })
  .then(() => {
    console.log(
      "[SUCCESS] Models are synchronized with the database successfully."
    );
  })
  .catch((err) =>
    console.log(
      "[ERROR] There was an error during database connection : " + err
    )
  );

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
