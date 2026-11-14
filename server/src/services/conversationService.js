
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Create direct conversation
const createDirectConversation = async (userId, receiverId) => {
  if (String(userId) === String(receiverId)) {
    const error = new Error("You cannot chat with yourself");
    error.statusCode = 400;
    throw error;
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    const error = new Error("Receiver not found");
    error.statusCode = 404;
    throw error;
  }

  const participantIds = [String(userId), String(receiverId)].sort();

  const existingConversation = await Conversation.findOne({
    type: "direct",
    participants: {
      $size: 2,
      $all: [
        { $elemMatch: { user: userId } },
        { $elemMatch: { user: receiverId } },
      ],
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  try {
    return await Conversation.create({
      type: "direct",
      participants: participantIds.map((id) => ({
        user: id,
        role: "member",
      })),
      createdBy: userId,
    });
  } catch (error) {
    // If another request created the same conversation,
    // retrieve it instead of failing.
    const conversation = await Conversation.findOne({
      type: "direct",
      participants: {
        $size: 2,
        $all: [
          { $elemMatch: { user: userId } },
          { $elemMatch: { user: receiverId } },
        ],
      },
    });

    if (conversation) {
      return conversation;
    }

    throw error;
  }
};

// Create group conversation
const createGroupConversation = async (userId, name, memberIds) => {
  const uniqueMemberIds = [...new Set([userId, ...memberIds].map(String))];

  if (uniqueMemberIds.length < 3) {
    const error = new Error("A group needs at least 3 participants");
    error.statusCode = 400;
    throw error;
  }

  const validUsers = await User.countDocuments({
    _id: { $in: uniqueMemberIds },
  });

  if (validUsers !== uniqueMemberIds.length) {
    const error = new Error("One or more users do not exist");
    error.statusCode = 400;
    throw error;
  }

  return await Conversation.create({
    type: "group",
    name,
    participants: uniqueMemberIds.map((id) => ({
      user: id,
      role: id === String(userId) ? "admin" : "member",
    })),
    createdBy: userId,
  });
};

// Get user conversations
const getUserConversations = async (userId) => {
  return await Conversation.find({
    "participants.user": userId,
  })
    .populate("participants.user", "name email avatar")
    .sort({ updatedAt: -1 });
};

// Remove group member
const removeGroupMember = async (userId, conversationId, memberId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    type: "group",
  });

  if (!conversation) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const isAdmin = conversation.participants.some(
    (participant) =>
      String(participant.user) === String(userId) &&
      participant.role === "admin"
  );

  if (!isAdmin) {
    const error = new Error("Only group admins can remove members");
    error.statusCode = 403;
    throw error;
  }

  if (String(userId) === String(memberId)) {
    const error = new Error("Admin cannot remove themselves");
    error.statusCode = 400;
    throw error;
  }

  const isMember = conversation.participants.some(
    (participant) => String(participant.user) === String(memberId)
  );

  if (!isMember) {
    const error = new Error("User is not a member of this group");
    error.statusCode = 404;
    throw error;
  }

  conversation.participants = conversation.participants.filter(
    (participant) => String(participant.user) !== String(memberId)
  );

  await conversation.save();

  return conversation;
};

// Add group members
const addGroupMembers = async (userId, conversationId, memberIds) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    type: "group",
  });

  if (!conversation) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const isAdmin = conversation.participants.some(
    (participant) =>
      String(participant.user) === String(userId) &&
      participant.role === "admin"
  );

  if (!isAdmin) {
    const error = new Error("Only group admins can add members");
    error.statusCode = 403;
    throw error;
  }

  const existingIds = conversation.participants.map((participant) =>
    String(participant.user)
  );

  const newIds = [...new Set(memberIds.map(String))].filter(
    (id) => !existingIds.includes(id)
  );

  if (newIds.length === 0) {
    const error = new Error("All users are already group members");
    error.statusCode = 400;
    throw error;
  }

  const validUsers = await User.countDocuments({
    _id: { $in: newIds },
  });

  if (validUsers !== newIds.length) {
    const error = new Error("One or more users do not exist");
    error.statusCode = 400;
    throw error;
  }

  conversation.participants.push(
    ...newIds.map((id) => ({
      user: id,
      role: "member",
    }))
  );

  await conversation.save();

  return conversation;
};

module.exports = {
  createDirectConversation,
  createGroupConversation,
  getUserConversations,
  removeGroupMember,
  addGroupMembers,
};
