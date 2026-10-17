import React, { useState, useEffect } from 'react';
import {
  fetchUserProfile,
  updateNotificationSettings,
  triggerTestReport,
  fetchTelegramHistory,
  TelegramDispatchLog,
} from '../services/api';
import { UserAccount } from '../components/AuthModal';

interface OwnerTelegramProps {
  currentUser?: UserAccount | null;
}

export const OwnerTelegram: React.FC<OwnerTelegramProps> = ({ currentUser }) => {
  const [hasTelegram, setHasTelegram] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    receiveTelegram: true,
    receiveEmail: true,
    receiveInApp: true,
  });
  const [history, setHistory] = useState<TelegramDispatchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUserData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        fetchUserProfile(currentUser.id),
        fetchTelegramHistory(currentUser.id),
      ]);

      if (profileRes.success) {
        setHasTelegram(profileRes.hasTelegram);
        if (profileRes.settings) {
          setSettings({
            receiveTelegram: profileRes.settings.receiveTelegram ?? true,
            receiveEmail: profileRes.settings.receiveEmail ?? true,
            receiveInApp: profileRes.settings.receiveInApp ?? true,
          });
        }
      }
      setHistory(historyRes);
    } catch (err) {
      console.error('Lỗi khi tải thông tin Telegram:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser?.id]);

  // Handle Save Settings
  const handleSaveSettings = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      const res = await updateNotificationSettings(currentUser.id, settings);
      if (res.success) {
        showToast('Đã lưu cấu hình thông báo thành công!');
      } else {
        showToast(res.message || 'Lỗi khi lưu cài đặt', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Trigger Manual Test Report
  const handleTestReport = async () => {
    setIsTesting(true);
    try {
      const res = await triggerTestReport({
        email: currentUser?.email,
        sendZeroReports: true,
      });

      if (res.success) {
        showToast('Báo cáo đã được hệ thống gửi thành công tới kênh của bạn!');
        // Refresh history
        if (currentUser?.id) {
          const freshHistory = await fetchTelegramHistory(currentUser.id);
          setHistory(freshHistory);
        }
      } else {
        showToast(res.message || 'Không thể gửi báo cáo thử nghiệm', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi báo cáo', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const telegramBotUrl = `https://t.me/VikeSoAccountingBot?start=${currentUser?.id || ''}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tự Động Hóa Kế Toán
            </span>
            <span className="text-slate-300">•</span>
            {hasTelegram ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d0f81b] text-slate-950 text-xs font-black border border-[#bde412]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4783] animate-pulse"></span>
                Đã kết nối Telegram Bot (@VikeSoAccountingBot)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Chưa kích hoạt Telegram Bot
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Báo Cáo Tự Động Qua Telegram &amp; Kênh Thông Báo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Tự động tổng hợp số liệu thu chi cả ngày, đối soát chéo hóa đơn và gửi báo cáo kết ca kèm file Excel bảng kê trực tiếp vào tài khoản Telegram của bạn mỗi đêm lúc <strong>22:00</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleTestReport}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-bold shadow-sm shadow-[#ff4783]/20 transition-all cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
              {isTesting ? 'sync' : 'send'}
            </span>
            <span>{isTesting ? 'Đang gửi báo cáo...' : 'Bắn Báo Cáo Thử Nghiệm'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bot Connection & Instructions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Bot Link Status */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Liên Kết Bot Telegram (@VikeSoAccountingBot)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kênh nhận tin riêng tư của chủ hộ kinh doanh
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                  hasTelegram
                    ? 'bg-[#d0f81b] text-slate-950 border-[#bde412]'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {hasTelegram ? 'Đang Hoạt Động' : 'Chờ Kích Hoạt'}
              </span>
            </div>

            {hasTelegram ? (
              <div className="p-4 rounded-xl bg-[#d0f81b]/20 border border-[#bde412] text-slate-950 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff4783] text-[20px]">check_circle</span>
                  <span className="text-sm font-black">Tài khoản Telegram của bạn đã liên kết thành công!</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  Mỗi đêm lúc <strong>22:00:00 (GMT+7)</strong>, hệ thống VikeSo sẽ tự động phân tích sổ quỹ trong ngày của cửa hàng <strong>{currentUser?.shopName || 'Cửa hàng'}</strong> và gửi tin nhắn tóm tắt kèm file Excel bảng kê chi tiết vào Telegram của bạn.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">info</span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block text-sm">
                      Hướng dẫn 2 bước kích hoạt nhận báo cáo:
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600">
                      <li>
                        Nhấn vào nút <strong>"Mở Bot Telegram"</strong> bên dưới hoặc tìm kiếm bot <strong>@VikeSoAccountingBot</strong> trên ứng dụng Telegram.
                      </li>
                      <li>
                        Nhấn nút <strong>Start</strong> hoặc gửi lệnh: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900 font-mono font-bold">/start {currentUser?.id}</code>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={telegramBotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Mở Bot Telegram Ngay</span>
                  </a>
                </div>
              </div>
            )}

            {/* Notification Schedule Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Khung giờ gửi báo cáo</span>
                  <span className="material-symbols-outlined text-[#ff4783] text-[16px]">schedule</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">22:00</div>
                <p className="text-[11px] text-slate-500">Tự động chốt phiên và khóa sổ mỗi đêm (GMT+7)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Tập tin đính kèm</span>
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">description</span>
                </div>
                <div className="text-base font-bold text-slate-900 font-mono">BangKe_Ngay.xlsx</div>
                <p className="text-[11px] text-slate-500">Định dạng bảng tính kế toán mở được trên điện thoại</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notification Channel Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Kênh Tiếp Nhận Báo Cáo</h2>
                <p className="text-xs text-slate-500">Bật/tắt theo nhu cầu nhận thông báo của bạn</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Toggle 1: Telegram */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Báo cáo qua Telegram
                    </span>
                    <span className="text-[11px] text-slate-500">Bản tin tóm tắt lúc 22:00</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.receiveTelegram}
                  onChange={(e) => setSettings({ ...settings, receiveTelegram: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ff4783] focus:ring-[#ff4783] accent-[#ff4783] cursor-pointer"
                />
              </label>

              {/* Toggle 2: Email */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Báo cáo qua Email
                    </span>
                    <span className="text-[11px] text-slate-500">Gửi tới {currentUser?.email || 'email của bạn'}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.receiveEmail}
                  onChange={(e) => setSettings({ ...settings, receiveEmail: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ff4783] focus:ring-[#ff4783] accent-[#ff4783] cursor-pointer"
                />
              </label>

              {/* Toggle 3: In-App */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
                    <span className="material-symbols-outlined text-[18px]">notifications</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Thông báo trong ứng dụng
                    </span>
                    <span className="text-[11px] text-slate-500">Cảnh báo tức thời trên Web &amp; Mobile</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.receiveInApp}
                  onChange={(e) => setSettings({ ...settings, receiveInApp: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ff4783] focus:ring-[#ff4783] accent-[#ff4783] cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
              type="button"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSaving ? 'animate-spin' : ''}`}>
                {isSaving ? 'sync' : 'save'}
              </span>
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt Thông Báo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Real Shift Dispatch Logs Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Lịch Sử Báo Cáo Kết Ca Của Cửa Hàng
            </h2>
            <p className="text-xs text-slate-500">
              Danh sách các phiên kết ca tự động kèm file bảng kê kế toán đã xuất
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Tự động cập nhật sau mỗi ca chốt sổ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-200/80">
                <th className="py-3 px-4">Thời Gian Gửi</th>
                <th className="py-3 px-4">Ca Làm Việc</th>
                <th className="py-3 px-4 text-right">Tổng Tiền Vào</th>
                <th className="py-3 px-4 text-right">Tổng Tiền Ra</th>
                <th className="py-3 px-4 text-right">Tồn Quỹ Thực Tế</th>
                <th className="py-3 px-4">Tập Tin Đính Kèm</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Chưa có lịch sử báo cáo kết ca nào. Hệ thống sẽ tự động gửi ca đầu tiên lúc 22:00.
                  </td>
                </tr>
              ) : (
                history.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 text-xs">
                      {log.sendTime}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.shift}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-tabular text-[#ff4783] font-black">
                      {log.inflow}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-tabular text-slate-800 font-bold">
                      {log.outflow}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-tabular text-slate-900 font-black">
                      {log.net}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 hover:text-[#ff4783] font-mono text-xs font-semibold cursor-pointer">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">table_chart</span>
                        {log.file}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d0f81b]/35 text-slate-950 text-[11px] font-black border border-[#bde412]">
                        <span className="material-symbols-outlined text-[13px] text-slate-950">done_all</span>
                        <span>Đã Gửi Thành Công</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
