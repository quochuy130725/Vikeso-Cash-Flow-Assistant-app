import React, { useState, useMemo } from 'react';
import { businessHouseholds } from '../data/mockData';
import { UserAccount } from '../components/AuthModal';

interface AdminOverviewProps {
  currentUser?: UserAccount | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'pro' | 'free'>('all');
  const [timeView, setTimeView] = useState<'30days' | 'quarter'>('30days');

  const filteredHouseholds = useMemo(() => {
    return businessHouseholds.filter((hh) => {
      if (planFilter !== 'all' && hh.plan !== planFilter) return false;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        return (
          hh.ownerName.toLowerCase().includes(query) ||
          hh.phone.toLowerCase().includes(query) ||
          hh.storeName.toLowerCase().includes(query) ||
          hh.businessType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [planFilter, searchTerm]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">
      {/* Top Banner: Founder Executive Cockpit - Compact & Balanced */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold border border-purple-200 uppercase tracking-wider">
              Bảng điều hành sáng lập
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Nền Tảng Đám Mây Doanh Nghiệp
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">badge</span>
              <span>{currentUser?.name || 'Admin'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                {currentUser?.role || 'ADMIN'}
              </span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 text-xs hidden md:inline">
              {currentUser?.email || 'test@example.com'}
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="text-slate-600 text-xs font-semibold hidden lg:inline">
              {currentUser?.shopName || currentUser?.storeName || 'Admin Quản Trị'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan Vận Hành Nền Tảng VikeSo
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">OCR Engine:</span>
              <span className="text-emerald-700 font-bold">99.8% ổn định</span>
            </div>
          </div>

          <button
            onClick={() => alert('Xuất file nhật ký dòng tiền toàn nền tảng Excel (.xlsx)...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer shadow-indigo-600/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Xuất Nhật Ký Hệ Thống</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards - Compact & Well-proportioned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:border-slate-300 transition-all gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Tổng số hộ kinh doanh
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <span className="material-symbols-outlined text-[17px]">storefront</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono font-tabular">
                1.248
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                hộ
              </span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              <span>+18.4% tháng này</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:border-slate-300 transition-all gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Cửa hàng mới tuần này
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <span className="material-symbols-outlined text-[17px]">domain_add</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono font-tabular">
                18
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                hộ mới
              </span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium border border-slate-200">
              <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
              <span>Tỷ lệ hoàn tất 92%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:border-slate-300 transition-all gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Doanh thu thuê bao (MRR)
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <span className="material-symbols-outlined text-[17px]">payments</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight font-mono font-tabular">
                84.051.000
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                đ
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <span className="font-bold text-slate-900">849 hộ</span> dùng Gói Pro (99k)
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:border-slate-300 transition-all gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Tỷ lệ chuyển đổi trả phí
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <span className="material-symbols-outlined text-[17px]">pie_chart</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono font-tabular">
                68.0%
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                Đạt mục tiêu
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              399 Free / <span className="font-semibold text-purple-700">849 Pro</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden flex">
            <div className="bg-purple-600 h-full" style={{ width: '68%' }}></div>
            <div className="bg-slate-300 h-full" style={{ width: '32%' }}></div>
          </div>
        </div>
      </div>

      {/* Visual Charts: OCR Vision Pipeline & Subscription / Churn Risk Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (8 cols): OCR SVG Line Chart with Dual Metrics & Operational Diagnostics */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-4.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  Khối Lượng Bóc Tách Hóa Đơn (OCR Pipeline)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI Realtime
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Tải trọng thị giác máy tính, phát hiện tắc nghẽn giờ cao điểm và hóa đơn cần xử lý
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
              <button
                onClick={() => setTimeView('30days')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  timeView === '30days'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                30 ngày
              </button>
              <button
                onClick={() => setTimeView('quarter')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  timeView === 'quarter'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                Theo quý
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar directly above chart for fast diagnosis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                Hợp lệ tự động
              </span>
              <span className="text-sm font-extrabold text-indigo-600 font-tabular">4.666 (96.8%)</span>
              <span className="text-[9px] text-slate-400">&lt; 1.2s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Ảnh mờ / Chờ soát
              </span>
              <span className="text-sm font-extrabold text-amber-600 font-tabular">154 (3.2%)</span>
              <span className="text-[9px] text-amber-600 font-medium">⚠️ Ca tối (20h-22h)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500">Độ trễ trung bình</span>
              <span className="text-sm font-extrabold text-slate-800 font-tabular">1.18 giây</span>
              <span className="text-[9px] text-indigo-600 font-semibold">⚡ Nhanh hơn 14%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500">Đỉnh tải GPU</span>
              <span className="text-sm font-extrabold text-purple-700 font-tabular">84%</span>
              <span className="text-[9px] text-slate-500">Khung 11h-13h &amp; 19h-21h</span>
            </div>
          </div>

          {/* Inline SVG Line Chart with Dual Line (Valid vs Error) and Peak Markers */}
          <div className="relative w-full h-48 sm:h-52 pt-1">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 700 200"
            >
              <defs>
                <linearGradient id="areaGradientAdmin" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25"></stop>
                  <stop offset="85%" stopColor="#4f46e5" stopOpacity="0.04"></stop>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="errorGradientAdmin" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22"></stop>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>

              {/* Grid lines with labels */}
              <line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="700" y1="30" y2="30"></line>
              <line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="700" y1="80" y2="80"></line>
              <line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="700" y1="130" y2="130"></line>
              <line stroke="#e2e8f0" strokeWidth="1" x1="0" x2="700" y1="185" y2="185"></line>

              {/* Peak load highlight band */}
              <rect x="520" y="20" width="180" height="165" fill="#f8fafc" opacity="0.6" rx="6"></rect>
              <text x="530" y="32" fill="#94a3b8" fontSize="9" fontWeight="600">ĐỢT CAO ĐIỂM ĐẦU THÁNG</text>

              {/* Gradient Area for Main Success Volume */}
              <polygon
                fill="url(#areaGradientAdmin)"
                points="0,165 50,150 100,155 150,125 200,135 250,105 300,90 350,110 400,75 450,65 500,80 550,45 600,40 650,25 700,18 700,185 0,185"
              ></polygon>

              {/* Main Curve Line (Valid Invoices) */}
              <polyline
                fill="none"
                points="0,165 50,150 100,155 150,125 200,135 250,105 300,90 350,110 400,75 450,65 500,80 550,45 600,40 650,25 700,18"
                stroke="#4f46e5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.2"
              ></polyline>

              {/* Error / Blurred Curve Line */}
              <polyline
                fill="none"
                points="0,182 50,181 100,183 150,180 200,179 250,177 300,176 350,178 400,174 450,173 500,175 550,170 600,169 650,166 700,164"
                stroke="#f59e0b"
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeWidth="2.2"
              ></polyline>

              {/* Active Data Points */}
              <circle cx="300" cy="90" fill="#ffffff" r="4.5" stroke="#4f46e5" strokeWidth="2.5"></circle>
              <circle cx="550" cy="45" fill="#ffffff" r="4.5" stroke="#4f46e5" strokeWidth="2.5"></circle>
              <circle cx="700" cy="18" fill="#4f46e5" r="5.5" stroke="#ffffff" strokeWidth="2.5"></circle>

              {/* Error points */}
              <circle cx="550" cy="170" fill="#ffffff" r="3.5" stroke="#f59e0b" strokeWidth="2"></circle>
              <circle cx="700" cy="164" fill="#f59e0b" r="4" stroke="#ffffff" strokeWidth="1.5"></circle>
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 text-slate-400 text-[11px] border-t border-slate-100 flex-wrap gap-2">
            <span>Ngày 01 (1.820 ảnh)</span>
            <span>Ngày 07 (2.450 ảnh)</span>
            <span>Ngày 14 (3.100 ảnh)</span>
            <span>Ngày 21 (3.920 ảnh)</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600">Hôm nay: 4.666 thành công</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-amber-600">154 ảnh mờ</span>
            </div>
          </div>

          {/* AI Operational Diagnosis & Action Alert Banner - Compact */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50/70 via-purple-50/40 to-slate-50 border border-amber-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <div className="flex flex-col text-xs text-slate-700">
                <span className="font-bold text-slate-900 text-xs">
                  Chẩn Đoán OCR AI &amp; Khuyến Nghị Vận Hành
                </span>
                <span className="mt-0.5 text-[11px]">
                  Tỷ lệ ảnh mờ tăng <strong>1.8% tại nhóm F&amp;B</strong> ca tối (20h30-22h). Bot Telegram đã bật nhắc tự động bật flash.
                </span>
                <span className="mt-0.5 text-[11px] text-slate-500">
                  GPU Worker Pool đạt đỉnh <strong>84% lúc 12h30</strong>. Tự động scale 2 pods, độ trễ giữ vững &lt; 1.2s.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => alert('Đang mở danh sách 154 hóa đơn gắn cờ ảnh mờ cần rà soát!')}
                className="px-2.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">checklist</span>
                Xử lý 154 ảnh mờ
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Subscription Breakdown & Churn Risk Action Cockpit */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-4.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Cơ Cấu Thuê Bao &amp; Rủi Ro</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Phân bố hộ KD và cảnh báo tài khoản sắp rời bỏ
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              Churn: 2.8%
            </span>
          </div>

          {/* Visual Donut Gauge - Compact & Balanced */}
          <div className="flex flex-col items-center justify-center py-0.5">
            <div className="relative w-24 h-24 rounded-full border-4 border-purple-600 flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-transparent border-r-transparent rotate-45"></div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-extrabold text-slate-900 font-mono">68.0%</span>
                <span className="text-[9px] text-purple-700 font-bold uppercase tracking-wider">Gói Pro</span>
                <span className="text-[9px] text-slate-400">849/1.248 hộ</span>
              </div>
            </div>
          </div>

          {/* Tier Counts */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/60 border border-purple-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-purple-600"></span>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-900 font-bold">
                    Gói Chuyên Nghiệp (Pro)
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">
                    99k/tháng • 84M MRR
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-purple-800 font-mono">849 hộ</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-slate-400"></span>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-900 font-bold">
                    Gói Miễn Phí (Free Tier)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Tối đa 30 bill/tháng
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 font-mono">399 hộ</span>
            </div>
          </div>

          {/* Problem Diagnostics & Action Trigger Boxes */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* Churn Warning Box */}
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-rose-800 font-bold text-xs">
                  <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
                  24 hộ Pro hết hạn 7 ngày
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded font-mono">
                  2.376.000 đ
                </span>
              </div>
              <p className="text-[10px] text-rose-700 leading-tight">
                Chưa bật gia hạn tự động. Cần nhắc nộp phí để giữ MRR.
              </p>
              <button
                type="button"
                onClick={() => alert('Đã gửi thông báo nhắc gia hạn kèm mã QR qua Bot Telegram tới 24 hộ!')}
                className="w-full py-1 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[12px]">send</span>
                Gửi nhắc phí Telegram (24 hộ)
              </button>
            </div>

            {/* Upsell Opportunity Box */}
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-emerald-900 font-bold text-xs">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">trending_up</span>
                  142 hộ Free chạm 25+ bill
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                  Tiềm năng cao
                </span>
              </div>
              <p className="text-[10px] text-indigo-900 leading-tight">
                Giao dịch đều đặn, sẵn sàng nâng cấp 99k/tháng.
              </p>
              <button
                type="button"
                onClick={() => alert('Đã gửi voucher ưu đãi giảm 20% gói Pro tháng đầu tới 142 hộ tiềm năng!')}
                className="w-full py-1 px-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[12px]">loyalty</span>
                Gửi ưu đãi kích hoạt Pro (142 hộ)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Registered Business Households - Compact & Crisp */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Quản Lý Hộ Kinh Doanh Mới Đăng Ký
            </h2>
            <span className="text-[11px] text-slate-500">
              Danh mục cửa hàng, tình trạng kết nối Telegram bot và gói dịch vụ
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên chủ, SĐT, cửa hàng..."
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 rounded-lg font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 border border-slate-200 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Toolbar Filter pills */}
        <div className="bg-slate-50/70 px-4 sm:px-5 py-2 border-b border-slate-100 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setPlanFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              planFilter === 'all'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            type="button"
          >
            Tất cả (1.248)
          </button>

          <button
            onClick={() => setPlanFilter('pro')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              planFilter === 'pro'
                ? 'bg-purple-700 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            type="button"
          >
            Gói Chuyên Nghiệp (849)
          </button>

          <button
            onClick={() => setPlanFilter('free')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              planFilter === 'free'
                ? 'bg-slate-700 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            type="button"
          >
            Gói Miễn Phí (399)
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-2.5 px-4 sm:px-5">Chủ Hộ &amp; SĐT</th>
                <th className="py-2.5 px-4 sm:px-5">Cửa Hàng / Ngành Nghề</th>
                <th className="py-2.5 px-4 sm:px-5">Ngày Tham Gia</th>
                <th className="py-2.5 px-4 sm:px-5">Gói Dịch Vụ</th>
                <th className="py-2.5 px-4 sm:px-5">Kích Hoạt Telegram</th>
                <th className="py-2.5 px-4 sm:px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {filteredHouseholds.map((hh) => (
                <tr key={hh.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 sm:px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{hh.ownerName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {hh.phone}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-4 sm:px-5">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{hh.storeName}</span>
                      <span className="text-[11px] text-slate-400">
                        {hh.businessType}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-4 sm:px-5 text-slate-500 text-xs">
                    {hh.joinDate}
                  </td>

                  <td className="py-2.5 px-4 sm:px-5">
                    {hh.plan === 'pro' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-100">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        Chuyên Nghiệp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                        Miễn Phí
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 sm:px-5">
                    {hh.telegramStatus === 'active' && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Đã Kích Hoạt
                      </span>
                    )}
                    {hh.telegramStatus === 'waiting' && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        Chờ Kết Nối
                      </span>
                    )}
                    {hh.telegramStatus === 'error' && (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Lỗi Bot
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 sm:px-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => alert(`Xem hồ sơ chi tiết của ${hh.ownerName} (${hh.storeName})`)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                        type="button"
                      >
                        Chi tiết
                      </button>

                      {hh.plan === 'pro' ? (
                        <button
                          onClick={() => alert(`Gia hạn gói Chuyên Nghiệp cho ${hh.storeName}`)}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
                          type="button"
                        >
                          Gia hạn
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Nâng cấp gói Chuyên Nghiệp cho ${hh.storeName}`)}
                          className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          type="button"
                        >
                          Nâng cấp
                        </button>
                      )}

                      <button
                        onClick={() => alert(`Cảnh báo: Khóa tạm thời tài khoản ${hh.ownerName}?`)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Khóa tạm thời"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 px-4 sm:px-5 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500">
          <span>Hiển thị 5 trên tổng số 1.248 hộ kinh doanh đang đồng bộ</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="p-1 rounded-md bg-white text-slate-400 disabled:opacity-40 border border-slate-200"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>
            <span className="px-2 py-0.5 font-bold text-slate-800 text-xs">Trang 1 / 250</span>
            <button
              onClick={() => alert('Chuyển trang 2...')}
              className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
