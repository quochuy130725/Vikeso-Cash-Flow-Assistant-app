const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Receipt = require('../models/Receipt');

// ─── Khởi tạo bộ gửi email ────────────────────────────────────────────────
const createMailTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// ─── Template Email HTML ──────────────────────────────────────────────────
const buildEmailHTML = ({ shopName, tongThu, tongChi, loinhuan, soHoaDon, ngay }) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Tài Chính Cuối Ngày - Vikeso</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#1e3a8a,#3b82f6,#93c5fd);">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.92);border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.2);max-width:600px;width:100%;">
          <tr>
            <td style="padding:35px 40px;text-align:center;border-bottom:1px solid rgba(0,0,0,0.06);">
              <h1 style="color:#1e3a8a;margin:0;font-size:28px;font-weight:800;">📊 Vikeso</h1>
              <p style="color:#475569;margin:10px 0 0;font-size:15px;font-weight:500;">Báo cáo tài chính cuối ngày</p>
              <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">${ngay}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px 10px;">
              <p style="font-size:16px;color:#334155;line-height:1.6;margin:0;">
                Xin chào <strong>${shopName}</strong>,<br>
                Dưới đây là tóm tắt tài chính hôm nay được ghi nhận từ <strong>${soHoaDon} hóa đơn/giao dịch</strong> hợp lệ.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:rgba(240,253,244,0.9);border:1px solid rgba(34,197,94,0.3);border-radius:14px;padding:20px;text-align:center;">
                    <div style="font-size:12px;color:#166534;font-weight:700;text-transform:uppercase;">🟢 Tổng Thu</div>
                    <div style="font-size:24px;color:#15803d;font-weight:900;margin-top:10px;">${tongThu} đ</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:rgba(254,242,242,0.9);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:20px;text-align:center;">
                    <div style="font-size:12px;color:#991b1b;font-weight:700;text-transform:uppercase;">🔴 Tổng Chi</div>
                    <div style="font-size:24px;color:#b91c1c;font-weight:900;margin-top:10px;">${tongChi} đ</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 30px;">
              <div style="border-left:5px solid ${loinhuan >= 0 ? '#10b981' : '#ef4444'};background:rgba(255,255,255,0.7);padding:20px 25px;border-radius:12px;text-align:center;">
                <div style="font-size:15px;color:#1e293b;font-weight:700;margin-bottom:8px;">💰 Lợi nhuận gộp</div>
                <div style="font-size:30px;color:${loinhuan >= 0 ? '#10b981' : '#ef4444'};font-weight:900;">
                  ${loinhuan >= 0 ? '+' : ''}${loinhuan} đ
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:rgba(0,0,0,0.02);padding:20px 40px;text-align:center;border-top:1px solid rgba(0,0,0,0.05);">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Email này được gửi tự động bởi hệ thống AI của <strong>Vikeso</strong>.<br>
                Vui lòng không trả lời thư này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Template Telegram ─────────────────────────────────────────────────────
const buildTelegramMessage = ({ shopName, tongThu, tongChi, loinhuan, soHoaDon, ngay }) =>
    `📊 *BÁO CÁO CHỐT CA - ${shopName}*\n` +
    `📅 Ngày: ${ngay}\n\n` +
    `🟢 Tổng Thu: ${tongThu} đ\n` +
    `🔴 Tổng Chi: ${tongChi} đ\n` +
    `💰 *Lợi Nhuận: ${loinhuan >= 0 ? '+' : ''}${loinhuan} đ*\n\n` +
    `📝 Ghi nhận từ ${soHoaDon} hóa đơn hợp lệ.\n` +
    `Chúc chủ quán ngủ ngon! 🌙`;

// =========================================================================
// HÀM CORE: Chạy toàn bộ luồng báo cáo (dùng chung cho Cron và Test API)
// =========================================================================
const runDailyReport = async () => {
    const results = { emailSent: 0, telegramSent: 0, skipped: 0, errors: [] };

    const nowInVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const startOfDayVN = new Date(nowInVN); startOfDayVN.setHours(0, 0, 0, 0);
    const endOfDayVN = new Date(nowInVN); endOfDayVN.setHours(23, 59, 59, 999);
    const startOfUtc = new Date(startOfDayVN.getTime() - 7 * 60 * 60 * 1000);
    const endOfUtc = new Date(endOfDayVN.getTime() - 7 * 60 * 60 * 1000);
    const ngayFormat = startOfDayVN.toLocaleDateString("vi-VN");

    const dateFilter = {
        status: "VALID",
        transactionDate: { $gte: startOfUtc, $lte: endOfUtc }
    };

    const activeUsers = await Receipt.distinct("userId", dateFilter);
    console.log(`👥 Phát hiện ${activeUsers.length} người dùng cần gửi báo cáo.`);

    const transporter = createMailTransporter();

    for (const uId of activeUsers) {
        const userReceipts = await Receipt.find({ userId: uId, ...dateFilter });

        let tongThu = 0, tongChi = 0;
        userReceipts.forEach(doc => {
            if (doc.transactionType === "THU") tongThu += doc.totalAmount;
            if (doc.transactionType === "CHI") tongChi += doc.totalAmount;
        });
        const loinhuan = tongThu - tongChi;

        const user = await User.findById(uId);
        if (!user) { results.skipped++; continue; }

        const shopName = user.shopName || user.name || "Cửa hàng Vikeso";
        const fmt = (n) => Number(n).toLocaleString('vi-VN');
        const data = { shopName, tongThu: fmt(tongThu), tongChi: fmt(tongChi), loinhuan: fmt(loinhuan), soHoaDon: userReceipts.length, ngay: ngayFormat };

        // ── Kiểm tra Notification Settings ────────────────────────────────
        const shouldSendEmail = user.notificationSettings?.receiveEmail ?? true;
        const shouldSendTelegram = user.notificationSettings?.receiveTelegram ?? true;

        // ── Email (BẮT BUỘC nếu bật) ────────────────────────────────────
        if (shouldSendEmail) {
            try {
                await transporter.sendMail({
                    from: `"Vikeso AI" <${process.env.MAIL_USER}>`,
                    to: user.email,
                    subject: `📊 Báo cáo chốt ca ${ngayFormat} - ${shopName}`,
                    html: buildEmailHTML({ ...data, loinhuan }),
                });
                console.log(`✉️  Email → ${user.email} ✅`);
                results.emailSent++;
            } catch (mailErr) {
                console.error(`❌ Email lỗi (${user.email}):`, mailErr.message);
                results.errors.push({ user: user.email, channel: 'email', error: mailErr.message });
            }
        } else {
            console.log(`⚠️  ${user.email} đã tắt nhận báo cáo qua Email.`);
        }

        // ── Telegram (TÙY CHỌN nếu đã liên kết và đang bật) ─────────────
        if (shouldSendTelegram && process.env.TELEGRAM_BOT_TOKEN && user.telegramChatId) {
            try {
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: user.telegramChatId,
                    text: buildTelegramMessage({ ...data, loinhuan: fmt(loinhuan) }),
                    parse_mode: 'Markdown',
                });
                console.log(`🚀 Telegram → ${user.email} ✅`);
                results.telegramSent++;
            } catch (teleErr) {
                console.error(`❌ Telegram lỗi (${user.email}):`, teleErr.message);
                results.errors.push({ user: user.email, channel: 'telegram', error: teleErr.message });
            }
        } else if (!user.telegramChatId) {
            console.log(`⚠️  ${user.email} chưa kết nối Telegram — bỏ qua.`);
        } else if (!shouldSendTelegram) {
            console.log(`⚠️  ${user.email} đã tắt nhận báo cáo qua Telegram.`);
        }
    }

    return { totalUsers: activeUsers.length, ...results };
};

// =========================================================================
// CRON JOB: 22:00 hàng ngày giờ Việt Nam
// =========================================================================
cron.schedule('0 22 * * *', async () => {
    console.log("⏰ [22:00] Bắt đầu gửi báo cáo cuối ngày...");
    try {
        const result = await runDailyReport();
        console.log("😴 Báo cáo hoàn tất:", result);
    } catch (err) {
        console.error("❌ Lỗi cron-job:", err);
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
});

console.log("✅ Hệ thống báo cáo tự động (Cron-job) đã được kích hoạt.");

// Export hàm core để Test API dùng chung
module.exports = { runDailyReport };
