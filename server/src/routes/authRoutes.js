const express = require("express");
const { register, login } = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);

module.exports = router;
