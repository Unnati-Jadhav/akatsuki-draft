const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protects routes — expects  Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided. Access denied." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user object (without password) to req.user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired. Please log in again." });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid token. Access denied." });
  }
};

/**
 * Restricts access to admin-only routes.
 * Must be used AFTER `protect`.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, message: "Access denied. Admins only." });
};

module.exports = { protect, adminOnly };
