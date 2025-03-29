const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  // Log for debugging
  console.log("[AUTH] Cookie token check:", token ? "Present" : "Missing");

  if (!token) {
    console.error("[AUTH] No authentication token found in cookies");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("[AUTH] Token verification failed:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("[AUTH] Token verified successfully for user ID:", user.id);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
