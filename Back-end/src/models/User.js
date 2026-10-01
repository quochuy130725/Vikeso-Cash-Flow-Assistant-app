const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true, trim: true, lowercase: true },
  name:             { type: String, default: '', trim: true },       // Tên hiển thị (Google hoặc tự nhập)
  password:         { type: String, default: null },        // null với Google user
  shopName:         { type: String, default: '', trim: true },
  telegramChatId:   { type: String, default: null },        // VŨ KHÍ DEMO TELEGRAM
  subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  phone:            { type: String, default: null },              // So dien thoai chu cua hang

  // ── Google OAuth ──────────────────────────────────────
  googleId:     { type: String, default: null, index: true },
  avatar:       { type: String, default: null },            // Google profile picture URL
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  
  // ── Cài đặt thông báo (Notification Settings) ─────────
  notificationSettings: {
    receiveEmail: { type: Boolean, default: true },
    receiveTelegram: { type: Boolean, default: true },
    receiveInApp: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
