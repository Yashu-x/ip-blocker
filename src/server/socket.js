const { Server } = require("socket.io");

let io;

function registerSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.emit("system:ready", { connectedAt: new Date().toISOString() });
  });

  return io;
}

function getSocketServer() {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }

  return io;
}

module.exports = { registerSocketServer, getSocketServer };
