const express = require("express");
const router = express.Router();
const {
  getPendingPosts,
  approvePost,
  rejectPost,
} = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

// All admin routes require a valid JWT AND admin role
router.use(protect, adminOnly);

// GET  /admin/posts/pending
router.get("/posts/pending", getPendingPosts);

// PATCH /admin/posts/approve/:id
router.patch("/posts/approve/:id", approvePost);

// PATCH /admin/posts/reject/:id
router.patch("/posts/reject/:id", rejectPost);

module.exports = router;
