import React, { useState, useEffect } from 'react';
import { updateUserProfile, changeUserPassword, createBillingOrder } from '../services/api';
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

  // Billing upgrade modal state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [billingOrder, setBillingOrder] = useState<any>(null);

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

  // Handle Upgrade PRO via SePay
  const handleCreateProOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const res = await createBillingOrder({
        userId: currentUser?.id,
        plan: 'PRO',
      });

      if (res.success && res.data) {
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
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-slate-900">
                    {isPro ? 'Gói Chuyên Nghiệp (PRO)' : 'Gói Cơ Bản (FREE)'}
                  </span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {isPro ? '99.000 đ' : '0 đ'} <span className="text-xs text-slate-400 font-normal">/ tháng</span>
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff4783] text-[16px]">check_circle</span>
                    <span>{isPro ? 'Quét không giới hạn hóa đơn AI Gemini' : 'Giới hạn 30 hóa đơn / tháng'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff4783] text-[16px]">check_circle</span>
                    <span>Tự động gửi báo cáo Telegram lúc 22:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff4783] text-[16px]">check_circle</span>
                    <span>Đối soát chéo tránh trùng hóa đơn và POS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff4783] text-[16px]">check_circle</span>
                    <span>Bảng kê doanh thu thuế chuẩn TT88</span>
                  </div>
                </div>
              </div>

              {!isPro ? (
                <button
                  onClick={handleCreateProOrder}
                  disabled={isCreatingOrder}
                  className="w-full py-3 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isCreatingOrder ? 'animate-spin' : ''}`}>
                    {isCreatingOrder ? 'sync' : 'upgrade'}
                  </span>
                  <span>{isCreatingOrder ? 'Đang tạo đơn VietQR...' : 'Nâng Cấp Gói PRO (99.000 đ/tháng)'}</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#d0f81b]/20 border border-[#bde412] text-xs text-slate-950 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff4783] text-[18px]">verified</span>
                  <span>Tài khoản của bạn đã được kích hoạt đầy đủ tính năng PRO!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
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
