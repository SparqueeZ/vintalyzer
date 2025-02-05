const User = require("../models/userModel");
const Role = require("../models/roleModel");
const UserRole = require("../models/userRoleModel");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ResetToken = require("../models/resetTokenModel");
const UserResetToken = require("../models/userResetTokenModel");
require("dotenv").config();

exports.register = async (req, res) => {
  console.log("[INFO] Registering user");
  try {
    const { lastname, firstname, displayname, email, password } = req.body;
    if (!lastname || !firstname || !displayname || !email || !password) {
      console.error("[ERROR] Tous les champs sont requis.");
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error("[ERROR] L'utilisateur existe déjà.");
      return res.status(400).json({ error: "L'utilisateur existe déjà." });
    }

    const user = await User.create({
      lastname,
      firstname,
      displayname,
      email,
      password,
    });

    res
      .status(201)
      .json({ message: "Utilisateur enregistré avec succès.", user });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      console.error("[ERROR] Erreur de validation.", error);
      return res.status(400).json({ error: "Erreur de validation." });
    }
    console.error(
      "[ERROR] Erreur lors de l'enregistrement de l'utilisateur.",
      error
    );
    res.status(500).json({
      error: "Erreur lors de l'enregistrement de l'utilisateur.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error("[ERROR] Utilisateur non trouvé.");
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.error("[ERROR] Identifiants invalides.");
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const token = jwt.sign({ id: user.dataValues.id }, process.env.JWT_SECRET, {
      expiresIn: `${process.env.JWT_SECRET_EXPIRATION}`,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Utilisateur connecté." });
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la connexion de l'utilisateur.",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la connexion de l'utilisateur." });
  }
};

exports.getUserInformations = async (req, res) => {
  console.log(req.user.id);
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["id"] },
      include: [
        {
          model: Role,
          attributes: ["name", "createdAt", "updatedAt"],
          through: { attributes: [] },
        },
      ],
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la récupération des informations de l'utilisateur.",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération des informations de l'utilisateur.",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la récupération des utilisateurs.",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Vérifie si l'utilisateur qui modifie est un administrateur ou un moderateur
    const loggedUserRole = await UserRole.findOne({
      where: { userId: req.user.id },
    });
    const dbRole = await Role.findByPk(loggedUserRole.roleId);
    if (dbRole.id !== 1 && dbRole.id !== 2) {
      console.error(
        "[ERROR] Vous n'avez pas les droits pour effectuer cette action."
      );
      return res.status(403).json({
        error: "Vous n'avez pas les droits pour effectuer cette action.",
      });
    }

    // Changement des informations de l'utilisateur
    const { id } = req.params;
    const { lastname, firstname, displayname, email, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      console.error("[ERROR] Utilisateur non trouvé.");
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    user.lastname = lastname;
    user.firstname = firstname;
    user.displayname = displayname;
    user.email = email;

    // Changement du rôle de l'utilisateur
    const userRole = await UserRole.findOne({ where: { userId: id } });
    const newRole = await Role.findOne({ where: { name: role } });
    userRole.roleId = newRole.id;

    await userRole.save();
    await user.save();
    res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la mise à jour de l'utilisateur.",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error("[ERROR] Utilisateur non trouvé.");
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    const token = await ResetToken.create({
      token: resetToken,
      expiry: resetTokenExpiry,
    });

    await UserResetToken.create({
      userId: user.id,
      resetTokenId: token.id,
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la demande de réinitialisation du mot de passe.",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la demande de réinitialisation du mot de passe.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const resetToken = await ResetToken.findOne({
      where: {
        token,
        expiry: { [Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!resetToken) {
      console.error("[ERROR] Token invalide ou expiré.");
      return res.status(400).json({ error: "Token invalide ou expiré." });
    }

    const userResetToken = await UserResetToken.findOne({
      where: { resetTokenId: resetToken.id },
    });

    const user = await User.findByPk(userResetToken.userId);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await userResetToken.destroy();
    await resetToken.destroy();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la réinitialisation du mot de passe.",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la réinitialisation du mot de passe.",
    });
  }
};

// TODO
exports.requestEmailConfirmation = async (req, res) => {};

exports.confirmEmail = async (req, res) => {};
