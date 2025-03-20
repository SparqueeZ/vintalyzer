const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateExtToken = (req, res, next) => {
  const token = req.body.ext_token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, `${process.env.JWT_SECRET}ext`, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateExtToken;
