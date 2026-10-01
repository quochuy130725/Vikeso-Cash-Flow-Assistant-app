const axios = require('axios');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { getIO } = require('../socket'); // Socket.IO — chỉ dùng để refresh dashboard

exports.saveManualEntry = async (req, res) => {
  try {
    const { items, userId: bodyUserId } = req.body;
    const userId = req.user?.id || bodyUserId; // Hỗ trợ test qua Postman nếu chưa có JWT

    if (!userId) {
       return res.status(400).json({ success: false, message: "Thiếu userId" });
    }

    // Chuẩn hóa dữ liệu đầu vào: hỗ trợ cả mảng items lẫn gửi trực tiếp 1 object lẻ
    let itemsToProcess = [];
    if (Array.isArray(items)) {
      itemsToProcess = items;
    } else if (req.body.category) {
      itemsToProcess = [req.body];
    } else {
      return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ. Cần truyền danh sách items hoặc 1 object giao dịch." });
    }

    // LẶP QUA TỪNG ITEM
    for (let item of itemsToProcess) {
      // 1. Tính tổng tiền (Ưu tiên lấy từ root do AI bóc ra, nếu không có mới tự cộng)
      const calculatedTotalAmount = item.totalAmount || (item.aiRawData?.CacKhoanTien?.reduce((sum, current) => sum + current, 0) || 0);

      // 2. LƯỚI LỌC THÔNG MINH 2 CHIỀU (BIDIRECTIONAL SMART FILTER)
      let initialStatus = "VALID";
      const recordDate = item.transactionDate ? new Date(item.transactionDate) : new Date();
      
      const startOfDay = new Date(recordDate); 
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(recordDate); 
      endOfDay.setHours(23, 59, 59, 999);

      // CHIỀU 1: Khi nộp POS Kết Ca -> Gạch bỏ (MERGED) các hóa đơn lẻ POS đã có từ trước trong ngày
      if (item.category === "POS Ket Ca") {
        await Receipt.updateMany(
          { 
            userId: userId, 
            category: "Hoa Don Le", 
            transactionType: "THU", 
            transactionDate: { $gte: startOfDay, $lte: endOfDay },
            "aiRawData.isPosBill": true
          }, 
          { status: "MERGED" }
        );
      }

      // CHIỀU 2: Khi nộp Hóa đơn lẻ POS (THU, isPosBill = true) -> Kiểm tra xem trong ngày đã có tờ POS Kết Ca nào chưa
      if (item.category === "Hoa Don Le" && item.transactionType === "THU" && item.aiRawData?.isPosBill === true) {
        const existingPosReport = await Receipt.findOne({
          userId: userId,
          category: "POS Ket Ca",
          status: "VALID",
          transactionDate: { $gte: startOfDay, $lte: endOfDay }
        });
        if (existingPosReport) {
          initialStatus = "MERGED"; // Trong ngày đã có POS Kết Ca rồi, tự động đánh dấu bill lẻ này là MERGED ngay khi tạo!
        }
      }

      // 3. Lưu bản ghi
      await Receipt.create({
        userId,
        category: item.category,
        transactionType: item.transactionType,
        totalAmount: calculatedTotalAmount,
        reason: item.reason,
        confidenceLevel: item.confidenceLevel || "HIGH",
        status: initialStatus, // Sử dụng initialStatus (MERGED hoặc VALID)
        transactionDate: item.transactionDate || new Date(),
        aiRawData: item.aiRawData
      });
    }

    // Xóa đoạn setTimeout bắn Telegram giả lập 15s để nhường sân khấu cho Cloud Function thật
    
    // Check if user has telegram connected
    const user = await User.findById(userId);
    const hasTelegram = user && !!user.telegramChatId;

    // 📡 Thông báo cho Dashboard tự refresh biểu đồ (không đụng luồng lưu)
    try {
      getIO().emit('new_transaction', { userId });
    } catch (_) {} // Ignore nếu socket chưa init (ví dụ: test Postman không cần realtime)

    // Phản hồi thành công
    return res.status(200).json({ success: true, message: "Đã lưu dữ liệu thành công!", hasTelegram });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
