const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Post = require("../models/Post");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const MODELS = ["gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.8-flash"];

const improvePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!isValidId(postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }

    const original = await Post.findById(postId);
    if (!original) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    if (original.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to improve this post.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const prompt = `You are a professional content editor. Improve the following blog post to make it clearer, more engaging, and better structured.
Keep the same topic and core message. Return ONLY the improved content, with no extra commentary and no markdown code fences.

Title: ${original.title}
Description: ${original.description}
Content:
${original.content}`;

    let improvedContent = null;
    for (const name of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent(prompt);
        improvedContent = result.response.text();
        console.log(`AI success with model: ${name}`);
        break;
      } catch (err) {
        console.error(`Model ${name} failed:`, err.status || err.message);
      }
    }

    if (!improvedContent) {
      return res.status(503).json({
        success: false,
        message: "AI service is busy. Please try again shortly.",
      });
    }

    const newDraft = await Post.create({
      title: `${original.title} (AI Improved)`,
      description: original.description,
      content: improvedContent,
      image: original.image,
      category: original.category,
      createdBy: req.user._id,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "AI-improved draft created successfully. The original post was not modified.",
      originalPostId: original._id,
      newDraft,
    });
  } catch (error) {
    console.error("improvePost error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while improving post with AI.",
    });
  }
};

module.exports = { improvePost };