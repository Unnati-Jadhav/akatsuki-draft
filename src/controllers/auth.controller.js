const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper ────────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// ── POST /auth/register ───────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered." });
    }

    // Role is always 'user' on public registration — never trust the request body
    const user = await User.create({ name, email, password, role: "user" });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("register error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it is hidden by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by protect middleware
  return res.status(200).json({
    success: true,
    user: userResponse(req.user),
  });
};

module.exports = { register, login, getMe };
