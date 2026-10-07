require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const SubscriptionOrder = require('../models/SubscriptionOrder');

const SEED_EMAILS = ['admin@vikeso.vn', 'owner.free@vikeso.vn', 'owner.pro@vikeso.vn'];
const SEED_ORDER_CODES = ['VIKESO-SEED01', 'VIKESO-SEED02'];

async function run() {
  if (!process.env.MONGO_URI) throw new Error('Thieu MONGO_URI trong .env');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔌 Da ket noi MongoDB');

  // Xoa seed cu (chi email/orderCode seed, khong xoa du lieu that)
  const users = await User.find({ email: { $in: SEED_EMAILS } });
  const userIds = users.map((u) => u._id);
  await Receipt.deleteMany({ userId: { $in: userIds } });
  await SubscriptionOrder.deleteMany({ orderCode: { $in: SEED_ORDER_CODES } });
  await User.deleteMany({ email: { $in: SEED_EMAILS } });

  const password = await bcrypt.hash('123456', 10);
  const now = new Date();

  const [admin, freeOwner, proOwner] = await User.create([
    {
      email: 'admin@vikeso.vn', name: 'Admin Vikeso', password,
      shopName: 'Admin Quan Tri', role: 'ADMIN', authProvider: 'local',
    },
    {
      email: 'owner.free@vikeso.vn', name: 'Chu Free', password,
      shopName: 'Tap Hoa Co Ba', phone: '0988888999',
      role: 'OWNER', subscriptionPlan: 'FREE', authProvider: 'local',
    },
    {
      email: 'owner.pro@vikeso.vn', name: 'Chu Pro', password,
      shopName: 'Vua Sau Rieng Ba Cuong', phone: '0988888998',
      role: 'OWNER', subscriptionPlan: 'PRO',
      proStartedAt: now,
      proExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      authProvider: 'local',
    },
  ]);
  console.log('👤 Users:', admin.email, '|', freeOwner.email, '|', proOwner.email);

  await Receipt.create([
    {
      userId: freeOwner._id, category: 'Hoa Don Le', transactionType: 'THU',
      totalAmount: 250000, reason: 'Ban tap hoa buoi sang', confidenceLevel: 'HIGH',
      status: 'VALID', aiRawData: { isPosBill: true, CacKhoanTien: [250000] },
    },
    {
      userId: freeOwner._id, category: 'So Tay', transactionType: 'CHI',
      totalAmount: 120000, reason: 'Nhap rau cu', confidenceLevel: 'MEDIUM',
      status: 'VALID', aiRawData: { isPosBill: false, CacKhoanTien: [120000] },
    },
    {
      userId: freeOwner._id, category: 'Hoa Don Le', transactionType: 'THU',
      totalAmount: 80000, reason: 'Bill le da gop vao ket ca', confidenceLevel: 'HIGH',
      status: 'MERGED', aiRawData: { isPosBill: true, CacKhoanTien: [80000] },
    },
    {
      userId: proOwner._id, category: 'POS Ket Ca', transactionType: 'THU',
      totalAmount: 5200000, reason: 'Ket ca ngay', confidenceLevel: 'HIGH',
      status: 'VALID', aiRawData: { isPosBill: true, CacKhoanTien: [5200000] },
    },
    {
      userId: proOwner._id, category: 'Chuyen Khoan', transactionType: 'CHI',
      totalAmount: 1500000, reason: 'Tra tien nhap sau rieng', confidenceLevel: 'HIGH',
      status: 'VALID', aiRawData: { isPosBill: false, CacKhoanTien: [1500000] },
    },
  ]);
  console.log('🧾 Receipts: 5');

  await SubscriptionOrder.create([
    {
      // Don SUCCESS cua owner.pro — dung de test webhook duplicate (id=90001)
      userId: proOwner._id, orderCode: 'VIKESO-SEED01', plan: 'PRO', amount: 99000,
      status: 'SUCCESS', sepayTransactionId: 90001,
      transferContent: 'VIKESO SEED01', gateway: 'MBBank',
      qrUrl: 'https://qr.sepay.vn/img?acc=0000000000&bank=VCB&amount=99000&des=VIKESO+SEED01&template=compact2',
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000), paidAt: now,
      rawWebhook: {
        id: 90001, gateway: 'MBBank', transferType: 'in', transferAmount: 99000,
        content: 'VIKESO SEED01 chuyen tien', transactionDate: '2025-01-15 10:30:00',
      },
    },
    {
      // Don PENDING cua owner.free — dung de test webhook hop le tiep theo
      userId: freeOwner._id, orderCode: 'VIKESO-SEED02', plan: 'PRO', amount: 99000,
      status: 'PENDING', transferContent: 'VIKESO SEED02',
      qrUrl: 'https://qr.sepay.vn/img?acc=0000000000&bank=VCB&amount=99000&des=VIKESO+SEED02&template=compact2',
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    },
  ]);
  console.log('🧾 Orders: VIKESO-SEED01 (SUCCESS) | VIKESO-SEED02 (PENDING)');

  console.log('✅ Seed xong. Login: owner.free@vikeso.vn / owner.pro@vikeso.vn / admin@vikeso.vn — pass: 123456');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('❌ Seed loi:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
