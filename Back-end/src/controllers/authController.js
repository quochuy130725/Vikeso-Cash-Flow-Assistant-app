const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Tạo JWT cho user
// ─────────────────────────────────────────────────────────────────────────────
const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      shopName: user.shopName,
      role: user.role || 'OWNER',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Trả về userInfo gọn gàng cho Flutter & Web
// ─────────────────────────────────────────────────────────────────────────────
const buildUserInfo = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name || '',
  shopName: user.shopName,
  avatar: user.avatar,
  phone: user.phone || '',
  telegramChatId: user.telegramChatId,
  subscriptionPlan: user.subscriptionPlan,
  authProvider: user.authProvider,
  role: user.role || 'OWNER',
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register  — Đăng ký Email/Password
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, shopName, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = (role === 'ADMIN' || email.toLowerCase().includes('admin') || email.toLowerCase().includes('finity')) ? 'ADMIN' : 'OWNER';
    const user = await User.create({
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      password: hashedPassword,
      shopName: shopName || '',
      role: userRole,
      authProvider: 'local',
    });

    const accessToken = signToken(user);
    console.log(`✅ Đăng ký thành công: ${user.email} (Role: ${user.role})`);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      accessToken,
      userInfo: buildUserInfo(user),
    });
  } catch (error) {
    console.error('Lỗi register:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login  — Đăng nhập Email/SĐT + Password
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.phone || req.body.identifier || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email hoặc số điện thoại và mật khẩu.' });
    }

    // Cho phép tìm bằng email HOẶC số điện thoại
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Email/Số điện thoại hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email/Số điện thoại hoặc mật khẩu không đúng.' });
    }

    // Tự động bổ sung role nếu tài khoản cũ chưa có trong Database
    if (!user.role) {
      user.role = (email.toLowerCase().includes('admin') || email.toLowerCase().includes('finity')) ? 'ADMIN' : 'OWNER';
      await user.save();
    }

    const accessToken = signToken(user);
    console.log(`✅ Đăng nhập thành công: ${user.email} (Role: ${user.role})`);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      accessToken,
      userInfo: buildUserInfo(user),
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/google  — Google Sign-In (nhận idToken từ Flutter)
// ─────────────────────────────────────────────────────────────────────────────
exports.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Thiếu Google idToken.' });
    }

    // Verify idToken với Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Tìm hoặc tạo user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User đã tồn tại: cập nhật googleId, avatar và role nếu chưa có
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        user.authProvider = 'google';
        changed = true;
      }
      if (!user.role) {
        user.role = (email.toLowerCase().includes('admin') || email.toLowerCase().includes('finity')) ? 'ADMIN' : 'OWNER';
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    } else {
      // Tạo user mới từ Google
      const userRole = (email.toLowerCase().includes('admin') || email.toLowerCase().includes('finity')) ? 'ADMIN' : 'OWNER';
      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        name: name || '',        // Tên thật từ Google profile
        shopName: name || '',
        avatar: picture,
        role: userRole,
        authProvider: 'google',
        password: null,
      });
      console.log(`🆕 Tạo user mới qua Google: ${email} (Role: ${user.role})`);
    }

    const accessToken = signToken(user);
    console.log(`✅ Google Sign-In thành công: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      accessToken,
      userInfo: buildUserInfo(user),
    });
  } catch (error) {
    console.error('Lỗi google-signin:', error);
    // Token không hợp lệ từ Google
    if (error.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Google token không hợp lệ hoặc đã hết hạn.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  — Lấy thông tin user hiện tại (cần Bearer token)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    return res.status(200).json({
      success: true,
      userInfo: {
        ...buildUserInfo(user),
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/profile  — Cập nhật thông tin cá nhân
// Body: { name?, shopName?, phone?, avatar? }
// Yêu cầu: Bearer token hợp lệ
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, shopName, phone, avatar } = req.body;
    const userId = req.user.userId;

    const updateFields = {};
    if (name      !== undefined) updateFields.name      = name.trim();
    if (shopName  !== undefined) updateFields.shopName  = shopName.trim();
    if (phone     !== undefined) updateFields.phone     = phone.trim();
    if (avatar    !== undefined) updateFields.avatar    = avatar;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'Không có trường nào để cập nhật.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    console.log(`✅ Cập nhật profile: ${user.email}`);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      userInfo: buildUserInfo(user),
    });
  } catch (error) {
    console.error('Lỗi update-profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/change-password  — Đổi mật khẩu
// Body: { currentPassword, newPassword }
// Yêu cầu: Bearer token hợp lệ
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(`🔑 Đổi mật khẩu thành công cho: ${user.email}`);
    return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('Lỗi change-password:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
