const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otpCode: { type: String, required: true }, // Mã 6 chữ số
  purpose: { type: String, enum: ['REGISTER_VERIFY', 'RESET_PASSWORD'], default: 'REGISTER_VERIFY' },
  attempts: { type: Number, default: 0 }, // Tối đa 5 lần nhập sai
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // Tự động xóa sau khi hết hạn (TTL Index)
}, { timestamps: true });

module.exports = mongoose.model('OtpToken', otpTokenSchema);

