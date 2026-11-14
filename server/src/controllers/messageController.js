const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
} = require("../services/messageService");
const createMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    const message = await sendMessage(req.user.id, conversationId, content);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

const fetchMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const messages = await getMessages(req.user.id, conversationId, page);

    res.status(200).json({
      success: true,
      page,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    await markMessagesAsRead(req.user.id, conversationId);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  fetchMessages,
  markAsRead,
};
