import React, { useState, useEffect } from 'react';
import {
  updateUserProfile,
  changeUserPassword,
  createBillingOrder,
  fetchUserShops,
  createAdditionalShop,
} from '../services/api';
import { ShopBranch } from '../types';
import { UserAccount } from '../components/AuthModal';

interface OwnerSettingsProps {
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const OwnerSettings: React.FC<OwnerSettingsProps> = ({ currentUser, onLogout }) => {
  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.storeName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email] = useState(currentUser?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setShopName(currentUser.shopName || currentUser.storeName || '');
      setPhone(currentUser.phone || '');
    }
    fetchUserShops(currentUser?.shopName || currentUser?.storeName).then(setShops);
  }, [currentUser]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập họ và tên chủ hộ', 'error');
      return;
    }
    if (!shopName.trim()) {
      showToast('Vui lòng nhập tên cửa hàng', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateUserProfile({
        name: name.trim(),
        shopName: shopName.trim(),
        phone: phone.trim(),
      });

      if (res.success) {
        showToast('Đã cập nhật thông tin cửa hàng thành công!');
      } else {
        showToast(res.message || 'Lỗi khi cập nhật hồ sơ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsSavingProfile(false);
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

  // Handle Register 2nd+ Shop Branch with Verification Docs (FE-WEB-13)
  const handleCreateAdditionalShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim()) {
      showToast('Vui lòng nhập Tên chi nhánh mới và Địa chỉ kinh doanh', 'error');
      return;
    }
    if (branchDocUrls.length === 0) {
      showToast('Bắt buộc đính kèm ít nhất 1 ảnh chứng từ xác minh (Giấy phép HKD / Mặt tiền cửa hàng)', 'error');
      return;
    }
    setIsSubmittingBranch(true);
    try {
      const res = await createAdditionalShop({
        shopName: branchName.trim(),
        businessType: branchType,
        address: branchAddress.trim(),
        phone: branchPhone.trim() || phone || '0912.345.678',
        verificationDocs: branchDocUrls,
        ownerName: name || currentUser?.name,
        ownerEmail: email || currentUser?.email,
      });
      if (res.success) {
        showToast(res.message);
        setNewShopModalOpen(false);
        setBranchName('');
        setBranchAddress('');
        setBranchDocUrls([]);
        const updated = await fetchUserShops(shopName);
        setShops(updated);
      }
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
        {/* Left Column (7 cols): Store Profile Editor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center border border-[#ff4783]/20">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Thông Tin Cửa Hàng &amp; Chủ Hộ</h2>
                  <p className="text-xs text-slate-500">Dữ liệu hiển thị trên bảng kê thuế và báo cáo kết ca</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settings_shop_name">
                    Tên cửa hàng / Hộ kinh doanh *
                  </label>
                  <input
                    id="settings_shop_name"
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    placeholder="Ví dụ: Tạp Hóa Minh Phát"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settings_owner_name">
                    Họ và tên chủ hộ *
                  </label>
                  <input
                    id="settings_owner_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ví dụ: Nguyễn Văn Minh"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settings_phone">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    id="settings_phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settings_email">
                    Email tài khoản (Cố định)
                  </label>
                  <input
                    id="settings_email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-10 px-3 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-500 font-medium cursor-not-allowed border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSavingProfile ? 'animate-spin' : ''}`}>
                    {isSavingProfile ? 'sync' : 'save'}
                  </span>
                  <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
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
                  <p className="text-xs text-slate-500">Chi nhánh thứ 2+ cần đính kèm chứng từ để Admin duyệt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewShopModalOpen(true)}
                className="h-8 px-3 rounded-lg bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                + Thêm chi nhánh
              </button>
            </div>

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
                  <span
                    className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-md border ${
                      s.status === 'ACTIVE'
                        ? 'bg-[#d0f81b]/35 text-slate-950 border-[#bde412]'
                        : s.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {s.status === 'ACTIVE'
                      ? 'ĐANG HOẠT ĐỘNG'
                      : s.status === 'PENDING_APPROVAL'
                        ? 'CHỜ ADMIN DUYỆT'
                        : 'TỪ CHỐI'}
                  </span>
                </div>
              ))}
            </div>
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

      {/* Modal: Register 2nd+ Shop Branch with Verification Docs (FE-WEB-13) */}
      {newShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Đăng Ký Cửa Hàng / Chi Nhánh Thứ 2+
                </h3>
                <p className="text-xs text-slate-500">
                  Bắt buộc đính kèm hình ảnh chứng từ xác minh để Admin phê duyệt kích hoạt
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
                  placeholder="VD: Tạp Hóa Minh Phát - Chi Nhánh 2"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200"
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
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại chi nhánh
                  </label>
                  <input
                    type="tel"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="0909.111.222"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ kinh doanh thực tế *
                </label>
                <input
                  type="text"
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tải ảnh chứng từ xác minh (Giấy ĐKKD / Hợp đồng thuê / Biển hiệu) *
                </label>
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
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt="Doc" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewShopModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black cursor-pointer"
                >
                  {isSubmittingBranch ? 'Đang gửi hồ sơ...' : 'Gửi Hồ Sơ Chờ Admin Duyệt'}
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
