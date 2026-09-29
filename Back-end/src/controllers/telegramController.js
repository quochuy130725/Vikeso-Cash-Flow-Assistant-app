const User = require('../models/User');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL  = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/telegram/webhook
// Telegram gọi endpoint này mỗi khi có tin nhắn mới gửi đến bot
// ─────────────────────────────────────────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  // Phải trả về 200 ngay để Telegram không gửi lại
  res.sendStatus(200);

  const update = req.body;
  if (!update || !update.message) return;

  const { message } = update;
  const chatId = message.chat.id;
  const text   = (message.text || '').trim();

  // Chỉ xử lý lệnh /start
  if (!text.startsWith('/start')) return;

  // /start <userId>  —  userId là MongoDB _id của user trong app Vikeso
  const parts  = text.split(' ');
  const userId = parts[1] ? parts[1].trim() : null;

  if (!userId) {
    // Gõ /start không kèm userId → hướng dẫn
    await sendMessage(chatId,
      '👋 Chào bạn! Để kết nối tài khoản Vikeso, hãy bấm nút *"Kết nối Telegram"* trong ứng dụng.',
      'Markdown'
    );
    return;
  }

  try {
    // Tìm user theo _id và lưu chatId
    const user = await User.findByIdAndUpdate(
      userId,
      { telegramChatId: String(chatId) },
      { new: true }
    );

    if (!user) {
      await sendMessage(chatId, '❌ Không tìm thấy tài khoản. Vui lòng thử lại từ ứng dụng.');
      return;
    }

    await sendMessage(chatId,
      `✅ *Kết nối thành công!*\n\nTài khoản *${user.shopName || user.email}* đã được liên kết với Telegram.\n\nBạn sẽ nhận báo cáo tài chính hàng ngày lúc *22:00 🕙* tại đây.`,
      'Markdown'
    );
    console.log(`✅ Telegram linked: ${user.email} → chatId ${chatId}`);
  } catch (err) {
    console.error('❌ Telegram webhook error:', err.message);
    await sendMessage(chatId, '⚠️ Có lỗi xảy ra. Vui lòng thử lại.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/telegram/set-webhook
// Gọi 1 lần để đăng ký webhook URL với Telegram
// VD: GET https://vikeso-cash-flow-assistant-app.onrender.com/api/telegram/set-webhook
// ─────────────────────────────────────────────────────────────────────────────
exports.setWebhook = async (req, res) => {
  try {
    const webhookUrl = `${process.env.SERVER_URL || 'https://vikeso-cash-flow-assistant-app.onrender.com'}/api/telegram/webhook`;
    const response   = await axios.get(`${BASE_URL}/setWebhook`, {
      params: { url: webhookUrl },
    });
    return res.json({ success: true, result: response.data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: gửi tin nhắn qua Bot API
// ─────────────────────────────────────────────────────────────────────────────
async function sendMessage(chatId, text, parseMode = '') {
  try {
    await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      ...(parseMode && { parse_mode: parseMode }),
    });
  } catch (err) {
    console.error('sendMessage error:', err.message);
  }
}
