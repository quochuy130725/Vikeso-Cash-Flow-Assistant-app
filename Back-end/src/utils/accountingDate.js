/**
 * Tiện ích xử lý Ngày hạch toán (accountingDate) theo Quy tắc 22:00
 * và Chuẩn hóa Phương thức thanh toán (paymentMethod)
 */

/**
 * Tính ngày hạch toán (accountingDate) theo múi giờ Việt Nam (UTC+7):
 * - Nếu thời điểm giao dịch >= 22:00:00 GMT+7: accountingDate = ngày hôm sau (00:00:00 GMT+7).
 * - Nếu thời điểm giao dịch < 22:00:00 GMT+7: accountingDate = cùng ngày (00:00:00 GMT+7).
 *
 * @param {Date|string|number} inputDate - Thời điểm phát sinh giao dịch
 * @returns {Date} Đối tượng Date đại diện cho 00:00:00 GMT+7 của ngày hạch toán
 */
function calculateAccountingDate(inputDate = new Date()) {
  const d = inputDate ? new Date(inputDate) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const vnOffsetMs = 7 * 60 * 60 * 1000;
  const vnTime = new Date(validDate.getTime() + vnOffsetMs);

  const y = vnTime.getUTCFullYear();
  const m = vnTime.getUTCMonth();
  let day = vnTime.getUTCDate();
  const hour = vnTime.getUTCHours();

  if (hour >= 22) {
    day += 1;
  }

  // Trả về mốc 00:00:00.000 giờ VN tương ứng trong UTC
  return new Date(Date.UTC(y, m, day, 0, 0, 0, 0) - vnOffsetMs);
}

/**
 * Chuẩn hóa phương thức thanh toán:
 * 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'THE_POS'
 */
function normalizePaymentMethod(method, category = '', reason = '', isPosBill = false) {
  if (method) {
    const norm = String(method).toUpperCase().trim();
    if (norm === 'TIEN_MAT' || norm === 'CASH') return 'TIEN_MAT';
    if (norm === 'CHUYEN_KHOAN' || norm === 'TRANSFER' || norm === 'BANK') return 'CHUYEN_KHOAN';
    if (norm === 'THE_POS' || norm === 'POS' || norm === 'CARD') return 'THE_POS';
  }

  if (category === 'Chuyen Khoan') return 'CHUYEN_KHOAN';
  if (category === 'POS Ket Ca' || isPosBill) return 'THE_POS';

  const text = `${reason || ''}`.toLowerCase();
  if (text.includes('vietqr') || text.includes('chuyển khoản') || text.includes('ck') || text.includes('qr')) {
    return 'CHUYEN_KHOAN';
  }
  if (text.includes('pos') || text.includes('quẹt thẻ') || text.includes('kết ca')) {
    return 'THE_POS';
  }

  return 'TIEN_MAT';
}

/**
 * Trả về dải thời gian { start, end } trong UTC cho 1 ngày hạch toán cụ thể (UTC+7)
 */
function getAccountingDateRange(accountingDate = new Date()) {
  const acc = calculateAccountingDate(accountingDate);
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  const vnTime = new Date(acc.getTime() + vnOffsetMs);

  const y = vnTime.getUTCFullYear();
  const m = vnTime.getUTCMonth();
  const d = vnTime.getUTCDate();

  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - vnOffsetMs);
  const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - vnOffsetMs);

  return { start, end };
}

module.exports = {
  calculateAccountingDate,
  normalizePaymentMethod,
  getAccountingDateRange,
};

