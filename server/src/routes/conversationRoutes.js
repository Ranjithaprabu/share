const express = require("express");

const {
  createDirect,
  createGroup,
  getConversations,
  removeMember,
  addMembers,
} = require("../controllers/conversationController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  validateDirectConversation,
  validateGroupConversation,
  validateAddMembers,
  validateRemoveMember,
  validateConversationId,
} = require("../validators/conversationValidator");

const router = express.Router();

// Create direct conversation
router.post(
  "/direct",
  authMiddleware,
  validateDirectConversation,
  createDirect
);

// Create group conversation
router.post("/group", authMiddleware, validateGroupConversation, createGroup);

// Get all user conversations
router.get("/", authMiddleware, getConversations);

// Remove group member
router.delete(
  "/:conversationId/members",
  authMiddleware,
  validateConversationId,
  validateRemoveMember,
  removeMember
);

// Add group members
router.post(
  "/:conversationId/members",
  authMiddleware,
  validateConversationId,
  validateAddMembers,
  addMembers
);

module.exports = router;
