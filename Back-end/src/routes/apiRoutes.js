const express = require('express');
const router = express.Router();

// Middleware
const upload = require('../middlewares/upload');

// Controllers
const manualEntryController = require('../controllers/manualEntryController');
const aiReceiptController = require('../controllers/aiReceiptController');
const User = require('../models/User');
const Receipt = require('../models/Receipt');

// ---------------------------------------------------------
// API 1: LƯU DỮ LIỆU - Lưới lọc 2 chiều & Telegram Bot
// POST /api/manual-entry
// ---------------------------------------------------------
router.post('/manual-entry', manualEntryController.saveManualEntry);

// ---------------------------------------------------------
// API 2: SCAN HÓA ĐƠN - Upload ảnh & Gemini OCR
// POST /api/scan-receipt
// ---------------------------------------------------------
// Dùng callback pattern thay vì middleware trực tiếp
// để bắt lỗi từ multer/busboy (tương thích Express v5)
router.post('/scan-receipt', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Lỗi xử lý file upload',
      });
    }
    next();
  });
}, aiReceiptController.scanReceipt);

// ---------------------------------------------------------
// API 3: XÁC NHẬN & LƯU HÓA ĐƠN (Sau khi user review SplitScreen)
// POST /api/confirm-receipt  →  lưu DB + emit WebSocket 'new_transaction'
// ---------------------------------------------------------
router.post('/confirm-receipt', aiReceiptController.confirmReceipt);

// ---------------------------------------------------------
// API 4: ĐĂNG NHẬP
// POST /api/login
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        email: user.email,
        shopName: user.shopName,
        telegramChatId: user.telegramChatId,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// API 4: LẤY DANH SÁCH GIAO DỊCH (Analytics)
// GET /api/transactions?userId=...
// ---------------------------------------------------------
router.get('/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId' });
    }

    const receipts = await Receipt.find({ userId, status: 'VALID' }).sort({ transactionDate: -1 });

    return res.status(200).json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error('Lỗi get-transactions:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// API TEST: Trigger báo cáo cuối ngày ngay lập tức (CHỈ DÙNG KHI TEST)
// POST /api/test-report
// ---------------------------------------------------------
router.post('/test-report', async (req, res) => {
  try {
    const { runDailyReport } = require('../services/cronService');
    console.log("🧪 [TEST] Trigger báo cáo thủ công...");
    const result = await runDailyReport();
    return res.status(200).json({
      success: true,
      message: 'Báo cáo đã được gửi thành công!',
      result,
    });
  } catch (error) {
    console.error('Lỗi test-report:', error);
    return res.status(500).json
      ({ success: false, error: error.message });
  }
});

module.exports = router;
