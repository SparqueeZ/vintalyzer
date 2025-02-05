const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", authController.getAllUsers);
router.get("/user", authenticateToken, authController.getUserInformations);

router.post("/password/reset", authController.requestPasswordReset);
router.post("/password/reset/confirm", authController.resetPassword);

router.post("/email/confirmation", authController.requestEmailConfirmation);
router.post("/email/confirmation/confirm", authController.confirmEmail);

module.exports = router;
