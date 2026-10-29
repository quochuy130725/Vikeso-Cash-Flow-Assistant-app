const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware bảo vệ route nội bộ.
 * Đọc Bearer token từ header Authorization, verify bằng JWT_SECRET.
 * Kiểm tra trạng thái isActive và so khớp tokenVersion để thu hồi phiên tức thì (<1s).
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Thiếu Access Token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }

    const user = await User.findById(userId).select('role isActive tokenVersion activeShopId employerId subscriptionPlan shopName name email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa bởi chủ cửa hàng.',
      });
    }

    if (
      decoded.tokenVersion !== undefined &&
      user.tokenVersion !== undefined &&
      decoded.tokenVersion < user.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_REVOKED',
        message: 'Phiên đăng nhập đã bị thu hồi hoặc đổi mật khẩu. Vui lòng đăng nhập lại.',
      });
    }

    req.user = {
      userId: user._id,
      id: user._id,
      email: user.email,
      name: user.name,
      shopName: user.shopName,
      role: user.role || 'OWNER',
      tokenVersion: user.tokenVersion || 0,
      activeShopId: user.activeShopId || null,
      employerId: user.employerId || null,
      subscriptionPlan: user.subscriptionPlan || 'FREE',
    };

    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token đã hết hạn, vui lòng đăng nhập lại.'
      : 'Token không hợp lệ.';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Middleware tùy chọn: Nếu có token thì verify và gán req.user,
 * nếu không có token thì bỏ qua mà không ném lỗi (giữ tương thích ngược).
 */
const optionalToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return verifyToken(req, res, next);
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.optionalToken = optionalToken;
