const mongoose = require('mongoose');

const subscriptionOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  orderCode: { type: String, required: true, unique: true, index: true, trim: true },
  plan: { type: String, enum: ['PRO'], default: 'PRO' },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
    default: 'PENDING',
    index: true,
  },
  // id giao dich SePay gui ve — dedup chong replay/retry
  sepayTransactionId: { type: Number, default: null, unique: true, sparse: true },
  transferContent: { type: String, default: '' },
  qrUrl: { type: String, default: '' },
  gateway: { type: String, default: '' },
  expiresAt: { type: Date, required: true, index: true },
  paidAt: { type: Date, default: null },
  rawWebhook: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionOrder', subscriptionOrderSchema);
