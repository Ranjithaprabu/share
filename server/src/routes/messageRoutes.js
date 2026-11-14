const express = require("express");

const {
  createMessage,
  fetchMessages,
  markAsRead,
} = require("../controllers/messageController");
const {
  validateMessage,
  validateConversationId,
} = require("../validators/messageValidator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, validateMessage, createMessage);

router.get("/:conversationId", authMiddleware, fetchMessages);

router.patch("/:conversationId/read", authMiddleware, markAsRead);
router.get(
  "/:conversationId",
  authMiddleware,
  validateConversationId,
  fetchMessages
);

router.patch(
  "/:conversationId/read",
  authMiddleware,
  validateConversationId,
  markAsRead
);
module.exports = router;
