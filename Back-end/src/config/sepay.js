/**
 * Cấu hình SePay tập trung (VietQR + Webhook)
 */

const sepayConfig = {
  bankCode: process.env.SEPAY_BANK_CODE || 'MB',
  bankAccount: process.env.SEPAY_BANK_ACCOUNT || '0829100286',
  accountName: process.env.SEPAY_ACCOUNT_NAME || 'PHAM HUYNH QUOC HUY',
  webhookApiKey: process.env.SEPAY_WEBHOOK_API_KEY || '',
  qrTemplate: process.env.SEPAY_QR_TEMPLATE || 'compact2',
  proPrice: Number(process.env.PRO_PRICE || 99000),
  proDays: Number(process.env.PRO_DURATION_DAYS || 30),
  orderPrefix: 'VIKESO',
  qrExpireMinutes: 15,
};

/**
 * Sinh URL VietQR chuẩn theo định dạng vietqr.io và qr.sepay.vn
 */
function buildQrUrl({ amount, content }) {
  const bank = sepayConfig.bankCode || 'MB';
  const acc = sepayConfig.bankAccount || '0829100286';
  const name = encodeURIComponent(sepayConfig.accountName || 'PHAM HUYNH QUOC HUY');
  const addInfo = encodeURIComponent(content || '');

  // Định dạng VietQR chuẩn quốc gia
  return `https://img.vietqr.io/image/${bank}-${acc}-${sepayConfig.qrTemplate}.png?amount=${amount}&addInfo=${addInfo}&accountName=${name}`;
}

function buildSepayDirectUrl({ amount, content }) {
  const params = new URLSearchParams({
    acc: sepayConfig.bankAccount || '0829100286',
    bank: sepayConfig.bankCode || 'MB',
    amount: String(amount),
    des: content,
    template: sepayConfig.qrTemplate,
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

module.exports = {
  ...sepayConfig,
  buildQrUrl,
  buildSepayDirectUrl,
};
