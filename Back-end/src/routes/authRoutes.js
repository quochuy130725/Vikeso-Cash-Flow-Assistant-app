const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register  — Đăng ký Email/Password
router.post('/register', authController.register);

// POST /api/auth/login  — Đăng nhập Email/Password (bcrypt + JWT)
router.post('/login', authController.login);

// POST /api/auth/google  — Google Sign-In (verify idToken từ Flutter, cấp JWT)
router.post('/google', authController.googleSignIn);

module.exports = router;
