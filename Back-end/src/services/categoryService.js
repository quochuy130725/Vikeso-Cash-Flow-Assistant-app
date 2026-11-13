const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  // ── THU: Doanh thu bán hàng (Cha) ──────────────────────────────────
  {
    name: 'Doanh thu bán hàng',
    transactionType: 'THU',
    isParent: true,
    icon: 'storefront',
    color: '#FF4783',
    children: [
      { name: 'Bán lẻ tại quầy', icon: 'point_of_sale', color: '#FF4783' },
      { name: 'Bán hàng qua POS', icon: 'credit_card', color: '#FF4783' },
      { name: 'Thu tiền mặt tại quầy', icon: 'payments', color: '#FF4783' },
      { name: 'Doanh thu chuyển khoản QR', icon: 'qr_code_2', color: '#FF4783' },
      { name: 'Thu công nợ / Khoản thu khác', icon: 'receipt', color: '#FF4783' },
    ],
  },
  // ── CHI: Chi phí nhập hàng (Cha) ───────────────────────────────────
  {
    name: 'Chi phí nhập hàng',
    transactionType: 'CHI',
    isParent: true,
    icon: 'inventory_2',
    color: '#0F172A',
    children: [
      { name: 'Nhập hàng hóa / Nguyên vật liệu', icon: 'shopping_bag', color: '#0F172A' },
      { name: 'Chuyển khoản thanh toán NCC', icon: 'account_balance', color: '#0F172A' },
    ],
  },
  // ── CHI: Chi phí vận hành cố định (Cha) ─────────────────────────────
  {
    name: 'Chi phí vận hành cố định',
    transactionType: 'CHI',
    isParent: true,
    icon: 'domain',
    color: '#0F172A',
    children: [
      { name: 'Chi phí điện, nước, vận hành', icon: 'lightbulb', color: '#0F172A' },
      { name: 'Tiền thuê mặt bằng', icon: 'home_work', color: '#0F172A' },
      { name: 'Lương nhân viên', icon: 'badge', color: '#0F172A' },
    ],
  },
  // ── CHI: Chi phí phát sinh khác (Cha) ──────────────────────────────
  {
    name: 'Chi phí phát sinh khác',
    transactionType: 'CHI',
    isParent: true,
    icon: 'more_horiz',
    color: '#0F172A',
    children: [
      { name: 'Phí vận chuyển, ship', icon: 'local_shipping', color: '#0F172A' },
      { name: 'Sửa chữa, bảo trì', icon: 'build', color: '#0F172A' },
    ],
  },
];

/**
 * Khởi tạo danh mục mặc định của hệ thống nếu chưa có trong DB
 */
async function seedDefaultCategories() {
  try {
    const existingCount = await Category.countDocuments({ isSystemDefault: true });
    if (existingCount > 0) return;

    console.log('🌱 Đang khởi tạo danh mục Cha - Con mặc định hệ thống...');
    for (const group of DEFAULT_CATEGORIES) {
      const parent = await Category.create({
        name: group.name,
        transactionType: group.transactionType,
        parentId: null,
        icon: group.icon,
        color: group.color,
        isSystemDefault: true,
        isActive: true,
      });

      for (const child of group.children) {
        await Category.create({
          name: child.name,
          transactionType: group.transactionType,
          parentId: parent._id,
          icon: child.icon,
          color: child.color,
          isSystemDefault: true,
          isActive: true,
        });
      }
    }
    console.log('✅ Khởi tạo danh mục Cha - Con mặc định thành công!');
  } catch (err) {
    console.error('⚠️ Lỗi seed default categories:', err.message);
  }
}

/**
 * Lấy danh sách danh mục (hỗ trợ định dạng tree hoặc flat)
 */
async function getCategories({ shopId, ownerId, type, format = 'flat' }) {
  const query = { isActive: true };

  // Lọc theo shop riêng hoặc hệ thống
  if (shopId || ownerId) {
    query.$or = [
      { isSystemDefault: true },
      ...(shopId ? [{ shopId }] : []),
      ...(ownerId ? [{ ownerId }] : []),
    ];
  }

  if (type && ['THU', 'CHI'].includes(type)) {
    query.transactionType = type;
  }

  const allCategories = await Category.find(query).sort({ isSystemDefault: -1, createdAt: 1 }).lean();

  if (format === 'tree') {
    const parents = allCategories.filter((c) => !c.parentId);
    const childrenMap = {};

    allCategories.forEach((c) => {
      if (c.parentId) {
        const pid = String(c.parentId);
        childrenMap[pid] = childrenMap[pid] || [];
        childrenMap[pid].push(c);
      }
    });

    return parents.map((p) => ({
      ...p,
      children: childrenMap[String(p._id)] || [],
    }));
  }

  return allCategories;
}

module.exports = {
  seedDefaultCategories,
  getCategories,
};

