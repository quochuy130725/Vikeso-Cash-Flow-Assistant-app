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
