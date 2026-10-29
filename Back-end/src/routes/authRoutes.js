const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

// POST /api/auth/register (Bỏ bắt buộc shopName, gửi mã OTP 6 số)
router.post('/register', authController.register);

// POST /api/auth/verify-otp (Xác thực OTP 6 số kích hoạt tài khoản)
router.post('/verify-otp', authController.verifyOtp);

// POST /api/auth/resend-otp (Gửi lại mã OTP sau 60s)
router.post('/resend-otp', authController.resendOtp);

// POST /api/auth/login (Kiểm tra isActive, tokenVersion, RBAC)
router.post('/login', authController.login);

// POST /api/auth/google
router.post('/google', authController.googleSignIn);

// GET /api/auth/me — Lấy thông tin user hiện tại (cần token)
router.get('/me', verifyToken, authController.getMe);

// PUT /api/auth/profile — Cập nhật profile (cần token)
router.put('/profile', verifyToken, authController.updateProfile);

// PUT /api/auth/change-password — Đổi mật khẩu (cần token)
router.put('/change-password', verifyToken, authController.changePassword);

// POST /api/auth/forgot-password — Gửi OTP đặt lại mật khẩu qua email
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password — Xác thực OTP + đặt mật khẩu mới
router.post('/reset-password', authController.resetPassword);

module.exports = router;
