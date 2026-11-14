const onlineUsers = new Map();

const setupPresenceSocket = (io, socket) => {
  const userId = String(socket.userId);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);

  // Notify only when the user connects for the first time
  if (onlineUsers.get(userId).size === 1) {
    io.emit("user_online", userId);
  }

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);

    if (!userSockets) return;

    userSockets.delete(socket.id);

    // Mark offline only when all devices disconnect
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      io.emit("user_offline", userId);
    }
  });
};

module.exports = setupPresenceSocket;
