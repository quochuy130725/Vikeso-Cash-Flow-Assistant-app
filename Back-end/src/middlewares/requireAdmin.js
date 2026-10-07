const User = require('../models/User');

/**
 * Chặn route admin. Chạy SAU verifyToken (req.user đã có).
 * JWT mới có role; token cũ thiếu role thì fallback query DB.
 */
const requireAdmin = async (req, res, next) => {
  try {
    let role = req.user?.role;
    if (!role) {
      const userId = req.user?.userId || req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Thiếu Access Token.' });
      const user = await User.findById(userId).select('role');
      role = user?.role;
    }
    if (role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Chỉ ADMIN được truy cập.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = requireAdmin;
