const mongoose = require("mongoose");

const validateMessage = (req, res, next) => {
  const { conversationId, content } = req.body;

  if (!conversationId || content === undefined) {
    return res.status(400).json({
      success: false,
      message: "Conversation ID and message content are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid conversation ID",
    });
  }

  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message cannot be empty",
    });
  }

  if (content.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Message cannot exceed 5000 characters",
    });
  }

  next();
};

const validateConversationId = (req, res, next) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid conversation ID",
    });
  }

  next();
};

module.exports = {
  validateMessage,
  validateConversationId,
};
