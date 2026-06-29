const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true, trim: true },
  telegramChatId: { type: String, default: null }, // VŨ KHÍ DEMO TELEGRAM
  subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
