const User = require("../models/userModel");
const Role = require("../models/roleModel");
const UserRole = require("../models/userRoleModel");
const Subscription = require("../models/subscriptionModel");
const userSubscription = require("../models/userSubscriptionModel");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ResetToken = require("../models/resetTokenModel");
const UserResetToken = require("../models/userResetTokenModel");
const { sendEmailConfirmation } = require("../utils/emailUtils");
require("dotenv").config();

exports.register = async (req, res) => {
  console.log("[INFO] Registering user");
  // Set CORS headers explicitly for this route
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );

  try {
    const { lastname, firstname, displayname, email, password, role } =
      req.body;
    if (!lastname || !firstname || !email || !password) {
      console.error("[ERROR] Tous les champs sont requis.");
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error("[ERROR] L'utilisateur existe déjà.");
      return res.status(400).json({ error: "L'utilisateur existe déjà." });
    }

    // Use firstname as displayname if not provided
    const userDisplayname = displayname || firstname;

    const user = await User.create({
      lastname,
      firstname,
      displayname: userDisplayname,
      email,
      password,
      emailConfirmed: 0, // Set email as not confirmed initially
    });

    // Find default role or use provided role
    let roleToAssign;
    if (role) {
      roleToAssign = await Role.findOne({ where: { name: role } });
    } else {
      roleToAssign = await Role.findOne({ where: { name: "CLIENT" } });
    }

    if (roleToAssign) {
      await UserRole.create({
        userId: user.id,
        roleId: roleToAssign.id,
      });
    }

    // Send confirmation email
    try {
      await sendEmailConfirmation(user);
      console.log("[INFO] Confirmation email sent to user");
    } catch (emailError) {
      console.error("[ERROR] Failed to send confirmation email:", emailError);
      // We continue even if email sending fails
    }

    res.status(201).json({
      message:
        "Utilisateur enregistré avec succès. Veuillez vérifier votre email pour confirmer votre compte.",
      user,
    });
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
    const ext_token = jwt.sign(
      { id: user.dataValues.id },
      `${process.env.JWT_SECRET}ext`,
      {
        expiresIn: `${process.env.JWT_SECRET_EXPIRATION}`,
      }
    );

    // Set appropriate CORS headers for cookies
    res.header(
      "Access-Control-Allow-Origin",
      req.headers.origin || process.env.FRONT_URL
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Set the cookie with correct attributes for cross-origin
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none", // Important for cross-origin requests
      secure: true, // Required when sameSite is 'none'
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: "/", // Ensure cookie is available across all paths
    });

    // Log success for debugging
    console.log("[SUCCESS] Authentication successful, token cookie set");

    res.status(200).json({ message: "Utilisateur connecté.", ext_token });
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

exports.logout = async (req, res) => {
  res.clearCookie("token");
  console.log("[INFO] Utilisateur déconnecté.");
  res.status(200).json({ message: "Utilisateur déconnecté." });
};

exports.getUserInformations = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          attributes: ["name", "createdAt", "updatedAt"],
          through: { attributes: [] },
        },
        {
          model: Subscription,
          attributes: ["name", "price", "frequency", "createdAt", "updatedAt"],
          through: { attributes: ["status", "startDate", "endDate"] },
        },
      ],
    });

    const userResponse = {
      ...user.toJSON(),
      Subscription: user.Subscriptions[0]
        ? {
            ...user.Subscriptions[0].toJSON(),
            status: user.Subscriptions[0].UserSubscription.status,
            startDate: user.Subscriptions[0].UserSubscription.startDate,
            endDate: user.Subscriptions[0].UserSubscription.endDate,
          }
        : null,
    };

    res.status(200).json(userResponse);
    console.log(
      "[SUCCESS] Informations de l'utilisateur récupérées avec succès."
    );
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

    // Delete existing reset tokens for the user
    const userResetTokens = await UserResetToken.findAll({
      where: { userId: user.id },
    });
    for (const userResetToken of userResetTokens) {
      await userResetToken.destroy();
      await ResetToken.destroy({ where: { id: userResetToken.resetTokenId } });
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
    const resetLink = `${process.env.FRONT_URL}/app/connexion?token=${resetToken}`;

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

    console.log("[INFO] Email de réinitialisation envoyé.");
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
exports.requestEmailConfirmation = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error("[ERROR] Utilisateur non trouvé.");
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    sendEmailConfirmation(user);

    console.log("[INFO] Email de confirmation envoyé.");
    res.status(200).json({ message: "Email de confirmation envoyé." });
  } catch (error) {
    console.error(
      "[ERROR] Erreur lors de la demande de confirmation de l'email.",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la demande de confirmation de l'email.",
    });
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      console.error("[ERROR] Token de confirmation d'email manquant.");
      return res
        .status(400)
        .json({ error: "Token de confirmation d'email manquant." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    } catch (jwtError) {
      console.error(
        "[ERROR] Token de confirmation invalide ou expiré:",
        jwtError
      );
      return res
        .status(400)
        .json({ error: "Token de confirmation invalide ou expiré." });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.error("[ERROR] Utilisateur non trouvé.");
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    user.emailConfirmed = 1;
    await user.save();

    res.status(200).json({ message: "Email confirmé avec succès." });
  } catch (error) {
    console.error("[ERROR] Erreur lors de la confirmation de l'email.", error);
    res.status(500).json({
      error: "Erreur lors de la confirmation de l'email.",
    });
  }
};
