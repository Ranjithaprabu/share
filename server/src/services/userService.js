
const User = require("../models/User");

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const getAllUsers = async (currentUserId) => {
  return await User.find({
    _id: { $ne: currentUserId },
  })
    .select("name email avatar")
    .sort({ name: 1 });
};

module.exports = {
  getUserProfile,
  getAllUsers,
};
