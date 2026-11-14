const jwt = require("jsonwebtoken");
const setupMessageSocket = require("./messageSocket");
const setupPresenceSocket = require("./presenceSocket");
const setupSocket = (io) => {
  // Verify user token before connecting
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated user connected:", socket.userId);
    setupMessageSocket(io, socket);
    setupPresenceSocket(io, socket);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

module.exports = setupSocket;
