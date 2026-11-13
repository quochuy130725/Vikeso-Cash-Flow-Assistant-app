const Category = require('../models/Category');
const { getCategories } = require('../services/categoryService');
const { emitToUser } = require('../socket');

/**
 * GET /api/categories
 * Lấy danh mục hệ thống + danh mục riêng của shop (format: tree hoặc flat)
 */
exports.listCategories = async (req, res) => {
  try {
    const ownerId = req.user?.employerId || req.user?.userId || req.user?.id || req.query.userId;
    const shopId = req.query.shopId || req.user?.activeShopId;
    const type = req.query.type;
    const format = req.query.format || 'flat';

    const categories = await getCategories({
      shopId,
      ownerId,
      type,
      format,
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Lỗi list-categories:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/categories
 * Tạo mới danh mục Cha hoặc Con (Chỉ OWNER)
 */
exports.createCategory = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { name, transactionType, parentId, icon, color, shopId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên danh mục.' });
    }
    if (!['THU', 'CHI'].includes(transactionType)) {
      return res.status(400).json({ success: false, message: 'transactionType chỉ nhận THU hoặc CHI.' });
    }

    const category = await Category.create({
      ownerId,
      shopId: shopId || req.user?.activeShopId || null,
      name: name.trim(),
      transactionType,
      parentId: parentId || null,
      icon: icon || (transactionType === 'THU' ? 'point_of_sale' : 'shopping_bag'),
      color: color || (transactionType === 'THU' ? '#FF4783' : '#0F172A'),
      isSystemDefault: false,
      isActive: true,
    });

    // Thông báo cho Mobile App qua Socket để refresh danh mục
    emitToUser(ownerId, 'categories_updated', { categoryId: category._id, action: 'CREATE' });

    return res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công!',
      data: category,
    });
  } catch (error) {
    console.error('Lỗi create-category:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/categories/:id
 * Sửa thông tin danh mục tùy chỉnh
 */
exports.updateCategory = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { name, icon, color, parentId } = req.body;

    const category = await Category.findOne({ _id: id, ownerId });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục hoặc không có quyền sửa.' });
    }
    if (category.isSystemDefault) {
      return res.status(403).json({ success: false, message: 'Không được chỉnh sửa danh mục mặc định của hệ thống.' });
    }

    if (name !== undefined) category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (parentId !== undefined) category.parentId = parentId;

    await category.save();

    emitToUser(ownerId, 'categories_updated', { categoryId: category._id, action: 'UPDATE' });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công!',
      data: category,
    });
  } catch (error) {
    console.error('Lỗi update-category:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/categories/:id
 * Xóa danh mục tùy chỉnh (xóa mềm isActive: false)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const ownerId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, ownerId });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục hoặc không có quyền xóa.' });
    }
    if (category.isSystemDefault) {
      return res.status(403).json({ success: false, message: 'Không được xóa danh mục mặc định của hệ thống.' });
    }

    // Xóa mềm danh mục cha và các con
    category.isActive = false;
    await category.save();
    await Category.updateMany({ parentId: category._id }, { $set: { isActive: false } });

    emitToUser(ownerId, 'categories_updated', { categoryId: category._id, action: 'DELETE' });

    return res.status(200).json({
      success: true,
      message: 'Đã xóa danh mục thành công!',
    });
  } catch (error) {
    console.error('Lỗi delete-category:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

