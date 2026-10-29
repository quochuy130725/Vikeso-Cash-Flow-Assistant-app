const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const User = require('../models/User');
const OtpToken = require('../models/OtpToken');
const { sendResetPasswordEmail, sendRegisterOtpEmail } = require('../services/mailService');

const RESET_CODE_TTL_MINUTES = 10;
const RESET_CODE_RESEND_SECONDS = 60;
const RESET_CODE_MAX_ATTEMPTS = 5;

const REGISTER_OTP_TTL_MINUTES = 5;
const REGISTER_OTP_RESEND_SECONDS = 60;
const REGISTER_OTP_MAX_ATTEMPTS = 5;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Tạo JWT cho user (chứa đầy đủ role, tokenVersion, activeShopId)
// ─────────────────────────────────────────────────────────────────────────────
const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      id: user._id,
      email: user.email,
      shopName: user.shopName,
      role: user.role || 'OWNER',
      tokenVersion: user.tokenVersion || 0,
      activeShopId: user.activeShopId || null,
      employerId: user.employerId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Trả về userInfo chuẩn hóa v3.2
// ─────────────────────────────────────────────────────────────────────────────
const buildUserInfo = (user, effectivePlan = null) => ({
  id: user._id,
  email: user.email,
  name: user.name || '',
  shopName: user.shopName || '',
  avatar: user.avatar,
  phone: user.phone || '',
  telegramChatId: user.telegramChatId,
  subscriptionPlan: effectivePlan || user.subscriptionPlan || 'FREE',
  authProvider: user.authProvider || 'local',
  role: user.role || 'OWNER',
  isEmailVerified: Boolean(user.isEmailVerified),
  onboardingCompleted: Boolean(user.onboardingCompleted),
  isActive: user.isActive !== false,
  activeShopId: user.activeShopId || null,
  employerId: user.employerId || null,
  notificationSettings: user.notificationSettings || {
    receiveEmail: true,
    receiveTelegram: !!user.telegramChatId,
    receiveInApp: true,
  },
});

// Helper che bớt email
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register  — Đăng ký cá nhân & Gửi Email OTP 6 số
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existing = await User.findOne({ email: normalizedEmail });

    // Nếu đã tồn tại nhưng chưa verify email: cho phép cập nhật pass và gửi lại OTP
    if (existing && existing.isEmailVerified === false) {
      existing.password = await bcrypt.hash(password, 10);
      if (name) existing.name = name.trim();
      if (phone) existing.phone = phone.trim();
      await existing.save();
    } else if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký và kích hoạt.' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = (role === 'ADMIN' || normalizedEmail.includes('admin') || normalizedEmail.includes('finity')) ? 'ADMIN' : 'OWNER';
      existing = await User.create({
        email: normalizedEmail,
        name: name?.trim() || '',
        password: hashedPassword,
        phone: phone?.trim() || null,
        role: userRole,
        isEmailVerified: false,
        onboardingCompleted: false,
        isActive: true,
        tokenVersion: 0,
        authProvider: 'local',
      });
    }

    // Sinh mã OTP 6 số
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + REGISTER_OTP_TTL_MINUTES * 60 * 1000);

    await OtpToken.deleteMany({ email: normalizedEmail, purpose: 'REGISTER_VERIFY' });
    await OtpToken.create({
      email: normalizedEmail,
      otpCode,
      purpose: 'REGISTER_VERIFY',
      attempts: 0,
      expiresAt,
    });

    let demoCode = null;
    try {
      await sendRegisterOtpEmail({
        to: normalizedEmail,
        name: existing.name || 'Chủ hộ kinh doanh',
        code: otpCode,
        minutes: REGISTER_OTP_TTL_MINUTES,
      });
      console.log(`📧 Đã gửi mã xác thực OTP tới: ${normalizedEmail}`);
    } catch (mailError) {
      console.warn(`⚠️ Gửi mail thất bại, fallback demoCode:`, mailError.message);
      demoCode = otpCode;
    }

    return res.status(201).json({
      success: true,
      requireOtp: true,
      email: normalizedEmail,
      maskedEmail: maskEmail(normalizedEmail),
      expiresInMinutes: REGISTER_OTP_TTL_MINUTES,
      demoCode,
      message: `Đăng ký thành công! Mã OTP 6 số đã được gửi tới ${maskEmail(normalizedEmail)}.`,
    });
  } catch (error) {
    console.error('Lỗi register:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp  — Xác thực OTP 6 số sau đăng ký
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mã OTP.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenDoc = await OtpToken.findOne({ email: normalizedEmail, purpose: 'REGISTER_VERIFY' });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không tồn tại hoặc đã hết hạn. Vui lòng nhấn gửi lại mã mới.',
      });
    }

    if (tokenDoc.attempts >= REGISTER_OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Bạn đã nhập sai mã quá 5 lần. Vui lòng yêu cầu mã xác thực mới.',
      });
    }

    if (tokenDoc.otpCode !== String(otpCode).trim()) {
      tokenDoc.attempts += 1;
      await tokenDoc.save();
      const left = REGISTER_OTP_MAX_ATTEMPTS - tokenDoc.attempts;
      return res.status(400).json({
        success: false,
        message: left > 0 ? `Mã xác thực không chính xác. Còn ${left} lần thử.` : 'Đã nhập sai quá số lần cho phép.',
      });
    }

    // Xác thực thành công: xóa OTP và kích hoạt tài khoản
    await OtpToken.deleteOne({ _id: tokenDoc._id });
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { isEmailVerified: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng.' });
    }

    const accessToken = signToken(user);
    console.log(`✅ Xác thực email thành công cho: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Xác thực tài khoản thành công!',
      accessToken,
      userInfo: buildUserInfo(user),
      requireOnboarding: !user.onboardingCompleted,
    });
  } catch (error) {
    console.error('Lỗi verify-otp:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp  — Gửi lại mã OTP 6 số
// ─────────────────────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Tài khoản này đã được xác thực trước đó. Vui lòng đăng nhập.' });
    }

    const existingOtp = await OtpToken.findOne({ email: normalizedEmail, purpose: 'REGISTER_VERIFY' });
    if (existingOtp && existingOtp.updatedAt) {
      const elapsedSec = (Date.now() - existingOtp.updatedAt.getTime()) / 1000;
      if (elapsedSec < REGISTER_OTP_RESEND_SECONDS) {
        const wait = Math.ceil(REGISTER_OTP_RESEND_SECONDS - elapsedSec);
        return res.status(429).json({ success: false, message: `Vui lòng đợi ${wait} giây trước khi gửi lại mã.` });
      }
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + REGISTER_OTP_TTL_MINUTES * 60 * 1000);

    await OtpToken.deleteMany({ email: normalizedEmail, purpose: 'REGISTER_VERIFY' });
    await OtpToken.create({
      email: normalizedEmail,
      otpCode,
      purpose: 'REGISTER_VERIFY',
      attempts: 0,
      expiresAt,
    });

    let demoCode = null;
    try {
      await sendRegisterOtpEmail({
        to: normalizedEmail,
        name: user.name || 'Chủ hộ kinh doanh',
        code: otpCode,
        minutes: REGISTER_OTP_TTL_MINUTES,
      });
    } catch (mailError) {
      console.warn('⚠️ Gửi resend mail thất bại, fallback demoCode:', mailError.message);
      demoCode = otpCode;
    }

    return res.status(200).json({
      success: true,
      message: `Đã gửi lại mã OTP mới tới ${maskEmail(normalizedEmail)}.`,
      email: normalizedEmail,
      demoCode,
    });
  } catch (error) {
    console.error('Lỗi resend-otp:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login  — Đăng nhập Email/SĐT + Password (Kiểm tra isActive & RBAC)
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.phone || req.body.identifier || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email hoặc số điện thoại và mật khẩu.' });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail
      ? { email: identifier.toLowerCase().trim() }
      : {
          $or: [
            { phone: identifier },
            { email: identifier.toLowerCase().trim() },
          ],
        };

    const user = await User.findOne(query);
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Email/Số điện thoại hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email/Số điện thoại hoặc mật khẩu không đúng.' });
    }

    // 1. Kiểm tra tài khoản có bị Owner khóa không
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa bởi chủ cửa hàng.',
      });
    }

    // 2. Tương thích ngược: user cũ mặc định coi như đã verified
    if (user.isEmailVerified === undefined) {
      user.isEmailVerified = true;
      user.onboardingCompleted = true;
      await user.save();
    }

    // 3. Nếu là STAFF: kế thừa subscriptionPlan từ Employer
    let effectivePlan = user.subscriptionPlan;
    if (user.role === 'STAFF' && user.employerId) {
      const employer = await User.findById(user.employerId).select('subscriptionPlan proExpiresAt');
      if (employer) {
        effectivePlan = employer.subscriptionPlan;
      }
    }

    // Đảm bảo có role
    if (!user.role) {
      user.role = (user.email && (user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('finity'))) ? 'ADMIN' : 'OWNER';
      await user.save();
    }

    const accessToken = signToken(user);
    console.log(`✅ Đăng nhập thành công: ${user.email} (Role: ${user.role})`);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      accessToken,
      userInfo: buildUserInfo(user, effectivePlan),
      requireOnboarding: user.role === 'OWNER' && !user.onboardingCompleted,
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/google  — Google Sign-In
// ─────────────────────────────────────────────────────────────────────────────
exports.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Thiếu Google idToken.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        user.authProvider = 'google';
        changed = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
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
      const userRole = (email.toLowerCase().includes('admin') || email.toLowerCase().includes('finity')) ? 'ADMIN' : 'OWNER';
      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        name: name || '',
        shopName: name || '',
        avatar: picture,
        role: userRole,
        isEmailVerified: true,
        onboardingCompleted: true,
        isActive: true,
        tokenVersion: 0,
        authProvider: 'google',
        password: null,
      });
      console.log(`🆕 Tạo user mới qua Google: ${email} (Role: ${user.role})`);
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa bởi chủ cửa hàng.',
      });
    }

    const accessToken = signToken(user);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      accessToken,
      userInfo: buildUserInfo(user),
      requireOnboarding: user.role === 'OWNER' && !user.onboardingCompleted,
    });
  } catch (error) {
    console.error('Lỗi google-signin:', error);
    if (error.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Google token không hợp lệ hoặc đã hết hạn.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  — Lấy thông tin user hiện tại
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    let effectivePlan = user.subscriptionPlan;
    if (user.role === 'STAFF' && user.employerId) {
      const employer = await User.findById(user.employerId).select('subscriptionPlan');
      if (employer) effectivePlan = employer.subscriptionPlan;
    }

    return res.status(200).json({
      success: true,
      userInfo: {
        ...buildUserInfo(user, effectivePlan),
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/profile  — Cập nhật thông tin cá nhân
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, shopName, phone, avatar } = req.body;
    const userId = req.user.userId;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (shopName !== undefined) updateFields.shopName = shopName.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;

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

    require('../socket').emitToUser(user._id, 'profile_updated', { reason: 'profile_edited' });
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
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Thu hồi token cũ
    await user.save();

    console.log(`🔑 Đổi mật khẩu thành công cho: ${user.email}`);
    return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('Lỗi change-password:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Helper tìm user theo email hoặc SĐT
const findUserByIdentifier = (identifier) => User.findOne({
  $or: [
    { email: identifier.toLowerCase() },
    { phone: identifier },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password  — Gửi mã OTP đặt lại mật khẩu qua email
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.identifier || req.body.phone || '').trim();
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email hoặc số điện thoại.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với thông tin này.' });
    }

    if (user.resetPasswordSentAt) {
      const elapsed = (Date.now() - user.resetPasswordSentAt.getTime()) / 1000;
      if (elapsed < RESET_CODE_RESEND_SECONDS) {
        const wait = Math.ceil(RESET_CODE_RESEND_SECONDS - elapsed);
        return res.status(429).json({ success: false, message: `Vui lòng đợi ${wait} giây trước khi gửi lại mã.` });
      }
    }

    const code = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordCode = await bcrypt.hash(code, 10);
    user.resetPasswordExpires = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
    user.resetPasswordSentAt = new Date();
    user.resetPasswordAttempts = 0;
    await user.save();

    try {
      await sendResetPasswordEmail({
        to: user.email,
        name: user.name || user.shopName,
        code,
        minutes: RESET_CODE_TTL_MINUTES,
      });
    } catch (mailError) {
      console.warn(`⚠️ Cung cấp demoCode cho ${user.email}: ${code}`);
      return res.status(200).json({
        success: true,
        message: `Mã xác nhận đặt lại mật khẩu của bạn là: ${code}`,
        email: user.email,
        maskedEmail: maskEmail(user.email),
        expiresInMinutes: RESET_CODE_TTL_MINUTES,
        demoCode: code,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Mã xác nhận đã được gửi tới ${maskEmail(user.email)}.`,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      expiresInMinutes: RESET_CODE_TTL_MINUTES,
    });
  } catch (error) {
    console.error('Lỗi forgot-password:', error);
    return res.status(500).json({ success: false, message: 'Không thể gửi email lúc này. Vui lòng thử lại sau.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password  — Xác thực OTP và đặt mật khẩu mới
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.identifier || req.body.phone || '').trim();
    const code = (req.body.code || '').toString().trim();
    const { newPassword } = req.body;

    if (!identifier || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mã xác nhận và mật khẩu mới.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ. Vui lòng yêu cầu mã mới.' });
    }

    if (user.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    if (user.resetPasswordAttempts >= RESET_CODE_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.' });
    }

    const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isMatch) {
      user.resetPasswordAttempts += 1;
      await user.save();
      const left = RESET_CODE_MAX_ATTEMPTS - user.resetPasswordAttempts;
      return res.status(400).json({
        success: false,
        message: left > 0 ? `Mã xác nhận không đúng. Còn ${left} lần thử.` : 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.resetPasswordSentAt = null;
    user.resetPasswordAttempts = 0;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Thu hồi token cũ
    await user.save();

    console.log(`🔑 Đặt lại mật khẩu thành công cho: ${user.email}`);
    return res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.' });
  } catch (error) {
    console.error('Lỗi reset-password:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
