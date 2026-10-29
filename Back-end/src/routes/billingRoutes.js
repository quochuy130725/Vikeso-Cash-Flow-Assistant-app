const express = require('express');
const router = express.Router();

const billingController = require('../controllers/billingController');
const sepayWebhookController = require('../controllers/sepayWebhookController');
const verifySepay = require('../middlewares/verifySepay');
const { optionalToken } = require('../middlewares/verifyToken');

// Billing (client gọi - hỗ trợ cả Bearer JWT lẫn userId trong body/query)
router.post('/create-order', optionalToken, billingController.createOrder);
router.get('/status/:orderCode', optionalToken, billingController.getStatus);
router.get('/history', optionalToken, billingController.getHistory);

// SePay webhook (SePay gọi, xác thực bằng API-Key)
router.post('/sepay/webhook', verifySepay, sepayWebhookController.handle);

module.exports = router;
