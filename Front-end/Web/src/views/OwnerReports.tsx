import React, { useState } from 'react';
import { UserAccount } from '../components/AuthModal';

interface OwnerReportsProps {
  currentUser?: UserAccount | null;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export const OwnerReports: React.FC<OwnerReportsProps> = ({
  currentUser,
  onExportPdf,
  onExportExcel,
}) => {
  const [period, setPeriod] = useState<'oct' | 'sep' | 'q3' | 'custom'>('oct');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownload = (name: string) => {
    setToastMessage(`Đang kết xuất ${name}...`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Primary Actions */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] uppercase tracking-wider font-bold border border-emerald-200">
              Hệ thống sổ kế toán chuẩn
            </span>
            <span className="text-xs text-slate-400 font-medium">• Kỳ khóa sổ định kỳ</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">storefront</span>
              <span>{currentUser?.shopName || currentUser?.storeName || (currentUser?.role === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh')}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-600 font-medium">
              Chủ hộ: <strong className="text-slate-900">{currentUser?.name || (currentUser?.role === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}</strong>
            </span>
            {currentUser?.email && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500">
                  {currentUser.email}
                </span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo Cáo Tài Chính &amp; Xuất Dữ Liệu Thuế
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Tổng hợp dữ liệu sổ sách thu chi cho hộ kinh doanh <strong className="text-slate-800">{currentUser?.shopName || currentUser?.storeName || (currentUser?.role === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh')}</strong>, xác thực hóa đơn tự động và kết xuất biểu mẫu theo quy chuẩn chi cục thuế.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => {
              onExportPdf();
              handleDownload('file PDF lưu trữ định dạng chuẩn TT88');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-rose-600 text-[18px]">
              picture_as_pdf
            </span>
            <span>Xuất file PDF lưu trữ</span>
          </button>

          <button
            onClick={() => {
              onExportExcel();
              handleDownload('bảng kê Excel thuế đầy đủ');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 border border-[#bde412] text-xs sm:text-sm font-black shadow-sm hover:shadow transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Xuất file Excel đầy đủ</span>
          </button>
        </div>
      </section>

      {/* 2. Filter & Period Switcher (Eliminated horizontal scrollbar, fully responsive) */}
      <section className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setPeriod('oct')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              period === 'oct'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            type="button"
          >
            Tháng này (Tháng 10/2024)
          </button>

          <button
            onClick={() => setPeriod('sep')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              period === 'sep'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            type="button"
          >
            Tháng trước (Tháng 9/2024)
          </button>

          <button
            onClick={() => setPeriod('q3')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              period === 'q3'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            type="button"
          >
            Quý III/2024
          </button>

          <button
            onClick={() => setPeriod('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              period === 'custom'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            type="button"
          >
            Tùy chọn ngày
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500 font-medium shrink-0">
          <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
          <span>Dữ liệu từ 01/10/2024 đến 31/10/2024</span>
        </div>
      </section>

      {/* 3. 3 Key Performance Indicator Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Tiền Vào */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Tổng Tiền Vào Trong Kỳ
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
                384.500.000 <span className="text-xs font-semibold text-slate-400">đ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span>
                  +14.2%
                </span>
                <span className="text-xs text-slate-400 font-medium">so với tháng trước</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>328 lượt giao dịch thu</span>
            <span className="font-semibold text-emerald-700">Hóa đơn tự động: 99.4%</span>
          </div>
        </div>

        {/* Card 2: Tiền Ra */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Tổng Tiền Ra Trong Kỳ
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
                298.150.000 <span className="text-xs font-semibold text-slate-400">đ</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                  Chiếm 77.5% tổng thu
                </span>
                <span className="text-xs font-medium text-emerald-700">Kiểm soát tốt hàng nhập</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>142 khoản chi kho</span>
            <span className="font-medium text-slate-700">Chi lớn nhất: Tiền hàng sỉ</span>
          </div>
        </div>

        {/* Card 3: Dòng Tiền Ròng Tích Lũy */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Dòng Tiền Ròng Tích Lũy
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono font-tabular tracking-tight">
                +86.350.000 <span className="text-xs font-semibold text-slate-400">đ</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  Biên lợi nhuận ~22.5%
                </span>
                <span className="text-xs text-slate-400 font-medium">Tiền mặt an toàn</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tỷ lệ tích lũy: Đạt KH</span>
            <span className="font-bold text-emerald-600">Khả năng tái vốn tốt</span>
          </div>
        </div>
      </section>

      {/* 4. Analytical Visualizations: Bar chart & Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Comparison Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Xu Hướng Tiền Vào vs Tiền Ra (4 Tuần)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Thặng dư +86.35M
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Đối chiếu diễn biến doanh thu, chi phí và mức thanh khoản thực tế tích lũy qua từng tuần
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#059669]"></span>
                <span className="text-xs font-semibold text-slate-700">Tiền vào</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-xs font-semibold text-slate-700">Tiền ra</span>
              </div>
            </div>
          </div>

          {/* Quick Net Surplus Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400">Tuần 1 (01-07)</span>
              <span className="text-xs font-bold text-emerald-700">+17.0M</span>
              <span className="text-[9px] text-slate-500">Tỷ lệ chi: 80.0%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400">Tuần 2 (08-14)</span>
              <span className="text-xs font-bold text-emerald-700">+18.0M</span>
              <span className="text-[9px] text-slate-500">Tỷ lệ chi: 80.4%</span>
            </div>
            <div className="flex flex-col bg-amber-50/80 rounded-lg p-1 border border-amber-200/60">
              <span className="text-[10px] font-bold text-amber-800">Tuần 3 (15-21) ⚠️</span>
              <span className="text-xs font-extrabold text-amber-700">+23.0M</span>
              <span className="text-[9px] text-amber-800 font-semibold">Chi đỉnh: 81.0M</span>
            </div>
            <div className="flex flex-col bg-emerald-50/80 rounded-lg p-1 border border-emerald-200/60">
              <span className="text-[10px] font-bold text-emerald-800">Tuần 4 (22-31) 🏆</span>
              <span className="text-xs font-extrabold text-emerald-700">+28.35M</span>
              <span className="text-[9px] text-emerald-800 font-semibold">Tối ưu nhất: 72.6%</span>
            </div>
          </div>

          {/* Chart Visual Canvas */}
          <div className="w-full pt-2">
            <svg className="w-full h-56" fill="none" viewBox="0 0 600 200">
              {/* Grid lines */}
              <line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="580" y1="20" y2="20" />
              <line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="580" y1="70" y2="70" />
              <line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="580" y1="120" y2="120" />
              <line stroke="#e2e8f0" strokeWidth="1" x1="40" x2="580" y1="170" y2="170" />

              {/* Axis Values */}
              <text fill="#94a3b8" fontSize="10" fontWeight="500" textAnchor="end" x="34" y="24">120M</text>
              <text fill="#94a3b8" fontSize="10" fontWeight="500" textAnchor="end" x="34" y="74">80M</text>
              <text fill="#94a3b8" fontSize="10" fontWeight="500" textAnchor="end" x="34" y="124">40M</text>
              <text fill="#94a3b8" fontSize="10" fontWeight="500" textAnchor="end" x="34" y="174">0</text>

              {/* Week 1: In 85M (y=63), Out 68M (y=85) */}
              <rect fill="#059669" height="107" rx="4" width="34" x="90" y="63" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 1 Tiền vào: 85.000.000 đ</title>
              </rect>
              <text fill="#059669" fontSize="10" fontWeight="700" textAnchor="middle" x="107" y="55">85M</text>

              <rect fill="#ef4444" height="85" rx="4" width="34" x="130" y="85" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 1 Tiền ra: 68.000.000 đ</title>
              </rect>
              <text fill="#ef4444" fontSize="10" fontWeight="700" textAnchor="middle" x="147" y="78">68M</text>
              <text fill="#475569" fontSize="11" fontWeight="600" textAnchor="middle" x="127" y="188">Tuần 1</text>

              {/* Week 2: In 92M (y=55), Out 74M (y=77) */}
              <rect fill="#059669" height="115" rx="4" width="34" x="220" y="55" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 2 Tiền vào: 92.000.000 đ</title>
              </rect>
              <text fill="#059669" fontSize="10" fontWeight="700" textAnchor="middle" x="237" y="47">92M</text>

              <rect fill="#ef4444" height="93" rx="4" width="34" x="260" y="77" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 2 Tiền ra: 74.000.000 đ</title>
              </rect>
              <text fill="#ef4444" fontSize="10" fontWeight="700" textAnchor="middle" x="277" y="70">74M</text>
              <text fill="#475569" fontSize="11" fontWeight="600" textAnchor="middle" x="257" y="188">Tuần 2</text>

              {/* Week 3: In 104M (y=40), Out 81M (y=69) */}
              <rect fill="#059669" height="130" rx="4" width="34" x="350" y="40" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 3 Tiền vào: 104.000.000 đ</title>
              </rect>
              <text fill="#059669" fontSize="10" fontWeight="700" textAnchor="middle" x="367" y="32">104M</text>

              <rect fill="#ef4444" height="101" rx="4" width="34" x="390" y="69" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 3 Tiền ra: 81.000.000 đ</title>
              </rect>
              <text fill="#ef4444" fontSize="10" fontWeight="700" textAnchor="middle" x="407" y="61">81M</text>
              <text fill="#475569" fontSize="11" fontWeight="600" textAnchor="middle" x="387" y="188">Tuần 3</text>

              {/* Week 4: In 103.5M (y=41), Out 75.15M (y=76) */}
              <rect fill="#059669" height="129" rx="4" width="34" x="480" y="41" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 4 Tiền vào: 103.500.000 đ</title>
              </rect>
              <text fill="#059669" fontSize="10" fontWeight="700" textAnchor="middle" x="497" y="33">103.5M</text>

              <rect fill="#ef4444" height="94" rx="4" width="34" x="520" y="76" className="transition-all hover:opacity-90 cursor-pointer">
                <title>Tuần 4 Tiền ra: 75.150.000 đ</title>
              </rect>
              <text fill="#ef4444" fontSize="10" fontWeight="700" textAnchor="middle" x="537" y="68">75.15M</text>
              <text fill="#475569" fontSize="11" fontWeight="600" textAnchor="middle" x="517" y="188">Tuần 4</text>
            </svg>
          </div>

          {/* AI Early Warning Callout Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">crisis_alert</span>
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Cảnh báo điểm nghẽn dòng tiền Tuần 3:</span> Chi phí vọt lên <strong>81.0M (chiếm 77.9% doanh thu)</strong> do dồn tiền nhập bia và đồ uống giá sỉ. Lượng hàng tồn kho này hiện đủ bán cho 18 ngày tới. Đề xuất: <em>Giãn chu kỳ nhập hàng sang tuần 2 tháng 11</em> để không làm cạn kiệt thanh khoản tiền mặt dự phòng.
            </div>
          </div>
        </div>

        {/* Spending Breakdown & Leakage Diagnostics */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Cơ Cấu Tiền Ra &amp; Rủi Ro Chi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Phân tích rủi ro vượt định mức ngành</p>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Tổng chi: 298.15M
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* 75% Goods -> 212.0 of 282.7 */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="#ef4444"
                  strokeDasharray="212.0 282.7"
                  strokeDashoffset="0"
                  strokeWidth="11"
                />
                {/* 12% Personnel -> 33.9 */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="#7e22ce"
                  strokeDasharray="33.9 282.7"
                  strokeDashoffset="-212.0"
                  strokeWidth="11"
                />
                {/* 8% Utilities -> 22.6 */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="#f59e0b"
                  strokeDasharray="22.6 282.7"
                  strokeDashoffset="-245.9"
                  strokeWidth="11"
                />
                {/* 5% Shipping -> 14.1 */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="#3b82f6"
                  strokeDasharray="14.1 282.7"
                  strokeDashoffset="-268.5"
                  strokeWidth="11"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Nhập hàng
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  75.0%
                </span>
                <span className="text-[9px] text-rose-600 font-bold">Vượt chuẩn 8%</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 flex-1 w-full">
              <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Nhập hàng hóa
                  </span>
                  <span className="font-extrabold text-rose-700 font-mono">75% (223.6M)</span>
                </div>
                <span className="text-[10px] text-rose-700 pl-4 font-medium">⚠️ Cao hơn chuẩn F&amp;B (62-68%)</span>
              </div>

              <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>Nhân sự &amp; Ca làm
                  </span>
                  <span className="font-extrabold text-purple-700 font-mono">12% (35.8M)</span>
                </div>
                <span className="text-[10px] text-emerald-700 pl-4 font-medium">✓ Đạt định mức tối ưu (&lt;15%)</span>
              </div>

              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Điện nước viễn thông
                  </span>
                  <span className="font-extrabold text-amber-700 font-mono">8% (23.8M)</span>
                </div>
                <span className="text-[10px] text-amber-700 pl-4 font-medium">⚠️ Tăng 18% do tủ mát bia chạy tối đa</span>
              </div>

              <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Vận chuyển &amp; Chiết khấu
                  </span>
                  <span className="font-extrabold text-blue-700 font-mono">5% (14.9M)</span>
                </div>
                <span className="text-[10px] text-slate-500 pl-4 font-medium">Phí sàn giao hàng đối tác</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5 shrink-0">tips_and_updates</span>
            <span>
              <strong>Khuyến nghị tối ưu lợi nhuận:</strong> Giảm tỷ trọng hàng tồn trữ về ngưỡng 66% sẽ giải phóng ngay <strong>~26.800.000 VNĐ</strong> tiền mặt tự do vào tài khoản thanh toán của quán.
            </span>
          </div>
        </div>
      </section>

      {/* 5. Tax Compliance Section: Thông tư 88/2021/TT-BTC (Screenshot 2: Clean, legible, high-contrast) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Bảng Kê Doanh Thu Nghĩa Vụ Thuế Hộ Kinh Doanh
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Chuẩn TT 88/2021/TT-BTC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Phân loại doanh số chịu thuế GTGT &amp; TNCN áp dụng phương pháp kê khai hoặc khoán doanh thu.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            <span>Đầy đủ chứng từ chứng minh hợp lệ (348 hóa đơn đã kiểm tra)</span>
          </div>
        </div>

        {/* Data Ledger Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-3.5 px-4 text-center w-14">STT</th>
                <th className="py-3.5 px-6">Nhóm Ngành Nghề Kinh Doanh</th>
                <th className="py-3.5 px-6 text-center">Thuế Suất GTGT + TNCN</th>
                <th className="py-3.5 px-6 text-right">Doanh Số Tính Thuế</th>
                <th className="py-3.5 px-6 text-right">Số Thuế Tạm Tính</th>
                <th className="py-3.5 px-6 text-center">Trạng Thái Sổ Sách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-800">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-4 px-4 text-center font-mono font-bold text-slate-400">01</td>
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900 text-sm">
                    Bán buôn lẻ hàng tiêu dùng thiết yếu
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Bách hóa, sữa bỉm, thực phẩm bao gói
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    1.5% (1.0% GTGT + 0.5% TNCN)
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-mono font-tabular font-bold text-slate-900 text-sm">
                  269.150.000 đ
                </td>
                <td className="py-4 px-6 text-right font-mono font-tabular font-bold text-rose-600 text-sm">
                  4.037.250 đ
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Chuẩn hóa
                  </span>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-4 px-4 text-center font-mono font-bold text-slate-400">02</td>
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900 text-sm">
                    Phân phối sỉ hàng hóa đối tác địa phương
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Giao đại lý cấp 2, hộ kinh doanh xóm
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    1.0% (Phân phối sỉ đại lý)
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-mono font-tabular font-bold text-slate-900 text-sm">
                  115.350.000 đ
                </td>
                <td className="py-4 px-6 text-right font-mono font-tabular font-bold text-rose-600 text-sm">
                  1.153.500 đ
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Chuẩn hóa
                  </span>
                </td>
              </tr>

              {/* Summary Row */}
              <tr className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
                <td colSpan={3} className="py-4 px-6 text-slate-900 font-bold text-sm">
                  Tổng Cộng Doanh Thu &amp; Thuế Tạm Tính Toàn Cửa Hàng
                </td>
                <td className="py-4 px-6 text-right font-mono font-tabular font-extrabold text-emerald-600 text-base">
                  384.500.000 đ
                </td>
                <td className="py-4 px-6 text-right font-mono font-tabular font-extrabold text-rose-600 text-base">
                  5.190.750 đ
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    <span className="material-symbols-outlined text-[14px]">task_alt</span>
                    Sẵn sàng kê khai
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Downloadable Export Hub */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Trung Tâm Tải Mẫu Báo Cáo &amp; Sao Lưu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tập tin được mã hóa an toàn, định dạng sẵn tương thích với phần mềm kế toán và cổng nộp thuế điện tử.
            </p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[22px]">download_for_offline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1: Excel */}
          <div
            onClick={() => handleDownload('Bảng Kê Thu Chi Hàng Ngày (Excel .xlsx)')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between space-y-3 group cursor-pointer border border-slate-200/80 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#059669] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                  Bảng Kê Thu Chi Hàng Ngày (Excel)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Toàn bộ 470 dòng biến động tiền mặt, mã thanh toán &amp; phân loại mục đích.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2.5 text-xs text-slate-400 border-t border-slate-200/60 font-medium">
              <span>1.2 MB (.xlsx)</span>
              <span className="inline-flex items-center gap-1 text-[#059669] font-bold group-hover:underline">
                Tải file <span className="material-symbols-outlined text-[15px]">download</span>
              </span>
            </div>
          </div>

          {/* Item 2: PDF */}
          <div
            onClick={() => handleDownload('Báo Cáo Dòng Tiền Tháng (PDF .pdf)')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between space-y-3 group cursor-pointer border border-slate-200/80 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">analytics</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Báo Cáo Dòng Tiền Tháng (PDF)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bản in trình bày đồ họa rõ ràng, có sẵn chữ ký mẫu của chủ hộ ({currentUser?.name || (currentUser?.role === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}) và xác nhận.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2.5 text-xs text-slate-400 border-t border-slate-200/60 font-medium">
              <span>2.8 MB (.pdf)</span>
              <span className="inline-flex items-center gap-1 text-rose-600 font-bold group-hover:underline">
                Tải file <span className="material-symbols-outlined text-[15px]">download</span>
              </span>
            </div>
          </div>

          {/* Item 3: ZIP */}
          <div
            onClick={() => handleDownload('Tập Tin Sao Lưu Chứng Từ Ảnh AI (.zip)')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between space-y-3 group cursor-pointer border border-slate-200/80 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">folder_zip</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Tập Tin Sao Lưu Chứng Từ Ảnh AI
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ảnh chụp hóa đơn đã nhận diện OCR ký tự, gán nhãn theo từng ngày.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2.5 text-xs text-slate-400 border-t border-slate-200/60 font-medium">
              <span>45.4 MB (.zip)</span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-bold group-hover:underline">
                Tải gói <span className="material-symbols-outlined text-[15px]">cloud_download</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
