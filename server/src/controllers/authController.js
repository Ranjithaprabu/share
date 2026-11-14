
const {
    registerUser,
    loginUser,
  } = require("../services/authService");
  
  const register = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
  
      const { user, token } = await registerUser(name, email, password);
  
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  
  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      const { user, token } = await loginUser(email, password);
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = { register, login };
  