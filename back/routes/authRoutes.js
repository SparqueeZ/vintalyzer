const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", authController.getAllUsers);
router.get("/user", authenticateToken, authController.getUserInformations);

module.exports = router;
