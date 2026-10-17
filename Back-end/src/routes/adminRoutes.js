const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

router.use(verifyToken, requireAdmin);

router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/plan', adminController.updatePlan);
router.patch('/users/:id/role', adminController.updateRole);
router.delete('/users/:id', adminController.deleteUser);

router.get('/overview', adminController.getOverview);

router.get('/transactions', adminController.listTransactions);
router.post('/transactions', adminController.createTransaction);
router.get('/transactions/:id', adminController.getTransaction);
router.patch('/transactions/:id', adminController.updateTransaction);
router.delete('/transactions/:id', adminController.deleteTransaction);

router.get('/payments', adminController.listPayments);
router.get('/payments/:id', adminController.getPayment);
router.patch('/payments/:id', adminController.updatePayment);
router.delete('/payments/:id', adminController.deletePayment);

module.exports = router;
