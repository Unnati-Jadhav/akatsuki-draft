const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

// IMPORTANT: /my-posts must be declared BEFORE /:id so Express doesn't
// treat "my-posts" as an ID parameter.

// GET /posts/my-posts  (protected)
router.get("/my-posts", protect, getMyPosts);

// GET /posts           (public — approved only)
router.get("/", getApprovedPosts);

// GET /posts/:id       (public — approved only)
router.get("/:id", getApprovedPostById);

// POST /posts          (protected)
router.post(
  "/",
  protect,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
  ],
  validate,
  createPost
);

// PATCH /posts/:id     (protected — owner only)
router.patch("/:id", protect, updatePost);

// DELETE /posts/:id    (protected — owner only)
router.delete("/:id", protect, deletePost);

module.exports = router;
