import React, { useState } from 'react';
import { UserAccount } from '../components/AuthModal';

interface AdminSettingsProps {
  currentUser?: UserAccount | null;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser }) => {
  const [sliderVal, setSliderVal] = useState(95);
  const [duplicateFilter, setDuplicateFilter] = useState(true);
  const [cronTime, setCronTime] = useState('22:00:00 (GMT+7)');
  const [rateLimit, setRateLimit] = useState(25);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200/80">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200 uppercase tracking-wider">
              Hạ tầng phân tán • VikeSo Core v4.2
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Cụm GPU AI Online
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
              <span className="material-symbols-outlined text-[15px] text-purple-600">manage_accounts</span>
              <span>{currentUser?.name || 'Admin'}</span>
              <span className="text-slate-400">({currentUser?.email || 'test@example.com'})</span>
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Cài Đặt Hệ Thống &amp; Cấu Hình Máy Chủ AI VikeSo
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Thiết lập tham số nhận diện thị giác máy tính, điều phối tải Telegram Bot và theo dõi hạn mức cụm máy chủ.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => showToast('Đang phát lệnh khởi động lại cụm container OCR GPU...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-rose-600 transition-all shadow-xs cursor-pointer text-xs font-bold border border-slate-200"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>Khởi động lại GPU</span>
          </button>

          <button
            onClick={() => showToast('Cấu hình vận hành AI & Telegram đã lưu thành công!')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#198754] hover:bg-[#146c43] text-white font-bold shadow-xs hover:shadow transition-all text-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Lưu Cấu Hình</span>
          </button>
        </div>
      </div>

      {/* Grid: AI Parameters Left (7 cols), Telegram & Resource Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (7 cols): AI Engine & OCR Parameters */}
        <section className="lg:col-span-7 space-y-4">
          {/* Card 1: AI Parameters */}
          <div className="p-4 sm:p-5 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#198754] border border-emerald-100">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Tham Số Bóc Tách Trí Tuệ Nhân Tạo (AI Engine)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cân chỉnh ngưỡng xác thực tự động OCR/NLP qua mô hình phân tầng rủi ro.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wide uppercase border border-emerald-200">
                Model: VK-Vision-Pro
              </span>
            </div>

            {/* Green slider card */}
            <div className="space-y-2 p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#198754]"></span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Ngưỡng tin cậy đèn xanh (Auto-Post)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">
                    Tự động ghi sổ:
                  </span>
                  <span className="text-sm font-bold text-[#198754] font-mono">
                    &gt; {sliderVal}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Giao dịch có độ chính xác trên ngưỡng này được hệ thống phê duyệt tức thì mà không cần sự can thiệp thủ công.
              </p>

              <div className="pt-1">
                <input
                  type="range"
                  min="85"
                  max="99"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  aria-label="Ngưỡng tin cậy đèn xanh"
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#198754]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-medium">
                  <span>85% (Rộng)</span>
                  <span className="font-bold text-[#198754]">95% (Chuẩn vận hành)</span>
                  <span>99% (Khắt khe)</span>
                </div>
              </div>
            </div>

            {/* 2 Sub threshold cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 flex flex-col justify-between space-y-2 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-slate-900">
                      Ngưỡng đèn vàng (Cảnh báo)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                    80% - 95%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tạo phiếu tạm và gắn nhãn "Chờ thẩm định" gửi tới nhóm Telegram kế toán nội bộ.
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-3/4"></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 flex flex-col justify-between space-y-2 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-bold text-slate-900">
                      Ngưỡng đèn đỏ (Khóa duyệt)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-rose-600 border border-slate-200">
                    &lt; 80%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Yêu cầu chụp lại ảnh rõ nét; ngăn chặn hành vi tải ảnh mờ nhòe gây sai lệch sổ cái.
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-1/4"></div>
                </div>
              </div>
            </div>

            {/* Duplicate Filter Toggle */}
            <div className="p-3.5 rounded-lg bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/60">
              <div className="space-y-0.5 max-w-xl">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#198754] text-[17px]">filter_alt</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Bộ lọc chống trùng lặp song song (Duplicate Filter)
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đối chiếu số hóa đơn, mốc thời gian và tổng thanh toán với POS trước khi nạp.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={duplicateFilter}
                  onChange={(e) => setDuplicateFilter(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#198754]"></div>
                <span
                  className={`ml-2 text-xs font-bold ${
                    duplicateFilter ? 'text-[#198754]' : 'text-slate-400'
                  }`}
                >
                  {duplicateFilter ? 'BẬT' : 'TẮT'}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Right Column (5 cols): Telegram Schedule & Resource Monitoring */}
        <aside className="lg:col-span-5 space-y-4">
          {/* Card 1: Telegram Schedule Config */}
          <div className="p-4 sm:p-5 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <span className="material-symbols-outlined text-[18px]">schedule_send</span>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Lịch Chốt Sổ Telegram Tự Động
                </h2>
                <p className="text-xs text-slate-500">
                  Phân luồng bản tin định kỳ và chống nghẽn Telegram API.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 space-y-1.5 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Khung giờ chạy định kỳ hằng đêm
                  </label>
                  <span className="material-symbols-outlined text-slate-400 text-[15px]">
                    nightlight
                  </span>
                </div>
                <input
                  type="text"
                  value={cronTime}
                  onChange={(e) => setCronTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg text-xs text-slate-900 font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-slate-200 shadow-xs"
                />
                <div className="flex items-center gap-1.5 text-[#198754] text-[10px] font-medium">
                  <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
                  <span>Cloudflare Worker Edge Network phân luồng</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 space-y-1.5 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Tốc độ giới hạn gửi tin Telegram
                  </label>
                  <span className="material-symbols-outlined text-slate-400 text-[15px]">speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 bg-white rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-slate-200 shadow-xs"
                  />
                  <span className="text-xs text-slate-500 font-semibold">
                    tin nhắn / giây
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Resource Monitoring & Hardware */}
          <div className="p-4 sm:p-5 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#198754]">
                  <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Giám Sát Tài Nguyên Hệ Thống
                </h2>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* OCR Metric */}
              <div className="p-2.5 rounded-lg bg-slate-50 space-y-1 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Máy chủ OCR
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    99.8% Online
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900 font-mono">
                    1.2
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    s / ảnh
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#198754] h-full rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>

              {/* Quota Metric */}
              <div className="p-2.5 rounded-lg bg-slate-50 space-y-1 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Dung lượng
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold font-mono">
                    42.5/500 GB
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900 font-mono">
                    8.5%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    đã dùng
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '8.5%' }}></div>
                </div>
              </div>
            </div>

            {/* Infrastructure List */}
            <div className="space-y-1.5 pt-0.5">
              <h3 className="text-[10px] text-slate-700 uppercase font-bold tracking-wider">
                Cụm Hạ Tầng Vận Hành
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="text-slate-800 font-medium text-xs">Node GPU T4</span>
                  <span className="text-[10px] text-emerald-700 font-bold">ONLINE</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="text-slate-800 font-medium text-xs">Workers Edge</span>
                  <span className="text-[10px] text-emerald-700 font-bold">READY</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="text-slate-800 font-medium text-xs">Kho S3 WebP</span>
                  <span className="text-[10px] text-slate-500 font-bold">SYNCED</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating notify */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl animate-bounce text-xs font-semibold">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

