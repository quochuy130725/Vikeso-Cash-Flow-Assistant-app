const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const Shop = require('../models/Shop');
const { emitToUser } = require('../socket');

/**
 * GET /api/staff
 * Lấy danh sách nhân viên thuộc quyền quản lý của Owner
 */
exports.listStaff = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { shopId } = req.query;

    const query = { role: 'STAFF', employerId: ownerId };
    if (shopId) query.activeShopId = shopId;

    const staffMembers = await User.find(query)
      .select('-password -resetPasswordCode')
      .populate('activeShopId', 'shopName address')
      .sort({ createdAt: -1 })
      .lean();

    // Thống kê số lượng hóa đơn nhân viên đã nhập
    const staffIds = staffMembers.map((s) => s._id);
    const receiptCounts = await Receipt.aggregate([
      { $match: { createdBy: { $in: staffIds }, status: 'VALID' } },
      { $group: { _id: '$createdBy', count: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const countMap = {};
    receiptCounts.forEach((r) => {
      countMap[String(r._id)] = {
        receiptCount: r.count,
        totalRevenue: r.totalRevenue,
      };
    });

    const data = staffMembers.map((s) => ({
      ...s,
      id: s._id,
      shopName: s.activeShopId?.shopName || s.shopName || 'Cửa hàng chính',
      stats: countMap[String(s._id)] || { receiptCount: 0, totalRevenue: 0 },
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Lỗi list-staff:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/staff
 * Chủ shop tạo tài khoản nhân viên thu ngân từ Web Portal
 */
exports.createStaff = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { name, email, phone, password, assignedShopId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu cho nhân viên.',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã tồn tại trong hệ thống.' });
    }

    // Xác định shop chỉ định
    let targetShopId = assignedShopId || req.user.activeShopId;
    let shopName = '';
    if (targetShopId) {
      const shop = await Shop.findById(targetShopId);
      if (shop) shopName = shop.shopName;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await User.create({
      email: normalizedEmail,
      name: name.trim(),
      phone: phone?.trim() || null,
      password: hashedPassword,
      role: 'STAFF',
      employerId: ownerId,
      activeShopId: targetShopId || null,
      shopName,
      isEmailVerified: true,
      onboardingCompleted: true,
      isActive: true,
      tokenVersion: 0,
      authProvider: 'local',
    });

    console.log(`👤 Tạo tài khoản nhân viên mới: ${staff.email} (Chủ shop: ${ownerId})`);

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản nhân viên thu ngân thành công!',
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        isActive: staff.isActive,
        shopName: staff.shopName,
      },
    });
  } catch (error) {
    console.error('Lỗi create-staff:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/staff/:id/status
 * Khóa / Mở khóa tài khoản nhân viên tức thì (< 1s) qua Socket.IO force_logout
 */
exports.updateStaffStatus = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu trường isActive (true/false).' });
    }

    const staff = await User.findOne({ _id: id, role: 'STAFF', employerId: ownerId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên này.' });
    }

    staff.isActive = Boolean(isActive);
    staff.tokenVersion = (staff.tokenVersion || 0) + 1; // Vô hiệu hóa token cũ
    await staff.save();

    // Bắn socket đẩy nhân viên ra ngay lập tức nếu bị khóa
    if (!staff.isActive) {
      console.log(`🚨 Bắn force_logout tới nhân viên bị khóa: ${staff._id} (${staff.email})`);
      emitToUser(staff._id, 'force_logout', {
        reason: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa bởi chủ cửa hàng.',
      });
    }

    return res.status(200).json({
      success: true,
      message: staff.isActive ? 'Đã mở khóa tài khoản nhân viên.' : 'Đã khóa tài khoản nhân viên và thu hồi phiên đăng nhập tức thì!',
      data: {
        id: staff._id,
        isActive: staff.isActive,
        tokenVersion: staff.tokenVersion,
      },
    });
  } catch (error) {
    console.error('Lỗi update-staff-status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/staff/:id/reset-password
 * Cấp lại mật khẩu mới cho nhân viên thu ngân
 */
exports.resetStaffPassword = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const staff = await User.findOne({ _id: id, role: 'STAFF', employerId: ownerId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên này.' });
    }

    staff.password = await bcrypt.hash(newPassword, 10);
    staff.tokenVersion = (staff.tokenVersion || 0) + 1; // Thu hồi token cũ
    await staff.save();

    // Bắn force_logout yêu cầu nhân viên đăng nhập lại
    emitToUser(staff._id, 'force_logout', {
      reason: 'PASSWORD_RESET',
      message: 'Chủ cửa hàng đã cấp lại mật khẩu mới. Vui lòng đăng nhập lại.',
    });

    console.log(`🔑 Cấp lại mật khẩu cho nhân viên: ${staff.email}`);

    return res.status(200).json({
      success: true,
      message: 'Đã đổi mật khẩu cho nhân viên thành công!',
    });
  } catch (error) {
    console.error('Lỗi reset-staff-password:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/staff/:id
 * Xóa tài khoản nhân viên (giữ lịch sử hóa đơn)
 */
exports.deleteStaff = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const staff = await User.findOne({ _id: id, role: 'STAFF', employerId: ownerId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên này.' });
    }

    // Đẩy khỏi app trước khi xóa
    emitToUser(staff._id, 'force_logout', {
      reason: 'ACCOUNT_DELETED',
      message: 'Tài khoản nhân viên của bạn đã bị xóa bởi chủ cửa hàng.',
    });

    await User.deleteOne({ _id: staff._id });
    console.log(`🗑️ Đã xóa nhân viên: ${staff.email}`);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa tài khoản nhân viên thành công.',
      deletedId: String(staff._id),
    });
  } catch (error) {
    console.error('Lỗi delete-staff:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

