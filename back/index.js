const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./configs/db.js");
const Role = require("./models/roleModel");
const UserRole = require("./models/userRoleModel");
const User = require("./models/userModel");
const cors = require("cors");

const emailDetectionController = require("./controllers/emailDetectionController.js");

dotenv.config();

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("[SUCCESS] Base de données synchronisée");

    // Vérifier si des rôles existent déjà
    const existingRoles = await Role.findAll();

    if (existingRoles.length === 0) {
      const roles = ["administrator", "moderator", "user"];
      for (const roleName of roles) {
        await Role.create({ name: roleName });
        console.log(`[SUCCESS] Rôle '${roleName}' créé`);
      }
      console.log("[SUCCESS] Initialisation des rôles terminée");
    } else {
      console.log("[INFO] Les rôles sont déjà initialisés");
    }
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de l'initialisation de la base de données:",
      error
    );
  }
};

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "[SUCCESS] Connection to the database has been established successfully."
    );
    return initializeDatabase(); // Appeler la fonction d'initialisation
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
const documentRoutes = require("./routes/documentRoutes");
const salesRoutes = require("./routes/salesRoutes");

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/sales", salesRoutes);

app.get("/api/detect-emails", async (req, res) => {
  try {
    await emailDetectionController.testEmailConnection();
    res.status(200).send("Email detection process completed successfully.");
  } catch (error) {
    res
      .status(500)
      .send("Error during email detection process: " + error.message);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
