
const mongoose = require("mongoose");

// Validate direct conversation
const validateDirectConversation = (req, res, next) => {
  const { receiverId } = req.body;

  if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({
      success: false,
      message: "Valid receiver ID is required",
    });
  }

  next();
};

// Validate group creation
const validateGroupConversation = (req, res, next) => {
  const { name, memberIds } = req.body;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 50
  ) {
    return res.status(400).json({
      success: false,
      message: "Group name must be between 2 and 50 characters",
    });
  }

  if (!Array.isArray(memberIds)) {
    return res.status(400).json({
      success: false,
      message: "Member IDs must be an array",
    });
  }

  if (!memberIds.every(
    (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
  )) {
    return res.status(400).json({
      success: false,
      message: "Invalid member ID",
    });
  }

  next();
};

// Validate adding group members
const validateAddMembers = (req, res, next) => {
  const { memberIds } = req.body;

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one member ID is required",
    });
  }

  if (!memberIds.every(
    (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
  )) {
    return res.status(400).json({
      success: false,
      message: "Invalid member ID",
    });
  }

  next();
};

// Validate removing a group member
const validateRemoveMember = (req, res, next) => {
  const { memberId } = req.body;

  if (
    typeof memberId !== "string" ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid member ID is required",
    });
  }

  next();
};

// Validate conversation ID in URL
const validateConversationId = (req, res, next) => {
  const { conversationId } = req.params;

  if (
    typeof conversationId !== "string" ||
    !mongoose.Types.ObjectId.isValid(conversationId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid conversation ID",
    });
  }

  next();
};

module.exports = {
  validateDirectConversation,
  validateGroupConversation,
  validateAddMembers,
  validateRemoveMember,
  validateConversationId,
};
