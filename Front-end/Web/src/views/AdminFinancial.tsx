import React, { useState, useMemo } from 'react';
import { subscriptionPayments } from '../data/mockData';

const monthlyUnitEconomics = [
  {
    key: 'T5',
    label: 'Tháng 5/2024 (Alpha)',
    shortMonth: 'Tháng 5',
    mrr: 12.0,
    cost: 1.8,
    grossProfit: 10.2,
    margin: 85.0,
    x: 110,
    mrrY: 223,
    costY: 246,
    badge: null,
  },
  {
    key: 'T6',
    label: 'Tháng 6/2024',
    shortMonth: 'Tháng 6',
    mrr: 28.0,
    cost: 2.6,
    grossProfit: 25.4,
    margin: 90.7,
    x: 270,
    mrrY: 187,
    costY: 244,
    badge: null,
  },
  {
    key: 'T7',
    label: 'Tháng 7/2024',
    shortMonth: 'Tháng 7',
    mrr: 35.0,
    cost: 3.2,
    grossProfit: 31.8,
    margin: 90.8,
    x: 430,
    mrrY: 171,
    costY: 243,
    badge: null,
  },
  {
    key: 'T8',
    label: 'Tháng 8/2024 (Ra mắt Bot)',
    shortMonth: 'Tháng 8',
    mrr: 52.0,
    cost: 4.4,
    grossProfit: 47.6,
    margin: 91.5,
    x: 590,
    mrrY: 133,
    costY: 240,
    badge: { text: '🚀 Ra mắt Bot Telegram (+48% MRR)', color: 'purple' },
  },
  {
    key: 'T9',
    label: 'Tháng 9/2024',
    shortMonth: 'Tháng 9',
    mrr: 68.0,
    cost: 5.5,
    grossProfit: 62.5,
    margin: 91.9,
    x: 750,
    mrrY: 97,
    costY: 238,
    badge: null,
  },
  {
    key: 'T10',
    label: 'Tháng 10/2024 (Hiện tại)',
    shortMonth: 'Tháng 10',
    mrr: 84.05,
    cost: 6.82,
    grossProfit: 77.23,
    margin: 91.8,
    x: 910,
    mrrY: 61,
    costY: 235,
    badge: { text: '⭐ Kỷ lục: 84.05M VNĐ', color: 'emerald' },
  },
];

import { UserAccount } from '../components/AuthModal';

interface AdminFinancialProps {
  currentUser?: UserAccount | null;
}

export const AdminFinancial: React.FC<AdminFinancialProps> = ({ currentUser }) => {
  const [period, setPeriod] = useState<'month' | 'q3' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(5);

  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return subscriptionPayments;
    const query = searchTerm.toLowerCase();
    return subscriptionPayments.filter(
      (p) =>
        p.storeName.toLowerCase().includes(query) ||
        p.invoiceId.toLowerCase().includes(query) ||
        p.planDescription.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const handleExportFinancialReport = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">
      {/* Top Executive Command Bar - Compact & Balanced */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold border border-purple-200 uppercase tracking-wider">
              Báo Cáo Ban Lãnh Đạo
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • Chu kỳ tài chính Q4/2024
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">badge</span>
              <span>{currentUser?.name || 'Admin'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                {currentUser?.role || 'ADMIN'}
              </span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 text-xs hidden sm:inline">
              {currentUser?.email || 'test@example.com'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Báo Cáo Tài Chính &amp; Doanh Thu Thuê Bao Nền Tảng
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Phân tích chỉ số tăng trưởng MRR, cơ cấu dòng tiền, hiệu suất biên lợi nhuận ròng AI VikeSo.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setPeriod('month')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                period === 'month'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Tháng này
            </button>
            <button
              onClick={() => setPeriod('q3')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                period === 'q3'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Quý 3
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                period === 'year'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Cả năm
            </button>
          </div>

          <button
            onClick={handleExportFinancialReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#198754] hover:bg-[#146c43] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Macro Executive KPIs (4 Cards Grid) - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: MRR */}
        <div className="p-3.5 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-2 group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Doanh Thu Thuê Bao Tháng
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#198754] flex items-center justify-center border border-emerald-100">
              <span className="material-symbols-outlined text-[17px]">payments</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              84.051.000 <span className="text-xs font-semibold text-slate-400">đ</span>
            </div>
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                +22.4%
              </div>
              <span className="text-[11px] text-slate-400">so tháng trước</span>
            </div>
          </div>
        </div>

        {/* Card 2: Paying Customers */}
        <div className="p-3.5 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-2 group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Tổng Hộ KD Trả Phí
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <span className="material-symbols-outlined text-[17px]">storefront</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              849 <span className="text-xs font-semibold text-slate-400">hộ</span>
            </div>
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100">
                <span className="material-symbols-outlined text-[12px]">pie_chart</span>
                Chiếm 68%
              </div>
              <span className="text-[11px] text-slate-400">tổng người dùng</span>
            </div>
          </div>
        </div>

        {/* Card 3: Cloud & AI Cost */}
        <div className="p-3.5 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-2 group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Chi Phí Hạ Tầng &amp; AI
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <span className="material-symbols-outlined text-[17px]">neurology</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              6.820.000 <span className="text-xs font-semibold text-slate-400">đ</span>
            </div>
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                <span className="material-symbols-outlined text-[12px]">shield</span>
                Biên LN: 91.8%
              </div>
              <span className="text-[11px] text-slate-400">Tối ưu chi phí</span>
            </div>
          </div>
        </div>

        {/* Card 4: LTV */}
        <div className="p-3.5 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-2 group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Giá Trị Vòng Đời (LTV)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <span className="material-symbols-outlined text-[17px]">loyalty</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              1.188.000 <span className="text-xs font-semibold text-slate-400">đ</span>
            </div>
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                <span className="material-symbols-outlined text-[12px]">autorenew</span>
                12 Tháng
              </div>
              <span className="text-[11px] text-slate-400">chu kỳ gắn bó</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Growth Chart Panel: Unit Economics & Gross Margin Health - Highly Intuitive & Visual */}
      <div className="p-4 sm:p-5 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-4">
        {/* Chart Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Tăng Trưởng MRR &amp; Đơn Vị Kinh Tế (Unit Economics)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Biên LN Gộp: 91.8%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh tương quan giữa Doanh thu định kỳ (MRR) và Chi phí GPU/Server AI thực tế từ T5/2024 đến T10/2024
            </p>
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-200 text-emerald-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#198754]"></span>
              <span>Doanh thu MRR</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50/70 border border-blue-200 text-blue-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Chi phí GPU &amp; Cloud</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50/70 border border-purple-200 text-purple-800 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-purple-600">rocket_launch</span>
              <span>Cột mốc Bot T8</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="w-full bg-slate-50/60 rounded-xl p-3.5 sm:p-4 relative border border-slate-200/70 space-y-3">
          {/* Active Data Inspector Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {monthlyUnitEconomics[activeMonthIdx].label}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Doanh thu:</span>
                <span className="font-bold text-[#198754] font-mono">
                  {monthlyUnitEconomics[activeMonthIdx].mrr.toLocaleString('vi-VN')}M VNĐ
                </span>
              </div>
              <span className="text-xs text-slate-300">|</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Chi phí GPU:</span>
                <span className="font-bold text-blue-600 font-mono">
                  {monthlyUnitEconomics[activeMonthIdx].cost.toLocaleString('vi-VN')}M VNĐ
                </span>
              </div>
              <span className="text-xs text-slate-300">|</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Lãi gộp:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  +{monthlyUnitEconomics[activeMonthIdx].grossProfit.toLocaleString('vi-VN')}M VNĐ
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  ({monthlyUnitEconomics[activeMonthIdx].margin}%)
                </span>
              </div>
            </div>

            {monthlyUnitEconomics[activeMonthIdx].badge ? (
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                monthlyUnitEconomics[activeMonthIdx].badge?.color === 'purple'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {monthlyUnitEconomics[activeMonthIdx].badge?.text}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">
                Di chuột vào biểu đồ để kiểm tra chi tiết
              </span>
            )}
          </div>

          {/* SVG Graphical Viewport with Complete Coordinate Grid & Data Labels */}
          <div className="w-full h-56 sm:h-64 relative">
            <svg
              className="w-full h-full overflow-visible select-none"
              preserveAspectRatio="none"
              viewBox="0 0 1000 290"
            >
              <defs>
                {/* Revenue Gradient */}
                <linearGradient id="mrrAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.32"></stop>
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.12"></stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"></stop>
                </linearGradient>

                {/* Gross Profit Band Gradient between MRR & Cost */}
                <linearGradient id="profitBandGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"></stop>
                  <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.08"></stop>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02"></stop>
                </linearGradient>

                {/* Cost Area Gradient */}
                <linearGradient id="costAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18"></stop>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"></stop>
                </linearGradient>

                {/* Drop shadow for point callouts */}
                <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* Y-Axis Horizontal Gridlines & Scale Labels (0 to 100M) */}
              {[
                { val: '100M', y: 35 },
                { val: '80M', y: 78 },
                { val: '60M', y: 122 },
                { val: '40M', y: 165 },
                { val: '20M', y: 208 },
                { val: '0 VNĐ', y: 252 },
              ].map((grid, idx) => (
                <g key={idx}>
                  <line
                    x1="65"
                    x2="975"
                    y1={grid.y}
                    y2={grid.y}
                    stroke={idx === 5 ? '#cbd5e1' : '#e2e8f0'}
                    strokeWidth={idx === 5 ? '1.5' : '1'}
                    strokeDasharray={idx === 5 ? '0' : '4 4'}
                  />
                  <text
                    x="55"
                    y={grid.y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {grid.val}
                  </text>
                </g>
              ))}

              {/* Active Month Vertical Scanning Guideline */}
              <line
                x1={monthlyUnitEconomics[activeMonthIdx].x}
                x2={monthlyUnitEconomics[activeMonthIdx].x}
                y1="25"
                y2="252"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.85"
              />

              {/* Area 1: Gross Margin Band (Filled polygon between MRR line and Cost line) */}
              <polygon
                fill="url(#profitBandGrad)"
                points="110,223 270,187 430,171 590,133 750,97 910,61 910,235 750,238 590,240 430,243 270,244 110,246"
              />

              {/* Area 2: Cost Polygon under the blue line */}
              <polygon
                fill="url(#costAreaGrad)"
                points="110,246 270,244 430,243 590,240 750,238 910,235 910,252 110,252"
              />

              {/* Blue Line: GPU & Cloud Infrastructure Cost */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="110,246 270,244 430,243 590,240 750,238 910,235"
              />

              {/* Emerald Line: Monthly Recurring Revenue (MRR) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="110,223 270,187 430,171 590,133 750,97 910,61"
              />

              {/* Cost Data Points & Minimal Labels */}
              {monthlyUnitEconomics.map((m, idx) => (
                <g key={`cost-pt-${idx}`}>
                  <circle
                    cx={m.x}
                    cy={m.costY}
                    r={activeMonthIdx === idx ? 4.5 : 3.5}
                    fill="#ffffff"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Subtle Cost Label under point */}
                  <text
                    x={m.x}
                    y={m.costY + 14}
                    textAnchor="middle"
                    fill="#3b82f6"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {m.cost}M
                  </text>
                </g>
              ))}

              {/* MRR Data Points & Explicit Value Pill Callouts */}
              {monthlyUnitEconomics.map((m, idx) => {
                const isActive = activeMonthIdx === idx;
                const isSpecial = m.badge !== null;

                return (
                  <g key={`mrr-pt-${idx}`}>
                    {/* Glowing Ring for Special or Active Point */}
                    {(isActive || isSpecial) && (
                      <circle
                        cx={m.x}
                        cy={m.mrrY}
                        r={isActive ? 11 : 8}
                        fill={isSpecial && m.badge?.color === 'purple' ? '#a855f7' : '#10b981'}
                        opacity="0.22"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={m.x}
                      cy={m.mrrY}
                      r={isActive ? 6 : 5}
                      fill="#ffffff"
                      stroke={
                        isSpecial && m.badge?.color === 'purple'
                          ? '#7e22ce'
                          : '#10b981'
                      }
                      strokeWidth={isActive ? 3.5 : 2.5}
                    />

                    {/* Value Badge Pill above Point */}
                    <g filter="url(#badgeShadow)">
                      <rect
                        x={m.x - (isSpecial ? 38 : 22)}
                        y={m.mrrY - 26}
                        width={isSpecial ? 76 : 44}
                        height="18"
                        rx="5"
                        fill={
                          isActive
                            ? '#0f172a'
                            : isSpecial && m.badge?.color === 'purple'
                            ? '#7e22ce'
                            : '#ffffff'
                        }
                        stroke={
                          isActive
                            ? '#0f172a'
                            : isSpecial && m.badge?.color === 'purple'
                            ? '#6b21a8'
                            : '#cbd5e1'
                        }
                        strokeWidth="1"
                      />
                      <text
                        x={m.x}
                        y={m.mrrY - 13}
                        textAnchor="middle"
                        fill={
                          isActive || (isSpecial && m.badge?.color === 'purple')
                            ? '#ffffff'
                            : '#0f172a'
                        }
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="monospace"
                      >
                        {m.mrr}M
                        {isSpecial && m.badge?.color === 'purple' ? ' (Bot)' : ''}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Transparent Column Hitboxes for Effortless Mouse Hover */}
              {monthlyUnitEconomics.map((m, idx) => (
                <rect
                  key={`hitbox-${idx}`}
                  x={m.x - 70}
                  y="20"
                  width="140"
                  height="245"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMonthIdx(idx)}
                />
              ))}
            </svg>
          </div>

          {/* Clean 6-Column Monthly KPI Cards (Eliminates Text Wrapping Mess) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-200">
            {monthlyUnitEconomics.map((m, idx) => {
              const isActive = activeMonthIdx === idx;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setActiveMonthIdx(idx)}
                  className={`p-2 sm:p-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-bold ${isActive ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {m.shortMonth}
                    </span>
                    {m.badge && (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        m.badge.color === 'purple' ? 'bg-purple-600' : 'bg-emerald-600'
                      }`}></span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between text-xs font-mono font-bold">
                    <span className="text-[#198754]">{m.mrr}M</span>
                    <span className="text-blue-600 text-[11px] font-medium">{m.cost}M</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
                    <span>Lãi gộp:</span>
                    <span className="font-semibold text-emerald-700">{m.margin}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Financial & Unit Economics Diagnostics Banner - Compact */}
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50/70 via-blue-50/40 to-slate-50 border border-emerald-200/70 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">verified</span>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-900 text-xs">Chi Phí OCR Tối Ưu Cực Đại</span>
                <span className="text-slate-600 mt-0.5 text-[11px]">
                  Chỉ <strong>14.6 VNĐ / hóa đơn</strong>. Bộ nhớ đệm OCR Cache giúp tiết kiệm 32% chi phí gọi GPU AI.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5">warning</span>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-900 text-xs">Phát Hiện Chênh Lệch Sử Dụng</span>
                <span className="text-slate-600 mt-0.5 text-[11px]">
                  Nhóm F&amp;B quét trung bình <strong>38 ảnh/ngày</strong> (gấp 2.1x tạp hóa) nhưng cùng đóng 99k/tháng.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-purple-600 mt-0.5">rocket_launch</span>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-900 text-xs">Khuyến Nghị Đòn Bẩy Doanh Số</span>
                <span className="text-slate-600 mt-0.5 text-[11px]">
                  Ra mắt gói <strong>F&amp;B Đa Ca 149k/tháng</strong>. Dự báo tăng <strong>+18.5M VNĐ MRR</strong> ngay tháng tới.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Ledger / Transactions Table Section (Unified Master Card) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Giao Dịch Thanh Toán Gói Cước Gần Nhất
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sổ cái kế toán thời gian thực từ các cổng đối soát thanh toán trực tiếp
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[17px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm hóa đơn, tên hộ KD..."
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 rounded-lg font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-slate-200 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-2.5 px-4 sm:px-5 font-semibold">Mã hóa đơn</th>
                <th className="py-2.5 px-4 sm:px-5 font-semibold">Tên hộ kinh doanh</th>
                <th className="py-2.5 px-4 sm:px-5 font-semibold">Gói cước</th>
                <th className="py-2.5 px-4 sm:px-5 font-semibold text-right">Số tiền (VNĐ)</th>
                <th className="py-2.5 px-4 sm:px-5 font-semibold text-center">Phương thức</th>
                <th className="py-2.5 px-4 sm:px-5 font-semibold">Thời gian</th>
                <th className="py-2.5 px-4 sm:px-5 font-semibold text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 text-slate-800">
              {filteredPayments.map((p) => (
                <tr key={p.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 sm:px-5">
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {p.invoiceId}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 sm:px-5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${p.avatarColor}`}
                      >
                        {p.avatarInitials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-xs">
                          {p.storeName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.storeLocation}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-4 sm:px-5">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-100">
                      {p.planDescription}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 sm:px-5 text-right font-mono font-bold text-slate-900 text-xs">
                    {p.amount.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="py-2.5 px-4 sm:px-5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                      <span className="material-symbols-outlined text-[13px]">
                        {p.paymentMethod.includes('VietQR') ? 'qr_code_scanner' : 'credit_card'}
                      </span>
                      {p.paymentMethod}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 sm:px-5 text-slate-400 text-xs">
                    {p.timestamp}
                  </td>

                  <td className="py-2.5 px-4 sm:px-5 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Thành công
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 sm:px-5 bg-slate-50/70 border-t border-slate-100 gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-xs">
              Tổng quan:
            </span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white shadow-xs font-semibold text-slate-800 border border-slate-200 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-[#198754]">849</span> hộ kinh doanh thuê bao đang hoạt động
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-2 text-xs">
              Trang 1 / 85
            </span>
            <button
              disabled
              className="w-6 h-6 rounded-md bg-white shadow-xs flex items-center justify-center text-slate-400 disabled:opacity-40 border border-slate-200"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">chevron_left</span>
            </button>
            <button
              className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center"
              type="button"
            >
              1
            </button>
            <button
              className="w-6 h-6 rounded-md bg-white shadow-xs text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
              type="button"
            >
              2
            </button>
            <button
              className="w-6 h-6 rounded-md bg-white shadow-xs text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
              type="button"
            >
              3
            </button>
            <span className="px-1 text-slate-400 text-xs">...</span>
            <button
              className="w-6 h-6 rounded-md bg-white shadow-xs text-slate-600 hover:bg-slate-100 text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
              type="button"
            >
              85
            </button>
            <button
              className="w-6 h-6 rounded-md bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-3 z-50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">
              Khởi tạo Báo Cáo Tài Chính thành công
            </span>
            <span className="text-[11px] text-slate-300">
              File PDF đã sẵn sàng và gửi về Telegram Ban Quản Trị
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
