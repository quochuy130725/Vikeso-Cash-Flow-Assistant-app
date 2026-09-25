const jwt = require('jsonwebtoken');

/**
 * Middleware bảo vệ route nội bộ.
 * Đọc Bearer token từ header Authorization, verify bằng JWT_SECRET.
 * Nếu hợp lệ → gán req.user (payload) và đi tiếp.
 * Nếu không hợp lệ / hết hạn → trả 401.
 *
 * Cách dùng:
 *   router.get('/protected', verifyToken, controller.handler);
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Thiếu Access Token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, shopName, iat, exp }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token đã hết hạn, vui lòng đăng nhập lại.'
      : 'Token không hợp lệ.';
    return res.status(401).json({ success: false, message });
  }
};

module.exports = verifyToken;
