const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Middleware
const upload = require('../middlewares/upload');
const { optionalToken } = require('../middlewares/verifyToken');
const { blockStaff } = require('../middlewares/rbac');

// Controllers
const manualEntryController = require('../controllers/manualEntryController');
const aiReceiptController = require('../controllers/aiReceiptController');
const analyticsController = require('../controllers/analyticsController');
const telegramController = require('../controllers/telegramController');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const { runDailyReport } = require('../services/cronService');

// ---------------------------------------------------------
// API 1: LƯU DỮ LIỆU THỦ CÔNG - Lưới lọc 2 chiều & WebSocket
// POST /api/manual-entry
// ---------------------------------------------------------
router.post('/manual-entry', optionalToken, manualEntryController.saveManualEntry);

// ---------------------------------------------------------
// API 2: SCAN HÓA ĐƠN - Upload 1 ảnh (FREE) hoặc tối đa 3 ảnh (PRO)
// POST /api/scan-receipt
// ---------------------------------------------------------
router.post('/scan-receipt', optionalToken, (req, res, next) => {
  upload.any()(req, res, (err) => {
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
// API 3: XÁC NHẬN & LƯU HÓA ĐƠN (Sau SplitScreen Review)
// POST /api/confirm-receipt  -> lưu DB + Lưới lọc + WebSocket
// ---------------------------------------------------------
router.post('/confirm-receipt', optionalToken, aiReceiptController.confirmReceipt);

// ---------------------------------------------------------
// API 4: ĐĂNG NHẬP (Hỗ trợ tương thích ngược cho client cũ)
// POST /api/login
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.phone || req.body.identifier || '').trim();
    const { password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email/số điện thoại và mật khẩu' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Email/Số điện thoại hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    const isPlainMatch = user.password === password; // fallback cho tài khoản test cũ chưa hash
    if (!isMatch && !isPlainMatch) {
      return res.status(400).json({ success: false, message: 'Email/Số điện thoại hoặc mật khẩu không đúng' });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa bởi chủ cửa hàng.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'OWNER',
        shopName: user.shopName,
        telegramChatId: user.telegramChatId,
        subscriptionPlan: user.subscriptionPlan,
        notificationSettings: user.notificationSettings || { receiveEmail: true, receiveTelegram: true, receiveInApp: true },
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// API 5: BIẾN ĐỘNG THU - CHI ĐA KỲ & SO SÁNH CÙNG KỲ (Chặn STAFF)
// GET /api/transactions/analytics
// ---------------------------------------------------------
router.get('/transactions/analytics', optionalToken, blockStaff, analyticsController.getAnalytics);

// ---------------------------------------------------------
// API 6: LẤY DANH SÁCH GIAO DỊCH
// GET /api/transactions?userId=...&month=...&year=...
// ---------------------------------------------------------
router.get('/transactions', optionalToken, async (req, res) => {
  try {
    const effectiveUserId = req.user?.employerId || req.user?.userId || req.user?.id || req.query.userId;
    if (!effectiveUserId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId' });
    }

    const filter = { userId: effectiveUserId };

    // 1. Phân quyền STAFF: Thu ngân chỉ thấy hóa đơn do chính mình tạo
    if (req.user?.role === 'STAFF') {
      filter.createdBy = req.user.userId;
    }

    // 2. Lọc theo trạng thái
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // 3. Lọc theo cửa hàng (nếu có)
    if (req.query.shopId) {
      filter.shopId = req.query.shopId;
    }

    // 4. Lọc theo tháng/năm trên accountingDate
    const vnOffset = 7 * 60 * 60 * 1000;
    if (req.query.month && req.query.year) {
      const m = Number(req.query.month) - 1;
      const y = Number(req.query.year);
      const start = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0) - vnOffset);
      const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999) - vnOffset);
      filter.accountingDate = { $gte: start, $lte: end };
    } else if (req.query.fromDate || req.query.toDate) {
      filter.accountingDate = {};
      if (req.query.fromDate) filter.accountingDate.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) filter.accountingDate.$lte = new Date(req.query.toDate);
    }

    const receipts = await Receipt.find(filter)
      .populate('createdBy', 'name email role')
      .populate('shopId', 'shopName')
      .sort({ accountingDate: -1, transactionDate: -1 });

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
// API 7: LẤY THÔNG TIN CÁ NHÂN & CÀI ĐẶT
// GET /api/user/:id/profile
// ---------------------------------------------------------
router.get('/user/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    return res.status(200).json({
      success: true,
      hasTelegram: !!user.telegramChatId,
      settings: user.notificationSettings || { receiveEmail: true, receiveTelegram: true, receiveInApp: true }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// API 8: CẬP NHẬT CÀI ĐẶT THÔNG BÁO
// PUT /api/user/:id/notification-settings
// ---------------------------------------------------------
router.put('/user/:id/notification-settings', async (req, res) => {
  try {
    const { id } = req.params;
    const { receiveEmail, receiveTelegram, receiveInApp } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (!user.notificationSettings) {
      user.notificationSettings = { receiveEmail: true, receiveTelegram: true, receiveInApp: true };
    }

    if (receiveEmail !== undefined) user.notificationSettings.receiveEmail = receiveEmail;
    if (receiveTelegram !== undefined) user.notificationSettings.receiveTelegram = receiveTelegram;
    if (receiveInApp !== undefined) user.notificationSettings.receiveInApp = receiveInApp;

    await user.save();
    require('../socket').emitToUser(user._id, 'profile_updated', { reason: 'notification_settings' });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật cài đặt thông báo thành công',
      settings: user.notificationSettings
    });
  } catch (error) {
    console.error('Lỗi update-notification-settings:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// API TEST: Trigger báo cáo cuối ngày ngay lập tức
// POST /api/test-report
// ---------------------------------------------------------
router.post('/test-report', async (req, res) => {
  try {
    const sendZeroReports = req.body?.sendZeroReports !== undefined ? req.body.sendZeroReports : true;
    const targetEmail = req.body?.email || req.body?.targetEmail || null;
    console.log(`🧪 [TEST] Trigger báo cáo thủ công... (sendZeroReports: ${sendZeroReports}, targetEmail: ${targetEmail || 'all'})`);
    const result = await runDailyReport({ sendZeroReports, targetEmail });
    return res.status(200).json({
      success: true,
      message: 'Báo cáo đã được gửi thành công!',
      result,
    });
  } catch (error) {
    console.error('Lỗi test-report:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// TELEGRAM BOT Webhook
// ---------------------------------------------------------
router.post('/telegram/webhook', telegramController.handleWebhook);
router.get('/telegram/set-webhook', telegramController.setWebhook);

// ---------------------------------------------------------
// TELEGRAM BOT Lịch sử kết ca
// ---------------------------------------------------------
router.get('/telegram/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId' });
    }

    const receipts = await Receipt.find({ userId }).sort({ accountingDate: -1, transactionDate: -1 }).lean();

    const groups = {};
    receipts.forEach((r) => {
      const d = r.accountingDate ? new Date(r.accountingDate) : (r.transactionDate ? new Date(r.transactionDate) : new Date());
      const vnOffset = 7 * 60 * 60 * 1000;
      const vn = new Date(d.getTime() + vnOffset);
      const dayKey = `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}-${String(vn.getUTCDate()).padStart(2, '0')}`;
      if (!groups[dayKey]) {
        groups[dayKey] = { date: vn, thu: 0, chi: 0, count: 0 };
      }
      groups[dayKey].count += 1;
      if (r.transactionType === 'THU') {
        groups[dayKey].thu += (r.totalAmount || 0);
      } else {
        groups[dayKey].chi += (r.totalAmount || 0);
      }
    });

    const history = Object.keys(groups).sort().reverse().map((key) => {
      const g = groups[key];
      const d = g.date;
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      const dateStr = `${day}/${month}/${year}`;
      const dateCompact = `${day}${month}${year}`;
      const net = g.thu - g.chi;

      return {
        sendTime: `${dateStr} 22:00:00`,
        shift: `Ca Ngày ${dateStr}`,
        inflow: `+${g.thu.toLocaleString('vi-VN')} đ`,
        outflow: `-${g.chi.toLocaleString('vi-VN')} đ`,
        net: `${net >= 0 ? '+' : '-'}${Math.abs(net).toLocaleString('vi-VN')} đ`,
        file: `BangKe_${dateCompact}.xlsx`,
        status: 'Thành công (200 OK - Đã gửi Bot)',
        receiptCount: g.count,
      };
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Lỗi telegram history:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
