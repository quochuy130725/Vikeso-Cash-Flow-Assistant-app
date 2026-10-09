const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Receipt = require('../models/Receipt');

const createMailTransporter = () => nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4, // Bắt buộc IPv4 để tránh lỗi ENETUNREACH trên Render
    pool: true,
    maxConnections: 5,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
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
                ${soHoaDon > 0 
                  ? `Dưới đây là tóm tắt tài chính hôm nay được ghi nhận từ <strong>${soHoaDon} hóa đơn/giao dịch</strong> hợp lệ.`
                  : `Hôm nay cửa hàng <strong>chưa phát sinh giao dịch nào</strong> được ghi nhận vào hệ thống.`}
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
    (soHoaDon > 0 ? `📝 Ghi nhận từ ${soHoaDon} hóa đơn hợp lệ.\n` : `📝 Hôm nay chưa phát sinh giao dịch nào.\n`) +
    `Chúc chủ quán ngủ ngon! 🌙`;

// =========================================================================
// HÀM CORE: Chạy toàn bộ luồng báo cáo (dùng chung cho Cron và Test API)
// =========================================================================
const runDailyReport = async ({ sendZeroReports = false, targetEmail = null } = {}) => {
    const results = { emailSent: 0, telegramSent: 0, skipped: 0, errors: [] };

    // Tính chính xác 00:00:00 -> 23:59:59.999 theo giờ Việt Nam (UTC+7)
    const now = new Date();
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + vnOffset);
    const y = vnNow.getUTCFullYear();
    const m = vnNow.getUTCMonth();
    const d = vnNow.getUTCDate();

    const startOfUtc = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - vnOffset);
    const endOfUtc = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - vnOffset);
    const ngayFormat = `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;

    const dateFilter = {
        status: "VALID",
        transactionDate: { $gte: startOfUtc, $lte: endOfUtc }
    };

    let usersToProcess = [];

    if (targetEmail) {
        // Chế độ test chỉ định 1 email cụ thể
        usersToProcess = await User.find({ email: targetEmail.trim().toLowerCase() });
        console.log(`🎯 [Chế độ chỉ định email: ${targetEmail}] Tìm thấy ${usersToProcess.length} người dùng.`);
    } else if (sendZeroReports) {
        // Gửi cho tất cả users có bật nhận thông báo (email hoặc telegram)
        usersToProcess = await User.find({
            $or: [
                { 'notificationSettings.receiveEmail': { $ne: false } },
                { 'notificationSettings.receiveTelegram': true, telegramChatId: { $ne: null } }
            ]
        });
        console.log(`👥 [Chế độ gửi tất cả] Tìm thấy ${usersToProcess.length} người dùng.`);
    } else {
        // Mặc định: Chỉ gửi cho những người có phát sinh giao dịch trong ngày
        const activeUserIds = await Receipt.distinct("userId", dateFilter);
        console.log(`👥 Phát hiện ${activeUserIds.length} người dùng có giao dịch cần gửi báo cáo.`);
        if (activeUserIds.length > 0) {
            usersToProcess = await User.find({ _id: { $in: activeUserIds } });
        }
    }

    const transporter = createMailTransporter();

    await Promise.all(usersToProcess.map(async (user) => {
        const userReceipts = await Receipt.find({ userId: user._id, ...dateFilter });

        let tongThu = 0, tongChi = 0;
        userReceipts.forEach(doc => {
            if (doc.transactionType === "THU") tongThu += doc.totalAmount;
            if (doc.transactionType === "CHI") tongChi += doc.totalAmount;
        });
        const loinhuan = tongThu - tongChi;

        const shopName = user.shopName || user.name || "Cửa hàng Vikeso";
        const fmt = (n) => Number(n).toLocaleString('vi-VN');
        const data = { 
            shopName, 
            tongThu: fmt(tongThu), 
            tongChi: fmt(tongChi), 
            loinhuan: fmt(loinhuan), 
            soHoaDon: userReceipts.length, 
            ngay: ngayFormat 
        };

        // ── Kiểm tra Notification Settings ────────────────────────────────
        const shouldSendEmail = user.notificationSettings?.receiveEmail ?? true;
        const shouldSendTelegram = user.notificationSettings?.receiveTelegram ?? true;

        // ── Email (nếu bật) ─────────────────────────────────────────────
        if (shouldSendEmail && user.email) {
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
        } else if (!shouldSendEmail) {
            console.log(`⚠️  ${user.email} đã tắt nhận báo cáo qua Email.`);
        }

        // ── Telegram (nếu đã liên kết và đang bật) ──────────────────────
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
    }));

    try { transporter.close(); } catch (_) {}

    return { totalUsers: usersToProcess.length, ...results };
};

// =========================================================================
// CRON JOB: 22:00 hàng ngày giờ Việt Nam
// =========================================================================
cron.schedule('0 22 * * *', async () => {
    console.log("⏰ [22:00] Bắt đầu gửi báo cáo cuối ngày...");
    try {
        const result = await runDailyReport({ sendZeroReports: true });
        console.log("😴 Báo cáo hoàn tất:", result);
    } catch (err) {
        console.error("❌ Lỗi cron-job:", err);
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
});

console.log("✅ Hệ thống báo cáo tự động (Cron-job) đã được kích hoạt.");

// =========================================================================
// CRON BILLING: hết hạn order QR + downgrade PRO hết hạn (01:00 hằng ngày)
// Logic nằm trong billingService, cron chỉ gọi.
// =========================================================================
cron.schedule('0 1 * * *', async () => {
    try {
        const billingService = require('./billingService');
        await billingService.expireOverdueOrders();
        await billingService.downgradeExpiredPro();
        console.log("🧾 [Billing] Quét hết hạn order/PRO xong.");
    } catch (err) {
        console.error("❌ Lỗi cron billing:", err.message);
    }
}, { scheduled: true, timezone: "Asia/Ho_Chi_Minh" });

// Export hàm core để Test API dùng chung
module.exports = { runDailyReport };
