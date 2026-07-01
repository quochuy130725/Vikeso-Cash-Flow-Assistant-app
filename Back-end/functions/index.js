const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const path = require("path");

// 1. DÁN Y NGUYÊN SCHEMA CHUẨN CỦA TEAM ÔNG VÀO ĐÂY
const receiptSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  receiptUrl: { type: String, default: "" },
  category: { type: String, enum: ["Hoa Don Le", "POS Ket Ca", "So Tay", "Khác"], default: "Khác" },
  transactionType: { type: String, enum: ["THU", "CHI", "KHONG_XAC_DINH"], required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  reason: { type: String, default: "" },
  status: { type: String, enum: ["VALID", "MERGED"], default: "VALID", index: true },
  aiRawData: { type: Object, default: {} }
}, {
  timestamps: true // ĂN TIỀN LÀ Ở CÁI NÀY ĐỂ FILTER THEO NGÀY
});

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema);

// ĐỊNH NGHĨA USER SCHEMA CHO CLOUD FUNCTION
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  shopName: { type: String, required: false, default: "", trim: true },
  telegramChatId: { type: String, default: null },
  subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const MONGO_URI = process.env.MONGO_URI; // Nên giấu link DB vào biến môi trường

// =========================================================================
// 2. GIAI ĐOẠN 4: HỆ THỐNG BÁO CÁO TỰ ĐỘNG LÚC 22H00 (GOM NHÓM THEO USER)
// =========================================================================
exports.dailyNightReport = onSchedule(
  {
    schedule: "0 22 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    memory: "256MiB"
  },
  async (event) => {
    console.log("⏰ [22:00] Bắt đầu quét MongoDB xuất báo cáo cá nhân hóa...");

    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI);
      }

      // ⚡ Xử lý múi giờ UTC chuẩn như Claude chỉ điểm
      const nowInVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      const startOfDayVN = new Date(nowInVN); startOfDayVN.setHours(0, 0, 0, 0);
      const endOfDayVN = new Date(nowInVN); endOfDayVN.setHours(23, 59, 59, 999);

      const startOfUtc = new Date(startOfDayVN.getTime() - 7 * 60 * 60 * 1000);
      const endOfUtc = new Date(endOfDayVN.getTime() - 7 * 60 * 60 * 1000);

      // Bước 1: Nhặt ra danh sách các User có phát sinh giao dịch VALID hôm nay
      const activeUsers = await Receipt.distinct("userId", {
        status: "VALID",
        createdAt: { $gte: startOfUtc, $lte: endOfUtc }
      });

      console.log(`👥 Phát hiện ${activeUsers.length} người dùng cần gửi báo cáo đêm nay.`);

      // Bước 2: Vòng lặp tính toán và bắn tin nhắn riêng cho từng User
      for (const uId of activeUsers) {
        const userReceipts = await Receipt.find({
          userId: uId,
          status: "VALID",
          createdAt: { $gte: startOfUtc, $lte: endOfUtc }
        });

        let tongThu = 0;
        let tongChi = 0;

        userReceipts.forEach(doc => {
          if (doc.transactionType === "THU") tongThu += doc.totalAmount;
          if (doc.transactionType === "CHI") tongChi += doc.totalAmount;
        });

        const loinhuan = tongThu - tongChi;

        // Đóng gói tin nhắn cá nhân hóa
        const reportMessage = `
📊 BÁO CÁO TÀI CHÍNH CUỐI NGÀY 📊
Chào khách hàng [ID: ${uId}] của FinAuto,
Ngày: ${startOfDayVN.toLocaleDateString("vi-VN")}
-------------------------
🟢 Tổng THU: ${tongThu.toLocaleString('vi-VN')} đ
🔴 Tổng CHI: ${tongChi.toLocaleString('vi-VN')} đ
-------------------------
💰 Lợi nhuận ngày: ${loinhuan >= 0 ? '+' : ''}${loinhuan.toLocaleString('vi-VN')} đ
📝 Hệ thống ghi nhận từ ${userReceipts.length} hóa đơn hợp lệ.
`;

        // Template HTML xịn xò để demo ăn điểm tuyệt đối (Glassmorphism + Animation Style)
        const htmlTemplate = `
<style>
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0px); }
  }
  .floating-icon {
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }
</style>
<div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3a8a, #3b82f6, #93c5fd); padding: 50px 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
    
    <!-- Header -->
    <div style="padding: 30px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.05);">
      <div class="floating-icon" style="margin-bottom: 15px;">
        <img src="cid:rocket-gif" alt="Rocket" width="80" height="auto" style="display: block; margin: 0 auto; border: 0;" />
      </div>
      <h1 style="color: #1e3a8a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">FinAuto</h1>
      <p style="color: #475569; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Báo cáo tài chính cuối ngày</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-top: 0;">
        Chào <strong>khách hàng [ID: ${uId}]</strong>,
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #334155;">
        Dưới đây là tóm tắt tình hình thu chi ngày <strong>${startOfDayVN.toLocaleDateString("vi-VN")}</strong> được hệ thống AI tự động ghi nhận từ <strong>${userReceipts.length}</strong> hóa đơn/giao dịch hợp lệ.
      </p>

      <!-- Stats Grid (Fluid Layout for Mobile) -->
      <div style="margin: 30px 0; text-align: center;">
        <!-- Tổng Thu -->
        <div style="display: inline-block; width: 45%; min-width: 150px; margin: 0 1% 15px 1%; background-color: rgba(240, 253, 244, 0.8); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 20px 10px; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);">
          <div style="font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase;">Tổng Thu <span class="floating-icon" style="animation-delay: 0.5s;">🟢</span></div>
          <div style="font-size: 22px; color: #15803d; font-weight: 800; margin-top: 10px;">${tongThu.toLocaleString('vi-VN')} đ</div>
        </div>
        <!-- Tổng Chi -->
        <div style="display: inline-block; width: 45%; min-width: 150px; margin: 0 1% 15px 1%; background-color: rgba(254, 242, 242, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 20px 10px; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);">
          <div style="font-size: 13px; color: #991b1b; font-weight: 700; text-transform: uppercase;">Tổng Chi <span class="floating-icon" style="animation-delay: 1s;">🔴</span></div>
          <div style="font-size: 22px; color: #b91c1c; font-weight: 800; margin-top: 10px;">${tongChi.toLocaleString('vi-VN')} đ</div>
        </div>
      </div>

      <!-- Lợi nhuận (Stacked layout for mobile) -->
      <div style="background-color: rgba(255, 255, 255, 0.7); border: 1px solid rgba(255, 255, 255, 0.9); border-left: 5px solid ${loinhuan >= 0 ? '#10b981' : '#ef4444'}; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
         <div style="font-size: 16px; color: #1e293b; font-weight: 700; margin-bottom: 8px;"><span class="floating-icon" style="animation-delay: 1.5s;">💰</span> Lợi nhuận gộp:</div>
         <div style="font-size: 26px; color: ${loinhuan >= 0 ? '#10b981' : '#ef4444'}; font-weight: 900;">
           ${loinhuan >= 0 ? '+' : ''}${loinhuan.toLocaleString('vi-VN')} đ
         </div>
      </div>

      <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
        Xem chi tiết các khoản giao dịch tại <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 700;">Ứng dụng FinAuto</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: rgba(0,0,0,0.02); padding: 25px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        Email này được gửi tự động bởi hệ thống Trí tuệ nhân tạo của FinAuto.<br>
        Vui lòng không trả lời thư này.
      </p>
    </div>
  </div>
</div>
`;

        console.log(`------------------------------------\n[Gửi tới User: ${uId}]\n`, reportMessage);

        // Bước 3: Gửi báo cáo qua Telegram (Lấy ID thực tế từ Database)
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        let telegramChatId = null;
        let shopName = "Cửa hàng FinAuto";

        try {
          // Kéo dữ liệu thực tế của User này từ MongoDB
          const user = await User.findById(uId);
          if (user) {
            if (user.telegramChatId) telegramChatId = user.telegramChatId;
            if (user.shopName) shopName = user.shopName;
          }
        } catch (err) {
          console.log(`⚠️ Lỗi khi tìm User ${uId}: ${err.message}`);
        }

        if (TELEGRAM_BOT_TOKEN && telegramChatId) {
          try {
            const axios = require('axios');
            
            const teleMessage = `📊 *BÁO CÁO CHỐT CA - ${shopName}*\n\n` +
                            `🟢 Tổng Thu: ${tongThu.toLocaleString('vi-VN')} đ\n` +
                            `🔴 Tổng Chi: ${tongChi.toLocaleString('vi-VN')} đ\n` +
                            `💰 *Lợi Nhuận: ${loinhuan >= 0 ? '+' : ''}${loinhuan.toLocaleString('vi-VN')} đ*\n\n` +
                            `📝 Hệ thống AI ghi nhận từ ${userReceipts.length} hóa đơn hợp lệ.\n` +
                            `Chúc chủ quán nghỉ ngơi vui vẻ! 🌙`;

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              chat_id: telegramChatId,
              text: teleMessage,
              parse_mode: 'Markdown'
            });
            console.log(`🚀 Đã gửi Telegram báo cáo THỰC TẾ thành công cho User ${uId}!`);
          } catch (teleError) {
            console.error(`❌ Lỗi khi gửi Telegram cho User ${uId}:`, teleError.message);
          }
        } else {
          console.log(`⚠️ Bỏ qua gửi Telegram cho User ${uId} do chưa cấu hình telegramChatId trong DB.`);
        }
      }

    } catch (error) {
      console.error("❌ Lỗi luồng báo cáo tổng thể:", error);
    }
    console.log("😴 Tất cả báo cáo cá nhân đã được xử lý. Cloud Function đi ngủ!");
  }
);