const sharp = require('sharp');
const { analyzeReceiptImage } = require('../services/geminiAI');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const { processAndSaveReceipts } = require('../services/receiptService');

/**
 * POST /api/scan-receipt
 * Hỗ trợ nhận 1 ảnh (FREE) hoặc tối đa 3 ảnh (PRO)
 * Xử lý song song qua sharp + Gemini AI (Prompt Engine)
 */
exports.scanReceipt = async (req, res) => {
  try {
    // Thu thập danh sách files từ multer (hỗ trợ req.file, req.files mảng, hoặc req.files object)
    let files = [];
    if (req.file) {
      files = [req.file];
    } else if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).forEach((f) => {
        if (Array.isArray(f)) files.push(...f);
        else if (f) files.push(f);
      });
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng upload ảnh hóa đơn (field name: image hoặc images)',
      });
    }

    // Xác định người dùng và gói cước (FREE vs PRO)
    const userId = req.user?.userId || req.user?.id || req.body?.userId;
    let userPlan = 'FREE';

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userPlan = user.subscriptionPlan || 'FREE';
        // Nếu là STAFF thì kế thừa gói PRO của chủ shop
        if (user.role === 'STAFF' && user.employerId) {
          const employer = await User.findById(user.employerId).select('subscriptionPlan');
          if (employer?.subscriptionPlan) userPlan = employer.subscriptionPlan;
        }

        // Kiểm tra hạn ngạch gói FREE (tối đa 30 bill/tháng)
        if (userPlan === 'FREE') {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const currentMonthBillCount = await Receipt.countDocuments({
            userId: user._id,
            createdAt: { $gte: startOfMonth },
          });

          if (currentMonthBillCount >= 30) {
            return res.status(403).json({
              success: false,
              error_type: 'MONTHLY_QUOTA_EXCEEDED',
              message: 'Gói Cơ Bản đã đạt giới hạn 30 hóa đơn trong tháng này. Vui lòng nâng cấp PRO để quét không giới hạn!',
            });
          }
        }
      }
    }

    // ── Kiểm tra phân tầng gói cước (Batch OCR) ──
    if (userPlan === 'FREE' && files.length > 1) {
      return res.status(403).json({
        success: false,
        error_type: 'PRO_REQUIRED_BATCH_OCR',
        message: 'Gói Cơ Bản chỉ hỗ trợ tải 1 ảnh/lần. Nâng cấp PRO để quét 3 ảnh cùng lúc!',
      });
    }

    if (files.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Hệ thống hỗ trợ quét tối đa 3 ảnh trong 1 lần yêu cầu.',
      });
    }

    console.log(`📸 Nhận ${files.length} ảnh để xử lý AI OCR (Gói: ${userPlan})...`);

    // Xử lý song song nén ảnh và phân tích Gemini
    const results = await Promise.all(
      files.map(async (file, idx) => {
        try {
          const compressed = await sharp(file.buffer)
            .resize({ width: 800, withoutEnlargement: true })
            .grayscale()
            .normalize()
            .jpeg({ quality: 70 })
            .toBuffer();

          const data = await analyzeReceiptImage('image/jpeg', compressed);
          return { index: idx, success: true, data };
        } catch (err) {
          console.warn(`⚠️ Lỗi phân tích ảnh ${idx + 1}:`, err.message);
          return { index: idx, success: false, error: err.message };
        }
      })
    );

    const allItems = [];
    let lastErrorType = null;

    results.forEach((r) => {
      if (r.success && r.data?.items && Array.isArray(r.data.items)) {
        allItems.push(...r.data.items);
      } else if (r.data?.error_type) {
        lastErrorType = r.data.error_type;
      }
    });

    if (allItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không nhận diện được nội dung hóa đơn hoặc ảnh quá mờ.',
        error_type: lastErrorType || 'BLURRY_IMAGE',
      });
    }

    return res.status(200).json({
      success: true,
      message: `AI đã phân tích thành công ${allItems.length} giao dịch từ ${files.length} ảnh!`,
      items: allItems,
    });
  } catch (error) {
    console.error('Lỗi scan-receipt:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/confirm-receipt
 * Người dùng xác nhận items trên SplitScreen -> lưu vào MongoDB
 * qua quy trình chuẩn (Hạch toán 22:00, Lưới lọc 2 chiều, WebSocket)
 */
exports.confirmReceipt = async (req, res) => {
  try {
    const { userId: bodyUserId, items } = req.body;
    const effectiveUserId = req.user?.employerId || req.user?.userId || req.user?.id || bodyUserId;

    if (!effectiveUserId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId hoặc danh sách items rỗng.',
      });
    }

    const savedDocs = await processAndSaveReceipts({
      userId: effectiveUserId,
      items,
      creator: req.user,
      defaultEntrySource: 'AI_SCAN',
    });

    return res.status(201).json({
      success: true,
      message: `Đã lưu ${savedDocs.length} giao dịch thành công!`,
      data: savedDocs,
    });
  } catch (error) {
    console.error('Lỗi confirm-receipt:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
