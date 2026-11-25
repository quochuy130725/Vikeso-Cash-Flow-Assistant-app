import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAdminOverview,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserPlan,
  updateAdminUserRole,
  deleteAdminUser,
  getLocalShops,
  fetchAdminShopRequests,
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail Modal for 2nd+ Shop Branch Request
  const [selectedShopRequest, setSelectedShopRequest] = useState<ShopBranch | null>(null);

  // Reject reason dialog state (Mentor Requirement)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [togglingPlanUserId, setTogglingPlanUserId] = useState<string | null>(null);

  // =============================================================================
  // NGHIỆP VỤ 1: QUẢN LÝ CẤP TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN) HỆ THỐNG
  // - Admin chỉ có quyền cấp mới tài khoản Quản Trị Viên cho nhân sự ban quản trị.
  // - Tài khoản Chủ hộ (Owner) sẽ do người dùng tự đăng ký ngoài trang chủ web.
  // =============================================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ===========================================================================
  // NGHIỆP VỤ TẢI DỮ LIỆU BẢNG QUẢN TRỊ ADMIN (TỪ DÒNG 50 ĐẾN 75)
  // - Đồng bộ danh sách tài khoản người dùng, chỉ số hệ thống
  // - Gọi API lấy danh sách hồ sơ chi nhánh chờ Admin duyệt thực tế từ database
  // ===========================================================================
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [overviewData, usersData, shopsData] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminUsers(),
        fetchAdminShopRequests(),
      ]);
      setOverview(overviewData);
      setUsers(usersData || []);
      if (Array.isArray(shopsData)) {
        setShopRequests(shopsData);
      }
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

  // Reset pagination to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, planFilter, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredUsers, safeCurrentPage, rowsPerPage]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (safeCurrentPage > 3) {
      pages.push('...');
    }
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safeCurrentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
    return pages;
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

  // Handle Quick Plan Toggle (FREE <-> PRO)
  const handleToggleUserPlan = async (user: BusinessHousehold) => {
    const targetPlan: 'FREE' | 'PRO' = user.plan === 'pro' ? 'FREE' : 'PRO';
    const confirmMsg =
      targetPlan === 'PRO'
        ? `Kích hoạt gói PRO (30 ngày) cho "${user.ownerName}" (${user.phone})?`
        : `Chuyển tài khoản "${user.ownerName}" về gói MIỄN PHÍ (FREE)?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setTogglingPlanUserId(user.id);
    try {
      const res = await updateAdminUserPlan(user.id, targetPlan);
      if (res.success) {
        showToast(
          targetPlan === 'PRO'
            ? `Đã nâng cấp "${user.ownerName}" lên gói PRO!`
            : `Đã chuyển "${user.ownerName}" về gói MIỄN PHÍ.`
        );
        await loadData(true);
      } else {
        showToast(res.message || 'Không thể cập nhật gói dịch vụ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setTogglingPlanUserId(null);
    }
  };

  // =============================================================================
  // NGHIỆP VỤ 2: XỬ LÝ CẤP MỚI TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN) (DÒNG 125 ĐẾN 168)
  // - Dùng để: Gửi yêu cầu khởi tạo tài khoản Admin lên API POST /api/admin/users
  // - Phục vụ:
  //   1. Kiểm tra tính hợp lệ: Email, Họ tên và Mật khẩu (tối thiểu 6 ký tự).
  //   2. Gán cứng vai trò role: 'ADMIN'. Không áp dụng gói cước hay thông tin cửa hàng.
  //   3. Cập nhật tức thời danh sách người dùng trên giao diện sau khi tạo thành công.
  // =============================================================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim()) {
      showToast('Vui lòng nhập email đăng nhập của Quản trị viên', 'error');
      return;
    }
    if (!createName.trim()) {
      showToast('Vui lòng nhập họ và tên của Quản trị viên', 'error');
      return;
    }
    if (!createPassword || createPassword.length < 6) {
      showToast('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await createAdminUser({
        email: createEmail.trim(),
        password: createPassword,
        name: createName.trim(),
        phone: createPhone.trim() || undefined,
        role: 'ADMIN',
      });

      if (res.success) {
        showToast('Đã cấp tài khoản Quản trị viên mới thành công!');
        setCreateEmail('');
        setCreatePassword('');
        setCreateName('');
        setCreatePhone('');
        setCreateModalOpen(false);
        loadData(true);
      } else {
        showToast(res.message || 'Không thể tạo tài khoản quản trị viên', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalOwners = users.filter((u) => u.role !== 'ADMIN').length;
  const listPRO = users.filter((u) => u.plan === 'pro' && u.role !== 'ADMIN').length;
  const listFREE = users.filter((u) => u.plan === 'free' && u.role !== 'ADMIN').length;
  const totalUsers = users.length > 0 ? users.length : (overview?.totalUsers ?? 0);
  const totalPRO = users.length > 0 ? listPRO : (overview?.totalPRO ?? 0);
  const totalFREE = users.length > 0 ? listFREE : (overview?.totalFREE ?? 0);
  const mrr = totalPRO * 99000;
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
            <span className="material-symbols-outlined text-[18px] text-white">admin_panel_settings</span>
            <span>+ Thêm Quản Trị Viên</span>
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
                Phê Duyệt Đăng Ký Cửa Hàng / Chi Nhánh Mới (Kèm Chứng Từ)
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold tabular-nums">
                {shopRequests.filter((s) => s.status === 'PENDING_APPROVAL').length} chờ duyệt
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
              Chủ hộ đăng ký tài khoản cần gửi hồ sơ cửa hàng kèm chứng từ xác minh để Ban Quản Trị (Admin) thẩm định và phê duyệt kích hoạt.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Chi Nhánh / Cửa Hàng</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Mã Số Thuế (MST)</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Chủ Hộ / Người Đại Diện</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap">Địa Chỉ Kinh Doanh</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center">Hồ Sơ KYC</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-right pr-6">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {shopRequests.filter((s) => s.id !== 'shop-main').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    Chưa có yêu cầu đăng ký cửa hàng / chi nhánh nào chờ duyệt.
                  </td>
                </tr>
              ) : (
                shopRequests
                  .filter((s) => s.id !== 'shop-main')
                  .map((req) => {
                    const docs = req.verificationDocs || req.documentUrls || [];
                    const hasCccd = req.cccdFrontUrl || req.cccdBackUrl;
                    const totalImages = docs.length + (hasCccd ? 2 : 0);
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-5">
                          <div className="font-bold text-slate-900">{req.shopName}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{req.businessType}</div>
                        </td>

                        <td className="py-3.5 px-4 sm:px-5">
                          {req.taxCode ? (
                            <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded inline-block">
                              {req.taxCode}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Chưa khai báo</span>
                          )}
                          {req.ownerCccd && (
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">CCCD: {req.ownerCccd}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 sm:px-5">
                          <div className="font-semibold text-slate-900">
                            {req.legalOwnerName || req.ownerName || 'Chủ hộ kinh doanh'}
                          </div>
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
                            <span>{totalImages > 0 ? `${totalImages} ảnh KYC` : '0 ảnh'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black border ${
                              req.status === 'PENDING_APPROVAL' || req.approvalStatus === 'PENDING'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : req.status === 'ACTIVE' || req.approvalStatus === 'APPROVED'
                                  ? 'bg-[#d0f81b]/35 text-slate-950 border-[#bde412]'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {req.status === 'PENDING_APPROVAL' || req.approvalStatus === 'PENDING'
                              ? 'CHỜ PHÊ DUYỆT'
                              : req.status === 'ACTIVE' || req.approvalStatus === 'APPROVED'
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
                            <span>Xem hồ sơ</span>
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
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-right min-w-[160px] pr-6">Thao Tác</th>
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
                paginatedUsers.map((u) => (
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
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserPlan(u)}
                            disabled={togglingPlanUserId === u.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                              u.plan === 'pro'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                : 'bg-[#d0f81b]/45 hover:bg-[#d0f81b] text-slate-950 border border-[#bde412]'
                            }`}
                            type="button"
                            title={u.plan === 'pro' ? 'Chuyển về gói FREE' : 'Nâng cấp lên gói PRO'}
                          >
                            {togglingPlanUserId === u.id
                              ? 'Đang lưu...'
                              : u.plan === 'pro'
                                ? 'Hạ FREE'
                                : 'Nâng PRO'}
                          </button>
                        )}
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
              <tr className="border-t border-slate-200/90 bg-slate-50/70 text-xs text-slate-600">
                <td colSpan={6} className="py-3.5 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    {/* Left: Summary & Rows Per Page */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-600">
                        Hiển thị{' '}
                        <strong className="text-slate-900 font-bold">
                          {filteredUsers.length === 0 ? 0 : (safeCurrentPage - 1) * rowsPerPage + 1}
                        </strong>
                        {' - '}
                        <strong className="text-slate-900 font-bold">
                          {Math.min(safeCurrentPage * rowsPerPage, filteredUsers.length)}
                        </strong>{' '}
                        trong tổng số{' '}
                        <strong className="text-slate-900 font-bold">{filteredUsers.length}</strong>{' '}
                        tài khoản
                      </span>

                      <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                        <span className="text-slate-500 text-xs">Mỗi trang:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="h-7 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d6155f] cursor-pointer shadow-2xs"
                        >
                          <option value={10}>10 dòng</option>
                          <option value={20}>20 dòng</option>
                          <option value={50}>50 dòng</option>
                        </select>
                      </div>
                    </div>

                    {/* Right: Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1 self-center sm:self-auto">
                        {/* Prev Button */}
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={safeCurrentPage === 1}
                          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Trang trước"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                          <span className="hidden md:inline">Trước</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, idx) => {
                            if (typeof page === 'string') {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="w-7 text-center text-slate-400 select-none text-xs font-bold"
                                >
                                  ...
                                </span>
                              );
                            }
                            const isActive = page === safeCurrentPage;
                            return (
                              <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                  isActive
                                    ? 'bg-[#d6155f] text-white border border-[#d6155f] shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safeCurrentPage === totalPages}
                          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Trang sau"
                        >
                          <span className="hidden md:inline">Sau</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3.5. Detail Popup Modal for 2nd+ Shop Branch Request */}
      {selectedShopRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
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
              {/* Cảnh báo nếu hồ sơ đã từng bị từ chối */}
              {(selectedShopRequest.rejectionReason || selectedShopRequest.status === 'REJECTED' || selectedShopRequest.approvalStatus === 'REJECTED') && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0 mt-0.5">error</span>
                  <div>
                    <div className="text-xs font-extrabold text-rose-800 uppercase tracking-wide">
                      Hồ sơ này đang ở trạng thái BỊ TỪ CHỐI
                    </div>
                    <div className="text-xs text-rose-700 mt-0.5">
                      <strong>Lý do từ chối đã gửi cho chủ shop:</strong> {selectedShopRequest.rejectionReason || 'Chứng từ chưa đạt yêu cầu.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid - 1. Pháp lý & Định danh */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ff4783]">badge</span>
                  <span>1. Pháp lý &amp; Định danh chủ hộ / Doanh nghiệp</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Tên cửa hàng / Chi nhánh đăng ký
                    </span>
                    <div className="text-sm font-extrabold text-slate-900">{selectedShopRequest.shopName}</div>
                    <div className="text-xs text-slate-500">{selectedShopRequest.businessType}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Mã số thuế (MST) / Mã định danh HKD
                    </span>
                    <div className="text-sm font-black text-slate-900 font-mono tracking-wide">
                      {selectedShopRequest.taxCode ? (
                        <span className="bg-slate-200/80 px-2 py-0.5 rounded">{selectedShopRequest.taxCode}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa khai báo</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">Khóa duy nhất chống gian lận &amp; trùng lặp</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Chủ hộ / Người đại diện pháp luật
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedShopRequest.legalOwnerName || selectedShopRequest.ownerName || 'Chủ hộ kinh doanh'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Số CCCD: <strong>{selectedShopRequest.ownerCccd || 'Chưa cung cấp'}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Thông tin liên hệ &amp; Ngày đăng ký
                    </span>
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      {selectedShopRequest.phone || '—'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Email: {selectedShopRequest.ownerEmail || '—'} • Ngày: {selectedShopRequest.createdAt || 'Hôm nay'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid - 2. Tách bạch 3 loại địa chỉ */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ff4783]">pin_drop</span>
                  <span>2. Đối soát 3 loại địa chỉ (Kinh doanh thực tế vs ĐKKD vs Xuất hóa đơn)</span>
                </span>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-slate-700">1. Địa chỉ cơ sở kinh doanh thực tế:</span>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{selectedShopRequest.address || '—'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-slate-700">2. Địa chỉ ĐKKD / Thường trú theo CCCD:</span>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {selectedShopRequest.registeredAddress || selectedShopRequest.address || 'Giống địa chỉ kinh doanh'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-slate-700">3. Địa chỉ xuất hóa đơn GTGT / Thuế:</span>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {selectedShopRequest.invoiceAddress || selectedShopRequest.address || 'Giống địa chỉ kinh doanh'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Documents Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ff4783]">verified_user</span>
                    <span>Hồ Sơ Chứng Từ KYC Đính Kèm (GPKD &amp; CCCD 2 Mặt)</span>
                  </span>
                  <span className="text-xs text-slate-600">Nhấn vào ảnh để xem kích thước gốc</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* GPKD */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-700">Giấy phép kinh doanh (GPKD):</span>
                    {selectedShopRequest.licenseImageUrls?.length ? (
                      selectedShopRequest.licenseImageUrls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-[#ff4783] bg-slate-100 aspect-video block shadow-xs">
                          <img src={url} alt="GPKD" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                            <span>Xem GPKD</span>
                          </div>
                        </a>
                      ))
                    ) : (selectedShopRequest.verificationDocs || selectedShopRequest.documentUrls || []).length ? (
                      (selectedShopRequest.verificationDocs || selectedShopRequest.documentUrls || []).map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-[#ff4783] bg-slate-100 aspect-video block shadow-xs">
                          <img src={url} alt={`Chứng từ ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                            <span>Xem ảnh #{idx + 1}</span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Chưa đính kèm GPKD
                      </div>
                    )}
                  </div>

                  {/* CCCD Trước */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-700">CCCD Mặt trước:</span>
                    {selectedShopRequest.cccdFrontUrl ? (
                      <a href={selectedShopRequest.cccdFrontUrl} target="_blank" rel="noreferrer" className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-[#ff4783] bg-slate-100 aspect-video block shadow-xs">
                        <img src={selectedShopRequest.cccdFrontUrl} alt="CCCD Trước" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          <span>Xem CCCD Trước</span>
                        </div>
                      </a>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Chưa đính kèm
                      </div>
                    )}
                  </div>

                  {/* CCCD Sau */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-700">CCCD Mặt sau:</span>
                    {selectedShopRequest.cccdBackUrl ? (
                      <a href={selectedShopRequest.cccdBackUrl} target="_blank" rel="noreferrer" className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-[#ff4783] bg-slate-100 aspect-video block shadow-xs">
                        <img src={selectedShopRequest.cccdBackUrl} alt="CCCD Sau" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          <span>Xem CCCD Sau</span>
                        </div>
                      </a>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Chưa đính kèm
                      </div>
                    )}
                  </div>
                </div>
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

              {(selectedShopRequest.status === 'PENDING_APPROVAL' || selectedShopRequest.approvalStatus === 'PENDING') && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectReasonInput('');
                      setRejectModalOpen(true);
                    }}
                    className="h-10 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[17px]">cancel</span>
                    <span>Từ chối hồ sơ (Nhập lý do)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={async () => {
                      setIsSubmittingReview(true);
                      try {
                        const res = await reviewAdminShopRequest(selectedShopRequest.id, 'APPROVE');
                        const fresh = await fetchAdminShopRequests();
                        setShopRequests(fresh);
                        setSelectedShopRequest(fresh.find((s) => s.id === selectedShopRequest.id) || null);
                        showToast(res.message, 'success');
                      } catch (err: any) {
                        showToast(err.message || 'Lỗi phê duyệt hồ sơ', 'error');
                      } finally {
                        setIsSubmittingReview(false);
                      }
                    }}
                    className="h-10 px-5 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 border border-[#bde412] text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
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

      {/* =============================================================================
          NGHIỆP VỤ: DIALOG TỪ CHỐI HỒ SƠ CỬA HÀNG VÀ BẮT BUỘC NHẬP LÝ DO (CHỈ ĐẠO MENTOR)
          - Dùng để làm gì: Khi Admin bấm Từ chối, bắt buộc phải nhập lý do cụ thể.
          - Phục vụ: Giúp Chủ hộ biết chính xác lý do để nộp lại (Re-submit).
      ============================================================================= */}
      {rejectModalOpen && selectedShopRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Từ Chối Hồ Sơ Cửa Hàng
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hồ sơ: <strong className="text-slate-800">{selectedShopRequest.shopName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5" htmlFor="admin_reject_reason">
                  Lý do từ chối cụ thể * <span className="text-slate-400 font-normal">(Chủ shop sẽ nhìn thấy lý do này để khắc phục)</span>
                </label>
                <textarea
                  id="admin_reject_reason"
                  rows={4}
                  required
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Ví dụ: Ảnh Giấy phép kinh doanh bị mờ, không nhìn rõ dấu đỏ và mã số thuế; số CCCD chưa khớp với họ tên người đại diện..."
                  className="w-full p-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 transition-all"
                />
              </div>

              {/* Gợi ý lý do nhanh */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Gợi ý lý do nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Ảnh Giấy phép kinh doanh bị mờ, không nhìn rõ dấu đỏ và mã số thuế.',
                    'Mã số thuế không trùng khớp với thông tin đăng ký kinh doanh.',
                    'Thiếu ảnh chụp CCCD mặt sau của người đại diện pháp luật.',
                    'Địa chỉ kinh doanh thực tế chưa đầy đủ số nhà / tên đường.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReasonInput(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-left transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingReview || !rejectReasonInput.trim()}
                onClick={async () => {
                  if (!rejectReasonInput.trim()) {
                    showToast('Vui lòng nhập lý do từ chối hồ sơ', 'error');
                    return;
                  }
                  setIsSubmittingReview(true);
                  try {
                    const res = await reviewAdminShopRequest(selectedShopRequest.id, 'REJECT', rejectReasonInput.trim());
                    const fresh = await fetchAdminShopRequests();
                    setShopRequests(fresh);
                    setSelectedShopRequest(fresh.find((s) => s.id === selectedShopRequest.id) || null);
                    setRejectModalOpen(false);
                    showToast(res.message || 'Đã từ chối hồ sơ và gửi lý do cho chủ shop', 'error');
                  } catch (err: any) {
                    showToast(err.message || 'Lỗi khi từ chối hồ sơ', 'error');
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSubmittingReview ? 'animate-spin' : ''}`}>
                  {isSubmittingReview ? 'sync' : 'gavel'}
                </span>
                <span>{isSubmittingReview ? 'Đang gửi...' : 'Xác Nhận Từ Chối Hồ Sơ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================================
          NGHIỆP VỤ 3: MODAL CẤP TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN) (DÒNG 870 ĐẾN 990)
          - Dùng để làm gì: Form cấp mới tài khoản dành riêng cho Quản Trị Viên (Admin).
          - Phục vụ mục đích:
            1. Không cho phép tạo tài khoản Chủ hộ (Owner) tại đây vì Owner tự đăng ký ngoài web.
            2. Thu thập đầy đủ thông tin định danh: Họ tên, Email, Mật khẩu khởi tạo và SĐT liên hệ.
            3. Khóa cứng phân quyền ADMIN, loại bỏ các trường không cần thiết (Tên shop, Gói dịch vụ).
      ============================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f5] text-[#b01755] flex items-center justify-center border border-[#ffd6e4]">
                  <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Tạo Tài Khoản Quản Trị Viên (Admin)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cấp quyền quản trị hệ thống cho nhân sự ban quản lý</p>
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
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_name">
                  Họ và tên Quản trị viên <span className="text-[#ff4783]">*</span>
                </label>
                <input
                  id="create_name"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  placeholder="Ví dụ: Nguyễn Văn Quản Trị"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_email">
                  Email đăng nhập quản trị <span className="text-[#ff4783]">*</span>
                </label>
                <input
                  id="create_email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                  placeholder="admin@vikeso.vn"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_password">
                  Mật khẩu khởi tạo <span className="text-[#ff4783]">*</span>
                </label>
                <input
                  id="create_password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="create_phone">
                  Số điện thoại liên hệ (Tùy chọn)
                </label>
                <input
                  id="create_phone"
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="Ví dụ: 0909123456"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all font-medium"
                />
              </div>

              {/* Vai trò cố định ADMIN */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Vai trò phân quyền hệ thống
                </div>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4] text-xs font-black">
                    <span className="material-symbols-outlined text-[16px]">shield_person</span>
                    <span>Quản Trị Viên (ADMIN)</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">• Toàn quyền phê duyệt &amp; quản trị hệ thống</span>
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
                  className="px-5 py-2.5 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isCreating ? 'animate-spin' : ''}`}>
                    {isCreating ? 'sync' : 'admin_panel_settings'}
                  </span>
                  <span>{isCreating ? 'Đang tạo...' : 'Cấp Quyền Admin'}</span>
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
