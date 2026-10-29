/**
 * Middleware phân quyền RBAC (Role-Based Access Control)
 * Hỗ trợ 3 role: 'ADMIN', 'OWNER', 'STAFF'
 */

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ success: false, message: 'Thiếu thông tin quyền người dùng.' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `403 Forbidden: Bạn không có quyền thực hiện hành động này (Yêu cầu: ${allowedRoles.join(' / ')}).`,
      });
    }
    next();
  };
};

const requireOwner = requireRole('OWNER', 'ADMIN');

const blockStaff = (req, res, next) => {
  if (req.user?.role === 'STAFF') {
    return res.status(403).json({
      success: false,
      message: '403 Forbidden: Nhân viên thu ngân (STAFF) không có quyền truy cập tính năng này.',
    });
  }
  next();
};

module.exports = {
  requireRole,
  requireOwner,
  blockStaff,
};

