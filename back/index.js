const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./configs/db.js");
const Role = require("./models/roleModel");
const UserRole = require("./models/userRoleModel");
const User = require("./models/userModel");

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cookieParser());
app.use(express.json());

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

// const initializeDatabase = async () => {
//   await sequelize.sync();
//   console.log("Base de données synchronisée.");

//   const roles = ["moderator", "administrator", "user"];
//   for (const roleName of roles) {
//     await Role.findOrCreate({ where: { name: roleName } });
//   }
//   console.log("Rôles par défaut ajoutés.");
// };

// initializeDatabase();

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
