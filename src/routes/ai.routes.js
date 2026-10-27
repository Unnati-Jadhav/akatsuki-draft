const express = require("express");
const router = express.Router();
const { improvePost } = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

// POST /ai/improve/:postId  (protected — owner only, checked in controller)
router.post("/improve/:postId", protect, improvePost);

module.exports = router;
