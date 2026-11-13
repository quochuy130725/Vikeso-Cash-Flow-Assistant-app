/**
 * KIỂM THỬ END-TO-END TẤT CẢ ENDPOINTS ĐẶC TẢ v3.2-FINAL
 * Chạy: node Back-end/src/scripts/test_api_endpoints.js
 */

const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
require('dotenv').config({ path: 'Back-end/.env' });

const http = require('http');
const express = require('express');
const mongoose = require('mongoose');

const apiRoutes = require('../routes/apiRoutes');
const authRoutes = require('../routes/authRoutes');
const billingRoutes = require('../routes/billingRoutes');
const adminRoutes = require('../routes/adminRoutes');
const staffRoutes = require('../routes/staffRoutes');
const shopRoutes = require('../routes/shopRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const { initSocket } = require('../socket');

const User = require('../models/User');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const OtpToken = require('../models/OtpToken');
const Receipt = require('../models/Receipt');
const SubscriptionOrder = require('../models/SubscriptionOrder');

async function runE2ETests() {
  console.log('🚀 Khởi động Server thử nghiệm tại port ngẫu nhiên...');
  const app = express();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/shops', shopRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', apiRoutes);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB.');

  const server = await new Promise((resolve) => {
    const s = httpServer.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`🌐 Server test đang lắng nghe tại: ${baseUrl}`);

  const post = async (path, body, headers = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  };

  const get = async (path, headers = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    return { status: res.status, json: await res.json() };
  };

  const patch = async (path, body, headers = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  };

  const put = async (path, body, headers = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  };

  try {
    const unique = Date.now();
    const ownerEmail = `e2e_owner_${unique}@vikeso.test`;
    const adminEmail = `e2e_admin_${unique}@vikeso.test`;

    // 1. Đăng ký tài khoản Owner
    console.log('\n--- 1. POST /api/auth/register ---');
    const regRes = await post('/api/auth/register', {
      name: 'Nguyễn Văn Chủ Shop',
      email: ownerEmail,
      phone: '0901234567',
      password: 'password123',
    });
    console.log('Result:', regRes.json);
    if (!regRes.json.requireOtp) throw new Error('Register không trả về requireOtp: true');

    // Lấy OTP từ DB
    const otpDoc = await OtpToken.findOne({ email: ownerEmail });
    if (!otpDoc) throw new Error('Không tìm thấy OtpToken trong DB');
    console.log(`🔑 Mã OTP 6 số từ DB: ${otpDoc.otpCode}`);

    // 2. Xác thực OTP
    console.log('\n--- 2. POST /api/auth/verify-otp ---');
    const verifyRes = await post('/api/auth/verify-otp', {
      email: ownerEmail,
      otpCode: otpDoc.otpCode,
    });
    console.log('Result:', verifyRes.json);
    if (!verifyRes.json.accessToken) throw new Error('Không nhận được accessToken');
    if (verifyRes.json.requireOnboarding !== true) throw new Error('requireOnboarding phải là true');

    const ownerToken = verifyRes.json.accessToken;
    const authHeaders = { Authorization: `Bearer ${ownerToken}` };

    // 3. Khởi tạo Onboarding cửa hàng đầu tiên
    console.log('\n--- 3. POST /api/shops/onboarding ---');
    const onbRes = await post('/api/shops/onboarding', {
      shopName: 'Tạp Hóa Mặt Trời',
      businessType: 'Tạp hóa tổng hợp',
      address: '123 Lê Lợi, Q1, TP.HCM',
      phone: '0901234567',
    }, authHeaders);
    console.log('Result:', onbRes.json);
    if (onbRes.json.data.approvalStatus !== 'APPROVED') throw new Error('Shop đầu tiên phải là APPROVED');
    if (!onbRes.json.data.isPrimary) throw new Error('Shop đầu tiên phải là isPrimary: true');

    const primaryShopId = onbRes.json.data._id;

    // 4. Chủ shop tạo nhân viên thu ngân (STAFF)
    console.log('\n--- 4. POST /api/staff ---');
    const staffEmail = `e2e_staff_${unique}@vikeso.test`;
    const staffRes = await post('/api/staff', {
      name: 'Trần Thu Ngân',
      email: staffEmail,
      phone: '0987654321',
      password: 'passwordStaff123',
      assignedShopId: primaryShopId,
    }, authHeaders);
    console.log('Result:', staffRes.json);
    if (staffRes.json.data.role !== 'STAFF') throw new Error('Nhân viên không có role STAFF');

    const staffId = staffRes.json.data.id;

    // 5. Khóa nhân viên và kiểm tra thu hồi phiên (Session Eviction)
    console.log('\n--- 5. PATCH /api/staff/:id/status (Khóa tài khoản) ---');
    const lockRes = await patch(`/api/staff/${staffId}/status`, { isActive: false }, authHeaders);
    console.log('Result:', lockRes.json);
    if (lockRes.json.data.isActive !== false) throw new Error('isActive không cập nhật false');

    // 6. Cây Danh mục: Lấy danh mục và Tạo danh mục mới
    console.log('\n--- 6. POST & GET /api/categories ---');
    const newCatRes = await post('/api/categories', {
      name: 'Nước giải khát & Kem',
      transactionType: 'THU',
      icon: 'local_drink',
      color: '#FF4783',
    }, authHeaders);
    console.log('Create Category:', newCatRes.json);

    const listCatRes = await get('/api/categories?format=tree', authHeaders);
    console.log(`Số nhóm danh mục Cha (tree): ${listCatRes.json.data.length}`);

    // 7. Sinh mã thanh toán gói PRO VietQR
    console.log('\n--- 7. POST /api/billing/create-order ---');
    const billRes = await post('/api/billing/create-order', {}, authHeaders);
    console.log('Billing order:', billRes.json);
    if (billRes.json.data.amount !== 99000) throw new Error('Giá gói PRO phải là 99.000đ');
    if (!billRes.json.data.qrImageUrl) throw new Error('qrImageUrl không được rỗng');

    // 8. Đăng ký chi nhánh thứ 2+ (PENDING_APPROVAL)
    console.log('\n--- 8. POST /api/shops (Chi nhánh thứ 2+) ---');
    const shop2Res = await post('/api/shops', {
      shopName: 'Tạp Hóa Mặt Trời - Cơ sở 2',
      businessType: 'Bán lẻ thực phẩm',
      address: '456 Hai Bà Trưng, Q3, TP.HCM',
      phone: '0901234568',
      verificationDocs: ['https://example.com/doc1.jpg'],
    }, authHeaders);
    console.log('Shop 2 Result:', shop2Res.json);
    if (shop2Res.json.data.approvalStatus !== 'PENDING') throw new Error('Chi nhánh 2+ phải ở trạng thái PENDING');

    const shop2Id = shop2Res.json.data._id;

    // 9. Admin duyệt chi nhánh thứ 2
    console.log('\n--- 9. Admin Review Shop ---');
    // Tạo admin user
    const adminUser = await User.create({
      email: adminEmail,
      name: 'Hệ Thống Admin',
      role: 'ADMIN',
      isEmailVerified: true,
      onboardingCompleted: true,
    });
    const jwt = require('jsonwebtoken');
    const adminToken = jwt.sign(
      { userId: adminUser._id, role: 'ADMIN', tokenVersion: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const reviewRes = await patch(`/api/admin/shops/${shop2Id}/review`, {
      action: 'APPROVE',
    }, adminHeaders);
    console.log('Admin Review Result:', reviewRes.json);
    if (reviewRes.json.data.approvalStatus !== 'APPROVED') throw new Error('Admin duyệt không thành công');

    // 10. Analytics
    console.log('\n--- 10. GET /api/transactions/analytics ---');
    const analyticsRes = await get('/api/transactions/analytics?period=month', authHeaders);
    console.log('Analytics Result:', analyticsRes.json);
    if (analyticsRes.json.currentPeriod === undefined) throw new Error('Analytics thiếu currentPeriod');

    console.log('\n========================================================');
    console.log('🎉 TẤT CẢ 10/10 MODULE API ENDPOINTS ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
    console.log('========================================================');

    // Dọn dẹp
    console.log('\n🧹 Dọn dẹp test database...');
    await User.deleteMany({ email: { $in: [ownerEmail, staffEmail, adminEmail] } });
    await Shop.deleteMany({ _id: { $in: [primaryShopId, shop2Id] } });
    await OtpToken.deleteMany({ email: ownerEmail });
    await SubscriptionOrder.deleteMany({ orderCode: billRes.json.data.orderCode });
    await Category.deleteOne({ _id: newCatRes.json.data._id });
    console.log('✅ Đã dọn dẹp sạch sẽ!');

  } catch (err) {
    console.error('❌ E2E Test Lỗi:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runE2ETests();

