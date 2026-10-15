const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const userRoom = (userId) => `user:${String(userId)}`;

const initSocket = (httpServer) => {
  io = socketIO(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    // Xác thực bằng JWT gửi kèm khi kết nối: io(url, { auth: { token } })
    // → mỗi user vào phòng riêng, chỉ nhận dữ liệu của chính mình.
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    let userId = null;
    if (token) {
      try {
        userId = jwt.verify(token, process.env.JWT_SECRET).userId;
      } catch (_) {
        socket.emit('auth_error', { message: 'Token không hợp lệ hoặc đã hết hạn.' });
      }
    }

    if (userId) {
      socket.join(userRoom(userId));
      console.log(`🔌 Socket ${socket.id} kết nối (user ${userId})`);
    } else {
      console.log(`🔌 Socket ${socket.id} kết nối (chưa xác thực)`);
    }

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

/**
 * Gửi sự kiện realtime chỉ tới các thiết bị của 1 user.
 * Không throw nếu socket chưa init (vd: chạy script / test).
 */
const emitToUser = (userId, event, payload = {}) => {
  if (!io || !userId) return;
  try {
    io.to(userRoom(userId)).emit(event, { userId: String(userId), ...payload });
  } catch (err) {
    console.warn(`⚠️ emitToUser(${event}) lỗi:`, err.message);
  }
};

module.exports = { initSocket, getIO, emitToUser };
