const adminService = require('../services/adminService');

/** Controller mỏng: chỉ lấy query/params/body, gọi service, trả res. */
const ok = (res, data, status = 200) => res.status(status).json({ success: true, ...data });
const fail = (res, err) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Lỗi máy chủ.' });

exports.listUsers = async (req, res) => {
  try { return ok(res, await adminService.listUsers(req.query)); } catch (e) { return fail(res, e); }
};
exports.getUserDetail = async (req, res) => {
  try { return ok(res, await adminService.getUserDetail(req.params.id)); } catch (e) { return fail(res, e); }
};
exports.updatePlan = async (req, res) => {
  try { return ok(res, { data: await adminService.updatePlan(req.params.id, req.body) }); } catch (e) { return fail(res, e); }
};
exports.updateRole = async (req, res) => {
  try { return ok(res, { data: await adminService.updateRole(req.params.id, req.body) }); } catch (e) { return fail(res, e); }
};
exports.deleteUser = async (req, res) => {
  try { return ok(res, await adminService.deleteUser(req.params.id)); } catch (e) { return fail(res, e); }
};
exports.getOverview = async (req, res) => {
  try { return ok(res, { data: await adminService.getOverview() }); } catch (e) { return fail(res, e); }
};
exports.listTransactions = async (req, res) => {
  try { return ok(res, await adminService.listTransactions(req.query)); } catch (e) { return fail(res, e); }
};
exports.listPayments = async (req, res) => {
  try { return ok(res, await adminService.listPayments(req.query)); } catch (e) { return fail(res, e); }
};

exports.createUser = async (req, res) => {
  try { return ok(res, { data: await adminService.createUser(req.body) }, 201); } catch (e) { return fail(res, e); }
};
exports.updateUser = async (req, res) => {
  try { return ok(res, { data: await adminService.updateUser(req.params.id, req.body) }); } catch (e) { return fail(res, e); }
};

exports.getTransaction = async (req, res) => {
  try { return ok(res, { data: await adminService.getTransaction(req.params.id) }); } catch (e) { return fail(res, e); }
};
exports.createTransaction = async (req, res) => {
  try { return ok(res, { data: await adminService.createTransaction(req.body) }, 201); } catch (e) { return fail(res, e); }
};
exports.updateTransaction = async (req, res) => {
  try { return ok(res, { data: await adminService.updateTransaction(req.params.id, req.body) }); } catch (e) { return fail(res, e); }
};
exports.deleteTransaction = async (req, res) => {
  try { return ok(res, await adminService.deleteTransaction(req.params.id)); } catch (e) { return fail(res, e); }
};

exports.getPayment = async (req, res) => {
  try { return ok(res, { data: await adminService.getPayment(req.params.id) }); } catch (e) { return fail(res, e); }
};
exports.updatePayment = async (req, res) => {
  try { return ok(res, { data: await adminService.updatePayment(req.params.id, req.body) }); } catch (e) { return fail(res, e); }
};
exports.deletePayment = async (req, res) => {
  try { return ok(res, await adminService.deletePayment(req.params.id)); } catch (e) { return fail(res, e); }
};
