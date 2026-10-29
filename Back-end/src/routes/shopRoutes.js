const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const verifyToken = require('../middlewares/verifyToken');
const { requireOwner } = require('../middlewares/rbac');

// Mọi route cửa hàng đều yêu cầu đăng nhập và vai trò OWNER / ADMIN
router.use(verifyToken, requireOwner);

// POST /api/shops/onboarding (Tạo shop đầu tiên sau OTP)
router.post('/onboarding', shopController.onboardingShop);

// GET /api/shops (Danh sách cửa hàng của Owner)
router.get('/', shopController.listShops);

// POST /api/shops (Đăng ký chi nhánh thứ 2+ kèm chứng từ)
router.post('/', shopController.createAdditionalShop);

// PATCH /api/shops/:id/switch (Chuyển shop active)
router.patch('/:id/switch', shopController.switchShop);

module.exports = router;

