import React, { useState, useEffect } from 'react';
import { fetchServerHealth, triggerTestReport, changeUserPassword } from '../services/api';
import { UserAccount } from '../components/AuthModal';

interface AdminSettingsProps {
  currentUser?: UserAccount | null;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser }) => {
  // Server Health state
  const [healthStatus, setHealthStatus] = useState<string>('Đang kiểm tra...');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string>('');
  const [isPinging, setIsPinging] = useState(false);

  // Test report state
  const [isTestingReport, setIsTestingReport] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pingServer = async () => {
    setIsPinging(true);
    try {
      const res = await fetchServerHealth();
      setHealthStatus(res.status === 'ok' ? '200 OK (Bình Thường)' : 'Lỗi kết nối');
      setLatencyMs(res.latencyMs);
      setLastPingTime(new Date().toLocaleTimeString('vi-VN'));
    } catch {
      setHealthStatus('Không thể kết nối máy chủ');
      setLatencyMs(null);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    pingServer();
  }, []);

  // Trigger manual test report
  const handleTestCronReport = async () => {
    setIsTestingReport(true);
    try {
      const res = await triggerTestReport({
        email: currentUser?.email,
        sendZeroReports: true,
      });

      if (res.success) {
        showToast('Đã kích hoạt gửi báo cáo ngày 22:00 thử nghiệm thành công!');
      } else {
        showToast(res.message || 'Lỗi gửi báo cáo', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setIsTestingReport(false);
    }
  };

  // Change Admin Password
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
      const res = await changeUserPassword({ oldPassword, newPassword });
      if (res.success) {
        showToast('Đổi mật khẩu Quản trị viên thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Mật khẩu cũ không chính xác', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi đổi mật khẩu', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hệ Thống &amp; Cấu Hình
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-700 font-semibold">
              Quản trị viên: <strong className="text-slate-900">{currentUser?.name || 'Admin'}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-[#d0f81b] border border-slate-900"></span>
              Máy chủ Render &amp; Atlas Online
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Giám Sát Hạ Tầng &amp; Cài Đặt Hệ Thống VikeSo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-sm">
            Theo dõi độ trễ API thực tế, kiểm soát tiến trình gửi báo cáo tự động lúc 22:00, webhook SePay và quản lý bảo mật quyền Admin.
          </p>
        </div>

        <button
          onClick={pingServer}
          disabled={isPinging}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
          type="button"
        >
          <span className={`material-symbols-outlined text-[16px] text-white ${isPinging ? 'animate-spin' : ''}`}>
            network_ping
          </span>
          <span>{isPinging ? 'Đang ping...' : 'Kiểm Tra Ping API'}</span>
        </button>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Real Infrastructure Health & Cron Automation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real Server Health Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Trạng Thái Kết Nối Máy Chủ Thực Tế</h2>
                  <p className="text-xs text-slate-500">Đo trực tiếp qua endpoint GET /api/health</p>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-[#d0f81b] text-slate-950 border border-[#bde412]">
                TRỰC TUYẾN
              </span>
            </div>

            {/* Flat health stats layout (no nested cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Trạng Thái HTTP</span>
                <div className="text-sm font-extrabold text-slate-900">{healthStatus}</div>
                <span className="text-xs text-slate-500 block">Endpoint /api/health</span>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Độ Trễ Phản Hồi</span>
                <div className="text-xl font-extrabold text-[#b01755] font-mono tabular-nums">
                  {latencyMs !== null ? `${latencyMs} ms` : '...'}
                </div>
                <span className="text-xs text-slate-500 block">Lúc {lastPingTime || 'Vừa xong'}</span>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cơ Sở Dữ Liệu</span>
                <div className="text-sm font-extrabold text-slate-900">MongoDB Atlas</div>
                <span className="text-xs text-emerald-700 font-bold block">✓ Đã kết nối</span>
              </div>
            </div>
          </div>

          {/* Cron Job & Automation Dispatch Card (Flat layout without nested card wrapper) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">alarm</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Tiến Trình Chạy Ngầm (Cron Service)</h2>
                <p className="text-xs text-slate-500">Quản lý lịch bắn báo cáo kết ca tự động hàng đêm</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d0f81b] border border-slate-900"></span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Báo cáo kết ca ngày tự động (Daily Report)
                  </span>
                </div>
                <span className="text-xs font-black text-slate-950 bg-[#d0f81b] px-2 py-0.5 rounded border border-[#bde412] font-mono tabular-nums">
                  22:00:00 (GMT+7)
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                Hệ thống cronService tự động kích hoạt mỗi đêm lúc 22:00, gom toàn bộ hóa đơn của từng hộ kinh doanh, tạo file Excel bảng kê và gửi vào Telegram/Email của họ.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-slate-500">
                  Dùng để kiểm thử ngay lập tức mà không cần đợi đến 22:00:
                </span>
                <button
                  type="button"
                  onClick={handleTestCronReport}
                  disabled={isTestingReport}
                  className="h-9 px-3.5 rounded-lg bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isTestingReport ? 'animate-spin' : ''}`}>
                    {isTestingReport ? 'sync' : 'send'}
                  </span>
                  <span>{isTestingReport ? 'Đang gửi...' : 'Gửi Thử Báo Cáo Ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Webhook Integrations & Admin Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Webhook Endpoints Status Card (Flat divided rows, no nested cards) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">webhook</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Cổng Tích Hợp Webhook</h2>
                <p className="text-xs text-slate-500">Các điểm cuối kết nối cổng dịch vụ thứ ba</p>
              </div>
            </div>

            <div className="space-y-4 pt-1 divide-y divide-slate-100 text-xs">
              <div className="space-y-1.5 pt-1 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">SePay VietQR Webhook</span>
                  <span className="text-xs font-black text-slate-950 bg-[#d0f81b]/40 px-2 py-0.5 rounded border border-[#bde412]">
                    Hoạt Động
                  </span>
                </div>
                <code className="text-xs font-mono text-slate-700 block bg-slate-50 p-2 rounded border border-slate-200/70 break-all">
                  POST /api/billing/sepay/webhook
                </code>
                <span className="text-xs text-slate-500 block">Xác thực bằng API-Key bảo mật</span>
              </div>

              <div className="space-y-1.5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Telegram Bot Webhook</span>
                  <span className="text-xs font-black text-slate-950 bg-[#d0f81b]/40 px-2 py-0.5 rounded border border-[#bde412]">
                    Hoạt Động
                  </span>
                </div>
                <code className="text-xs font-mono text-slate-700 block bg-slate-50 p-2 rounded border border-slate-200/70 break-all">
                  POST /api/telegram/webhook
                </code>
                <span className="text-xs text-slate-500 block">Đăng ký tự động với máy chủ Telegram API</span>
              </div>
            </div>
          </div>

          {/* Admin Change Password Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Bảo Mật Tài Khoản Admin</h2>
                <p className="text-xs text-slate-500">Đổi mật khẩu tài khoản quản trị viên</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="admin_old_pass">
                  Mật khẩu hiện tại *
                </label>
                <input
                  id="admin_old_pass"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu admin hiện tại"
                  className="w-full h-9.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="admin_new_pass">
                  Mật khẩu mới *
                </label>
                <input
                  id="admin_new_pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-9.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="admin_confirm_pass">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  id="admin_confirm_pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full h-9.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
              >
                <span className={`material-symbols-outlined text-[16px] ${isChangingPassword ? 'animate-spin' : ''}`}>
                  {isChangingPassword ? 'sync' : 'key'}
                </span>
                <span>{isChangingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Admin'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

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
              toastMessage.type === 'error' ? 'text-rose-500' : 'text-[#b01755]'
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
