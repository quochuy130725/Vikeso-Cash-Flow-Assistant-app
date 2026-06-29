require('dotenv').config(); // Đọc file .env đầu tiên
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp'); // Thêm thần khí bóp ảnh
const { analyzeReceiptImage } = require('./services/geminiAI');
const Receipt = require('./models/Receipt');

const app = express();

// Cấu hình Multer lưu file tạm trong RAM để gửi thẳng API Gemini
const upload = multer({ storage: multer.memoryStorage() });

// Middleware để Express đọc được dữ liệu JSON từ body request gửi lên
app.use(express.json());

// ---------------------------------------------------------
// CẤU HÌNH KẾT NỐI MONGODB
// ---------------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() =>
    console.log('🔥 Kết nối MongoDB thành công rồi ông giáo ơi!'))
  .catch((err) =>
    console.error('🚨 Lỗi kết nối DB rồi bồ tèo:', err));

// ---------------------------------------------------------
// ROUTE TEST API 1: MANUAL ENTRY (.reduce() + Lưới lọc + Telegram)
// ---------------------------------------------------------
const manualEntryController = require('./controllers/manualEntryController');
app.post('/api/manual-entry', manualEntryController.saveManualEntry);

// ---------------------------------------------------------
// ROUTE TEST API 2: UPLOAD & SCAN HÓA ĐƠN VỚI GEMINI
// ---------------------------------------------------------
app.post('/api/scan-receipt', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Vui lòng upload ảnh hóa đơn (field name: image)' });
    }

    const { buffer } = req.file;
    console.log(`📸 Ảnh gốc nhận được: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Nén ảnh: Thu nhỏ 800px, trắng đen, tăng tương phản, nén JPEG 70%
    const compressedImageBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .jpeg({ quality: 70 })
      .toBuffer();

    console.log(`⚡ Ảnh sau nén: ${(compressedImageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📸 Đang gửi ảnh cho Gemini phân tích...`);

    // Gọi Gemini AI phân tích - CHỈ TRẢ KẾT QUẢ, CHƯA LƯU DB
    const geminiData = await analyzeReceiptImage('image/jpeg', compressedImageBuffer);
    console.log('✨ Kết quả Gemini:', JSON.stringify(geminiData, null, 2));

    // Bắt lỗi ảnh rác / ảnh mờ
    if (geminiData.error_type || !geminiData.items || geminiData.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Ảnh không hợp lệ hoặc quá mờ.", 
        error_type: geminiData.error_type || "UNKNOWN_ERROR" 
      });
    }

    // ✅ Trả về items để Flutter hiển thị SplitScreen cho người dùng xem lại
    // Việc lưu DB sẽ xảy ra SAU KHI người dùng xác nhận qua /api/manual-entry
    return res.status(200).json({
      success: true,
      message: "AI phân tích thành công! Vui lòng xem lại trước khi lưu.",
      items: geminiData.items   // <-- trả về raw items từ Gemini
    });

  } catch (error) {
    console.error("Lỗi scan-receipt:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Bật Server lắng nghe cổng 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});