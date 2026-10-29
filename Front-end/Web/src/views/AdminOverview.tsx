import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAdminOverview,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  getLocalShops,
  reviewAdminShopRequest,
} from '../services/api';
import { BusinessHousehold, ShopBranch } from '../types';
import { UserAccount } from '../components/AuthModal';

interface AdminOverviewProps {
  currentUser?: UserAccount | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ currentUser }) => {
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<BusinessHousehold[]>([]);
  const [shopRequests, setShopRequests] = useState<ShopBranch[]>(() => getLocalShops());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'OWNER' | 'ADMIN'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'pro' | 'free'>('all');

  // Detail Modal for 2nd+ Shop Branch Request
  const [selectedShopRequest, setSelectedShopRequest] = useState<ShopBranch | null>(null);

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
      if (roleFilter !== 'all') {
        const uRole = u.role || 'OWNER';
        if (uRole !== roleFilter) return false;
      }
      if (planFilter !== 'all') {
        if (u.role === 'ADMIN') return false;
        if (u.plan !== planFilter) return false;
      }
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = u.ownerName?.toLowerCase().includes(query);
        const matchesShop = u.storeName?.toLowerCase().includes(query);
        const matchesPhone = u.phone?.toLowerCase().includes(query);
        return matchesName || matchesShop || matchesPhone;
      }
      return true;
    });
  }, [users, roleFilter, planFilter, searchTerm]);

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
        phone: createRole === 'ADMIN' ? undefined : (createPhone.trim() || undefined),
        role: createRole,
        subscriptionPlan: createRole === 'ADMIN' ? undefined : createPlan,
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
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalOwners = users.filter((u) => u.role !== 'ADMIN').length;
  const totalPRO = overview?.totalPRO ?? users.filter((u) => u.plan === 'pro' && u.role !== 'ADMIN').length;
  const totalFREE = overview?.totalFREE ?? users.filter((u) => u.plan === 'free' && u.role !== 'ADMIN').length;
  const mrr = overview?.mrr ?? totalPRO * 99000;
  const todayReceipts = overview?.todayReceipts ?? 0;
  const todayOrders = overview?.todayOrders ?? 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bảng Điều Hành Hệ Thống
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-700 font-semibold">
              Quản trị viên: <strong className="text-slate-900">{currentUser?.name || 'Admin'}</strong> ({currentUser?.email || 'test@example.com'})
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-[#d0f81b] border border-slate-900"></span>
              Máy chủ MongoDB Atlas kết nối trực tiếp
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan Người Dùng &amp; Vận Hành Nền Tảng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-lg">
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
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-white">person_add</span>
            <span>+ Tạo Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Real Metric Cards from Backend Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng người dùng */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số hộ kinh doanh
            </span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {totalUsers} <span className="text-xs font-sans font-normal text-slate-600">tài khoản</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Dữ liệu người dùng thực tế trên MongoDB
            </span>
          </div>
        </div>

        {/* Card 2: Hộ dùng PRO */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tài khoản Gói PRO
            </span>
            <span className="w-2 h-2 rounded-full bg-[#d0f81b] border border-slate-900"></span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {totalPRO} <span className="text-xs font-sans font-normal text-slate-600">hộ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 tabular-nums">
              <span className="bg-[#d0f81b] text-slate-950 px-1.5 py-0.5 rounded font-black border border-[#bde412] text-xs">
                PRO: {totalPRO}
              </span>
              <span>/ FREE: {totalFREE}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Doanh thu thuê bao MRR */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh thu MRR dự kiến
            </span>
            <span className="w-2 h-2 rounded-full bg-[#ff4783]"></span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#b01755] font-mono tabular-nums tracking-tight">
              {Number(mrr).toLocaleString('vi-VN')} <span className="text-xs font-semibold">đ</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Dựa trên {totalPRO} hộ PRO (99k / 1 tháng)
            </span>
          </div>
        </div>

        {/* Card 4: Hoạt động trong ngày */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hoạt động hôm nay
            </span>
            <span className="w-2 h-2 rounded-full bg-[#ff4783]"></span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {todayReceipts} <span className="text-xs font-sans font-normal text-slate-600">giao dịch</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {todayOrders > 0 ? `${todayOrders} đơn nâng cấp PRO mới` : 'Hệ thống vận hành ổn định'}
            </span>
          </div>
        </div>
      </div>

      {/* 2.5. Admin Multi-Shop Approval Queue Table (FE-WEB-13) */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d0f81b] border border-[#bde412]"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Phê Duyệt Đăng Ký Cửa Hàng / Chi Nhánh Thứ 2+ (Kèm Chứng Từ)
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold tabular-nums">
                {shopRequests.filter((s) => s.status === 'PENDING_APPROVAL').length} chờ duyệt
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
              Chủ hộ đăng ký cửa hàng đầu tiên được kích hoạt ngay; từ cửa hàng thứ 2 trở đi bắt buộc gửi chứng từ để Admin thẩm định.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[920px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Chi Nhánh / Cửa Hàng Mới</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Chủ Hộ Kinh Doanh</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Địa Chỉ Kinh Doanh</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center">Chứng Từ</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-right pr-6">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {shopRequests.filter((s) => s.id !== 'shop-main').length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    Chưa có yêu cầu đăng ký chi nhánh thứ 2+ nào.
                  </td>
                </tr>
              ) : (
                shopRequests
                  .filter((s) => s.id !== 'shop-main')
                  .map((req) => {
                    const docs = req.verificationDocs || req.documentUrls || [];
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-5">
                          <div className="font-bold text-slate-900">{req.shopName}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{req.businessType}</div>
                        </td>

                        <td className="py-3.5 px-4 sm:px-5">
                          <div className="font-semibold text-slate-900">{req.ownerName || 'Chủ hộ kinh doanh'}</div>
                          <div className="text-xs text-slate-600 font-mono">
                            {req.ownerEmail ? `${req.ownerEmail} • ` : ''}
                            {req.phone || '—'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 sm:px-5 max-w-[240px]">
                          <div className="text-xs text-slate-700 truncate" title={req.address}>
                            {req.address}
                          </div>
                          {req.createdAt && (
                            <div className="text-xs text-slate-600 mt-0.5">Ngày gửi: {req.createdAt}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold tabular-nums">
                            <span className="material-symbols-outlined text-[14px] text-[#ff4783]">photo_library</span>
                            <span>{docs.length} ảnh</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black border ${
                              req.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : req.status === 'ACTIVE'
                                  ? 'bg-[#d0f81b]/35 text-slate-950 border-[#bde412]'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {req.status === 'PENDING_APPROVAL'
                              ? 'CHỜ PHÊ DUYỆT'
                              : req.status === 'ACTIVE'
                                ? 'ĐÃ DUYỆT (ACTIVE)'
                                : 'ĐÃ TỪ CHỐI'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap pr-6">
                          <button
                            type="button"
                            onClick={() => setSelectedShopRequest(req)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#fff0f5] hover:bg-pink-100 text-[#b01755] border border-[#ffd6e4] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[15px] text-[#ff4783]">visibility</span>
                            <span>Xem chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. User Management Data Grid (Real Users with CRUD Actions) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Title & Toolbar Header (Unified to avoid nested card containers) */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4783]"></span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Danh Sách Hộ Kinh Doanh &amp; Tài Khoản
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Quản trị toàn bộ tài khoản chủ hộ, theo dõi thời hạn gói PRO tự động kích hoạt qua VietQR.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff0f5] text-[#b01755] text-xs font-bold border border-[#ffd6e4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4783]"></span>
                {filteredUsers.length} tài khoản hiển thị
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên chủ hộ, tên cửa hàng, số điện thoại..."
                className="w-full h-9.5 pl-9 pr-8 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#d6155f] border border-slate-200 transition-all shadow-2xs font-medium"
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

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('OWNER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'OWNER'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chủ Hộ ({totalOwners})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter('ADMIN');
                    setPlanFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'ADMIN'
                      ? 'bg-[#d6155f] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quản Trị ({totalAdmins})
                </button>
              </div>

            {/* Plan Filter (only shown if not filtering exclusively by Admin) */}
            {roleFilter !== 'ADMIN' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlanFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    planFilter === 'all'
                      ? 'bg-[#d6155f] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Tất cả gói
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter('pro')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    planFilter === 'pro'
                      ? 'bg-[#d0f81b] text-slate-950 border border-[#bde412] shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Gói PRO ({totalPRO})
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter('free')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    planFilter === 'free'
                      ? 'bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4] shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Gói FREE ({totalFREE})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[180px]">Chủ Hộ &amp; SĐT</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[200px]">Cửa Hàng Kinh Doanh</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[140px]">Ngày Tham Gia</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap min-w-[130px]">Gói Dịch Vụ</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center min-w-[140px]">Trạng Thái Bot</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-right min-w-[100px] pr-6">Thao Tác</th>
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
                        <span className="text-xs text-slate-600 font-mono">{u.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{u.storeName}</span>
                        <span className="text-xs text-slate-600">{u.businessType}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 text-slate-500 text-xs whitespace-nowrap">
                      {u.joinDate}
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      {u.role === 'ADMIN' ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-[#b01755] bg-[#fff0f5] border border-[#ffd6e4] w-fit">
                            QUẢN TRỊ VIÊN
                          </span>
                          <span className="text-xs text-slate-600 font-medium mt-0.5">
                            Đặc quyền hệ thống
                          </span>
                        </div>
                      ) : u.plan === 'pro' ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black text-slate-950 bg-[#d0f81b] border border-[#bde412] w-fit">
                            PRO
                          </span>
                          <span className="text-xs text-slate-600 font-medium mt-0.5">
                            {u.proExpiresAt ? `Hạn: ${u.proExpiresAt}` : 'Gói 30 ngày'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 w-fit">
                            MIỄN PHÍ
                          </span>
                          <span className="text-xs text-slate-600 mt-0.5">
                            Gói Cơ Bản
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center">
                      {u.telegramStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4783]"></span>
                          Đã Kết Nối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          Chưa Kết Nối
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap pr-6">
                      <div className="inline-flex items-center justify-end">
                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          type="button"
                          title="Xóa tài khoản người dùng"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-100 text-xs text-slate-500">
                <td colSpan={3} className="py-3.5 px-4 sm:px-5">
                  Hiển thị <strong>{filteredUsers.length}</strong> người dùng
                </td>
                <td colSpan={3} className="py-3.5 px-4 sm:px-5 text-right font-medium text-slate-600 pr-6">
                  Dữ liệu từ MongoDB Backend
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3.5. Detail Popup Modal for 2nd+ Shop Branch Request */}
      {selectedShopRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#fff0f5] text-[#ff4783] border border-[#ffd6e4] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">storefront</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Hồ Sơ Đăng Ký Chi Nhánh Mới
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${
                        selectedShopRequest.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : selectedShopRequest.status === 'ACTIVE'
                            ? 'bg-[#d0f81b]/35 text-slate-950 border-[#bde412]'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {selectedShopRequest.status === 'PENDING_APPROVAL'
                        ? 'CHỜ PHÊ DUYỆT'
                        : selectedShopRequest.status === 'ACTIVE'
                          ? 'ĐÃ DUYỆT (ACTIVE)'
                          : 'ĐÃ TỪ CHỐI'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                    Kiểm tra thông tin pháp nhân hộ kinh doanh và chứng từ đính kèm trước khi phê duyệt
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedShopRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Tên cửa hàng / Chi nhánh đăng ký
                  </span>
                  <div className="text-sm font-extrabold text-slate-900">{selectedShopRequest.shopName}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Ngành nghề kinh doanh
                  </span>
                  <div className="text-sm font-bold text-slate-800">{selectedShopRequest.businessType}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Chủ hộ kinh doanh (Owner)
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedShopRequest.ownerName || 'Chủ hộ kinh doanh'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedShopRequest.ownerEmail || '—'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Số điện thoại &amp; Ngày gửi hồ sơ
                  </span>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {selectedShopRequest.phone || '—'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Ngày đăng ký: {selectedShopRequest.createdAt || selectedShopRequest.submittedAt || 'Hôm nay'}
                  </div>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Địa chỉ kinh doanh thực tế
                  </span>
                  <div className="text-sm font-semibold text-slate-900">{selectedShopRequest.address}</div>
                </div>
              </div>

              {/* Verification Documents Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ff4783]">verified_user</span>
                    <span>
                      Giấy Chứng Từ Xác Minh Đính Kèm (
                      {(selectedShopRequest.verificationDocs || selectedShopRequest.documentUrls || []).length} ảnh)
                    </span>
                  </span>
                  <span className="text-xs text-slate-600">Nhấn vào ảnh để mở kích thước gốc</span>
                </div>

                {(selectedShopRequest.verificationDocs || selectedShopRequest.documentUrls || []).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Không có hình ảnh chứng từ đính kèm.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {(selectedShopRequest.verificationDocs || selectedShopRequest.documentUrls || []).map(
                      (imgUrl, idx) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-[#ff4783] bg-slate-100 aspect-video block shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Chứng từ ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            <span>Xem ảnh gốc #{idx + 1}</span>
                          </div>
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedShopRequest(null)}
                className="h-10 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
              >
                Đóng cửa sổ
              </button>

              {selectedShopRequest.status === 'PENDING_APPROVAL' && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await reviewAdminShopRequest(selectedShopRequest.id, 'REJECT');
                      const updated = getLocalShops();
                      setShopRequests(updated);
                      setSelectedShopRequest(updated.find((s) => s.id === selectedShopRequest.id) || null);
                      showToast(res.message, 'error');
                    }}
                    className="h-10 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await reviewAdminShopRequest(selectedShopRequest.id, 'APPROVE');
                      const updated = getLocalShops();
                      setShopRequests(updated);
                      setSelectedShopRequest(updated.find((s) => s.id === selectedShopRequest.id) || null);
                      showToast(res.message, 'success');
                    }}
                    className="h-10 px-5 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 border border-[#bde412] text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#ff4783]">check_circle</span>
                    <span>Duyệt Kích Hoạt Cửa Hàng</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                <div className={createRole === 'ADMIN' ? 'col-span-2' : ''}>
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

                {createRole === 'OWNER' && (
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
                )}
              </div>

              {createRole === 'OWNER' && (
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
              )}

              {createRole === 'ADMIN' && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Lưu ý:</span> Tài khoản Quản trị viên (ADMIN) không áp dụng thông tin cửa hàng và các gói cước dịch vụ (PRO/FREE).
                </div>
              )}

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
                  className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
              ? 'bg-rose-50 text-rose-800 border-2 border-rose-200'
              : 'bg-white text-slate-900 border-2 border-[#ffd6e4]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              toastMessage.type === 'error' ? 'text-rose-500' : 'text-[#ff4783]'
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
