import React, { useState } from 'react';
import { UserAccount } from '../components/AuthModal';

interface OwnerSettingsProps {
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const OwnerSettings: React.FC<OwnerSettingsProps> = ({ currentUser, onLogout }) => {
  const isRoleAdmin = currentUser?.role === 'ADMIN';
  const [storeName, setStoreName] = useState(
    currentUser?.shopName || currentUser?.storeName || (isRoleAdmin ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh')
  );
  const [ownerName, setOwnerName] = useState(
    currentUser?.name || (isRoleAdmin ? 'Admin' : 'Chủ Hộ Kinh Doanh')
  );
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [taxCode, setTaxCode] = useState('0318928471');
  const [address, setAddress] = useState(
    'Số 48 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  );
  const [sector, setSector] = useState('retail_grocery');
  const [autoMerge, setAutoMerge] = useState(true);

  React.useEffect(() => {
    if (currentUser) {
      setStoreName(currentUser.shopName || currentUser.storeName || (currentUser.role === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh'));
      setOwnerName(currentUser.name || (currentUser.role === 'ADMIN' ? 'Admin' : 'Chủ Hộ Kinh Doanh'));
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToastMessage('Đã cập nhật cài đặt hộ kinh doanh thành công!');
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }, 600);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn đăng xuất khỏi tài khoản ${ownerName}?`)) {
      alert('Đã đăng xuất phiên làm việc.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header with Embedded Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-1.5 text-[#198754] font-bold text-xs uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Thiết Lập Hệ Thống</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang đồng bộ máy chủ POS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cài Đặt Cửa Hàng &amp; Tài Khoản Hộ Kinh Doanh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý pháp nhân hộ kinh doanh, thiết bị thu ngân và dịch vụ đồng bộ kế toán tức thời.
          </p>
        </div>

        {/* Top Action Buttons (no floating bar blocking content) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Đăng xuất</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white shadow-sm hover:shadow transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${saving ? 'animate-spin' : ''}`}>
              {saving ? 'sync' : 'save'}
            </span>
            <span>{saving ? 'Đang lưu...' : 'Lưu Cài Đặt'}</span>
          </button>
        </div>
      </div>

      {/* Plan Banner - Sleek and Compact */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-md p-5 sm:p-6 border border-emerald-900/40">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {currentUser?.subscriptionPlan === 'FREE' ? 'Gói Miễn Phí (FREE)' : (currentUser?.subscriptionPlan || 'Gói Chuyên Nghiệp (PRO)')}
              </span>
              <span className="text-white text-lg font-bold font-mono">
                {currentUser?.subscriptionPlan === 'FREE' ? '0 đ' : '99.000 đ'} <span className="text-xs font-normal text-slate-400">/ tháng</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[11px] font-medium border border-white/10">
                {currentUser?.subscriptionPlan === 'FREE' ? 'Gói Khởi Động Tiêu Chuẩn' : 'Tự động gia hạn thẻ VNPAY'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">all_inclusive</span>
                <span>Không giới hạn hóa đơn AI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">schedule_send</span>
                <span>Báo cáo Telegram 22h00</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">sync_alt</span>
                <span>Đối soát ngân hàng 2 chiều</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">description</span>
                <span>Xuất file TT88 chuẩn thuế</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">event_available</span>
              <span>Hạn sử dụng: <strong className="text-white">28/11/2025</strong> (Còn 274 ngày)</span>
            </div>
          </div>

          <div className="flex sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => alert('Mở bảng thanh toán ưu đãi gia hạn 12 tháng (tiết kiệm 20%)...')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 border border-white/20 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">upgrade</span>
              <span>Nâng Cấp Hàng Năm</span>
            </button>
            <button
              onClick={() => alert('Quản lý phương thức thanh toán thẻ và lịch sử cước...')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
              <span>Quản Lý Gia Hạn Gói</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left (7 cols), Information Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Business Info & POS Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Thông Tin Hộ Kinh Doanh */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#198754]">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Thông Tin Hộ Kinh Doanh
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dữ liệu hiển thị trực tiếp trên báo cáo thuế và bill khách hàng.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[#198754] text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Đã xác thực CCCD
              </span>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="store_name">
                    Tên cơ sở kinh doanh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                      storefront
                    </span>
                    <input
                      id="store_name"
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] border border-slate-200 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="owner_name">
                    Người đại diện / Chủ hộ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                      person_outline
                    </span>
                    <input
                      id="owner_name"
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] border border-slate-200 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="phone_number">
                    Số điện thoại đăng ký <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                      call
                    </span>
                    <input
                      id="phone_number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] border border-slate-200 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="tax_code">
                    Mã số thuế hộ kinh doanh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                      fingerprint
                    </span>
                    <input
                      id="tax_code"
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] border border-slate-200 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="address">
                  Địa chỉ cơ sở kinh doanh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                    location_on
                  </span>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] border border-slate-200 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="business_sector">
                  Ngành nghề kinh doanh chính <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                    category
                  </span>
                  <select
                    id="business_sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full h-10 pl-9 pr-9 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] border border-slate-200 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="retail_grocery">Bán lẻ hàng tạp hóa &amp; tiêu dùng gia đình</option>
                    <option value="fb_restaurant">Dịch vụ ăn uống, nhà hàng, giải khát</option>
                    <option value="fashion">Quần áo, phụ kiện &amp; đồ may mặc</option>
                    <option value="pharmacy">Nhà thuốc &amp; thiết bị chăm sóc sức khỏe</option>
                    <option value="hardware">Vật liệu xây dựng &amp; ngũ kim dân dụng</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-[20px]">
                    arrow_drop_down
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Card 2: Cấu Hình Máy Tính Tiền & Thiết Bị Đồng Bộ */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#198754]">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cấu Hình Máy Tính Tiền &amp; Thiết Bị Đồng Bộ
                </h2>
                <p className="text-xs text-slate-500">
                  Kết nối phần cứng tại quầy thu ngân để tự động gom nhật ký thu chi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Device 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/70">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#198754] shadow-xs shrink-0 border border-slate-200">
                    <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        Máy In Bill &amp; POS Quầy Ca
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Trực tuyến
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Trạng thái: <strong className="text-slate-900 font-medium">Đã kết nối quầy 1</strong> • LAN:{' '}
                      <span className="font-mono text-slate-800 font-semibold">192.168.1.105:9100</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => alert('Gửi tín hiệu Ping đến máy in 192.168.1.105:9100 -> Thành công (độ trễ 4ms)')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">sync</span>
                    Kiểm Tra
                  </button>
                  <button
                    onClick={() => alert('Mở bảng cấu hình cổng IP LAN máy in...')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs transition-colors border border-slate-200 cursor-pointer"
                    type="button"
                  >
                    Cấu Hình IP
                  </button>
                </div>
              </div>

              {/* Device 2: Auto Merge Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-200/70">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-xs shrink-0 border border-slate-200">
                    <span className="material-symbols-outlined text-[20px]">call_merge</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        Tự động gộp hóa đơn trùng (MERGED)
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        Khuyên dùng
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gộp mã QR VietQR và hoá đơn in POS phát sinh trong vòng 60s để tránh tính trùng.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoMerge}
                      onChange={(e) => setAutoMerge(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#198754]"></div>
                  </label>
                </div>
              </div>

              {/* Device 3: Cloud Backup */}
              <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-200/70">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-xs shrink-0 border border-slate-200">
                    <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Sao lưu đám mây thời gian thực
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dữ liệu doanh thu từng ca được mã hóa AES-256 lưu trữ song song về kho máy chủ.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#198754] px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200">
                  BẬT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Store Presence & Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Cơ Sở Hoạt Động */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#198754] text-[20px]">store</span>
              <h3 className="text-base font-bold">Cơ Sở Hoạt Động</h3>
            </div>

            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80"
                alt={storeName || 'Cửa hàng'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between">
                <span className="text-xs font-bold truncate">
                  {storeName}
                </span>
                <span className="text-[11px] bg-emerald-600/90 px-2 py-0.5 rounded text-white font-bold">
                  Quận 1, HCM
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Thời gian mở quầy:</span>
                <span className="font-semibold text-slate-800">06:00 - 22:30 hàng ngày</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Tổng số hóa đơn tháng:</span>
                <span className="font-bold text-[#198754] font-mono">1.482 đơn</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Cán bộ phụ trách thuế:</span>
                <span className="font-semibold text-slate-800">Chi cục Thuế Q1</span>
              </div>
            </div>
          </div>

          {/* Card 2: Bảo Mật & Phiên Đăng Nhập */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">security</span>
              <h3 className="text-base font-bold">Bảo Mật &amp; Phiên Đăng Nhập</h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#198754] text-[18px]">
                    phone_android
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">
                      iPhone 14 Pro Max
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Đang hoạt động • TP. HCM
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#198754] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Thiết bị chính
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">
                    desktop_windows
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">
                      Chrome trên Windows 11
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Cửa hàng Quầy 1 (Phiên này)
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            <button
              onClick={() => alert('Mở popup đổi mật khẩu quản trị bảo mật 2 lớp...')}
              className="w-full text-center text-xs font-bold text-[#198754] hover:underline pt-1 cursor-pointer"
              type="button"
            >
              Đổi mật khẩu cổng quản trị
            </button>
          </div>

          {/* Card 3: Notice VNeID */}
          <div className="rounded-2xl p-4 bg-amber-50/80 text-amber-900 flex items-start gap-2.5 border border-amber-200/70">
            <span className="material-symbols-outlined text-amber-600 shrink-0 text-[18px]">info</span>
            <p className="text-xs leading-relaxed">
              Mọi thay đổi về <span className="font-bold">Mã số thuế</span> hoặc{' '}
              <span className="font-bold">Chủ hộ</span> sẽ được đối chiếu lại tự động với dữ liệu đăng ký kinh doanh quốc gia qua định danh điện tử VNeID.
            </p>
          </div>
        </div>
      </div>

      {/* In-flow Bottom Action Card (Natural layout, completely non-blocking) */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            Thông tin đã được đồng bộ với cơ sở dữ liệu sổ kế toán đám mây.
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Đăng xuất</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white shadow-sm hover:shadow transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${saving ? 'animate-spin' : ''}`}>
              {saving ? 'sync' : 'save'}
            </span>
            <span>{saving ? 'Đang lưu...' : 'Lưu Cài Đặt Cửa Hàng'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#198754] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

