require('dotenv').config(); // Đọc file .env đầu tiên

const express = require('express');
const connectDB = require('./src/config/database');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();

// Kết nối MongoDB Atlas
connectDB();

// Middleware parse JSON
app.use(express.json());

// Gắn toàn bộ routes vào prefix /api
app.use('/api', apiRoutes);

// Bật Server lắng nghe
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});