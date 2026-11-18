const mongoose = require('mongoose');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { seedDefaultCategories } = require('../services/categoryService');
const { emitToUser } = require('../socket');

/**
 * Helper: Kiểm tra chống trùng Mã số thuế (taxCode) & Số CCCD (ownerCccd)
 * - Chống trùng MST: Nếu có cửa hàng khác (_id != excludeShopId) đang APPROVED có cùng taxCode -> 409 TAX_CODE_ALREADY_EXISTS
 *   Hỗ trợ Multi-Branch cùng MST cha cho cùng 1 ownerId nếu có hậu tố mã chi nhánh (VD: 0312345678-001).
 *   Nếu MST cha (10 số đầu) đã thuộc về một ownerId KHÁC đang APPROVED -> 409 TAX_CODE_ALREADY_EXISTS.
 * - Chống trùng CCCD: Nếu ownerCccd đã được xác thực (APPROVED) cho một chủ hộ khác (ownerId != userId) -> 409 CCCD_ALREADY_EXISTS.
 */
async function validateTaxAndCccd({ taxCode, ownerCccd, userId, excludeShopId = null }) {
  if (taxCode && String(taxCode).trim()) {
    const trimmedTax = String(taxCode).trim();
    const excludeFilter = excludeShopId ? { _id: { $ne: excludeShopId } } : {};

    // 1. Trùng chính xác taxCode với bất kỳ shop APPROVED nào khác
    const exactConflict = await Shop.findOne({
      ...excludeFilter,
      taxCode: trimmedTax,
      approvalStatus: 'APPROVED',
    }).lean();

    if (exactConflict) {
      return {
        status: 409,
        code: 'TAX_CODE_ALREADY_EXISTS',
        message: 'Mã số thuế này đã được đăng ký trên hệ thống.',
      };
    }

    // 2. Nếu nhập mã chi nhánh (VD: 0312345678-001), kiểm tra xem MST gốc 10 số có thuộc về chủ hộ khác đang APPROVED không
    const baseTaxCode = trimmedTax.split('-')[0].trim();
    if (baseTaxCode && baseTaxCode !== trimmedTax) {
      const parentConflictOtherOwner = await Shop.findOne({
        ...excludeFilter,
        ownerId: { $ne: userId },
        taxCode: baseTaxCode,
        approvalStatus: 'APPROVED',
      }).lean();

      if (parentConflictOtherOwner) {
        return {
          status: 409,
          code: 'TAX_CODE_ALREADY_EXISTS',
          message: 'Mã số thuế này đã được đăng ký trên hệ thống.',
        };
      }
    }
  }

  if (ownerCccd && String(ownerCccd).trim()) {
    const trimmedCccd = String(ownerCccd).trim();
    const excludeFilter = excludeShopId ? { _id: { $ne: excludeShopId } } : {};

    const cccdConflict = await Shop.findOne({
      ...excludeFilter,
      ownerId: { $ne: userId },
      ownerCccd: trimmedCccd,
      approvalStatus: 'APPROVED',
    }).lean();

    if (cccdConflict) {
      return {
        status: 409,
        code: 'CCCD_ALREADY_EXISTS',
        message: 'Số CCCD này đã được xác thực cho chủ tiệm khác.',
      };
    }
  }

  return null;
}

/**
 * Helper: Chuẩn hóa mảng ảnh chứng từ KYC để tương thích ngược giữa licenseImageUrls, cccdFrontUrl, cccdBackUrl và verificationDocs
 */
function normalizeKycDocs(body, existingShop = null) {
  const hasLicenseArr = Array.isArray(body.licenseImageUrls);
  const hasLegacyDocs = Array.isArray(body.verificationDocs) || Array.isArray(body.documentUrls);

  const licenseImageUrls = hasLicenseArr
    ? body.licenseImageUrls.filter(Boolean)
    : hasLegacyDocs
      ? (body.verificationDocs || body.documentUrls).filter(Boolean)
      : existingShop
        ? existingShop.licenseImageUrls || []
        : [];

  const cccdFrontUrl =
    body.cccdFrontUrl !== undefined
      ? String(body.cccdFrontUrl || '').trim()
      : existingShop
        ? existingShop.cccdFrontUrl || ''
        : '';

  const cccdBackUrl =
    body.cccdBackUrl !== undefined
      ? String(body.cccdBackUrl || '').trim()
      : existingShop
        ? existingShop.cccdBackUrl || ''
        : '';

  let verificationDocs = hasLegacyDocs
    ? (body.verificationDocs || body.documentUrls).filter(Boolean)
    : existingShop
      ? existingShop.verificationDocs || []
      : [];

  if (verificationDocs.length === 0 && (licenseImageUrls.length > 0 || cccdFrontUrl || cccdBackUrl)) {
    verificationDocs = [...licenseImageUrls, cccdFrontUrl, cccdBackUrl].filter(Boolean);
  }

  return {
    licenseImageUrls,
    cccdFrontUrl,
    cccdBackUrl,
    verificationDocs,
  };
}

/**
 * API 1: POST /api/shops/onboarding
 * Dành cho Owner vừa xác thực OTP xong để tạo cửa hàng đầu tiên (isPrimary: true, APPROVED)
 */
exports.onboardingShop = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const {
      shopName,
      businessType,
      taxCode,
      legalOwnerName,
      ownerCccd,
      address,
      registeredAddress,
      invoiceAddress,
      phone,
    } = req.body;

    if (!shopName || !String(shopName).trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên cửa hàng.' });
    }

    const trimmedShopName = String(shopName).trim();

    // Kiểm tra xem user đã có shop chính chưa
    let shop = await Shop.findOne({ ownerId: userId, isPrimary: true });

    const validationError = await validateTaxAndCccd({
      taxCode,
      ownerCccd,
      userId,
      excludeShopId: shop?._id || null,
    });
    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        code: validationError.code,
        message: validationError.message,
      });
    }

    const kyc = normalizeKycDocs(req.body, shop);
    const trimmedAddress = address !== undefined ? String(address).trim() : shop?.address || '';
    const trimmedRegAddress =
      registeredAddress !== undefined
        ? String(registeredAddress).trim()
        : shop?.registeredAddress || trimmedAddress;
    const trimmedInvAddress =
      invoiceAddress !== undefined
        ? String(invoiceAddress).trim()
        : shop?.invoiceAddress || trimmedAddress;

    if (!shop) {
      shop = await Shop.create({
        ownerId: userId,
        shopName: trimmedShopName,
        businessType: businessType ? String(businessType).trim() : 'Hộ kinh doanh bán lẻ',
        taxCode: taxCode ? String(taxCode).trim() : '',
        legalOwnerName: legalOwnerName ? String(legalOwnerName).trim() : '',
        ownerCccd: ownerCccd ? String(ownerCccd).trim() : '',
        address: trimmedAddress,
        registeredAddress: trimmedRegAddress,
        invoiceAddress: trimmedInvAddress,
        phone: phone ? String(phone).trim() : '',
        isPrimary: true,
        licenseImageUrls: kyc.licenseImageUrls,
        cccdFrontUrl: kyc.cccdFrontUrl,
        cccdBackUrl: kyc.cccdBackUrl,
        verificationDocs: kyc.verificationDocs,
        approvalStatus: 'APPROVED',
      });
    } else {
      shop.shopName = trimmedShopName;
      if (businessType !== undefined) shop.businessType = String(businessType).trim() || 'Hộ kinh doanh bán lẻ';
      if (taxCode !== undefined) shop.taxCode = String(taxCode).trim();
      if (legalOwnerName !== undefined) shop.legalOwnerName = String(legalOwnerName).trim();
      if (ownerCccd !== undefined) shop.ownerCccd = String(ownerCccd).trim();
      if (address !== undefined) shop.address = trimmedAddress;
      if (registeredAddress !== undefined) shop.registeredAddress = trimmedRegAddress;
      if (invoiceAddress !== undefined) shop.invoiceAddress = trimmedInvAddress;
      if (phone !== undefined) shop.phone = String(phone).trim();
      shop.licenseImageUrls = kyc.licenseImageUrls;
      shop.cccdFrontUrl = kyc.cccdFrontUrl;
      shop.cccdBackUrl = kyc.cccdBackUrl;
      shop.verificationDocs = kyc.verificationDocs;
      shop.approvalStatus = 'APPROVED';
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
      message: 'Khởi tạo cửa hàng thành công!',
      data: shop,
      userInfo: user
        ? {
            id: user._id,
            email: user.email,
            name: user.name,
            shopName: user.shopName,
            activeShopId: user.activeShopId,
            onboardingCompleted: user.onboardingCompleted,
          }
        : undefined,
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
 * Đăng ký thêm cửa hàng/chi nhánh thứ 2 trở đi (Kiểm tra giới hạn gói FREE/PRO, chống trùng MST/CCCD, PENDING)
 */
exports.createAdditionalShop = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const {
      shopName,
      businessType,
      taxCode,
      legalOwnerName,
      ownerCccd,
      address,
      registeredAddress,
      invoiceAddress,
      phone,
    } = req.body;

    if (!shopName || !String(shopName).trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên chi nhánh mới.' });
    }

    // Kiểm tra Giới hạn Gói cước (Tier Limits): Nếu là FREE và đã có từ 1 shop trở lên -> 403 TIER_SHOP_LIMIT_EXCEEDED
    const [ownerUser, existingShopCount] = await Promise.all([
      User.findById(userId).lean(),
      Shop.countDocuments({ ownerId: userId }),
    ]);

    const userPlan = ownerUser?.subscriptionPlan || 'FREE';
    if (userPlan === 'FREE' && ownerUser?.role !== 'ADMIN' && existingShopCount >= 1) {
      return res.status(403).json({
        success: false,
        code: 'TIER_SHOP_LIMIT_EXCEEDED',
        message: 'Nâng cấp gói PRO để quản lý chuỗi nhiều cửa hàng.',
      });
    }

    // Kiểm tra chống trùng MST & CCCD
    const validationError = await validateTaxAndCccd({
      taxCode,
      ownerCccd,
      userId,
      excludeShopId: null,
    });
    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        code: validationError.code,
        message: validationError.message,
      });
    }

    // Kiểm tra chứng từ xác thực (KYC)
    const kyc = normalizeKycDocs(req.body, null);
    if (kyc.verificationDocs.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_DOCUMENT_DATA',
        message: 'Vui lòng đính kèm đủ ảnh giấy phép và CCCD 2 mặt.',
      });
    }

    const trimmedAddress = address ? String(address).trim() : '';

    const newShop = await Shop.create({
      ownerId: userId,
      shopName: String(shopName).trim(),
      businessType: businessType ? String(businessType).trim() : 'Hộ kinh doanh bán lẻ',
      taxCode: taxCode ? String(taxCode).trim() : '',
      legalOwnerName: legalOwnerName ? String(legalOwnerName).trim() : ownerUser?.name || '',
      ownerCccd: ownerCccd ? String(ownerCccd).trim() : '',
      address: trimmedAddress,
      registeredAddress: registeredAddress ? String(registeredAddress).trim() : trimmedAddress,
      invoiceAddress: invoiceAddress ? String(invoiceAddress).trim() : trimmedAddress,
      phone: phone ? String(phone).trim() : '',
      isPrimary: existingShopCount === 0,
      licenseImageUrls: kyc.licenseImageUrls,
      cccdFrontUrl: kyc.cccdFrontUrl,
      cccdBackUrl: kyc.cccdBackUrl,
      verificationDocs: kyc.verificationDocs,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID cửa hàng không hợp lệ.' });
    }

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

/**
 * API 2: PUT /api/shops/:id
 * Cập nhật thông tin chi tiết của một cửa hàng (Hỗ trợ gửi từng phần hoặc toàn bộ)
 */
exports.updateShopDetails = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const {
      shopName,
      businessType,
      taxCode,
      legalOwnerName,
      ownerCccd,
      address,
      registeredAddress,
      invoiceAddress,
      phone,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID cửa hàng không hợp lệ.' });
    }

    const shop = await Shop.findOne({ _id: id, ownerId: userId });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng thuộc quyền sở hữu của bạn.' });
    }

    // Kiểm tra chống trùng MST & CCCD
    const validationError = await validateTaxAndCccd({
      taxCode: taxCode !== undefined ? taxCode : shop.taxCode,
      ownerCccd: ownerCccd !== undefined ? ownerCccd : shop.ownerCccd,
      userId,
      excludeShopId: shop._id,
    });
    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        code: validationError.code,
        message: validationError.message,
      });
    }

    if (shopName !== undefined) {
      const trimmedName = String(shopName).trim();
      if (!trimmedName) {
        return res.status(400).json({ success: false, message: 'Tên cửa hàng không được để trống.' });
      }
      shop.shopName = trimmedName;
    }
    if (businessType !== undefined) {
      shop.businessType = String(businessType).trim() || shop.businessType;
    }
    if (taxCode !== undefined) {
      shop.taxCode = String(taxCode).trim();
    }
    if (legalOwnerName !== undefined) {
      shop.legalOwnerName = String(legalOwnerName).trim();
    }
    if (ownerCccd !== undefined) {
      shop.ownerCccd = String(ownerCccd).trim();
    }
    if (address !== undefined) {
      shop.address = String(address).trim();
    }
    if (registeredAddress !== undefined) {
      shop.registeredAddress = String(registeredAddress).trim();
    }
    if (invoiceAddress !== undefined) {
      shop.invoiceAddress = String(invoiceAddress).trim();
    }
    if (phone !== undefined) {
      shop.phone = String(phone).trim();
    }

    // Cập nhật ảnh KYC nếu có gửi lên
    if (
      req.body.licenseImageUrls !== undefined ||
      req.body.cccdFrontUrl !== undefined ||
      req.body.cccdBackUrl !== undefined ||
      req.body.verificationDocs !== undefined ||
      req.body.documentUrls !== undefined
    ) {
      const kyc = normalizeKycDocs(req.body, shop);
      shop.licenseImageUrls = kyc.licenseImageUrls;
      shop.cccdFrontUrl = kyc.cccdFrontUrl;
      shop.cccdBackUrl = kyc.cccdBackUrl;
      shop.verificationDocs = kyc.verificationDocs;
    }

    await shop.save();

    // Nếu cửa hàng đang cập nhật là cửa hàng đang active (hoặc là cửa hàng chính mặc định) thì đồng bộ lại lên User
    const ownerUser = await User.findById(userId);
    if (
      ownerUser &&
      (String(ownerUser.activeShopId || '') === String(shop._id) ||
        (!ownerUser.activeShopId && shop.isPrimary))
    ) {
      ownerUser.shopName = shop.shopName;
      ownerUser.activeShopId = shop._id;
      await ownerUser.save();
    }

    emitToUser(userId, 'profile_updated', {
      reason: 'shop_updated',
      activeShopId: shop._id,
      shopName: shop.shopName,
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cửa hàng thành công!',
      data: shop,
    });
  } catch (error) {
    console.error('Lỗi update-shop-details:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API 3: POST /api/shops/:id/resubmit
 * Chủ shop nộp lại hồ sơ sau khi bị Admin từ chối (REJECTED -> PENDING, xóa rejectionReason)
 */
exports.resubmitShop = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const {
      shopName,
      businessType,
      taxCode,
      legalOwnerName,
      ownerCccd,
      address,
      registeredAddress,
      invoiceAddress,
      phone,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID cửa hàng không hợp lệ.' });
    }

    const shop = await Shop.findOne({ _id: id, ownerId: userId });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng thuộc quyền sở hữu của bạn.' });
    }

    // Kiểm tra chống trùng MST & CCCD
    const validationError = await validateTaxAndCccd({
      taxCode: taxCode !== undefined ? taxCode : shop.taxCode,
      ownerCccd: ownerCccd !== undefined ? ownerCccd : shop.ownerCccd,
      userId,
      excludeShopId: shop._id,
    });
    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        code: validationError.code,
        message: validationError.message,
      });
    }

    if (shopName !== undefined && String(shopName).trim()) {
      shop.shopName = String(shopName).trim();
    }
    if (businessType !== undefined && String(businessType).trim()) {
      shop.businessType = String(businessType).trim();
    }
    if (taxCode !== undefined) {
      shop.taxCode = String(taxCode).trim();
    }
    if (legalOwnerName !== undefined) {
      shop.legalOwnerName = String(legalOwnerName).trim();
    }
    if (ownerCccd !== undefined) {
      shop.ownerCccd = String(ownerCccd).trim();
    }
    if (address !== undefined) {
      shop.address = String(address).trim();
    }
    if (registeredAddress !== undefined) {
      shop.registeredAddress = String(registeredAddress).trim();
    }
    if (invoiceAddress !== undefined) {
      shop.invoiceAddress = String(invoiceAddress).trim();
    }
    if (phone !== undefined) {
      shop.phone = String(phone).trim();
    }

    const kyc = normalizeKycDocs(req.body, shop);
    if (kyc.verificationDocs.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_DOCUMENT_DATA',
        message: 'Vui lòng đính kèm đủ ảnh giấy phép và CCCD 2 mặt.',
      });
    }

    shop.licenseImageUrls = kyc.licenseImageUrls;
    shop.cccdFrontUrl = kyc.cccdFrontUrl;
    shop.cccdBackUrl = kyc.cccdBackUrl;
    shop.verificationDocs = kyc.verificationDocs;

    // Chuyển trạng thái về PENDING và xóa lý do từ chối cũ
    shop.approvalStatus = 'PENDING';
    shop.rejectionReason = '';
    await shop.save();

    console.log(`🔄 Chủ shop nộp lại hồ sơ cửa hàng: ${shop.shopName} (Shop ID: ${shop._id})`);

    emitToUser(userId, 'shop_status_updated', {
      shopId: shop._id,
      shopName: shop.shopName,
      status: shop.approvalStatus,
      rejectionReason: '',
    });

    return res.status(200).json({
      success: true,
      message: 'Đã nộp lại hồ sơ thành công! Vui lòng chờ Admin duyệt lại.',
      data: shop,
    });
  } catch (error) {
    console.error('Lỗi resubmit-shop:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
