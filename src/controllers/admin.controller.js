const mongoose = require("mongoose");
const Post = require("../models/Post");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET /admin/posts/pending ───────────────────────────────────────────────────
const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error("getPendingPosts error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching pending posts." });
  }
};

// ── PATCH /admin/posts/approve/:id ────────────────────────────────────────────
const approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    post.status = "approved";
    await post.save();

    return res
      .status(200)
      .json({ success: true, message: "Post approved.", post });
  } catch (error) {
    console.error("approvePost error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error approving post." });
  }
};

// ── PATCH /admin/posts/reject/:id ─────────────────────────────────────────────
const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    post.status = "rejected";
    await post.save();

    return res
      .status(200)
      .json({ success: true, message: "Post rejected.", post });
  } catch (error) {
    console.error("rejectPost error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error rejecting post." });
  }
};

module.exports = { getPendingPosts, approvePost, rejectPost };
