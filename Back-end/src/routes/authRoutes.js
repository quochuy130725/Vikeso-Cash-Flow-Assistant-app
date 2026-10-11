const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/google
router.post('/google', authController.googleSignIn);

// GET /api/auth/me  — Lấy thông tin user hiện tại (cần token)
router.get('/me', verifyToken, authController.getMe);

// PUT /api/auth/profile  — Cập nhật name, shopName, phone, avatar (cần token)
router.put('/profile', verifyToken, authController.updateProfile);

// PUT /api/auth/change-password  — Đổi mật khẩu (cần token)
router.put('/change-password', verifyToken, authController.changePassword);

// POST /api/auth/forgot-password  — Gửi mã OTP đặt lại mật khẩu qua email
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password  — Xác thực OTP + đặt mật khẩu mới
router.post('/reset-password', authController.resetPassword);

module.exports = router;
