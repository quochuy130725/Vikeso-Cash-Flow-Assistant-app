const User = require('../models/User');
const { processAndSaveReceipts } = require('../services/receiptService');

exports.saveManualEntry = async (req, res) => {
  try {
    const { items, userId: bodyUserId } = req.body;
    // Hỗ trợ cả JWT req.user lẫn bodyUserId (test Postman / client cũ)
    const effectiveUserId = req.user?.employerId || req.user?.userId || req.user?.id || bodyUserId;

    if (!effectiveUserId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    let itemsToProcess = [];
    if (Array.isArray(items)) {
      itemsToProcess = items;
    } else if (req.body.category || req.body.totalAmount) {
      itemsToProcess = [req.body];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ. Cần truyền danh sách items hoặc 1 object giao dịch.',
      });
    }

    const savedDocs = await processAndSaveReceipts({
      userId: effectiveUserId,
      items: itemsToProcess,
      creator: req.user,
      defaultEntrySource: 'MANUAL',
    });

    const user = await User.findById(effectiveUserId);
    const hasTelegram = Boolean(user && user.telegramChatId);

    return res.status(200).json({
      success: true,
      message: 'Đã lưu dữ liệu thành công!',
      hasTelegram,
      data: savedDocs,
    });
  } catch (error) {
    console.error('Lỗi manual-entry:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
