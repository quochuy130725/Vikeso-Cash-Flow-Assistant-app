const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, default: '', trim: true },       // Tên hiển thị (Google hoặc tự nhập)
  password: { type: String, default: null },        // null với Google user
  shopName: { type: String, default: '', trim: true }, // Tên shop đang active
  telegramChatId: { type: String, default: null },
  subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  proStartedAt: { type: Date, default: null },
  proExpiresAt: { type: Date, default: null, index: true },
  phone: { type: String, default: null },
  role: { type: String, enum: ['ADMIN', 'OWNER', 'STAFF'], default: 'OWNER', index: true },

  // ── Google OAuth ──────────────────────────────────────
  googleId: { type: String, default: null, index: true },
  avatar: { type: String, default: null },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // ── Quên mật khẩu (OTP qua email) ─────────────────────
  resetPasswordCode: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  resetPasswordSentAt: { type: Date, default: null },
  resetPasswordAttempts: { type: Number, default: 0 },

  // ── Cài đặt thông báo (Notification Settings) ─────────
  notificationSettings: {
    receiveEmail: { type: Boolean, default: true },
    receiveTelegram: { type: Boolean, default: false },
    receiveInApp: { type: Boolean, default: true }
  },

  // ── Bổ sung v3.2: RBAC, OTP, Onboarding & Multi-Shop ──
  isEmailVerified: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
  tokenVersion: { type: Number, default: 0 },

  // Phục vụ nhân viên (STAFF) & Đa cửa hàng (Multi-Shop)
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  activeShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null, index: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
