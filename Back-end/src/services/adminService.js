const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const SubscriptionOrder = require('../models/SubscriptionOrder');
const sepayConfig = require('../config/sepay');

const toObjectId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null);

// Khung ngày VN (copy cách tính cronService): trả {start,end} UTC cho 1 ngày VN
const vnDayRange = (date = new Date()) => {
  const vnOffset = 7 * 60 * 60 * 1000;
  const vn = new Date(date.getTime() + vnOffset);
  const y = vn.getUTCFullYear(), m = vn.getUTCMonth(), d = vn.getUTCDate();
  return {
    start: new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - vnOffset),
    end: new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - vnOffset),
  };
};

const vnMonthRange = (date = new Date()) => {
  const vnOffset = 7 * 60 * 60 * 1000;
  const vn = new Date(date.getTime() + vnOffset);
  const y = vn.getUTCFullYear(), m = vn.getUTCMonth();
  return {
    start: new Date(Date.UTC(y, m, 1, 0, 0, 0, 0) - vnOffset),
    end: new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999) - vnOffset),
  };
};

const sumReceipts = async (match) => {
  const r = await Receipt.aggregate([
    { $match: match },
    { $group: { _id: '$transactionType', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
  ]);
  let thu = 0, chi = 0, count = 0;
  r.forEach((x) => {
    count += x.count;
    if (x._id === 'THU') thu = x.total;
    if (x._id === 'CHI') chi = x.total;
  });
  return { thu, chi, count };
};

// ── 1. Danh sách user + thống kê thu/chi mỗi user ──
const listUsers = async ({ search = '', plan, role, page = 1, limit = 20 }) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = {};
  if (plan) filter.subscriptionPlan = plan;
  if (role) filter.role = role;
  if (search) {
    const rx = new RegExp(search.trim(), 'i');
    filter.$or = [{ email: rx }, { shopName: rx }, { name: rx }];
  }
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const stats = await Receipt.aggregate([
    { $match: { userId: { $in: users.map((u) => u._id) }, status: 'VALID' } },
    { $group: { _id: { user: '$userId', type: '$transactionType' }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
  ]);
  const map = {};
  stats.forEach((s) => {
    const k = String(s._id.user);
    map[k] = map[k] || { totalThu: 0, totalChi: 0, receiptCount: 0 };
    map[k].receiptCount += s.count;
    if (s._id.type === 'THU') map[k].totalThu = s.total;
    if (s._id.type === 'CHI') map[k].totalChi = s.total;
  });
  return {
    data: users.map((u) => ({ ...u, ...(map[String(u._id)] || { totalThu: 0, totalChi: 0, receiptCount: 0 }) })),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ── 2. Chi tiết 1 user ──
const getUserDetail = async (id) => {
  if (!toObjectId(id)) { const e = new Error('userId không hợp lệ.'); e.statusCode = 400; throw e; }
  const user = await User.findById(id).select('-password').lean();
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
  const [stats, recentReceipts, recentOrders] = await Promise.all([
    sumReceipts({ userId: user._id, status: 'VALID' }),
    Receipt.find({ userId: user._id }).sort({ transactionDate: -1 }).limit(5).lean(),
    SubscriptionOrder.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return { user, stats, recentReceipts, recentOrders };
};

// ── 3-4. Đổi plan / role ──
const updatePlan = async (id, { plan, extendDays }) => {
  if (!['FREE', 'PRO'].includes(plan)) { const e = new Error('plan chỉ nhận FREE|PRO.'); e.statusCode = 400; throw e; }
  const user = await User.findById(id);
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
  user.subscriptionPlan = plan;
  if (plan === 'PRO') {
    const days = Number(extendDays) || sepayConfig.proDays;
    const base = user.proExpiresAt && user.proExpiresAt > new Date() ? user.proExpiresAt : new Date();
    user.proStartedAt = user.proStartedAt || new Date();
    user.proExpiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    user.proExpiresAt = null;
  }
  await user.save();
  require('../socket').emitToUser(user._id, 'profile_updated', { reason: 'plan_changed', plan });
  return user;
};

const updateRole = async (id, { role }) => {
  if (!['OWNER', 'ADMIN'].includes(role)) { const e = new Error('role chỉ nhận OWNER|ADMIN.'); e.statusCode = 400; throw e; }
  const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).select('-password');
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
  require('../socket').emitToUser(user._id, 'profile_updated', { reason: 'role_changed', role });
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
  await Promise.all([
    Receipt.deleteMany({ userId: user._id }),
    SubscriptionOrder.deleteMany({ userId: user._id }),
    User.deleteOne({ _id: user._id }),
  ]);
  return { deleted: String(user._id) };
};

// ── 5. Tổng quan hệ thống ──
const getOverview = async () => {
  const today = vnDayRange(), month = vnMonthRange();
  const [totalUsers, totalPRO, totalFREE, todayStats, monthStats, todayOrders] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ subscriptionPlan: 'PRO' }),
    User.countDocuments({ subscriptionPlan: 'FREE' }),
    sumReceipts({ status: 'VALID', transactionDate: { $gte: today.start, $lte: today.end } }),
    sumReceipts({ status: 'VALID', transactionDate: { $gte: month.start, $lte: month.end } }),
    SubscriptionOrder.countDocuments({ status: 'SUCCESS', createdAt: { $gte: today.start, $lte: today.end } }),
  ]);
  return {
    totalUsers, totalPRO, totalFREE,
    mrr: totalPRO * sepayConfig.proPrice,
    todayThu: todayStats.thu, todayChi: todayStats.chi, todayReceipts: todayStats.count, todayOrders,
    monthThu: monthStats.thu, monthChi: monthStats.chi, monthReceipts: monthStats.count,
  };
};

// ── 6. Giao dịch toàn hệ thống ──
const listTransactions = async ({ userId, type, from, to, search = '', page = 1, limit = 20 }) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = { status: 'VALID' };
  if (userId) {
    const oid = toObjectId(userId);
    if (!oid) { const e = new Error('userId không hợp lệ.'); e.statusCode = 400; throw e; }
    filter.userId = oid;
  }
  if (type) filter.transactionType = type;
  if (from || to) {
    filter.transactionDate = {};
    if (from) filter.transactionDate.$gte = new Date(from);
    if (to) filter.transactionDate.$lte = new Date(to);
  }
  if (search) filter.reason = new RegExp(search.trim(), 'i');
  const [total, data] = await Promise.all([
    Receipt.countDocuments(filter),
    Receipt.find(filter).populate('userId', 'email shopName').sort({ transactionDate: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

// ── 7. Doanh thu subscriptions ──
const listPayments = async ({ status, from, to, page = 1, limit = 20 }) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = {};
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const [total, data, sums] = await Promise.all([
    SubscriptionOrder.countDocuments(filter),
    SubscriptionOrder.find(filter).populate('userId', 'email shopName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    SubscriptionOrder.aggregate([{ $match: filter }, { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
  ]);
  return { data, sums, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

// ── 8. Tạo user (admin tạo tài khoản thủ công) ──
const createUser = async ({ email, password, name, shopName, phone, role = 'OWNER', subscriptionPlan = 'FREE' }) => {
  const normalizedEmail = (email || '').toString().toLowerCase().trim();
  if (!normalizedEmail) { const e = new Error('Vui lòng nhập email.'); e.statusCode = 400; throw e; }
  const hasPassword = password !== undefined && password !== null && String(password) !== '';
  if (hasPassword && String(password).length < 6) { const e = new Error('Mật khẩu phải có ít nhất 6 ký tự.'); e.statusCode = 400; throw e; }
  if (!['OWNER', 'ADMIN'].includes(role)) { const e = new Error('role chỉ nhận OWNER|ADMIN.'); e.statusCode = 400; throw e; }
  if (!['FREE', 'PRO'].includes(subscriptionPlan)) { const e = new Error('subscriptionPlan chỉ nhận FREE|PRO.'); e.statusCode = 400; throw e; }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) { const e = new Error('Email này đã được đăng ký.'); e.statusCode = 409; throw e; }

  await User.create({
    email: normalizedEmail,
    name: (name || '').toString().trim(),
    shopName: (shopName || '').toString().trim(),
    phone: (phone || '').toString().trim() || null,
    password: hasPassword ? await bcrypt.hash(String(password), 10) : null,
    role,
    subscriptionPlan,
    authProvider: hasPassword ? 'local' : 'google',
  });

  return User.findOne({ email: normalizedEmail }).select('-password').lean();
};

// ── 9. Cập nhật thông tin chung của user ──
const updateUser = async (id, { name, shopName, phone, avatar }) => {
  if (!toObjectId(id)) { const e = new Error('userId không hợp lệ.'); e.statusCode = 400; throw e; }
  const updateFields = {};
  if (name !== undefined) updateFields.name = String(name).trim();
  if (shopName !== undefined) updateFields.shopName = String(shopName).trim();
  if (phone !== undefined) updateFields.phone = String(phone).trim();
  if (avatar !== undefined) updateFields.avatar = avatar;
  if (Object.keys(updateFields).length === 0) { const e = new Error('Không có trường nào để cập nhật.'); e.statusCode = 400; throw e; }

  const user = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true }).select('-password').lean();
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
  require('../socket').emitToUser(user._id, 'profile_updated', { reason: 'profile_edited' });
  return user;
};

// ── 10. Chi tiết 1 giao dịch ──
const getTransaction = async (id) => {
  if (!toObjectId(id)) { const e = new Error('transactionId không hợp lệ.'); e.statusCode = 400; throw e; }
  const tx = await Receipt.findById(id).populate('userId', 'email shopName').lean();
  if (!tx) { const e = new Error('Không tìm thấy giao dịch.'); e.statusCode = 404; throw e; }
  return tx;
};

// ── 11. Tạo giao dịch ──
const createTransaction = async ({ userId, category = 'Khac', transactionType, totalAmount, reason = '', confidenceLevel = 'HIGH', status = 'VALID', transactionDate, receiptUrl = '' }) => {
  if (!toObjectId(userId)) { const e = new Error('userId không hợp lệ.'); e.statusCode = 400; throw e; }
  if (!['THU', 'CHI'].includes(transactionType)) { const e = new Error('transactionType chỉ nhận THU|CHI.'); e.statusCode = 400; throw e; }
  const amount = Number(totalAmount);
  if (totalAmount === undefined || Number.isNaN(amount)) { const e = new Error('totalAmount không hợp lệ.'); e.statusCode = 400; throw e; }
  if (!['Khac', 'Hoa Don Le', 'POS Ket Ca', 'So Tay', 'Chuyen Khoan'].includes(category)) { const e = new Error('category không hợp lệ.'); e.statusCode = 400; throw e; }
  if (!['HIGH', 'MEDIUM', 'LOW'].includes(confidenceLevel)) { const e = new Error('confidenceLevel chỉ nhận HIGH|MEDIUM|LOW.'); e.statusCode = 400; throw e; }
  if (!['VALID', 'MERGED'].includes(status)) { const e = new Error('status chỉ nhận VALID|MERGED.'); e.statusCode = 400; throw e; }
  const user = await User.findById(userId);
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }

  const tx = await Receipt.create({
    userId,
    category,
    transactionType,
    totalAmount: amount,
    reason,
    confidenceLevel,
    status,
    transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
    receiptUrl,
  });
  require('../socket').emitToUser(userId, 'new_transaction', { transactions: [tx] });
  return tx;
};

// ── 12. Cập nhật giao dịch ──
const updateTransaction = async (id, body) => {
  if (!toObjectId(id)) { const e = new Error('transactionId không hợp lệ.'); e.statusCode = 400; throw e; }
  const tx = await Receipt.findById(id);
  if (!tx) { const e = new Error('Không tìm thấy giao dịch.'); e.statusCode = 404; throw e; }

  const { userId, category, transactionType, totalAmount, reason, confidenceLevel, status, transactionDate, receiptUrl } = body;
  if (userId !== undefined) {
    if (!toObjectId(userId)) { const e = new Error('userId không hợp lệ.'); e.statusCode = 400; throw e; }
    const user = await User.findById(userId);
    if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
    tx.userId = userId;
  }
  if (category !== undefined) {
    if (!['Khac', 'Hoa Don Le', 'POS Ket Ca', 'So Tay', 'Chuyen Khoan'].includes(category)) { const e = new Error('category không hợp lệ.'); e.statusCode = 400; throw e; }
    tx.category = category;
  }
  if (transactionType !== undefined) {
    if (!['THU', 'CHI'].includes(transactionType)) { const e = new Error('transactionType chỉ nhận THU|CHI.'); e.statusCode = 400; throw e; }
    tx.transactionType = transactionType;
  }
  if (totalAmount !== undefined) {
    const amount = Number(totalAmount);
    if (Number.isNaN(amount)) { const e = new Error('totalAmount không hợp lệ.'); e.statusCode = 400; throw e; }
    tx.totalAmount = amount;
  }
  if (reason !== undefined) tx.reason = String(reason);
  if (confidenceLevel !== undefined) {
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(confidenceLevel)) { const e = new Error('confidenceLevel chỉ nhận HIGH|MEDIUM|LOW.'); e.statusCode = 400; throw e; }
    tx.confidenceLevel = confidenceLevel;
  }
  if (status !== undefined) {
    if (!['VALID', 'MERGED'].includes(status)) { const e = new Error('status chỉ nhận VALID|MERGED.'); e.statusCode = 400; throw e; }
    tx.status = status;
  }
  if (transactionDate !== undefined) tx.transactionDate = new Date(transactionDate);
  if (receiptUrl !== undefined) tx.receiptUrl = String(receiptUrl);

  await tx.save();
  const saved = await Receipt.findById(id).populate('userId', 'email shopName').lean();
  require('../socket').emitToUser(saved.userId, 'new_transaction', { transactions: [saved] });
  return saved;
};

// ── 13. Xóa giao dịch (hard delete) ──
const deleteTransaction = async (id) => {
  if (!toObjectId(id)) { const e = new Error('transactionId không hợp lệ.'); e.statusCode = 400; throw e; }
  const tx = await Receipt.findByIdAndDelete(id);
  if (!tx) { const e = new Error('Không tìm thấy giao dịch.'); e.statusCode = 404; throw e; }
  require('../socket').emitToUser(tx.userId, 'new_transaction');
  return { deleted: String(tx._id) };
};

// ── 14. Chi tiết 1 đơn thanh toán ──
const getPayment = async (id) => {
  if (!toObjectId(id)) { const e = new Error('paymentId không hợp lệ.'); e.statusCode = 400; throw e; }
  const order = await SubscriptionOrder.findById(id).populate('userId', 'email shopName').lean();
  if (!order) { const e = new Error('Không tìm thấy đơn thanh toán.'); e.statusCode = 404; throw e; }
  return order;
};

// ── 15. Cập nhật đơn thanh toán ──
const updatePayment = async (id, body) => {
  if (!toObjectId(id)) { const e = new Error('paymentId không hợp lệ.'); e.statusCode = 400; throw e; }
  const order = await SubscriptionOrder.findById(id);
  if (!order) { const e = new Error('Không tìm thấy đơn thanh toán.'); e.statusCode = 404; throw e; }
  const wasSuccess = order.status === 'SUCCESS';

  const { status, amount, plan, paidAt, bankCode, bankAccount, accountName, transferContent } = body;
  if (status !== undefined) {
    if (!['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'].includes(status)) { const e = new Error('status không hợp lệ.'); e.statusCode = 400; throw e; }
    order.status = status;
    if (status === 'SUCCESS') order.paidAt = order.paidAt || new Date();
  }
  if (amount !== undefined) {
    const amt = Number(amount);
    if (Number.isNaN(amt)) { const e = new Error('amount không hợp lệ.'); e.statusCode = 400; throw e; }
    order.amount = amt;
  }
  if (plan !== undefined) {
    if (!['PRO'].includes(plan)) { const e = new Error('plan chỉ nhận PRO.'); e.statusCode = 400; throw e; }
    order.plan = plan;
  }
  if (paidAt !== undefined) order.paidAt = paidAt ? new Date(paidAt) : null;
  if (bankCode !== undefined) order.bankCode = String(bankCode);
  if (bankAccount !== undefined) order.bankAccount = String(bankAccount);
  if (accountName !== undefined) order.accountName = String(accountName);
  if (transferContent !== undefined) order.transferContent = String(transferContent);

  await order.save();
  const saved = await SubscriptionOrder.findById(id).populate('userId', 'email shopName').lean();
  if (!wasSuccess && saved.status === 'SUCCESS') {
    require('../socket').emitToUser(saved.userId, 'subscription_upgraded', { plan: saved.plan, orderCode: saved.orderCode });
  }
  return saved;
};

// ── 16. Xóa đơn thanh toán (hard delete) ──
const deletePayment = async (id) => {
  if (!toObjectId(id)) { const e = new Error('paymentId không hợp lệ.'); e.statusCode = 400; throw e; }
  const order = await SubscriptionOrder.findByIdAndDelete(id);
  if (!order) { const e = new Error('Không tìm thấy đơn thanh toán.'); e.statusCode = 404; throw e; }
  return { deleted: String(order._id) };
};

module.exports = {
  listUsers, getUserDetail, updatePlan, updateRole, deleteUser, getOverview, listTransactions, listPayments,
  createUser, updateUser, getTransaction, createTransaction, updateTransaction, deleteTransaction,
  getPayment, updatePayment, deletePayment,
};
