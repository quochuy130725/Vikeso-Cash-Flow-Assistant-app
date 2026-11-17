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

// PUT /api/shops/:id (Cập nhật Tên, Hotline, Loại hình, MST, CCCD, 3 Địa chỉ, ảnh KYC)
router.put('/:id', shopController.updateShopDetails);

// POST /api/shops/:id/resubmit (Nộp lại hồ sơ sau khi bị Admin từ chối)
router.post('/:id/resubmit', shopController.resubmitShop);

module.exports = router;
