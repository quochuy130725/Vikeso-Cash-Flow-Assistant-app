require('dotenv').config(); // Đọc file .env đầu tiên

const http = require('http');
const express = require('express');
const connectDB = require('./src/config/database');
const apiRoutes = require('./src/routes/apiRoutes');
const { initSocket } = require('./src/socket');

const app = express();

// Tạo HTTP server bọc ngoài Express để Socket.IO có thể gắn vào cùng port
const httpServer = http.createServer(app);

// Khởi tạo Socket.IO — phải làm TRƯỚC khi lắng nghe
initSocket(httpServer);

// Kết nối MongoDB Atlas
connectDB();

// Middleware parse JSON
app.use(express.json());

// Gắn toàn bộ routes vào prefix /api
app.use('/api', apiRoutes);

// Bật Server lắng nghe — dùng httpServer thay vì app.listen()
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket đang chạy tại: http://localhost:${PORT}`);
});