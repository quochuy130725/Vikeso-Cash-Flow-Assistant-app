const Shop = require('../models/Shop');
const User = require('../models/User');
const { seedDefaultCategories } = require('../services/categoryService');
const { emitToUser } = require('../socket');

/**
 * POST /api/shops/onboarding
 * Dành cho Owner vừa xác thực OTP xong để tạo cửa hàng đầu tiên (isPrimary: true, APPROVED)
 */
exports.onboardingShop = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { shopName, businessType, address, phone } = req.body;

    if (!shopName || !shopName.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên cửa hàng.' });
    }

    const trimmedShopName = shopName.trim();

    // Kiểm tra xem user đã có shop chính chưa
    let shop = await Shop.findOne({ ownerId: userId, isPrimary: true });
    if (!shop) {
      shop = await Shop.create({
        ownerId: userId,
        shopName: trimmedShopName,
        businessType: businessType || 'Hộ kinh doanh bán lẻ',
        address: address || '',
        phone: phone || '',
        isPrimary: true,
        approvalStatus: 'APPROVED',
      });
    } else {
      shop.shopName = trimmedShopName;
      if (businessType) shop.businessType = businessType;
      if (address) shop.address = address;
      if (phone) shop.phone = phone;
      await shop.save();
    }

    // Cập nhật User
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          shopName: trimmedShopName,
          activeShopId: shop._id,
          onboardingCompleted: true,
        },
      },
      { new: true }
    );

    // Đảm bảo có danh mục mặc định
    await seedDefaultCategories();

    emitToUser(userId, 'profile_updated', { reason: 'onboarding_completed', shopName: trimmedShopName });

    return res.status(201).json({
      success: true,
      message: 'Khởi tạo cửa hàng đầu tiên thành công!',
      data: shop,
      userInfo: {
        id: user._id,
        email: user.email,
        name: user.name,
        shopName: user.shopName,
        activeShopId: user.activeShopId,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Lỗi onboarding-shop:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/shops
 * Lấy danh sách toàn bộ cửa hàng thuộc quyền quản lý của OWNER
 */
exports.listShops = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const shops = await Shop.find({ ownerId: userId }).sort({ isPrimary: -1, createdAt: 1 }).lean();

    return res.status(200).json({
      success: true,
      data: shops,
    });
  } catch (error) {
    console.error('Lỗi list-shops:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/shops
 * Đăng ký thêm cửa hàng/chi nhánh thứ 2 trở đi (Bắt buộc verificationDocs >= 1, PENDING)
 */
exports.createAdditionalShop = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { shopName, businessType, address, phone, verificationDocs } = req.body;

    if (!shopName || !shopName.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên chi nhánh mới.' });
    }

    if (!Array.isArray(verificationDocs) || verificationDocs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bắt buộc đính kèm ít nhất 1 ảnh chứng từ (giấy phép kinh doanh, hợp đồng thuê mặt bằng hoặc ảnh cửa hàng).',
      });
    }

    const newShop = await Shop.create({
      ownerId: userId,
      shopName: shopName.trim(),
      businessType: businessType || 'Hộ kinh doanh bán lẻ',
      address: address || '',
      phone: phone || '',
      isPrimary: false,
      verificationDocs,
      approvalStatus: 'PENDING',
    });

    console.log(`🏪 Tạo yêu cầu mở chi nhánh mới: ${newShop.shopName} (Owner: ${userId})`);

    return res.status(201).json({
      success: true,
      message: 'Đã gửi hồ sơ đăng ký chi nhánh thứ 2+ kèm ảnh chứng từ. Vui lòng chờ Admin phê duyệt!',
      data: newShop,
    });
  } catch (error) {
    console.error('Lỗi create-additional-shop:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/shops/:id/switch
 * Chuyển đổi cửa hàng đang làm việc (activeShopId)
 */
exports.switchShop = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const shop = await Shop.findOne({ _id: id, ownerId: userId });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng này.' });
    }

    if (shop.approvalStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ có thể chuyển sang cửa hàng đã được phê duyệt (APPROVED).',
      });
    }

    await User.findByIdAndUpdate(userId, {
      $set: { activeShopId: shop._id, shopName: shop.shopName },
    });

    emitToUser(userId, 'profile_updated', { reason: 'shop_switched', activeShopId: shop._id, shopName: shop.shopName });

    return res.status(200).json({
      success: true,
      message: `Đã chuyển sang làm việc tại: ${shop.shopName}`,
      activeShopId: shop._id,
      shopName: shop.shopName,
    });
  } catch (error) {
    console.error('Lỗi switch-shop:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

