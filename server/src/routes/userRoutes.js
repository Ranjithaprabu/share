
const express = require("express");

const {
  getMe,
  getUsers,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, getMe);

router.get("/", authMiddleware, getUsers);

module.exports = router;
