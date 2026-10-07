const sepayConfig = require('../config/sepay');

/**
 * SePay pure-logic: khong cham DB.
 * Tai lieu: https://developer.sepay.vn/en/sepay-webhooks/tich-hop-webhook
 */
const makeOrderCode = () => {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${sepayConfig.orderPrefix}-${rand}`;
};

const makeTransferContent = (orderCode) => `${sepayConfig.orderPrefix} ${orderCode.replace(`${sepayConfig.orderPrefix}-`, '')}`;

const parseOrderCode = (content, code) => {
  const text = `${code || ''} ${content || ''}`;
  const m = text.match(/VIKESO[\s-]?([A-Z0-9]{6})/i);
  if (!m) return null;
  return `${sepayConfig.orderPrefix}-${m[1].toUpperCase()}`;
};

const isAmountEnough = (transferAmount) =>
  Number(transferAmount) >= Number(sepayConfig.proPrice);

module.exports = { makeOrderCode, makeTransferContent, parseOrderCode, isAmountEnough };
