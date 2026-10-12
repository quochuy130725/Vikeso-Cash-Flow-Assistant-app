const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
require('dotenv').config(); // Đọc file .env đầu tiên

const http = require('http');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/swagger.json');
const connectDB = require('./src/config/database');
const apiRoutes = require('./src/routes/apiRoutes');
const authRoutes = require('./src/routes/authRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { initSocket } = require('./src/socket');

const app = express();

// Tạo HTTP server bọc ngoài Express để Socket.IO có thể gắn vào cùng port
const httpServer = http.createServer(app);

// Khởi tạo Socket.IO — phải làm TRƯỚC khi lắng nghe
initSocket(httpServer);

// Kết nối MongoDB Atlas
connectDB();

// Middleware parse JSON & CORS với cache preflight 24h (loại bỏ độ trễ OPTIONS mỗi lần click)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi chạy hệ thống Cron-job tự động bắn báo cáo (Chạy ngầm)
require('./src/services/cronService');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check & Prewarm endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', time: Date.now() }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', time: Date.now() }));

// Gắn toàn bộ routes
app.use('/api/auth', authRoutes);   // ─ Đăng nhập/Đăng ký/Google Sign-In
app.use('/api', apiRoutes);         // ─ Scan receipt, manual-entry, transactions...
app.use('/api/billing', billingRoutes); // ─ SePay VietQR: create-order, status, history, sepay/webhook
app.use('/api/admin', adminRoutes); // ─ Admin: users, overview, transactions, payments

// Bật Server lắng nghe — dùng httpServer thay vì app.listen()
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket đang lắng nghe tại cổng: ${PORT}`);
});