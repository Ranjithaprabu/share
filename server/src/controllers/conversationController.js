const {
  createDirectConversation,
  createGroupConversation,
  getUserConversations,
  removeGroupMember,
  addGroupMembers,
} = require("../services/conversationService");
const createDirect = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    const conversation = await createDirectConversation(
      req.user.id,
      receiverId
    );

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;

    const conversation = await createGroupConversation(
      req.user.id,
      name,
      memberIds
    );

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};
const getConversations = async (req, res, next) => {
  try {
    const conversations = await getUserConversations(req.user.id);

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { memberId } = req.body;

    const conversation = await removeGroupMember(
      req.user.id,
      conversationId,
      memberId
    );

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

const addMembers = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { memberIds } = req.body;

    const conversation = await addGroupMembers(
      req.user.id,
      conversationId,
      memberIds
    );

    res.status(200).json({
      success: true,
      message: "Members added successfully",
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDirect,
  createGroup,
  getConversations,
  removeMember,
  addMembers,
};
