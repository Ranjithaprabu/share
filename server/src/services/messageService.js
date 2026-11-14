
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// Send message
const sendMessage = async (userId, conversationId, content) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.user": userId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const message = await Message.create({
    sender: userId,
    conversation: conversationId,
    content: content.trim(),
    messageType: "text",
    readBy: [userId],
  });

  return await message.populate("sender", "name avatar");
};

// Get messages with pagination
const getMessages = async (userId, conversationId, page = 1) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.user": userId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const limit = 20;
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    conversation: conversationId,
  })
    .populate("sender", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return messages.reverse();
};

// Mark messages as read
const markMessagesAsRead = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.user": userId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
    }
  );
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
};
