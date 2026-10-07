const mongoose = require('mongoose');
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
  return user;
};

const updateRole = async (id, { role }) => {
  if (!['OWNER', 'ADMIN'].includes(role)) { const e = new Error('role chỉ nhận OWNER|ADMIN.'); e.statusCode = 400; throw e; }
  const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).select('-password');
  if (!user) { const e = new Error('Không tìm thấy người dùng.'); e.statusCode = 404; throw e; }
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

module.exports = { listUsers, getUserDetail, updatePlan, updateRole, deleteUser, getOverview, listTransactions, listPayments };
