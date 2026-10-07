const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

router.use(verifyToken, requireAdmin);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id/plan', adminController.updatePlan);
router.patch('/users/:id/role', adminController.updateRole);
router.delete('/users/:id', adminController.deleteUser);

router.get('/overview', adminController.getOverview);
router.get('/transactions', adminController.listTransactions);
router.get('/payments', adminController.listPayments);

module.exports = router;
