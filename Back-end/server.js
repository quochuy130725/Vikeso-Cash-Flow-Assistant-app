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

    const { mimetype, buffer } = req.file;
    const userId = req.body.userId || "GUEST_USER"; // Nhận userId nếu có truyền

    console.log(`📸 Ảnh gốc nhận được: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Phép thuật ép cân TỐI ĐA: Thu nhỏ 800px, chuyển Trắng Đen, tăng tương phản và nén JPEG 70%
    const compressedImageBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .grayscale() // Chuyển sang ảnh trắng đen (giảm đi 2/3 dữ liệu màu vô ích)
      .normalize() // Tăng độ tương phản để AI đọc chữ viết tay dễ hơn
      .jpeg({ quality: 70 }) // Hạ mức nén xuống 70%
      .toBuffer();

    console.log(`⚡ Ảnh sau khi nén bằng sharp: ${(compressedImageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📸 Đang gửi ảnh đã nén cho Gemini phân tích...`);

    // Gọi hàm phân tích của Gemini với mảng byte đã nén
    const geminiData = await analyzeReceiptImage('image/jpeg', compressedImageBuffer);
    console.log('✨ Kết quả Gemini trả về:', JSON.stringify(geminiData, null, 2));

    // Bắt lỗi nếu Gemini trả về mảng rỗng do ảnh rác/mờ
    if (geminiData.error_type || !geminiData.items || geminiData.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Ảnh không hợp lệ hoặc quá mờ.", 
        error_type: geminiData.error_type || "UNKNOWN_ERROR" 
      });
    }

    const savedReceipts = [];

    // Lặp qua từng item do Gemini bóc tách (đặc biệt khi chụp Sổ Tay có nhiều mục)
    for (const item of geminiData.items) {
      const { category, transactionType, reason, aiRawData } = item;
      const cacKhoanTien = aiRawData?.CacKhoanTien || [];

      // Tính tổng tiền
      const totalAmount = cacKhoanTien.reduce((sum, current) => sum + current, 0);

      // Xử lý lưới lọc POS kết ca (Lưới lọc nguyên tử)
      if (category === "POS Ket Ca") {
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

        await Receipt.updateMany(
          { 
            userId, 
            category: "Hoa Don Le", 
            transactionType: "THU", // BẮT BUỘC CHỈ GẠCH BỎ KHOẢN THU
            status: "VALID",
            transactionDate: { $gte: startOfDay, $lte: endOfDay }
          },
          { $set: { status: "MERGED" } }
        );
        console.log('⚡ [Lưới lọc] Đã quét và ẩn các hóa đơn bán lẻ (THU) cũ trong ngày.');
      }

      // Lưu vào Database
      const newReceipt = await Receipt.create({
        userId,
        category,
        transactionType,
        totalAmount,
        reason,
        aiRawData
      });
      
      savedReceipts.push(newReceipt);
    }

    return res.status(200).json({
      success: true,
      message: "Quét và lưu hóa đơn thành công!",
      data: savedReceipts
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