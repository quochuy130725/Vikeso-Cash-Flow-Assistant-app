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
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Trả về userInfo gọn gàng cho Flutter
// ─────────────────────────────────────────────────────────────────────────────
const buildUserInfo = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name || '',
  shopName: user.shopName,
  avatar: user.avatar,
  telegramChatId: user.telegramChatId,
  subscriptionPlan: user.subscriptionPlan,
  authProvider: user.authProvider,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register  — Đăng ký Email/Password
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, shopName } = req.body;

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
    const { name } = req.body;
    const user = await User.create({
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      password: hashedPassword,
      shopName: shopName || '',
      authProvider: 'local',
    });

    const accessToken = signToken(user);
    console.log(`✅ Đăng ký thành công: ${user.email}`);

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
// POST /api/auth/login  — Đăng nhập Email/Password
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const accessToken = signToken(user);
    console.log(`✅ Đăng nhập thành công: ${user.email}`);

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
      // User đã tồn tại: cập nhật googleId và avatar nếu chưa có
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Tạo user mới từ Google
      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        name: name || '',        // Tên thật từ Google profile
        shopName: name || '',
        avatar: picture,
        authProvider: 'google',
        password: null,
      });
      console.log(`🆕 Tạo user mới qua Google: ${email}`);
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
// Body: { shopName?, phone?, avatar? }
// Yêu cầu: Bearer token hợp lệ
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { shopName, phone, avatar } = req.body;
    const userId = req.user.userId;

    const updateFields = {};
    if (shopName !== undefined) updateFields.shopName = shopName.trim();
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
      userInfo: {
        ...buildUserInfo(user),
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Lỗi update-profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
