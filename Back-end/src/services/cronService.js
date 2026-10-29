const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const { sendEmail } = require('./mailService');

// ─── Template Email HTML ──────────────────────────────────────────────────
const buildEmailHTML = ({ shopName, tongThu, tongChi, loinhuan, soHoaDon, ngay, breakdown }) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Tài Chính Cuối Ngày - Vikeso</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#0F172A,#1E293B,#334155);">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.25);max-width:600px;width:100%;">
          <tr>
            <td style="padding:35px 40px;text-align:center;background:linear-gradient(135deg,#0F172A,#FF4783);color:#fff;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">📊 Vikeso</h1>
              <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;font-weight:500;">Báo cáo tài chính chốt sổ 22:00</p>
              <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:13px;">${ngay}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px 10px;">
              <p style="font-size:16px;color:#334155;line-height:1.6;margin:0;">
                Xin chào <strong>${shopName}</strong>,<br>
                ${soHoaDon > 0 
                  ? `Dưới đây là tóm tắt tài chính hôm nay được ghi nhận từ <strong>${soHoaDon} giao dịch hợp lệ</strong> (áp dụng quy tắc hạch toán chốt sổ sau 22h).`
                  : `Hôm nay cửa hàng <strong>chưa phát sinh giao dịch nào</strong> được ghi nhận vào hệ thống.`}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#FFF0F5;border:1px solid #FFD1E0;border-radius:14px;padding:20px;text-align:center;">
                    <div style="font-size:12px;color:#FF4783;font-weight:800;text-transform:uppercase;">🟢 Tổng Thu (Tiền vào)</div>
                    <div style="font-size:24px;color:#FF4783;font-weight:900;margin-top:10px;">${tongThu} đ</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:14px;padding:20px;text-align:center;">
                    <div style="font-size:12px;color:#0F172A;font-weight:800;text-transform:uppercase;">🔴 Tổng Chi (Tiền ra)</div>
                    <div style="font-size:24px;color:#0F172A;font-weight:900;margin-top:10px;">${tongChi} đ</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 25px;">
              <div style="border-left:5px solid ${loinhuan >= 0 ? '#10b981' : '#ef4444'};background:#F8FAFC;padding:20px 25px;border-radius:12px;text-align:center;">
                <div style="font-size:15px;color:#475569;font-weight:700;margin-bottom:8px;">💰 Lợi nhuận ròng trong ngày</div>
                <div style="font-size:32px;color:${loinhuan >= 0 ? '#10b981' : '#ef4444'};font-weight:900;">
                  ${loinhuan >= 0 ? '+' : ''}${loinhuan} đ
                </div>
              </div>
            </td>
          </tr>
          ${breakdown ? `
          <tr>
            <td style="padding:0 40px 20px;">
              <div style="font-size:13px;color:#64748B;line-height:1.6;border-top:1px dashed #E2E8F0;padding-top:15px;">
                <strong>Phương thức thanh toán:</strong><br>
                • Tiền mặt: ${breakdown.cash} đ<br>
                • Chuyển khoản VietQR: ${breakdown.transfer} đ<br>
                • Thẻ POS: ${breakdown.pos} đ
              </div>
            </td>
          </tr>` : ''}
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Email này được gửi tự động bởi hệ thống AI của <strong>Vikeso</strong>.<br>
                Chúc chủ quán một đêm an lành! 🌙
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
const buildTelegramMessage = ({ shopName, tongThu, tongChi, loinhuan, soHoaDon, ngay, breakdown }) =>
    `📊 *BÁO CÁO CHỐT CA - ${shopName}*\n` +
    `📅 Ngày: ${ngay} (Chốt sổ 22:00)\n\n` +
    `🟢 Tổng Thu: ${tongThu} đ\n` +
    `🔴 Tổng Chi: ${tongChi} đ\n` +
    `💰 *Lợi Nhuận: ${loinhuan >= 0 ? '+' : ''}${loinhuan} đ*\n\n` +
    (breakdown ? `💳 *Hình thức:* Tiền mặt: ${breakdown.cash} đ | VietQR: ${breakdown.transfer} đ | POS: ${breakdown.pos} đ\n\n` : '') +
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

    // Lọc theo accountingDate (với fallback transactionDate cho record cũ)
    const dateFilter = {
        status: "VALID",
        $or: [
            { accountingDate: { $gte: startOfUtc, $lte: endOfUtc } },
            { accountingDate: { $exists: false }, transactionDate: { $gte: startOfUtc, $lte: endOfUtc } }
        ]
    };

    let usersToProcess = [];

    if (targetEmail) {
        usersToProcess = await User.find({ email: targetEmail.trim().toLowerCase() });
        console.log(`🎯 [Chế độ chỉ định email: ${targetEmail}] Tìm thấy ${usersToProcess.length} người dùng.`);
    } else if (sendZeroReports) {
        usersToProcess = await User.find({
            role: { $in: ['OWNER', 'ADMIN'] },
            $or: [
                { 'notificationSettings.receiveEmail': { $ne: false } },
                { 'notificationSettings.receiveTelegram': true, telegramChatId: { $ne: null } }
            ]
        });
        console.log(`👥 [Chế độ gửi tất cả] Tìm thấy ${usersToProcess.length} người dùng.`);
    } else {
        const activeUserIds = await Receipt.distinct("userId", dateFilter);
        console.log(`👥 Phát hiện ${activeUserIds.length} người dùng có giao dịch cần gửi báo cáo.`);
        if (activeUserIds.length > 0) {
            usersToProcess = await User.find({ _id: { $in: activeUserIds } });
        }
    }

    await Promise.all(usersToProcess.map(async (user) => {
        const userReceipts = await Receipt.find({ userId: user._id, ...dateFilter });

        let tongThu = 0, tongChi = 0;
        let cashAmt = 0, transferAmt = 0, posAmt = 0;

        userReceipts.forEach(doc => {
            const amt = doc.totalAmount || 0;
            if (doc.transactionType === "THU") tongThu += amt;
            if (doc.transactionType === "CHI") tongChi += amt;

            if (doc.paymentMethod === 'CHUYEN_KHOAN') transferAmt += amt;
            else if (doc.paymentMethod === 'THE_POS') posAmt += amt;
            else cashAmt += amt;
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
            ngay: ngayFormat,
            breakdown: {
                cash: fmt(cashAmt),
                transfer: fmt(transferAmt),
                pos: fmt(posAmt),
            }
        };

        const shouldSendEmail = user.notificationSettings?.receiveEmail ?? true;
        const shouldSendTelegram = user.notificationSettings?.receiveTelegram ?? true;

        if (user.email && user.email.toLowerCase().endsWith('@example.com')) {
            console.log(`⚠️  ${user.email} là tài khoản mẫu (@example.com) — bỏ qua.`);
            results.skipped++;
            return;
        }

        // ── Email ─────────────────────────────────────────────────────────
        if (shouldSendEmail && user.email) {
            try {
                const info = await sendEmail({
                    senderName: 'Vikeso AI',
                    to: user.email,
                    name: shopName,
                    subject: `📊 Báo cáo chốt ca ${ngayFormat} - ${shopName}`,
                    html: buildEmailHTML({ ...data, loinhuan }),
                    text: buildTelegramMessage({ ...data, loinhuan: fmt(loinhuan) }).replace(/\*/g, ''),
                });
                console.log(`✉️  Email -> ${user.email} ✅ (${info.provider})`);
                results.emailSent++;
            } catch (mailErr) {
                console.error(`❌ Email lỗi (${user.email}):`, mailErr.message);
                results.errors.push({ user: user.email, channel: 'email', error: mailErr.message });
            }
        }

        // ── Telegram ──────────────────────────────────────────────────────
        if (shouldSendTelegram && process.env.TELEGRAM_BOT_TOKEN && user.telegramChatId) {
            try {
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: user.telegramChatId,
                    text: buildTelegramMessage({ ...data, loinhuan: fmt(loinhuan) }),
                    parse_mode: 'Markdown',
                });
                console.log(`🚀 Telegram -> ${user.email} ✅`);
                results.telegramSent++;
            } catch (teleErr) {
                console.error(`❌ Telegram lỗi (${user.email}):`, teleErr.message);
                results.errors.push({ user: user.email, channel: 'telegram', error: teleErr.message });
            }
        }
    }));

    return { totalUsers: usersToProcess.length, ...results };
};

// CRON JOB: 22:00 hàng ngày giờ Việt Nam
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

// CRON BILLING: hết hạn order QR + downgrade PRO hết hạn (01:00 hằng ngày)
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

module.exports = { runDailyReport };
