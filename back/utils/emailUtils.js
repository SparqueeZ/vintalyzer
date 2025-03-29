const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sendEmailConfirmation = async (user) => {
  try {
    // console.log("[INFO] Sending email confirmation");
    const emailToken = jwt.sign({ id: user.id }, process.env.EMAIL_SECRET, {
      expiresIn: "1h",
    });

    const confirmationLink = `${process.env.FRONT_URL}/confirm-email/${emailToken}`;

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
      subject: "Email Confirmation",
      text: `Click the link to confirm your email: ${confirmationLink}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("[INFO] Email confirmation sent");
  } catch (error) {
    console.error("[ERROR] Failed to send email confirmation:", error);
  }
};

module.exports = {
  sendEmailConfirmation,
};
