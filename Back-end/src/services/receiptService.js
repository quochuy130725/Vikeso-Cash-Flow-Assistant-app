const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { calculateAccountingDate, normalizePaymentMethod } = require('../utils/accountingDate');
const { emitToUser } = require('../socket');

/**
 * Xử lý và lưu giao dịch: Áp dụng Lưới lọc 2 chiều, Hạch toán sau 22:00,
 * Phân quyền Staff/Owner, Chuẩn hóa PaymentMethod và phát WebSocket.
 */
async function processAndSaveReceipts({
  userId,
  items,
  creator = null, // { userId, role, name, activeShopId }
  defaultEntrySource = 'MANUAL',
}) {
  if (!userId) throw new Error('Thiếu userId.');
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách items không được rỗng.');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('Không tìm thấy người dùng sở hữu sổ quỹ.');

  const createdBy = creator?.userId || creator?.id || userId;
  const createdByRole = creator?.role || user.role || 'OWNER';
  const createdByName = creator?.name || user.name || '';
  const shopId = creator?.activeShopId || user.activeShopId || null;

  const savedDocs = [];

  for (const item of items) {
    const totalAmount =
      item.totalAmount !== undefined
        ? Number(item.totalAmount)
        : (item.aiRawData?.CacKhoanTien?.reduce((sum, v) => sum + Number(v), 0) || 0);

    const transactionDate = item.transactionDate ? new Date(item.transactionDate) : new Date();
    const accountingDate = item.accountingDate
      ? new Date(item.accountingDate)
      : calculateAccountingDate(transactionDate);

    const isPosBill = Boolean(item.aiRawData?.isPosBill || item.isPosBill || item.category === 'Hoa Don Le');
    const isPosSettlement = item.category === 'POS Ket Ca' || Boolean(item.isPosSettlementReport);

    let entrySource = item.entrySource || defaultEntrySource;
    if (isPosSettlement) entrySource = 'POS_SETTLEMENT';

    const paymentMethod = normalizePaymentMethod(
      item.paymentMethod,
      item.category,
      item.reason,
      isPosBill
    );

    let status = 'VALID';

    // ── LƯỚI LỌC CHỐNG TRÙNG POS 2 CHIỀU (BIDIRECTIONAL SMART DEDUPLICATION) ──
    // Chiều 1: Khi nộp POS Kết Ca -> Gạch bỏ (MERGED) các bill lẻ POS có cùng accountingDate
    if (isPosSettlement) {
      await Receipt.updateMany(
        {
          userId,
          category: 'Hoa Don Le',
          transactionType: 'THU',
          accountingDate,
          'aiRawData.isPosBill': true,
        },
        { $set: { status: 'MERGED' } }
      );
    }

    // Chiều 2: Khi nộp Bill lẻ POS (THU, isPosBill = true) -> Kiểm tra nếu đã có POS Kết Ca cùng accountingDate
    if (item.category === 'Hoa Don Le' && item.transactionType === 'THU' && isPosBill) {
      const existingPosSettlement = await Receipt.findOne({
        userId,
        category: 'POS Ket Ca',
        status: 'VALID',
        accountingDate,
      });
      if (existingPosSettlement) {
        status = 'MERGED';
      }
    }

    const doc = await Receipt.create({
      userId,
      shopId,
      createdBy,
      createdByRole,
      createdByName,
      entrySource,
      paymentMethod,
      category: item.category || 'Khac',
      categoryId: item.categoryId || null,
      parentCategoryId: item.parentCategoryId || null,
      categoryName: item.categoryName || '',
      parentCategoryName: item.parentCategoryName || '',
      transactionType: item.transactionType || 'CHI',
      totalAmount,
      reason: item.reason || '',
      confidenceLevel: item.confidenceLevel || 'HIGH',
      status,
      transactionDate,
      accountingDate,
      receiptUrl: item.receiptUrl || '',
      aiRawData: item.aiRawData || {},
    });

    savedDocs.push(doc);
  }

  // Phát sự kiện realtime tới room của chủ shop
  emitToUser(userId, 'new_transaction', { transactions: savedDocs });

  return savedDocs;
}

module.exports = {
  processAndSaveReceipts,
};

