const mongoose = require("mongoose");
const Post = require("../models/Post");

// ── Helpers ───────────────────────────────────────────────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── POST /posts ───────────────────────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { title, description, content, image, category, status } = req.body;

    // Only allow 'draft' or 'pending' on creation
    const allowedStatuses = ["draft", "pending"];
    const postStatus =
      allowedStatuses.includes(status) ? status : "draft";

    const post = await Post.create({
      title,
      description,
      content,
      image: image || "",
      category,
      createdBy: req.user._id,
      status: postStatus,
    });

    return res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("createPost error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error creating post." });
  }
};

// ── GET /posts ─────────────────────────────────────────────────────────────────
const getApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "approved" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error("getApprovedPosts error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching posts." });
  }
};

// ── GET /posts/:id ─────────────────────────────────────────────────────────────
const getApprovedPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findOne({ _id: id, status: "approved" }).populate(
      "createdBy",
      "name email"
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Approved post not found." });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("getApprovedPostById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching post." });
  }
};

// ── GET /posts/my-posts ────────────────────────────────────────────────────────
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error("getMyPosts error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching your posts." });
  }
};

// ── PATCH /posts/:id ───────────────────────────────────────────────────────────
const updatePost = async (req, res) => {
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

    // Only the owner can edit
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised to edit this post." });
    }

    const allowedFields = [
      "title",
      "description",
      "content",
      "image",
      "category",
      "status",
    ];
    // Only allow setting status back to draft or pending (owner cannot approve)
    const safeStatus = ["draft", "pending"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "status" && !safeStatus.includes(req.body[field])) return;
        post[field] = req.body[field];
      }
    });

    await post.save();

    return res
      .status(200)
      .json({ success: true, message: "Post updated.", post });
  } catch (error) {
    console.error("updatePost error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating post." });
  }
};

// ── DELETE /posts/:id ──────────────────────────────────────────────────────────
const deletePost = async (req, res) => {
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

    // Only the owner can delete
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to delete this post.",
      });
    }

    await post.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    console.error("deletePost error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error deleting post." });
  }
};

module.exports = {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
