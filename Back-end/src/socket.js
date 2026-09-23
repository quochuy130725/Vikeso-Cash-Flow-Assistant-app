const socketIO = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = socketIO(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client kết nối Socket.IO: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client ngắt kết nối Socket.IO: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO chưa được khởi tạo! Hãy gọi initSocket() trong server.js trước.');
  }
  return io;
};

module.exports = { initSocket, getIO };
