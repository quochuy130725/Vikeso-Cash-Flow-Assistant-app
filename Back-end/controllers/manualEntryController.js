const axios = require('axios');
const Receipt = require('../models/Receipt');
const User = require('../models/User');

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
      // 1. Tính tổng tiền
      const totalAmount = item.aiRawData?.CacKhoanTien?.reduce((sum, current) => sum + current, 0) || 0;

      // 2. LƯỚI LỌC THÔNG MINH
      if (item.category === "POS Ket Ca") {
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
        
        // CHỈ gạch bỏ hóa đơn lẻ là khoản THU, GIỮ NGUYÊN khoản CHI
        await Receipt.updateMany(
          { 
            userId: userId, 
            category: "Hoa Don Le", 
            transactionType: "THU", 
            transactionDate: { $gte: startOfDay, $lte: endOfDay } 
          }, 
          { status: "MERGED" }
        );
      }

      // 3. Lưu bản ghi
      await Receipt.create({
        userId,
        category: item.category,
        transactionType: item.transactionType,
        totalAmount: totalAmount,
        reason: item.reason,
        aiRawData: item.aiRawData
      });
    }

    // Xóa đoạn setTimeout bắn Telegram giả lập 15s để nhường sân khấu cho Cloud Function thật
    
    // Phản hồi thành công
    return res.status(200).json({ success: true, message: "Đã lưu dữ liệu!" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
