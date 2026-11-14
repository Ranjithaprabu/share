
const {
    getUserProfile,
    getAllUsers,
  } = require("../services/userService");
  
  const getMe = async (req, res, next) => {
    try {
      const user = await getUserProfile(req.user.id);
  
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  };
  
  const getUsers = async (req, res, next) => {
    try {
      const users = await getAllUsers(req.user.id);
  
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    getMe,
    getUsers,
  };
  