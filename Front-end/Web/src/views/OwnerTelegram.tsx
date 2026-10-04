import React, { useState } from 'react';
import { telegramHistory } from '../data/mockData';
import { UserAccount } from '../components/AuthModal';

interface OwnerTelegramProps {
  currentUser?: UserAccount | null;
}

export const OwnerTelegram: React.FC<OwnerTelegramProps> = ({ currentUser }) => {
  const [fields, setFields] = useState({
    summary: true,
    netCash: true,
    topExpenses: true,
    cashDiscrepancy: true,
    excelAttachment: true,
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [toastTime, setToastTime] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handleTestSend = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    setToastTime(timeStr);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 5000);
  };

  const handleInstantSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      handleTestSend();
    }, 800);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner - Streamlined and balanced */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                Hệ thống đồng bộ tự động
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Đã kết nối Bot: @VikeSoAccountingBot
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                <span className="material-symbols-outlined text-[13px] text-[#059669]">bolt</span>
                WebHook 2.4 Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Báo Cáo Tự Động Qua Telegram
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Tự động tổng hợp dữ liệu chốt ca sổ sách, phát hiện chênh lệch đối soát và bắn bản kê định dạng tài chính chuẩn xác tới máy chủ Telegram cá nhân của chủ hộ kinh doanh.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
            <div className="flex flex-col items-end px-3.5 py-1.5 rounded-xl bg-slate-50 text-right border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Lần gửi kế tiếp
              </span>
              <span className="text-sm font-bold text-[#059669] font-mono">
                Hôm nay 22:00:00
              </span>
            </div>
            <button
              onClick={handleInstantSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              type="button"
            >
              <span className={`material-symbols-outlined text-[16px] ${syncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>
                {syncing ? 'Đang gửi...' : 'Đồng Bộ Ngay'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Config Left (7 cols), Phone Live Preview Right (5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Configuration & Security */}
        <div className="xl:col-span-7 space-y-6">
          {/* Card 1: Channel & Schedule Config */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#059669]">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Cấu Hình Lịch &amp; Kênh Nhận Tin
                  </h2>
                  <span className="text-xs text-slate-500">
                    Thiết lập tham số điều phối chốt phiên mỗi đêm
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200">
                Trạng thái: Kích hoạt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1.5 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 uppercase font-bold">
                    Khung Giờ Bắn Tin Hàng Ngày
                  </span>
                  <span className="material-symbols-outlined text-[#059669] text-[16px]">schedule</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    22:00
                  </span>
                  <span className="text-xs text-slate-400">Hàng đêm (GMT+7)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Tự động kích hoạt ngay sau khi thu ngân khóa ca và ký nhận tiền tồn két.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1.5 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 uppercase font-bold">
                    Nhóm Telegram Đích
                  </span>
                  <span className="material-symbols-outlined text-indigo-600 text-[16px]">group</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    Ban Quản Lý {currentUser?.shopName || currentUser?.storeName || 'Cửa Hàng'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ID Kênh: -100234819
                  </span>
                </div>
                <div className="pt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] text-[#059669] font-semibold">
                    Quyền Bot: Quản Trị Viên (Gửi Tin + File)
                  </span>
                </div>
              </div>
            </div>

            {/* Checkbox fields - compact and cleanly spaced */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Trường Dữ Liệu Chốt Sổ Trong Bản Tin
                </span>
                <span className="text-xs text-slate-400">
                  Tối ưu đọc trên điện thoại
                </span>
              </div>

              <div className="space-y-2">
                {/* 1 */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 transition-colors cursor-pointer hover:bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={fields.summary}
                      onChange={(e) => setFields({ ...fields, summary: e.target.checked })}
                      className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] accent-[#059669] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        Tóm tắt Tổng Tiền Vào &amp; Tiền Ra trong ngày
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Doanh thu bán lẻ, tiền thu hồi công nợ và chi phí vận hành
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#059669] font-bold shrink-0">Bắt buộc</span>
                </label>

                {/* 2 */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 transition-colors cursor-pointer hover:bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={fields.netCash}
                      onChange={(e) => setFields({ ...fields, netCash: e.target.checked })}
                      className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] accent-[#059669] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        Dòng tiền ròng thực tế tồn két cuối ngày
                      </span>
                      <span className="text-[11px] text-slate-500">
                        So chiếu số dư tiền mặt trong ngăn kéo và tài khoản ngân hàng
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#059669] font-bold shrink-0">Bắt buộc</span>
                </label>

                {/* 3 */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 transition-colors cursor-pointer hover:bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={fields.topExpenses}
                      onChange={(e) => setFields({ ...fields, topExpenses: e.target.checked })}
                      className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] accent-[#059669] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        Top 3 khoản chi lớn nhất cần chú ý
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tách riêng công nợ NCC hoặc chi phí bất thường vượt định mức
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold shrink-0">Khuyến nghị</span>
                </label>

                {/* 4 */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 transition-colors cursor-pointer hover:bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={fields.cashDiscrepancy}
                      onChange={(e) => setFields({ ...fields, cashDiscrepancy: e.target.checked })}
                      className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] accent-[#059669] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        Cảnh báo chênh lệch hóa đơn bán lẻ và phiếu kết ca POS
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tự động cảnh báo nếu tỷ lệ lệch vượt mức 0.5% tổng doanh thu
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-600 font-bold shrink-0">Bảo vệ quỹ</span>
                </label>

                {/* 5 */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 transition-colors cursor-pointer hover:bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={fields.excelAttachment}
                      onChange={(e) => setFields({ ...fields, excelAttachment: e.target.checked })}
                      className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] accent-[#059669] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        Đính kèm tập tin Excel sao kê ngày tự động (.XLSX)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sheet chi tiết từng đơn và nhật ký sửa/xóa hóa đơn của thu ngân
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold shrink-0">Định dạng nén</span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleTestSend}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Gửi Thử Tin Nhắn Báo Cáo Ngay</span>
              </button>

              <button
                onClick={() => alert('Đang mở trình liên kết Bot Telegram với nhóm quản lý...')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                type="button"
              >
                <span className="material-symbols-outlined text-slate-500 text-[16px]">
                  settings_ethernet
                </span>
                <span>Thay đổi kênh</span>
              </button>
            </div>

            {/* Test feedback toast */}
            {toastVisible && (
              <div className="p-3 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-between border border-emerald-200 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span className="text-xs font-semibold">
                    Đã gửi tin thử nghiệm thành công tới Telegram: @Ban Quản Lý {currentUser?.shopName || currentUser?.storeName || 'Cửa Hàng'} lúc {toastTime}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">
                  HTTP 200 OK
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Security & Fiduciary */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#059669]">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cơ Chế Bảo Mật &amp; Xác Thực Fiduciary
                  </h3>
                  <span className="text-xs text-slate-500">
                    Tiêu chuẩn mã hóa đường truyền viễn thông
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">TLS 1.3 / AES-256</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/70">
                <div className="flex items-center gap-1 text-[#059669]">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  <span className="text-[10px] font-bold uppercase">Token Độc Quyền</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Mỗi cơ sở dùng 1 Bot Token riêng biệt, chỉ xử lý báo cáo được chỉ định.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/70">
                <div className="flex items-center gap-1 text-[#059669]">
                  <span className="material-symbols-outlined text-[15px]">history_toggle_off</span>
                  <span className="text-[10px] font-bold uppercase">Tự Động Thử Lại</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nếu mạng chập chờn, cơ chế hàng đợi sẽ gửi lại 3 lần cách nhau 60s.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/70">
                <div className="flex items-center gap-1 text-indigo-600">
                  <span className="material-symbols-outlined text-[15px]">lock_reset</span>
                  <span className="text-[10px] font-bold uppercase">Ẩn Số Dư Nhạy Cảm</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tùy chọn che giấu số dư tiền két nếu mở tin nhắn nơi đông người.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Telegram Phone Live Preview (contained, no overflow) */}
        <div className="xl:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#059669] text-[18px]">phone_iphone</span>
              <span className="text-xs sm:text-sm text-slate-900 font-bold">
                Mô Phỏng Trực Quan Tin Nhắn (Live Preview)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Telegram Preview
            </span>
          </div>

          {/* Scaled and Contained Phone Frame */}
          <div className="relative mx-auto w-full max-w-sm rounded-[2.5rem] p-2.5 bg-slate-900 shadow-2xl border-4 border-slate-800">
            {/* Phone Speaker Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-[#0e1621] text-[#ffffff] flex flex-col h-[520px]">
              {/* Telegram top bar */}
              <div className="pt-6 pb-2.5 bg-[#17212b] px-3.5 flex items-center justify-between z-10 shadow-sm border-b border-[#242f3d]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7e8e9f] text-[18px] cursor-pointer">
                    arrow_back
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#059669] flex items-center justify-center font-bold text-[10px] text-white">
                    VS
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-bold leading-tight flex items-center gap-1">
                      VikeSo Accounting Bot
                      <span className="material-symbols-outlined text-[#4db3f7] text-[13px]">
                        verified
                      </span>
                    </span>
                    <span className="text-[10px] text-[#4db3f7]">
                      bot • trực tuyến
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[#7e8e9f]">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </div>
              </div>

              {/* Chat conversation area with customized scroll */}
              <div
                className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#0e1621] text-xs"
                style={{
                  backgroundImage: 'radial-gradient(#1e2c3a 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <div className="flex justify-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#182533]/80 text-[#798b9c] text-[10px]">
                    Hôm nay, 24 Tháng 10
                  </span>
                </div>

                <div className="flex items-start gap-2 max-w-[98%]">
                  <div className="w-6 h-6 rounded-full bg-[#059669] shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow mt-0.5">
                    VK
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="rounded-2xl rounded-tl-sm bg-[#182533] p-3 shadow-md space-y-2 text-[#e4ecf2] border border-[#2b394a]/40">
                      {/* Message header */}
                      <div className="flex items-center justify-between pb-1 border-b border-[#2b394a]">
                        <div className="flex items-center gap-1 text-[#4db3f7] text-xs font-bold">
                          <span>📊 BÁO CÁO CHỐT CA NGÀY</span>
                          <span className="font-mono">24/10/2024</span>
                        </div>
                      </div>

                      {/* Store meta */}
                      <div className="space-y-0.5 text-[11px]">
                        <div className="text-[#8ca0b3] font-medium flex items-center gap-1">
                          <span>🏪</span> {currentUser?.shopName || currentUser?.storeName || (currentUser?.role === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh')}
                        </div>
                        <div className="text-[#647587]">
                          Khóa sổ: 22:00:01 • Thu ngân: Nguyễn Hồng Mai
                        </div>
                      </div>

                      {/* Cash overview numbers */}
                      <div className="py-1 space-y-1 font-mono font-tabular text-[11px]">
                        <div className="flex justify-between items-center px-2 py-1 rounded bg-[#101b26]">
                          <span className="text-[#4caf50] font-bold">🟢 TỔNG TIỀN VÀO:</span>
                          <span className="text-[#4caf50] font-bold font-tabular">+15.450.000 đ</span>
                        </div>
                        <div className="flex justify-between items-center px-2 py-1 rounded bg-[#101b26]">
                          <span className="text-[#ff5252] font-bold">🔴 TỔNG TIỀN RA:</span>
                          <span className="text-[#ff5252] font-bold font-tabular">-4.200.000 đ</span>
                        </div>
                        <div className="flex justify-between items-center px-2 py-1.5 rounded bg-[#1d2d3e]">
                          <span className="text-[#ffd54f] font-bold flex items-center gap-1">
                            ⚡ DÒNG TIỀN RÒNG:
                          </span>
                          <span className="text-[#ffd54f] font-bold text-xs font-tabular">+11.250.000 đ</span>
                        </div>
                      </div>

                      {/* Top 3 Expenses */}
                      <div className="pt-0.5 space-y-1">
                        <span className="text-[10px] text-[#8ca0b3] font-bold uppercase tracking-wider block">
                          📌 Top 3 khoản chi lớn:
                        </span>
                        <ol className="space-y-1 text-[11px] text-[#c8d6e5]">
                          <li className="flex justify-between items-center pl-1 border-l-2 border-[#ff5252]/60">
                            <span>1. Đại lý nước giải khát</span>
                            <span className="font-mono font-tabular font-semibold text-[#ff5252]">3.200.000 đ</span>
                          </li>
                          <li className="flex justify-between items-center pl-1 border-l-2 border-[#ff5252]/40">
                            <span>2. Nhập bao bì túi xốp</span>
                            <span className="font-mono font-tabular font-semibold text-[#ff5252]">600.000 đ</span>
                          </li>
                          <li className="flex justify-between items-center pl-1 border-l-2 border-[#ff5252]/20">
                            <span>3. Tiền điện cửa hàng</span>
                            <span className="font-mono font-tabular font-semibold text-[#ff5252]">280.000 đ</span>
                          </li>
                        </ol>
                      </div>

                      {/* POS reconcile check */}
                      <div className="p-1.5 rounded bg-[#11231f] flex items-center justify-between text-[11px] border border-[#059669]/30">
                        <span className="text-[#4caf50] font-semibold flex items-center gap-1">
                          <span>✅</span> Đối soát máy tính tiền:
                        </span>
                        <span className="text-[#4caf50] font-bold">100% khớp ca</span>
                      </div>

                      {/* Attached file item */}
                      <div
                        onClick={() => alert('Đang mở file sao kê: BangKe_24102024.xlsx')}
                        className="mt-1.5 p-1.5 rounded-lg bg-[#202e3e] flex items-center gap-2 cursor-pointer hover:bg-[#253648] transition-colors border border-[#2b394a]"
                      >
                        <div className="w-7 h-7 rounded bg-[#059669]/20 flex items-center justify-center text-[#4caf50]">
                          <span className="material-symbols-outlined text-[16px]">table_chart</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-white font-bold truncate">
                            BangKe_24102024.xlsx
                          </div>
                          <div className="text-[10px] text-[#798b9c]">
                            142.5 KB • Bảng kê sổ cái
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[#4db3f7] text-[16px]">
                          download
                        </span>
                      </div>

                      {/* Timestamp & checks */}
                      <div className="flex items-center justify-end gap-1 pt-0.5 text-[10px] text-[#657688]">
                        <span>22:00</span>
                        <span className="material-symbols-outlined text-[12px] text-[#4db3f7]">
                          done_all
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readonly bottom bar */}
              <div className="h-10 bg-[#17212b] px-3 flex items-center justify-between text-[#7e8e9f] border-t border-[#242f3d]">
                <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                <div className="flex-1 mx-2.5 px-2.5 py-1 rounded-full bg-[#242f3d] text-[11px] text-[#6e7e8e] truncate">
                  Tin nhắn chỉ đọc từ hệ thống tự động...
                </div>
                <span className="material-symbols-outlined text-[18px]">mic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: 5 Most Recent Dispatch Logs (Cleanly separated) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#059669]">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nhật Ký 5 Phiên Bắn Tin Tự Động Gần Nhất
              </h2>
              <span className="text-xs text-slate-500">
                Lịch sử thực thi chốt ca lúc 22:00:02 mỗi đêm với tỷ lệ giao nhận thành công 100%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Độ trễ TB: 182ms
            </span>
            <button
              onClick={() => handleTestSend()}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Làm mới"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Thời Gian Gửi</th>
                <th className="py-2.5 px-3 font-semibold">Ngày Chốt Phiên</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tổng Tiền Vào</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tổng Tiền Ra</th>
                <th className="py-2.5 px-3 font-semibold text-right">Dòng Tiền Ròng</th>
                <th className="py-2.5 px-3 font-semibold">Tập Tin Sao Kê</th>
                <th className="py-2.5 px-3 font-semibold text-center">Trạng Thái Telegram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {telegramHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs">
                    {item.sendTime.split(' ')[0]}{' '}
                    <span className="text-[#059669] font-bold">{item.sendTime.split(' ')[1]}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.shift}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-[#059669] font-bold">
                    {item.inflow}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-rose-600 font-semibold">
                    {item.outflow}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-slate-900 font-bold">
                    {item.net}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      onClick={() => alert(`Đang tải tập tin: ${item.file}`)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-[#059669] cursor-pointer font-mono text-xs font-medium"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#059669]">
                        description
                      </span>
                      {item.file}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-[11px] font-bold border border-emerald-200">
                      <span className="material-symbols-outlined text-[13px]">done_all</span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2 text-slate-400 text-xs border-t border-slate-100">
          <span>
            Hiển thị 5/5 phiên gửi gần nhất theo thứ tự thời gian
          </span>
          <button
            onClick={() => alert('Mở đầy đủ nhật ký 30 ngày qua...')}
            className="text-[#059669] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span>Xem toàn bộ lịch sử 30 ngày</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

