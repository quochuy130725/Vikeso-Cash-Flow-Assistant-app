/**
 * Cấu hình SePay tập trung.
 * Mọi Service/Controller đọc từ đây, không đọc process.env rời rạc.
 */

const sepayConfig = {
  bankCode: process.env.SEPAY_BANK_CODE || '',
  bankAccount: process.env.SEPAY_BANK_ACCOUNT || '',
  accountName: process.env.SEPAY_ACCOUNT_NAME || 'VIKESO',
  webhookApiKey: process.env.SEPAY_WEBHOOK_API_KEY || '',
  qrTemplate: process.env.SEPAY_QR_TEMPLATE || 'compact2',
  proPrice: Number(process.env.PRO_PRICE || 99000),
  proDays: Number(process.env.PRO_DURATION_DAYS || 30),
  orderPrefix: 'VIKESO',
  qrExpireMinutes: 15,
};

/**
 * Sinh URL VietQR SePay theo format qr.sepay.vn/img
 * https://developer.sepay.vn — build QR payment page
 */
function buildQrUrl({ amount, content }) {
  const params = new URLSearchParams({
    acc: sepayConfig.bankAccount,
    bank: sepayConfig.bankCode,
    amount: String(amount),
    des: content,
    template: sepayConfig.qrTemplate,
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

module.exports = { ...sepayConfig, buildQrUrl };
