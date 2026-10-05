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

  // Kiểm tra nếu tin nhắn là lệnh /start hoặc chứa email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = text.match(emailRegex);

  let targetUser = null;

  if (text.startsWith('/start')) {
    const parts  = text.split(' ');
    const param  = parts[1] ? parts[1].trim() : null;

    if (param) {
      // 1. Kiểm tra nếu param là email
      if (emailRegex.test(param)) {
        targetUser = await User.findOne({ email: param.toLowerCase() });
      }
      // 2. Kiểm tra nếu param là MongoDB ObjectId hợp lệ
      else if (/^[0-9a-fA-F]{24}$/.test(param)) {
        targetUser = await User.findById(param);
      }
    }
  } else if (emailMatch) {
    // Người dùng nhắn trực tiếp email vào bot chat
    const email = emailMatch[1].toLowerCase();
    targetUser = await User.findOne({ email });
  }

  // Nếu tìm thấy user cần liên kết
  if (targetUser) {
    targetUser.telegramChatId = String(chatId);
    if (!targetUser.notificationSettings) {
      targetUser.notificationSettings = { receiveEmail: true, receiveTelegram: true, receiveInApp: true };
    } else {
      targetUser.notificationSettings.receiveTelegram = true;
    }
    await targetUser.save();

    await sendMessage(chatId,
      `✅ *Kết nối thành công!*\n\nTài khoản *${targetUser.shopName || targetUser.email}* đã được liên kết với Telegram.\n\nBạn sẽ nhận báo cáo tài chính hàng ngày lúc *22:00 🕙* tại đây.`,
      'Markdown'
    );
    console.log(`✅ Telegram linked: ${targetUser.email} → chatId ${chatId}`);
    return;
  }

  // Nếu là lệnh /start mà không có param hợp lệ
  if (text.startsWith('/start')) {
    await sendMessage(chatId,
      '👋 Chào bạn! Để kết nối tài khoản Vikeso:\n\n' +
      '1️⃣ Bấm nút *"Kết nối Telegram"* trong ứng dụng Vikeso.\n' +
      '2️⃣ Hoặc *gửi trực tiếp Email đăng ký* của bạn vào tin nhắn này để bot tự động liên kết!',
      'Markdown'
    );
    return;
  }

  // Nếu là tin nhắn thông thường nhưng không nhận diện được email
  if (emailMatch) {
    await sendMessage(chatId, `❌ Không tìm thấy tài khoản Vikeso nào với email *${emailMatch[1]}*. Vui lòng kiểm tra lại.`, 'Markdown');
  } else {
    await sendMessage(chatId,
      '👋 Để liên kết tài khoản Vikeso, bạn chỉ cần *gửi địa chỉ Email đăng ký của bạn* vào đây nhé!',
      'Markdown'
    );
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
