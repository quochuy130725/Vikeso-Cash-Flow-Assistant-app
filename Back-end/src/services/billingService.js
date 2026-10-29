const sepayConfig = require('../config/sepay');
const sepayService = require('./sepayService');
const SubscriptionOrder = require('../models/SubscriptionOrder');
const User = require('../models/User');
const { emitToUser } = require('../socket');

/**
 * Billing service — Quản lý gói PRO cố định 99.000đ/tháng (30 ngày)
 * Sinh mã VietQR động chuẩn hóa.
 */

const createOrder = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }

  const existing = await SubscriptionOrder.findOne({
    userId,
    status: 'PENDING',
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (existing) {
    const obj = existing.toObject();
    obj.bankCode = existing.bankCode || sepayConfig.bankCode;
    obj.bankAccount = existing.bankAccount || sepayConfig.bankAccount;
    obj.accountName = existing.accountName || sepayConfig.accountName;
    obj.qrImageUrl = obj.qrUrl || sepayConfig.buildQrUrl({ amount: sepayConfig.proPrice, content: obj.transferContent });
    return obj;
  }

  const orderCode = sepayService.makeOrderCode();
  const transferContent = sepayService.makeTransferContent(orderCode);
  const qrUrl = sepayConfig.buildQrUrl({ amount: sepayConfig.proPrice, content: transferContent });
  const expiresAt = new Date(Date.now() + sepayConfig.qrExpireMinutes * 60 * 1000);

  const created = await SubscriptionOrder.create({
    userId,
    orderCode,
    plan: 'PRO',
    amount: sepayConfig.proPrice,
    status: 'PENDING',
    transferContent,
    qrUrl,
    expiresAt,
    bankCode: sepayConfig.bankCode,
    bankAccount: sepayConfig.bankAccount,
    accountName: sepayConfig.accountName,
  });

  const obj = created.toObject();
  obj.bankCode = sepayConfig.bankCode;
  obj.bankAccount = sepayConfig.bankAccount;
  obj.accountName = sepayConfig.accountName;
  obj.qrImageUrl = qrUrl;
  return obj;
};

const getOrderStatus = async (orderCode) => {
  const order = await SubscriptionOrder.findOne({ orderCode });
  if (!order) {
    const err = new Error('Không tìm thấy đơn hàng.');
    err.statusCode = 404;
    throw err;
  }
  if (order.status === 'PENDING' && order.expiresAt < new Date()) {
    order.status = 'EXPIRED';
    await order.save();
  }
  const obj = order.toObject();
  obj.bankCode = order.bankCode || sepayConfig.bankCode;
  obj.bankAccount = order.bankAccount || sepayConfig.bankAccount;
  obj.accountName = order.accountName || sepayConfig.accountName;
  obj.qrImageUrl = obj.qrUrl || sepayConfig.buildQrUrl({ amount: obj.amount, content: obj.transferContent });
  return obj;
};

const getHistory = async (userId) =>
  SubscriptionOrder.find({ userId }).sort({ createdAt: -1 }).limit(50);

/**
 * Xử lý payload webhook SePay. Idempotent theo sepayTransactionId.
 */
const handleSepayWebhook = async (payload) => {
  if (!payload || payload.transferType !== 'in') {
    console.log(`⚠️ SePay webhook bỏ qua: transferType=${payload?.transferType} id=${payload?.id}`);
    return { ignored: true };
  }

  if (payload.id != null) {
    const dup = await SubscriptionOrder.findOne({ sepayTransactionId: payload.id });
    if (dup) {
      console.log(`🔁 SePay webhook trùng: sepayId=${payload.id} order=${dup.orderCode}`);
      return { duplicate: true, order: dup };
    }
  }

  const orderCode = sepayService.parseOrderCode(payload.content, payload.code);
  if (!orderCode) {
    console.log(`⚠️ SePay webhook không có mã VIKESO: id=${payload.id} content="${payload.content}" code="${payload.code}" amount=${payload.transferAmount}`);
    return { ignored: true, reason: 'NO_ORDER_CODE' };
  }

  const order = await SubscriptionOrder.findOne({ orderCode });
  if (!order) {
    console.log(`⚠️ SePay webhook sai orderCode: ${orderCode} id=${payload.id}`);
    return { ignored: true, reason: 'ORDER_NOT_FOUND' };
  }
  if (order.status !== 'PENDING') return { duplicate: true, order };
  if (order.expiresAt < new Date()) {
    order.status = 'EXPIRED';
    order.rawWebhook = payload;
    await order.save();
    return { expired: true, order };
  }
  if (!sepayService.isAmountEnough(payload.transferAmount)) {
    order.status = 'FAILED';
    order.rawWebhook = payload;
    if (payload.id != null) order.sepayTransactionId = payload.id;
    await order.save();
    return { failed: true, reason: 'INSUFFICIENT_AMOUNT', order };
  }

  order.status = 'SUCCESS';
  order.paidAt = new Date();
  order.gateway = payload.gateway || '';
  order.rawWebhook = payload;
  if (payload.id != null) order.sepayTransactionId = payload.id;
  await order.save();

  const now = new Date();
  const base = new Date();
  await User.updateOne(
    { _id: order.userId },
    {
      $set: {
        subscriptionPlan: 'PRO',
        proStartedAt: now,
        proExpiresAt: new Date(base.getTime() + sepayConfig.proDays * 24 * 60 * 60 * 1000),
      },
    }
  );

  emitToUser(order.userId, 'subscription_upgraded', { plan: 'PRO', orderCode });

  return { success: true, order };
};

const expireOverdueOrders = async () =>
  SubscriptionOrder.updateMany(
    { status: 'PENDING', expiresAt: { $lt: new Date() } },
    { $set: { status: 'EXPIRED' } }
  );

const downgradeExpiredPro = async () =>
  User.updateMany(
    { subscriptionPlan: 'PRO', proExpiresAt: { $ne: null, $lt: new Date() } },
    { $set: { subscriptionPlan: 'FREE' } }
  );

module.exports = {
  createOrder,
  getOrderStatus,
  getHistory,
  handleSepayWebhook,
  expireOverdueOrders,
  downgradeExpiredPro,
};
