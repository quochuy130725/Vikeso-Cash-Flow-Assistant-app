import React, { useState, useEffect } from 'react';
import {
  updateUserProfile,
  changeUserPassword,
  createBillingOrder,
  fetchUserShops,
  createAdditionalShop,
  switchActiveShop,
  fetchCurrentUserInfo,
} from '../services/api';
import { ShopBranch } from '../types';
import { UserAccount } from '../components/AuthModal';
import { AddressSelectPicker } from '../components/AddressSelectPicker';

interface OwnerSettingsProps {
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const OwnerSettings: React.FC<OwnerSettingsProps> = ({ currentUser, onLogout }) => {
  // =============================================================================
  // NGHIỆP VỤ BƯỚC 1: TÁCH BIỆT HOÀN TOÀN THÔNG TIN CÁ NHÂN & THÔNG TIN CỬA HÀNG
  // - personalName & personalPhone: Dữ liệu cá nhân của Chủ hộ (User model)
  // - activeStoreName, activeStorePhone, activeStoreAddress: Dữ liệu của Cơ sở kinh doanh (Shop model)
  // =============================================================================
  const [personalName, setPersonalName] = useState(currentUser?.name || '');
  const [personalPhone, setPersonalPhone] = useState(currentUser?.phone || '');
  const [email] = useState(currentUser?.email || '');
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Active Store form state
  const [activeStoreName, setActiveStoreName] = useState(currentUser?.shopName || currentUser?.storeName || '');
  const [activeStorePhone, setActiveStorePhone] = useState('');
  const [activeStoreAddress, setActiveStoreAddress] = useState('');
  const [activeStoreType, setActiveStoreType] = useState('Tạp hóa & Bán lẻ tiêu dùng');
  const [activeStoreStatus, setActiveStoreStatus] = useState('ACTIVE');
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Password change form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Billing upgrade modal state (Step 1: Package comparison popup -> Step 2: VietQR modal)
  const [packagePopupOpen, setPackagePopupOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [billingOrder, setBillingOrder] = useState<any>(null);

  // Multi-shop management state (FE-WEB-13)
  const [shops, setShops] = useState<ShopBranch[]>([]);
  const [newShopModalOpen, setNewShopModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchType, setBranchType] = useState('Tạp hóa & Bán lẻ tiêu dùng');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchDocUrls, setBranchDocUrls] = useState<string[]>([]);
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =============================================================================
  // NGHIỆP VỤ BƯỚC 1: ĐỒNG BỘ ĐỘC LẬP THÔNG TIN CÁ NHÂN & CƠ SỞ KINH DOANH
  // - Thông tin cá nhân (Họ tên, SĐT cá nhân): Nạp trực tiếp từ MongoDB qua /api/auth/me
  // - Thông tin cơ sở kinh doanh: Nạp từ cửa hàng đang chọn (ACTIVE shop / PENDING shop).
  // =============================================================================
  useEffect(() => {
    // 1. Khởi tạo tức thì từ cache để UI mượt mà không chớp nháy
    if (currentUser) {
      setPersonalName(currentUser.name || '');
      setPersonalPhone(currentUser.phone || '');
    }

    // 2. Gọi API GET /api/auth/me lấy thông tin mới nhất trực tiếp từ Database MongoDB
    fetchCurrentUserInfo().then((res) => {
      if (res.success && res.userInfo) {
        if (res.userInfo.name) {
          setPersonalName(res.userInfo.name);
        }
        if (res.userInfo.phone !== undefined && res.userInfo.phone !== null) {
          setPersonalPhone(res.userInfo.phone);
        }
      }
    });

    fetchUserShops(currentUser?.shopName || currentUser?.storeName).then((list) => {
      setShops(list);

      // Ưu tiên 1: Lấy chi nhánh đã được duyệt kích hoạt (ACTIVE)
      const activeShop = list.find((s) => s.status === 'ACTIVE');
      if (activeShop) {
        setActiveStoreName(activeShop.shopName);
        setActiveStorePhone(activeShop.phone || '');
        setActiveStoreAddress(activeShop.address || '');
        setActiveStoreType(activeShop.businessType || 'Tạp hóa & Bán lẻ tiêu dùng');
        setActiveStoreStatus(activeShop.status || 'ACTIVE');

        // Đồng bộ vào localStorage để header và toàn bộ trang cập nhật theo
        const saved = localStorage.getItem('vikeso_user');
        if (saved) {
          try {
            const u = JSON.parse(saved);
            if (!u.shopName || u.shopName === 'Chưa thiết lập cửa hàng' || u.activeShopId !== activeShop.id) {
              u.shopName = activeShop.shopName;
              u.storeName = activeShop.shopName;
              u.activeShopId = activeShop.id;
              localStorage.setItem('vikeso_user', JSON.stringify(u));
            }
          } catch (e) {}
        }

        // Bắn sự kiện cập nhật tức thời Header & Sidebar
        window.dispatchEvent(new CustomEvent('vikeso_shop_updated', {
          detail: { shopName: activeShop.shopName }
        }));
      } else {
        // Ưu tiên 2: Nếu chưa có cửa hàng nào được duyệt nhưng có hồ sơ đang chờ duyệt
        const pendingShop = list.find((s) => s.status === 'PENDING_APPROVAL');
        if (pendingShop) {
          setActiveStoreName(pendingShop.shopName);
          setActiveStorePhone(pendingShop.phone || '');
          setActiveStoreAddress(pendingShop.address || '');
          setActiveStoreType(pendingShop.businessType || 'Tạp hóa & Bán lẻ tiêu dùng');
          setActiveStoreStatus(pendingShop.status || 'PENDING_APPROVAL');
          window.dispatchEvent(new CustomEvent('vikeso_shop_updated', {
            detail: { shopName: pendingShop.shopName }
          }));
        } else {
          setActiveStoreName(currentUser?.shopName || currentUser?.storeName || 'Chưa thiết lập cửa hàng');
        }
      }
    });
  }, [currentUser]);

  // =============================================================================
  // NGHIỆP VỤ BƯỚC 1A: CẬP NHẬT HỒ SƠ CÁ NHÂN CHỦ HỘ
  // - Chỉ cập nhật: Họ tên, Số điện thoại cá nhân nhận OTP
  // =============================================================================
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalName.trim()) {
      showToast('Vui lòng nhập họ và tên chủ hộ', 'error');
      return;
    }

    setIsSavingPersonal(true);
    try {
      const res = await updateUserProfile({
        name: personalName.trim(),
        phone: personalPhone.trim(),
      });

      if (res.success) {
        showToast('Đã cập nhật thông tin cá nhân chủ hộ thành công!');
        const rawUser = localStorage.getItem('vikeso_user');
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            u.name = personalName.trim();
            u.phone = personalPhone.trim();
            localStorage.setItem('vikeso_user', JSON.stringify(u));
          } catch (e) {}
        }
      } else {
        showToast(res.message || 'Lỗi khi cập nhật hồ sơ cá nhân', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // =============================================================================
  // NGHIỆP VỤ BƯỚC 1B: CẬP NHẬT THÔNG TIN CƠ SỞ KINH DOANH
  // - Cập nhật tên cửa hàng, đồng bộ tức thì trên Header & Sidebar
  // =============================================================================
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoreName.trim()) {
      showToast('Vui lòng nhập tên cơ sở kinh doanh', 'error');
      return;
    }

    setIsSavingStore(true);
    try {
      const res = await updateUserProfile({
        shopName: activeStoreName.trim(),
      });

      if (res.success) {
        showToast('Đã lưu thông tin cơ sở kinh doanh thành công!');
        window.dispatchEvent(new CustomEvent('vikeso_shop_updated', {
          detail: { shopName: activeStoreName.trim() }
        }));
      } else {
        showToast(res.message || 'Lỗi khi cập nhật thông tin cửa hàng', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsSavingStore(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeUserPassword({
        oldPassword,
        newPassword,
      });

      if (res.success) {
        showToast('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Mật khẩu cũ không chính xác', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Upgrade PRO via SePay (Gói PRO 1 tháng - 99.000đ)
  const handleCreateProOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const res = await createBillingOrder({
        userId: currentUser?.id,
        plan: 'PRO',
        packageDuration: '1M',
        amount: 99000,
      });

      if (res.success && res.data) {
        setPackagePopupOpen(false);
        setBillingOrder(res.data);
      } else {
        showToast(res.message || 'Không thể tạo đơn nâng cấp', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi tạo đơn', 'error');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // =============================================================================
  // NGHIỆP VỤ 1: TẠO CỬA HÀNG MỚI & ĐÍNH KÈM CHỨNG TỪ XÁC MINH (DÒNG 160 ĐẾN 215)
  // - Dùng để: Xử lý submit hồ sơ thành lập cửa hàng / chi nhánh mới từ mục "Quản Lý Đa Cửa Hàng"
  // - Phục vụ:
  //   1. Cho phép Owner đăng ký cơ sở kinh doanh đầu tiên hoặc mở thêm chi nhánh mới.
  //   2. Kiểm tra tính hợp lệ: Tên cơ sở, Địa chỉ kinh doanh thực tế, và Bắt buộc có chứng từ.
  //   3. Gửi hồ sơ lên hệ thống với trạng thái PENDING_APPROVAL để Quản trị viên (Admin) xét duyệt.
  //   4. Tự động đồng bộ danh sách chi nhánh và cập nhật cửa hàng hoạt động ngay sau khi tạo.
  // =============================================================================
  const handleCreateAdditionalShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim()) {
      showToast('Vui lòng nhập Tên cửa hàng và Địa chỉ kinh doanh thực tế', 'error');
      return;
    }
    if (branchDocUrls.length === 0) {
      showToast('Bắt buộc đính kèm ít nhất 1 ảnh chứng từ xác minh (Giấy phép HKD / Biển hiệu cửa hàng)', 'error');
      return;
    }
    setIsSubmittingBranch(true);
    try {
      const res = await createAdditionalShop({
        shopName: branchName.trim(),
        businessType: branchType,
        address: branchAddress.trim(),
        phone: branchPhone.trim() || activeStorePhone || '0912.345.678',
        verificationDocs: branchDocUrls,
        ownerName: personalName || currentUser?.name,
        ownerEmail: email || currentUser?.email,
      });
      if (res.success) {
        showToast(res.message || 'Đã gửi hồ sơ cửa hàng kèm chứng từ! Đang chờ Admin phê duyệt.');
        setNewShopModalOpen(false);
        setBranchName('');
        setBranchAddress('');
        setBranchPhone('');
        setBranchDocUrls([]);
        const updated = await fetchUserShops(activeStoreName);
        setShops(updated);
        const createdName = branchName.trim();
        if (!activeStoreName || activeStoreName === 'Chưa thiết lập cửa hàng') {
          setActiveStoreName(createdName);
        }
        // Đồng bộ tức thời lên thanh Header và Sidebar Profile
        window.dispatchEvent(new CustomEvent('vikeso_shop_updated', {
          detail: { shopName: createdName }
        }));
        const rawUser = localStorage.getItem('vikeso_user');
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            u.shopName = createdName;
            u.storeName = createdName;
            localStorage.setItem('vikeso_user', JSON.stringify(u));
          } catch (e) {}
        }
      } else {
        showToast(res.message || 'Không thể tạo cửa hàng', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const handleUploadVerificationDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).slice(0, 3).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBranchDocUrls((prev) => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Tiện ích chèn ảnh mẫu chứng từ phục vụ test nhanh khi không có sẵn file trên máy
  const handleUseSampleDoc = () => {
    const sampleGpkd = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="160" y="80" font-size="14" font-weight="bold" fill="%230f172a" text-anchor="middle">GIẤY CHỨNG NHẬN ĐKKD</text><text x="160" y="110" font-size="11" fill="%2364748b" text-anchor="middle">HỘ KINH DOANH CÁ THỂ</text><text x="160" y="140" font-size="10" fill="%23ff4783" text-anchor="middle">Xác thực hợp lệ - Demo</text></svg>';
    const sampleSign = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="%23fff1f2" stroke="%23f43f5e" stroke-width="2"/><text x="160" y="80" font-size="14" font-weight="bold" fill="%239f1239" text-anchor="middle">ẢNH BIỂN HIỆU CỬA HÀNG</text><text x="160" y="110" font-size="11" fill="%2364748b" text-anchor="middle">MẶT TIỀN THỰC TẾ</text><text x="160" y="140" font-size="10" fill="%23059669" text-anchor="middle">Biển hiệu rõ ràng - Demo</text></svg>';
    setBranchDocUrls([sampleGpkd, sampleSign]);
    showToast('Đã nạp 2 ảnh chứng từ mẫu (GPKD & Biển hiệu) để bạn thử nghiệm!');
  };

  const isPro = currentUser?.subscriptionPlan === 'PRO';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tài Khoản &amp; Thiết Lập
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600 font-semibold">{email}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cài Đặt Cửa Hàng &amp; Quản Lý Gói Dịch Vụ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cập nhật pháp nhân cửa hàng, thông tin liên hệ và trạng thái đăng ký thuê bao kế toán tự động.
          </p>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        )}
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Owner Profile Editor & Store Profile Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* =============================================================================
              NGHIỆP VỤ BƯỚC 1A: THẺ THÔNG TIN CÁ NHÂN CHỦ HỘ (OWNER PROFILE)
              - Tách biệt hoàn toàn với thông tin cơ sở kinh doanh
              - Hiển thị: Họ tên chủ hộ, Email cố định, Số điện thoại cá nhân (nhận OTP), Role
          ============================================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Thông Tin Cá Nhân Chủ Hộ</h2>
                  <p className="text-xs text-slate-500">Tài khoản quản trị, đăng nhập và bảo mật VikeSo</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-[#d0f81b] text-slate-950 border border-[#bde412] uppercase tracking-wider">
                CHỦ HỘ KINH DOANH
              </span>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5" htmlFor="settings_owner_name">
                    <span>Họ và tên chủ hộ *</span>
                  </label>
                  <input
                    id="settings_owner_name"
                    type="text"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    required
                    placeholder="VD: Nguyễn Bá Minh Tiến"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5" htmlFor="settings_personal_phone">
                    <span>Số điện thoại cá nhân *</span>
                    <span className="text-[11px] font-normal text-slate-400">Nhận OTP &amp; đăng nhập</span>
                  </label>
                  <input
                    id="settings_personal_phone"
                    type="tel"
                    value={personalPhone}
                    onChange={(e) => setPersonalPhone(e.target.value)}
                    placeholder="Ví dụ: 01238889999"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5" htmlFor="settings_email">
                    <span>Email tài khoản</span>
                    <span className="text-[11px] font-normal text-slate-400">Cố định bảo mật</span>
                  </label>
                  <input
                    id="settings_email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-10 px-3 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-600 font-medium cursor-not-allowed border border-slate-200"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5">
                    <span>Vai trò trong hệ thống</span>
                    <span className="text-[11px] font-semibold text-emerald-600">Đã kích hoạt</span>
                  </label>
                  <div className="w-full h-10 px-3 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold border border-slate-200 flex items-center justify-between select-none">
                    <span>Chủ Hộ Kinh Doanh (Owner)</span>
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPersonal}
                  className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSavingPersonal ? 'animate-spin' : ''}`}>
                    {isSavingPersonal ? 'sync' : 'save'}
                  </span>
                  <span>{isSavingPersonal ? 'Đang lưu...' : 'Lưu Thông Tin Cá Nhân'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* =============================================================================
              NGHIỆP VỤ BƯỚC 1B: THẺ THÔNG TIN CƠ SỞ KINH DOANH ĐANG CHỌN (STORE PROFILE)
              - Hiển thị: Tên cửa hàng, Loại hình, Hotline của quán, Địa chỉ thực tế, Badge trạng thái
          ============================================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center border border-[#ff4783]/20">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Cơ Sở Kinh Doanh Đang Chọn: <span className="text-[#ff4783] font-extrabold">{activeStoreName || 'Chưa thiết lập'}</span>
                  </h2>
                  <p className="text-xs text-slate-500">Dữ liệu hiển thị trên bảng kê thuế, hóa đơn khách hàng và báo cáo kết ca</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider ${
                activeStoreStatus === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {activeStoreStatus === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : 'CHỜ DUYỆT'}
              </span>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5" htmlFor="settings_shop_name">
                    <span>Tên cơ sở / Chi nhánh *</span>
                  </label>
                  <input
                    id="settings_shop_name"
                    type="text"
                    value={activeStoreName}
                    onChange={(e) => setActiveStoreName(e.target.value)}
                    required
                    placeholder="Ví dụ: Thú Y Mrs.Mây"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5" htmlFor="settings_store_phone">
                    <span>Số điện thoại Hotline của quán</span>
                    <span className="text-[11px] font-normal text-slate-400">In trên bill</span>
                  </label>
                  <input
                    id="settings_store_phone"
                    type="tel"
                    value={activeStorePhone}
                    onChange={(e) => setActiveStorePhone(e.target.value)}
                    placeholder="Ví dụ: 0441235555"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1.5" htmlFor="settings_store_type">
                    <span>Loại hình kinh doanh</span>
                  </label>
                  <select
                    id="settings_store_type"
                    value={activeStoreType}
                    onChange={(e) => setActiveStoreType(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all font-medium cursor-pointer"
                  >
                    <option value="Tạp hóa & Bán lẻ tiêu dùng">Tạp hóa & Bán lẻ tiêu dùng</option>
                    <option value="F&B / Quán cà phê / Ăn uống">F&B / Quán cà phê / Ăn uống</option>
                    <option value="Thời trang / Phụ kiện">Thời trang / Phụ kiện</option>
                    <option value="Dịch vụ / Spa / Tiệm tóc">Dịch vụ / Spa / Tiệm tóc</option>
                    <option value="Hộ kinh doanh khác">Hộ kinh doanh khác</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <AddressSelectPicker
                    id="settings_store_address"
                    label="Địa chỉ cơ sở kinh doanh thực tế"
                    value={activeStoreAddress}
                    onChange={(addr) => setActiveStoreAddress(addr)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingStore}
                  className="h-10 px-5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSavingStore ? 'animate-spin' : ''}`}>
                    {isSavingStore ? 'sync' : 'save'}
                  </span>
                  <span>{isSavingStore ? 'Đang lưu...' : 'Lưu Thông Tin Cửa Hàng'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Bảo Mật &amp; Đổi Mật Khẩu</h2>
                <p className="text-xs text-slate-500">Mật khẩu mới yêu cầu tối thiểu 6 ký tự</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="old_password">
                  Mật khẩu hiện tại *
                </label>
                <input
                  id="old_password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="new_password">
                    Mật khẩu mới *
                  </label>
                  <input
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="confirm_password">
                    Nhập lại mật khẩu mới *
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isChangingPassword ? 'animate-spin' : ''}`}>
                    {isChangingPassword ? 'sync' : 'key'}
                  </span>
                  <span>{isChangingPassword ? 'Đang đổi mật khẩu...' : 'Cập Nhật Mật Khẩu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Plan & Subscription Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Gói Dịch Vụ Đang Dùng</h2>
                  <p className="text-xs text-slate-500">Quyền lợi và hạn ngạch tài khoản</p>
                </div>
              </div>

              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  isPro
                    ? 'bg-[#d0f81b] text-slate-950 border-[#bde412]'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isPro ? 'GÓI PRO' : 'GÓI MIỄN PHÍ'}
              </span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-extrabold text-slate-900">
                    {isPro ? 'Gói Chuyên Nghiệp (VikeSo PRO)' : 'Gói Cơ Bản (FREE)'}
                  </span>
                  <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
                    {isPro ? '99.000 đ' : '0 đ'} <span className="text-xs text-slate-500 font-sans font-medium">/ 1 tháng (30 ngày)</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b01755] text-[16px]">check_circle</span>
                    <span>
                      {isPro
                        ? 'Quét gộp tối đa 3 ảnh hóa đơn / lần (Batch OCR) trên App'
                        : 'Quét tối đa 1 ảnh hóa đơn / lần trên Mobile App (FREE)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b01755] text-[16px]">check_circle</span>
                    <span>Tự động gửi báo cáo chốt sổ Telegram &amp; Email lúc 22:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b01755] text-[16px]">check_circle</span>
                    <span>Đối soát chéo 2 chiều tránh trùng hóa đơn lẻ và kết ca POS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b01755] text-[16px]">check_circle</span>
                    <span>Bảng kê doanh thu thuế chuẩn TT88 &amp; Phân tích cùng kỳ</span>
                  </div>
                </div>
              </div>

              {!isPro ? (
                <button
                  onClick={() => setPackagePopupOpen(true)}
                  disabled={isCreatingOrder}
                  className="w-full h-10 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">upgrade</span>
                  <span>So Sánh &amp; Nâng Cấp Gói PRO (99.000đ / 1 tháng)</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#d0f81b]/25 border border-[#bde412] text-xs text-slate-950 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b01755] text-[18px]">verified</span>
                  <span>Tài khoản của bạn đã được kích hoạt đầy đủ tính năng PRO!</span>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Shop Management Card (FE-WEB-13) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">domain_add</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Quản Lý Đa Cửa Hàng / Chi Nhánh</h2>
                  <p className="text-xs text-slate-500">Đính kèm chứng từ để Ban Quản Trị (Admin) thẩm định &amp; phê duyệt kích hoạt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewShopModalOpen(true)}
                className="h-8 px-3 rounded-lg bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                + Thêm cửa hàng / Chi nhánh
              </button>
            </div>

            {/* =============================================================================
                NGHIỆP VỤ 2: QUẢN LÝ TẬP TRUNG TẠO MỚI & CHUYỂN ĐỔI CỬA HÀNG (DÒNG 540 ĐẾN 620)
                - Dùng để làm gì:
                  1. Cho phép Owner tạo cửa hàng đầu tiên hoặc chi nhánh thứ 2+ ngay tại mục này.
                  2. Hiển thị danh sách cửa hàng kèm trạng thái: "CHỜ ADMIN DUYỆT" hay "HOẠT ĐỘNG".
                  3. Cho phép chủ hộ chuyển chi nhánh làm việc nhanh chóng.
            ============================================================================= */}
            {shops.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">storefront</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Chưa có cửa hàng nào được thiết lập</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Bạn chưa có cửa hàng nào trên hệ thống. Hãy bấm nút <b>"+ Thêm cửa hàng / Chi nhánh"</b> ở trên để tạo cửa hàng đầu tiên và gửi hồ sơ chứng từ cho Admin duyệt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewShopModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_business</span>
                  <span>Tạo Cửa Hàng Mới Ngay</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {shops.map((s) => (
                  <div
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-3 first:pt-0"
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{s.shopName}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {s.businessType} • {s.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          s.status === 'ACTIVE'
                            ? 'bg-[#d0f81b]/35 text-slate-950 border-[#bde412]'
                            : s.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {s.status === 'ACTIVE'
                          ? (s.shopName === activeStoreName ? 'ĐANG CHỌN' : 'HOẠT ĐỘNG')
                          : s.status === 'PENDING_APPROVAL'
                            ? 'CHỜ ADMIN DUYỆT'
                            : 'TỪ CHỐI'}
                      </span>
                      {s.status === 'ACTIVE' && s.shopName !== activeStoreName && (
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await switchActiveShop(s.id);
                            if (res.success) {
                              setActiveStoreName(s.shopName);
                              if (s.phone) setActiveStorePhone(s.phone);
                              if (s.address) setActiveStoreAddress(s.address);
                              if (s.businessType) setActiveStoreType(s.businessType);
                              setActiveStoreStatus(s.status || 'ACTIVE');
                              try {
                                const rawUser = localStorage.getItem('vikeso_user');
                                if (rawUser) {
                                  const u = JSON.parse(rawUser);
                                  u.shopName = s.shopName;
                                  u.storeName = s.shopName;
                                  u.activeShopId = s.id;
                                  localStorage.setItem('vikeso_user', JSON.stringify(u));
                                }
                              } catch (e) {}
                              window.dispatchEvent(new CustomEvent('vikeso_shop_updated', {
                                detail: { shopName: s.shopName, activeShopId: s.id }
                              }));
                              showToast(`Đã chuyển sang chi nhánh "${s.shopName}"!`);
                              const fresh = await fetchUserShops(s.shopName);
                              setShops(fresh);
                            } else {
                              showToast(res.message || 'Lỗi chuyển chi nhánh', 'error');
                            }
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-[#d0f81b] text-slate-800 hover:text-slate-950 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          Chuyển làm việc
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2.8. Step 1: PRO Package Comparison PopUp (FE-WEB-06: Chỉ có Gói FREE 0đ vs Gói PRO 99.000đ / 1 tháng) */}
      {packagePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#d0f81b] text-slate-950 flex items-center justify-center border border-[#bde412]">
                  <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Nâng Cấp Gói VikeSo PRO (1 Tháng)
                  </h3>
                  <p className="text-xs text-slate-500">
                    So sánh quyền lợi Gói Cơ Bản (FREE) và Gói Chuyên Nghiệp (VikeSo PRO – 30 ngày)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackagePopupOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 2-Plan Comparison Cards (FREE vs PRO 1 Month) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wide">Gói Cơ Bản (FREE)</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">MẶC ĐỊNH</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">0 đ</span>
                    <span className="text-slate-500">/ vĩnh viễn</span>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-200 text-slate-600">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-[15px] shrink-0 mt-0.5">check</span>
                      <span>Quét tối đa <strong>1 ảnh hóa đơn / lần</strong> trên Mobile App</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-[15px] shrink-0 mt-0.5">check</span>
                      <span>Sổ quỹ Thu - Chi cơ bản &amp; tra cứu giao dịch</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">block</span>
                      <span>Không hỗ trợ quét gộp 3 ảnh (Batch OCR)</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">block</span>
                      <span>Không có báo cáo chốt sổ tự động 22:00 qua Telegram &amp; Email</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#f7fee7] border-2 border-[#ff4783] flex flex-col justify-between space-y-4 relative shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-950 uppercase tracking-wide">Gói VikeSo PRO</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#ff4783] text-white text-[10px] font-black">THỜI HẠN 1 THÁNG</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#ff4783] font-mono tabular-nums">99.000 đ</span>
                    <span className="text-slate-700 font-semibold">/ 1 tháng (30 ngày)</span>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-900/10 text-slate-900 font-medium">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#ff4783] text-[15px] shrink-0 mt-0.5">check_circle</span>
                      <span>Quét gộp <strong>3 ảnh hóa đơn / lần (Batch OCR)</strong> không giới hạn lượt</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#ff4783] text-[15px] shrink-0 mt-0.5">check_circle</span>
                      <span>Tự động gửi báo cáo kết ca 22:00 qua <strong>Telegram Bot &amp; Email</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#ff4783] text-[15px] shrink-0 mt-0.5">check_circle</span>
                      <span>Xuất bảng kê doanh thu &amp; chi phí ra file <strong>Excel chuẩn TT88</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#ff4783] text-[15px] shrink-0 mt-0.5">check_circle</span>
                      <span>Biểu đồ phân tích dòng tiền &amp; đối soát chống trùng hóa đơn POS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Tổng thanh toán: <strong className="text-slate-900 font-mono tabular-nums">99.000 đ</strong> (Kích hoạt tự động 30 ngày qua SePay)
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPackagePopupOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  disabled={isCreatingOrder}
                  onClick={() => handleCreateProOrder()}
                  className="h-10 px-5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  <span>
                    {isCreatingOrder ? 'Đang tạo mã VietQR...' : 'Tạo Mã VietQR Thanh Toán (99.000đ)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================================
          NGHIỆP VỤ 3: MODAL TẠO CỬA HÀNG MỚI & NỘP CHỨNG TỪ XÁC MINH (DÒNG 740 ĐẾN 880)
          - Dùng để làm gì: Hiển thị form khai báo cửa hàng (cơ sở đầu tiên hoặc chi nhánh thứ 2+).
          - Phục vụ mục đích gì:
            1. Cho phép Owner nhập tên cơ sở, ngành nghề, số điện thoại, địa chỉ thực tế.
            2. Cho phép tải lên hoặc chọn ảnh mẫu chứng từ xác minh pháp lý (GPKD / Biển hiệu).
            3. Đẩy hồ sơ với trạng thái PENDING_APPROVAL vào hệ thống để Admin kiểm duyệt.
      ============================================================================= */}
      {newShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Đăng Ký Cửa Hàng / Chi Nhánh Mới
                </h3>
                <p className="text-xs text-slate-500">
                  Bắt buộc đính kèm hình ảnh chứng từ xác minh để Admin thẩm định &amp; phê duyệt kích hoạt
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewShopModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAdditionalShop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên cửa hàng / Chi nhánh mới *
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="VD: Tạp Hóa Minh Phát - Chi Nhánh 1"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngành nghề kinh doanh
                  </label>
                  <input
                    type="text"
                    value={branchType}
                    onChange={(e) => setBranchType(e.target.value)}
                    placeholder="Bán lẻ / Tạp hóa / Ăn uống..."
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="0909.111.222"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all"
                  />
                </div>
              </div>

              <div>
                <AddressSelectPicker
                  id="modal_branch_address"
                  label="Địa chỉ kinh doanh thực tế"
                  required
                  value={branchAddress}
                  onChange={(addr) => setBranchAddress(addr)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Ảnh chứng từ xác minh (GPKD / HĐ thuê / Biển hiệu) *
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSampleDoc}
                    className="text-[11px] font-bold text-[#b01755] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                    <span>+ Dùng ảnh mẫu thử nghiệm</span>
                  </button>
                </div>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#ff4783] rounded-2xl bg-slate-50 cursor-pointer transition-colors text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#ff4783]">upload_file</span>
                  <span className="text-xs font-bold text-slate-700 mt-1">
                    Bấm để chọn ảnh chứng từ từ máy tính (Tối đa 3 ảnh)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadVerificationDoc}
                    className="hidden"
                  />
                </label>

                {branchDocUrls.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {branchDocUrls.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                        <img src={url} alt="Doc" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setBranchDocUrls([])}
                      className="text-xs text-rose-500 hover:underline ml-1 cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewShopModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSubmittingBranch ? 'animate-spin' : ''}`}>
                    {isSubmittingBranch ? 'sync' : 'send'}
                  </span>
                  <span>{isSubmittingBranch ? 'Đang gửi hồ sơ...' : 'Gửi Hồ Sơ Chờ Admin Duyệt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SePay VietQR Modal if user triggered upgrade */}
      {billingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#d0f81b] text-slate-950 flex items-center justify-center border border-[#bde412]">
              <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Quét Mã VietQR Nâng Cấp PRO</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mở ứng dụng ngân hàng và quét mã để kích hoạt tức thời
              </p>
            </div>

            {billingOrder.qrCodeUrl && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <img
                  src={billingOrder.qrCodeUrl}
                  alt="VietQR SePay"
                  className="w-52 h-52 object-contain mx-auto rounded-xl"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Mã đơn hàng:</span>
                <span className="font-bold text-slate-900">{billingOrder.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Số tiền:</span>
                <span className="font-black text-[#ff4783]">{Number(billingOrder.amount || 99000).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Nội dung CK:</span>
                <span className="font-bold text-slate-900">{billingOrder.transferContent || billingOrder.orderCode}</span>
              </div>
            </div>

            <button
              onClick={() => setBillingOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#ff4783] text-white text-xs font-bold hover:bg-[#e0326e] transition-colors cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
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
