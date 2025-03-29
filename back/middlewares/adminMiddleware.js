// Middleware to check if a user is an administrator
const adminMiddleware = (req, res, next) => {
  try {
    // Assuming the role is stored in the user object from the auth middleware
    if (!req.user || req.user.roleId !== 1) {
      // Assuming roleId 1 is admin
      return res.status(403).json({
        error: "Unauthorized access. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("[AUTH ERROR] Admin authorization error:", error);
    return res.status(500).json({
      error: "Authorization error",
    });
  }
};

module.exports = adminMiddleware;
