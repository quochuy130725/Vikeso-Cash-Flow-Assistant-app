require('dotenv').config(); // Đọc file .env đầu tiên

const http = require('http');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/swagger.json');
const connectDB = require('./src/config/database');
const apiRoutes = require('./src/routes/apiRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { initSocket } = require('./src/socket');

const app = express();

// Tạo HTTP server bọc ngoài Express để Socket.IO có thể gắn vào cùng port
const httpServer = http.createServer(app);

// Khởi tạo Socket.IO — phải làm TRƯỚC khi lắng nghe
initSocket(httpServer);

// Kết nối MongoDB Atlas
connectDB();

// Middleware parse JSON
app.use(cors());            // ← Cho phép Flutter Web / Postman gọi API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi chạy hệ thống Cron-job tự động bắn báo cáo (Chạy ngầm)
require('./src/services/cronService');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Gắn toàn bộ routes
app.use('/api/auth', authRoutes);   // ─ Đăng nhập/Đăng ký/Google Sign-In
app.use('/api', apiRoutes);         // ─ Scan receipt, manual-entry, transactions...

// Bật Server lắng nghe — dùng httpServer thay vì app.listen()
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket đang chạy tại: http://localhost:${PORT}`);
});