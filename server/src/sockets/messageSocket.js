
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const setupMessageSocket = (io, socket) => {
  // Join a conversation room
  socket.on("join_conversation", async (conversationId) => {
    try {
      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId)
      ) {
        return socket.emit("socket_error", {
          message: "Invalid conversation ID",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.user": socket.userId,
      });

      if (!conversation) {
        return socket.emit("socket_error", {
          message: "Conversation not found or access denied",
        });
      }

      socket.join(`conversation:${conversationId}`);
    } catch (error) {
      socket.emit("socket_error", {
        message: "Unable to join conversation",
      });
    }
  });

  // Typing started
  socket.on("typing_start", async (conversationId) => {
    try {
      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId)
      ) return;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.user": socket.userId,
      });

      if (!conversation) return;

      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        conversationId,
        userId: socket.userId,
      });
    } catch (error) {
      socket.emit("socket_error", {
        message: "Unable to update typing status",
      });
    }
  });

  // Typing stopped
  socket.on("typing_stop", async (conversationId) => {
    try {
      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId)
      ) return;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.user": socket.userId,
      });

      if (!conversation) return;

      socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
        conversationId,
        userId: socket.userId,
      });
    } catch (error) {
      socket.emit("socket_error", {
        message: "Unable to update typing status",
      });
    }
  });

  // Send a real-time message
  socket.on("send_message", async (payload) => {
    try {
      if (!payload || typeof payload !== "object") {
        return socket.emit("socket_error", {
          message: "Invalid message payload",
        });
      }

      const { conversationId, content } = payload;

      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId)
      ) {
        return socket.emit("socket_error", {
          message: "Invalid conversation ID",
        });
      }

      if (typeof content !== "string" || !content.trim()) {
        return socket.emit("socket_error", {
          message: "Message cannot be empty",
        });
      }

      if (content.trim().length > 5000) {
        return socket.emit("socket_error", {
          message: "Message cannot exceed 5000 characters",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.user": socket.userId,
      });

      if (!conversation) {
        return socket.emit("socket_error", {
          message: "Conversation not found or access denied",
        });
      }

      const message = await Message.create({
        sender: socket.userId,
        conversation: conversationId,
        content: content.trim(),
        messageType: "text",
        readBy: [socket.userId],
      });

      const populatedMessage = await message.populate("sender", "name avatar");

      io.to(`conversation:${conversationId}`).emit(
        "receive_message",
        populatedMessage
      );
    } catch (error) {
      socket.emit("socket_error", {
        message: "Unable to send message",
      });
    }
  });
};

module.exports = setupMessageSocket;
