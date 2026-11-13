const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { optionalToken } = require('../middlewares/verifyToken');
const verifyToken = require('../middlewares/verifyToken');
const { requireOwner } = require('../middlewares/rbac');

// GET /api/categories — hỗ trợ cả có token và public/query để Mobile & Web dễ nạp
router.get('/', optionalToken, categoryController.listCategories);

// Các thao tác thêm, sửa, xóa danh mục bắt buộc OWNER / ADMIN
router.post('/', verifyToken, requireOwner, categoryController.createCategory);
router.put('/:id', verifyToken, requireOwner, categoryController.updateCategory);
router.delete('/:id', verifyToken, requireOwner, categoryController.deleteCategory);

module.exports = router;

