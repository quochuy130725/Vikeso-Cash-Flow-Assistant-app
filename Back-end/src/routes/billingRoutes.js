const express = require('express');
const router = express.Router();

const billingController = require('../controllers/billingController');
const sepayWebhookController = require('../controllers/sepayWebhookController');
const verifySepay = require('../middlewares/verifySepay');

// Billing (client gọi)
router.post('/create-order', billingController.createOrder);
router.get('/status/:orderCode', billingController.getStatus);
router.get('/history', billingController.getHistory);

// SePay webhook (SePay gọi, xác thực bằng API-Key)
router.post('/sepay/webhook', verifySepay, sepayWebhookController.handle);

module.exports = router;
