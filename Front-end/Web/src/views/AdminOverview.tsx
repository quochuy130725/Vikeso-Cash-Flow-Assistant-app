import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAdminOverview,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserPlan,
  updateAdminUserRole,
  deleteAdminUser,
} from '../services/api';
import { BusinessHousehold } from '../types';
import { UserAccount } from '../components/AuthModal';

interface AdminOverviewProps {
  currentUser?: UserAccount | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ currentUser }) => {
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<BusinessHousehold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'pro' | 'free'>('all');

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createName, setCreateName] = useState('');
  const [createShopName, setCreateShopName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createRole, setCreateRole] = useState<'OWNER' | 'ADMIN'>('OWNER');
  const [createPlan, setCreatePlan] = useState<'FREE' | 'PRO'>('FREE');
  const [isCreating, setIsCreating] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [overviewData, usersData] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminUsers(),
      ]);
      setOverview(overviewData);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Admin:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered User List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (planFilter !== 'all' && u.plan !== planFilter) return false;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = u.ownerName?.toLowerCase().includes(query);
        const matchesShop = u.storeName?.toLowerCase().includes(query);
        const matchesPhone = u.phone?.toLowerCase().includes(query);
        return matchesName || matchesShop || matchesPhone;
      }
      return true;
    });
  }, [users, planFilter, searchTerm]);

  // Handle Plan Toggle
  const handleTogglePlan = async (user: BusinessHousehold) => {
    const newPlan: 'FREE' | 'PRO' = user.plan === 'pro' ? 'FREE' : 'PRO';
    try {
      const res = await updateAdminUserPlan(user.id, newPlan);
      if (res.success) {
        showToast(`Đã chuyển gói người dùng "${user.ownerName}" sang ${newPlan}!`);
        loadData(true);
      } else {
        showToast(res.message || 'Lỗi cập nhật gói', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi yêu cầu', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: BusinessHousehold) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.ownerName}" (${user.storeName})? Hành động này sẽ xóa toàn bộ hóa đơn liên quan!`)) {
      return;
    }

    try {
      const res = await deleteAdminUser(user.id);
      if (res.success) {
        showToast(`Đã xóa tài khoản "${user.ownerName}" thành công!`);
        loadData(true);
      } else {
        showToast(res.message || 'Lỗi xóa tài khoản', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    }
  };

  // Handle Create User Submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim()) {
      showToast('Vui lòng nhập email', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await createAdminUser({
        email: createEmail.trim(),
        password: createPassword || undefined,
        name: createName.trim() || undefined,
        shopName: createShopName.trim() || undefined,
        phone: createPhone.trim() || undefined,
        role: createRole,
        subscriptionPlan: createPlan,
      });

      if (res.success) {
        showToast('Đã tạo tài khoản người dùng mới thành công!');
        setCreateEmail('');
        setCreatePassword('');
        setCreateName('');
        setCreateShopName('');
        setCreatePhone('');
        setCreateModalOpen(false);
        loadData(true);
      } else {
        showToast(res.message || 'Không thể tạo tài khoản', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const totalUsers = overview?.totalUsers ?? users.length;
  const totalPRO = overview?.totalPRO ?? users.filter((u) => u.plan === 'pro').length;
  const totalFREE = overview?.totalFREE ?? users.filter((u) => u.plan === 'free').length;
  const mrr = overview?.mrr ?? totalPRO * 99000;
  const todayReceipts = overview?.todayReceipts ?? 0;
  const todayOrders = overview?.todayOrders ?? 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Bảng Điều Hành Hệ Thống
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-700 font-semibold">
              Quản trị viên: <strong className="text-slate-900">{currentUser?.name || 'Admin'}</strong> ({currentUser?.email || 'test@example.com'})
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Máy chủ MongoDB Atlas kết nối trực tiếp
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan Người Dùng &amp; Vận Hành Nền Tảng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Giám sát số lượng hộ kinh doanh thực tế, quản lý phân quyền, nâng hạ gói thuê bao và kiểm soát vận hành toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadData(true);
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Tạo Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Real Metric Cards from Backend Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng người dùng */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng số hộ kinh doanh
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              {totalUsers} <span className="text-xs font-normal text-slate-400">tài khoản</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Dữ liệu người dùng thực tế trên MongoDB
            </span>
          </div>
        </div>

        {/* Card 2: Hộ dùng PRO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tài khoản Gói PRO
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              {totalPRO} <span className="text-xs font-normal text-slate-400">hộ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="bg-[#d0f81b] text-slate-950 px-1.5 py-0.2 rounded font-black border border-[#bde412] text-[11px]">
                PRO: {totalPRO}
              </span>
              <span>/ FREE: {totalFREE}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Doanh thu thuê bao MRR */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Doanh thu MRR dự kiến
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center border border-[#ff4783]/20">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#ff4783] font-mono font-tabular tracking-tight">
              {Number(mrr).toLocaleString('vi-VN')} <span className="text-xs font-semibold">đ</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Dựa trên {totalPRO} hộ PRO (99k/tháng)
            </span>
          </div>
        </div>

        {/* Card 4: Hoạt động trong ngày */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hoạt động hôm nay
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              {todayReceipts} <span className="text-xs font-normal text-slate-400">giao dịch</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {todayOrders > 0 ? `${todayOrders} đơn nâng cấp PRO mới` : 'Hệ thống vận hành ổn định'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. User Management Data Grid (Real Users with CRUD Actions) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Title Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4783]"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Danh Sách Hộ Kinh Doanh &amp; Tài Khoản
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Quản trị toàn bộ tài khoản chủ hộ, phân quyền và nâng/hạ gói cước dịch vụ PRO.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              {filteredUsers.length} tài khoản hiển thị
            </span>
          </div>
        </div>

        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên chủ hộ, tên cửa hàng, số điện thoại..."
              className="w-full h-9.5 pl-9 pr-8 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all shadow-xs font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlanFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({users.length})
            </button>
            <button
              onClick={() => setPlanFilter('pro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planFilter === 'pro'
                  ? 'bg-[#d0f81b] text-slate-950 border border-[#bde412] shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Gói PRO ({totalPRO})
            </button>
            <button
              onClick={() => setPlanFilter('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planFilter === 'free'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Gói FREE ({totalFREE})
            </button>
          </div>
        </div>

        {/* Real Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[180px]">Chủ Hộ &amp; SĐT</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[200px]">Cửa Hàng Kinh Doanh</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[140px]">Ngày Tham Gia</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[130px]">Gói Dịch Vụ</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center min-w-[140px]">Trạng Thái Bot</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-right min-w-[150px] pr-6">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] animate-spin text-[#ff4783]">
                      progress_activity
                    </span>
                    <p className="text-xs font-semibold text-slate-500 mt-2">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{u.ownerName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{u.storeName}</span>
                        <span className="text-[11px] text-slate-400">{u.businessType}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 text-slate-500 text-xs whitespace-nowrap">
                      {u.joinDate}
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      {u.plan === 'pro' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-950 bg-[#d0f81b] px-2.5 py-0.5 rounded-md font-black border border-[#bde412]">
                          <span className="material-symbols-outlined text-[13px] text-slate-950">workspace_premium</span>
                          PRO (99k)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200">
                          MIỄN PHÍ
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      {u.telegramStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-900 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4783]"></span>
                          Đã Kết Nối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          Chưa Kết Nối
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Toggle Plan */}
                        <button
                          onClick={() => handleTogglePlan(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            u.plan === 'pro'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 border-[#bde412]'
                          }`}
                          type="button"
                          title="Chuyển đổi gói dịch vụ PRO / FREE"
                        >
                          {u.plan === 'pro' ? 'Hạ về FREE' : 'Nâng PRO'}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          type="button"
                          title="Xóa người dùng"
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

        {/* Table Footer */}
        <div className="p-3.5 px-5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> người dùng
          </span>
          <span className="font-semibold text-slate-700">Dữ liệu từ MongoDB Backend</span>
        </div>
      </div>

      {/* 4. Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-200">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tạo Tài Khoản Người Dùng Mới</h3>
                  <p className="text-xs text-slate-500">Thêm thủ công tài khoản chủ hộ hoặc quản trị viên</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_email">
                  Email đăng nhập *
                </label>
                <input
                  id="create_email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_password">
                  Mật khẩu khởi tạo *
                </label>
                <input
                  id="create_password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_name">
                    Tên chủ hộ
                  </label>
                  <input
                    id="create_name"
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_shop">
                    Tên cửa hàng
                  </label>
                  <input
                    id="create_shop"
                    type="text"
                    value={createShopName}
                    onChange={(e) => setCreateShopName(e.target.value)}
                    placeholder="Tạp Hóa X"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_role">
                    Vai trò (Role)
                  </label>
                  <select
                    id="create_role"
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all cursor-pointer"
                  >
                    <option value="OWNER">Chủ Hộ (OWNER)</option>
                    <option value="ADMIN">Quản Trị (ADMIN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_plan">
                    Gói dịch vụ
                  </label>
                  <select
                    id="create_plan"
                    value={createPlan}
                    onChange={(e) => setCreatePlan(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all cursor-pointer"
                  >
                    <option value="FREE">Miễn phí (FREE)</option>
                    <option value="PRO">Chuyên nghiệp (PRO)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border border-rose-700'
              : 'bg-slate-900 text-white border border-slate-700'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              toastMessage.type === 'error' ? 'text-rose-400' : 'text-[#d0f81b]'
            }`}
          >
            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};
