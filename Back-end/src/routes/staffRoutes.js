const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const verifyToken = require('../middlewares/verifyToken');
const { requireOwner } = require('../middlewares/rbac');

// Mọi route quản lý nhân viên đều yêu cầu đăng nhập và vai trò OWNER / ADMIN
router.use(verifyToken, requireOwner);

// GET /api/staff (Danh sách nhân viên)
router.get('/', staffController.listStaff);

// POST /api/staff (Tạo nhân viên mới)
router.post('/', staffController.createStaff);

// PATCH /api/staff/:id/status (Khóa/Mở khóa nhân viên, bắn force_logout)
router.patch('/:id/status', staffController.updateStaffStatus);

// PUT /api/staff/:id/reset-password (Đổi mật khẩu nhân viên, bắn force_logout)
router.put('/:id/reset-password', staffController.resetStaffPassword);

// DELETE /api/staff/:id (Xóa nhân viên)
router.delete('/:id', staffController.deleteStaff);

module.exports = router;

