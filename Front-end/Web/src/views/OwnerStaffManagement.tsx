import React, { useState, useEffect } from 'react';
import {
  fetchStaffMembers,
  createStaffMember,
  toggleStaffStatus,
  resetStaffPassword,
  deleteStaffMember,
} from '../services/api';
import { StaffMember } from '../types';
import { UserAccount } from '../components/AuthModal';

interface OwnerStaffManagementProps {
  currentUser?: UserAccount | null;
}

export const OwnerStaffManagement: React.FC<OwnerStaffManagementProps> = ({ currentUser }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Staff Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password Modal
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStaffMembers();
      setStaffList(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên, Email/SĐT và Mật khẩu tạm', 'error');
      return;
    }
    if (staffPassword.length < 6) {
      showToast('Mật khẩu tạm phải có tối thiểu 6 ký tự', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createStaffMember({
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || '0900.000.000',
        password: staffPassword,
      });
      if (res.success) {
        showToast(`Đã tạo tài khoản nhân viên "${staffName}" thành công!`);
        setStaffName('');
        setStaffEmail('');
        setStaffPhone('');
        setStaffPassword('');
        setCreateOpen(false);
        loadStaff();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (staff: StaffMember) => {
    const nextState = !staff.isActive;
    const res = await toggleStaffStatus(staff.id, nextState);
    if (res.success) {
      showToast(
        res.message ||
          (nextState
            ? `Đã mở khóa tài khoản ${staff.name}`
            : `Đã khóa tài khoản ${staff.name} & bắn Socket force_logout (< 1 giây)!`),
        nextState ? 'success' : 'error'
      );
      loadStaff();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || newPassword.length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên', 'error');
      return;
    }
    const res = await resetStaffPassword(resetTarget.id, newPassword);
    if (res.success) {
      showToast(`Đã cấp lại mật khẩu cho "${resetTarget.name}" thành công!`);
      setResetTarget(null);
      setNewPassword('');
    }
  };

  const handleDelete = async (staff: StaffMember) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản nhân viên "${staff.name}"?`)) return;
    await deleteStaffMember(staff.id);
    showToast(`Đã xóa nhân viên "${staff.name}"`);
    loadStaff();
  };

  const activeCount = staffList.filter((s) => s.isActive).length;
  const lockedCount = staffList.filter((s) => !s.isActive).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-[#fff0f5] text-[#b01755] text-xs font-bold border border-[#ffd6e4]">
              Phân quyền &amp; bảo mật ca làm việc
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600 font-semibold">
              Cửa hàng: <strong className="text-slate-900">{currentUser?.shopName || currentUser?.storeName || 'Cửa Hàng Hộ Kinh Doanh'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Nhân Viên Thu Ngân (STAFF)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Tạo tài khoản thu ngân quét hóa đơn tại quầy, nhân viên chỉ xem giao dịch của chính mình.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-black shadow-xs transition-all cursor-pointer self-start lg:self-auto shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng nhân sự thu ngân</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{staffList.length} nhân viên</div>
            <span className="text-xs text-slate-500">Đồng bộ quyền truy cập Mobile App</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang hoạt động (Mở ca)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{activeCount} tài khoản</div>
            <span className="text-xs text-slate-500">Được phép quét bill &amp; nhập thu chi</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#d0f81b]/35 text-slate-950 flex items-center justify-center border border-[#bde412]">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã khóa tức thì (Socket &lt; 1s)</span>
            <div className="text-2xl font-extrabold text-[#b01755] mt-1 tabular-nums">{lockedCount} tài khoản</div>
            <span className="text-xs text-slate-500">Tự động đăng xuất khỏi điện thoại</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#fff0f5] text-[#b01755] flex items-center justify-center border border-[#ffd6e4]">
            <span className="material-symbols-outlined text-[24px]">block</span>
          </div>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Danh Sách Tài Khoản Nhân Viên (STAFF)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
              Phân quyền cô lập dữ liệu: Nhân viên chỉ nhìn thấy 3 Tab trên Mobile App.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-5">Nhân Viên &amp; Vai Trò</th>
                <th className="py-3.5 px-5">Tài Khoản Đăng Nhập</th>
                <th className="py-3.5 px-5">Truy Cập Gần Nhất</th>
                <th className="py-3.5 px-5 text-center">Trạng Thái Quyền</th>
                <th className="py-3.5 px-5 text-right pr-6">Điều Khiển Tức Thì</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Đang tải danh sách nhân viên...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Chưa có tài khoản nhân viên nào. Hãy nhấn "+ Thêm Nhân Viên Mới" để cấp tài khoản thu ngân.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            staff.isActive
                              ? 'bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4]'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {staff.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{staff.name}</div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
                            STAFF • Thu ngân tại quầy
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900">{staff.email}</div>
                      <div className="text-xs text-slate-500 font-mono">{staff.phone}</div>
                    </td>

                    <td className="py-4 px-5 text-xs text-slate-600">
                      <div>{staff.lastLogin || 'Hôm nay'}</div>
                      <div className="text-xs text-slate-500">Tạo ngày: {staff.createdAt}</div>
                    </td>

                    <td className="py-4 px-5 text-center">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d0f81b]/35 text-slate-950 text-xs font-black border border-[#bde412]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4783]"></span>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Đã khóa (Force Logout)
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right pr-6">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleLock(staff)}
                          className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            staff.isActive
                              ? 'bg-[#fff0f5] hover:bg-pink-100 text-[#b01755] border border-[#ffd6e4] shadow-2xs'
                              : 'bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 border border-[#bde412] font-black'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {staff.isActive ? 'gpp_bad' : 'lock_open'}
                          </span>
                          <span>{staff.isActive ? 'Khóa tức thì' : 'Mở khóa'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(staff);
                            setNewPassword('');
                          }}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center"
                          title="Cấp lại mật khẩu"
                        >
                          <span className="material-symbols-outlined text-[16px]">key</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(staff)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
                          title="Xóa nhân viên"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Staff */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center border border-[#ff4783]/20">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tạo Tài Khoản Nhân Viên (STAFF)</h3>
                  <p className="text-xs text-slate-500">Cấp quyền đăng nhập Mobile App cho thu ngân</p>
                </div>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên nhân viên (Kèm ca làm việc) *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="VD: Lê Thị Mai (Ca Chiều)"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#ff4783]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="nv.mai@vikeso.vn"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#ff4783]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="0912.345.678"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#ff4783]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#ff4783]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-900">Giới hạn quyền tự động áp dụng cho STAFF:</div>
                <div>• Chỉ được quét hóa đơn &amp; nhập thu chi trong ca của mình.</div>
                <div>• Không xem được Báo cáo Lãi/Lỗ, Thuế TT88 hay Cài đặt cửa hàng.</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black cursor-pointer"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản Thu Ngân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cấp Lại Mật Khẩu Cho Nhân Viên
            </h3>
            <p className="text-xs text-slate-500">
              Nhân viên: <strong className="text-slate-900">{resetTarget.name}</strong> ({resetTarget.email})
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:bg-white focus:outline-none focus:border-[#ff4783]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-bold cursor-pointer"
                >
                  Lưu Mật Khẩu Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-2 border-rose-200'
              : 'bg-white text-slate-900 border-2 border-[#ffd6e4]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#ff4783]">
            {toastMessage.type === 'error' ? 'gpp_bad' : 'check_circle'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

