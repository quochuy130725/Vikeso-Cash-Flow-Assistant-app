import React, { useState, useMemo } from 'react';
import { ownerTransactions } from '../data/mockData';
import { UserAccount } from '../components/AuthModal';

interface OwnerCashflowLedgerProps {
  currentUser?: UserAccount | null;
  onDownloadExcel: () => void;
  onPrintReport: () => void;
}

export const OwnerCashflowLedger: React.FC<OwnerCashflowLedgerProps> = ({
  currentUser,
  onDownloadExcel,
  onPrintReport,
}) => {
  // View mode within the unified page: All (Default), Charts only, or Ledger only
  const [viewMode, setViewMode] = useState<'all' | 'charts' | 'ledger'>('all');
  // 7-day detailed cashflow dataset with problem diagnosis
  const dailyCashflow = [
    { day: 'Thứ 2', date: '18/10', inAmount: 12000000, outAmount: 4500000, net: 7500000, inH: 65, outH: 24, alert: null, note: 'Doanh thu đầu tuần ổn định, tiền mặt chiếm chủ yếu' },
    { day: 'Thứ 3', date: '19/10', inAmount: 9800000, outAmount: 3100000, net: 6700000, inH: 53, outH: 17, alert: null, note: 'Lượng khách lẻ vắng hơn thường lệ' },
    { day: 'Thứ 4', date: '20/10', inAmount: 14200000, outAmount: 6800000, net: 7400000, inH: 77, outH: 37, alert: 'Chi nhập hàng cao (-6.8M)', note: 'Cảnh báo chi đột biến: Nhập 5 két bia & nước ngọt Hưng Thịnh' },
    { day: 'Thứ 5', date: '21/10', inAmount: 8500000, outAmount: 3900000, net: 4600000, inH: 46, outH: 21, alert: 'Dòng tiền ròng thấp nhất tuần', note: 'Chi trả tiền điện 1.2M làm giảm tỷ lệ ròng xuống 54%' },
    { day: 'Thứ 6', date: '22/10', inAmount: 16000000, outAmount: 5200000, net: 10800000, inH: 86, outH: 28, alert: null, note: 'Doanh thu bán lẻ quẹt thẻ tăng mạnh dịp cuối tuần' },
    { day: 'Thứ 7', date: '23/10', inAmount: 18500000, outAmount: 6100000, net: 12400000, inH: 100, outH: 33, alert: null, note: 'Kỷ lục doanh số tuần: Dòng tiền thực thu +12.4M' },
    { day: 'Hôm nay', date: '24/10', inAmount: 15450000, outAmount: 4200000, net: 11250000, inH: 84, outH: 23, alert: null, isToday: true, note: 'Đối soát 100% khớp máy tính tiền POS và tài khoản ngân hàng' },
  ];
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);
  const activeDay = dailyCashflow[selectedDayIndex];

  const [tipDismissed, setTipDismissed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeChip, setTimeChip] = useState<'today' | 'yesterday' | '7days' | 'month'>('today');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'merged'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return ownerTransactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'in' && tx.type !== 'in') return false;
        if (typeFilter === 'out' && tx.type !== 'out') return false;
        if (typeFilter === 'merged' && tx.type !== 'merged') return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesDetails = tx.details.toLowerCase().includes(query);
        const matchesRef = tx.refCode?.toLowerCase().includes(query);
        const matchesAmount = Math.abs(tx.amount).toString().includes(query);
        return matchesTitle || matchesCategory || matchesDetails || matchesRef || matchesAmount;
      }

      return true;
    });
  }, [typeFilter, searchTerm]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Store Greeting Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Xin chào, {currentUser?.name || (currentUser?.role === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200/80 shadow-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gói {currentUser?.subscriptionPlan === 'FREE' ? 'Miễn Phí (Cơ Bản)' : (currentUser?.subscriptionPlan || 'FREE')}
            </span>
          </div>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">storefront</span>
            <span className="font-semibold text-slate-900">
              {currentUser?.shopName || currentUser?.storeName || (currentUser?.role === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh')}
            </span>
            {currentUser?.email && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-xs">{currentUser.email}</span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Đang Hoạt Động
            </span>
          </p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {/* View Mode Toggle: All vs Charts vs Ledger */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Toàn cảnh &amp; Sổ cái
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'charts'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Biểu đồ đối soát
            </button>
            <button
              onClick={() => setViewMode('ledger')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'ledger'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Sổ nhật ký
            </button>
          </div>

          <button
            onClick={onDownloadExcel}
            className="inline-flex items-center gap-2 bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 px-4 py-2 rounded-xl text-xs font-black border border-[#bde412] shadow-sm shadow-[#d0f81b]/20 hover:shadow transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Tải file Excel báo cáo</span>
          </button>
        </div>
      </div>

      {/* 2. Sleek Dismissible Tip Banner */}
      {!tipDismissed && (
        <div className="bg-emerald-50/80 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 border border-emerald-200/80 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
              <span className="material-symbols-outlined text-[22px]">lightbulb</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-emerald-950">
                Mẹo nhỏ quản lý cho chủ cửa hàng:
              </span>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Trang web dùng để theo dõi toàn cảnh dòng tiền và xuất báo cáo. Để chụp ảnh hóa đơn hoặc sổ tay bằng trí tuệ nhân tạo, vui lòng mở ứng dụng <strong>VikeSo</strong> trên điện thoại thông minh.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTipDismissed(true)}
            className="text-emerald-700/60 hover:text-emerald-900 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* 3. 3 Metric Cards (Shown in 'all' and 'charts' view) */}
      {(viewMode === 'all' || viewMode === 'charts') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tiền Vào */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tiền vào hôm nay
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight font-tabular">
                +15.450.000 <span className="text-lg font-semibold text-emerald-600">đ</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-100">
                  +18%
                </span>
                <span className="text-xs text-slate-500">
                  so với ngày hôm qua
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-[78%] rounded-full"></div>
            </div>
          </div>

          {/* Card 2: Tiền Ra */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tiền ra hôm nay
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-rose-600 tracking-tight font-tabular">
                -4.200.000 <span className="text-lg font-semibold text-rose-600">đ</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 truncate">
                Nhập nước giải khát, tiền điện nước, xăng xe giao hàng
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[28%] rounded-full"></div>
            </div>
          </div>

          {/* Card 3: Dòng Tiền Ròng */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Dòng tiền thực thu (Còn lại)
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-tabular">
                +11.250.000 <span className="text-lg font-semibold text-slate-900">đ</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-bold border border-slate-200">
                  Tỷ lệ ròng 72.8%
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                  An toàn quỹ tiền mặt
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-slate-800 h-full w-[72.8%] rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 7-Day Chart & Source Distribution (Interactive Diagnosis & Visual Insights) */}
      {(viewMode === 'all' || viewMode === 'charts') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 7-day Reconciliation Chart with AI Diagnosis */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Biểu Đồ Đối Soát Dòng Tiền 7 Ngày
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tuần này: +60.65M ròng (66.8%)
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-0.5">
                  Nhấp vào từng ngày để xem phân tích chi tiết dòng tiền và cảnh báo chi phí đột biến
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-semibold text-slate-700">Tiền Vào</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-semibold text-slate-700">Tiền Ra</span>
                </div>
              </div>
            </div>

            {/* Interactive 7-Day Bar Chart */}
            <div className="w-full h-64 flex items-end justify-between gap-2 sm:gap-3 pt-6 px-1">
              {dailyCashflow.map((d, idx) => {
                const isSelected = selectedDayIndex === idx;
                const netFormatted = `+${(d.net / 1000000).toFixed(1)}M`;

                return (
                  <div
                    key={d.day}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex-1 flex flex-col items-center gap-2 h-full justify-end rounded-xl p-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 ring-2 ring-emerald-600 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Top Net Tag & Alert Warning */}
                    <div className="flex flex-col items-center gap-0.5">
                      {d.alert && (
                        <span
                          title={d.alert}
                          className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 shadow-xs"
                        >
                          !
                        </span>
                      )}
                      <span className={`text-[10px] font-bold font-tabular ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {netFormatted}
                      </span>
                    </div>

                    {/* Dual Bars */}
                    <div className="w-full max-w-[42px] flex items-end justify-center gap-1.5 h-[65%]">
                      <div
                        className="w-1/2 bg-emerald-600 rounded-t-md transition-all shadow-xs"
                        style={{ height: `${d.inH}%` }}
                        title={`Tiền vào: ${d.inAmount.toLocaleString('vi-VN')} đ`}
                      ></div>
                      <div
                        className="w-1/2 bg-rose-500 rounded-t-md transition-all shadow-xs"
                        style={{ height: `${d.outH}%` }}
                        title={`Tiền ra: ${d.outAmount.toLocaleString('vi-VN')} đ`}
                      ></div>
                    </div>

                    {/* Day & Date Labels */}
                    <div className="flex flex-col items-center text-center">
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {d.day}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {d.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Diagnosis Callout for Selected Day */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">
                    insights
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Chẩn Đoán Chi Tiết: {activeDay.day} ({activeDay.date})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600">
                    Vào: <strong className="text-emerald-700 font-tabular">+{activeDay.inAmount.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">
                    Ra: <strong className="text-rose-600 font-tabular">-{activeDay.outAmount.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">
                    Ròng: <strong className="text-slate-900 font-tabular">+{activeDay.net.toLocaleString('vi-VN')} đ</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                {activeDay.alert ? (
                  <div className="w-full p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
                      warning
                    </span>
                    <div>
                      <strong>{activeDay.alert}: </strong>
                      <span>{activeDay.note}. Khoản chi chiếm {(activeDay.outAmount / activeDay.inAmount * 100).toFixed(1)}% doanh thu trong ngày, hãy kiểm tra đối soát hóa đơn nhập sỉ.</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
                      check_circle
                    </span>
                    <div>
                      <strong>Dòng tiền an toàn: </strong>
                      <span>{activeDay.note}. Tỷ lệ ròng đạt {(activeDay.net / activeDay.inAmount * 100).toFixed(1)}%, quỹ tiền mặt được bảo toàn tối ưu.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Source Proportion with Fee Leaks & Risks */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Tỷ Trọng Nguồn Thu &amp; Chi Phí Kênh
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân tích rủi ro phí giao dịch và thất thoát tiền mặt hôm nay
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* VietQR */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">qr_code_2</span>
                    Mã quét VietQR
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">48% (7.41M)</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      0% Phí
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '48%' }}></div>
                </div>
              </div>

              {/* POS */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">credit_card</span>
                    Máy quẹt thẻ POS
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">32% (4.94M)</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Phí quẹt thẻ 1.6%">
                      Mất ~79k phí
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>

              {/* Cash */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-600">payments</span>
                    Tiền mặt tại quầy
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">14% (2.16M)</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      Rủi ro tiền lẻ
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: '14%' }}></div>
                </div>
              </div>

              {/* COD */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">local_shipping</span>
                    Giao hàng thu hộ COD
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">6% (927k)</span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      Đọng vốn 3 ngày
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>
            </div>

            {/* Actionable Problem Advisory */}
            <div className="p-3.5 bg-emerald-50/70 rounded-xl flex items-start gap-2.5 border border-emerald-200/80">
              <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-emerald-950">Gợi ý tối ưu lợi nhuận:</span>
                <span className="text-xs text-emerald-800 leading-relaxed">
                  Tiệm đang tốn ~79.000đ/ngày tiền phí máy quẹt thẻ POS. Hãy dán thêm mã VietQR tại quầy để tiết kiệm thêm <strong>~2.370.000đ/tháng</strong>!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Complete Integrated Sổ Nhật Ký Thu Chi (Unified Master Card) */}
      {(viewMode === 'all' || viewMode === 'ledger') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Card Header with 3 Quick Count Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Sổ Nhật Ký Thu Chi &amp; Lịch Sử Giao Dịch
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Tất cả khoản thu, chi được tự động đối chiếu trong ngày
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Tổng lượt:
                </span>
                <span className="text-xs font-bold text-slate-900">
                  38 đơn
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <span className="text-xs text-emerald-700 uppercase font-semibold">
                  Tiền Vào:
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  +32
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                <span className="text-xs text-rose-700 uppercase font-semibold">
                  Tiền Ra:
                </span>
                <span className="text-xs font-bold text-rose-700">
                  -6
                </span>
              </div>
            </div>
          </div>

          {/* Unified Filter, Search & Action Bar */}
          <div className="bg-slate-50/70 p-5 border-b border-slate-200/60 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo nội dung, mã giao dịch, số tiền..."
                  className="w-full h-10 pl-10 pr-9 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-slate-200 transition-all shadow-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Time Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setTimeChip('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    timeChip === 'today'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setTimeChip('yesterday')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    timeChip === 'yesterday'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  Hôm qua
                </button>
                <button
                  onClick={() => setTimeChip('7days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    timeChip === '7days'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  7 ngày qua
                </button>
                <button
                  onClick={() => setTimeChip('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    timeChip === 'month'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  Tháng này
                </button>
              </div>
            </div>

            {/* Category Pills & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pt-2 border-t border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  <span>Tất cả giao dịch</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </button>

                <button
                  onClick={() => setTypeFilter('in')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === 'in'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  <span>Tiền Vào (+)</span>
                </button>

                <button
                  onClick={() => setTypeFilter('out')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === 'out'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                  <span>Tiền Ra (-)</span>
                </button>

                <button
                  onClick={() => setTypeFilter('merged')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === 'merged'
                      ? 'bg-purple-900 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">call_merge</span>
                  <span>Đã gộp máy tính tiền (MERGED)</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  onClick={onDownloadExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">download</span>
                  <span>Tải file Excel sổ sách</span>
                </button>

                <button
                  onClick={onPrintReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-600">print</span>
                  <span>In báo cáo ngày</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Reconciled Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-32">
                    Thời gian
                  </th>
                  <th className="py-3.5 px-5">
                    Nội dung &amp; Danh mục
                  </th>
                  <th className="py-3.5 px-5 w-64">
                    Phương thức ghi nhận
                  </th>
                  <th className="py-3.5 px-5 text-right w-48">
                    Số tiền (VNĐ)
                  </th>
                  <th className="py-3.5 px-5 text-center w-56">
                    Trạng thái đối soát
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-xs sm:text-sm">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  const formattedAmount = `${isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('vi-VN')} đ`;

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        tx.isStrikethrough
                          ? 'opacity-60 hover:opacity-100 bg-slate-50/40'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Column 1: Time */}
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold ${
                              tx.isStrikethrough ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {tx.time}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {tx.dateLabel}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Content & Category */}
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-semibold ${
                                tx.isStrikethrough ? 'text-slate-400 line-through' : 'text-slate-900'
                              }`}
                            >
                              {tx.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                tx.type === 'out'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : tx.type === 'merged'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}
                            >
                              {tx.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            {tx.type === 'merged' && !tx.isStrikethrough && (
                              <span className="material-symbols-outlined text-slate-400 text-[14px]">
                                inventory_2
                              </span>
                            )}
                            <span
                              className={`${
                                tx.isStrikethrough ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {tx.details}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Method */}
                      <td className="py-4 px-5 align-top">
                        <div
                          className={`flex items-center gap-2 ${
                            tx.isStrikethrough ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                              tx.methodColor || 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {tx.methodIcon}
                            </span>
                          </div>
                          <span className="text-xs font-medium">{tx.method}</span>
                        </div>
                      </td>

                      {/* Column 4: Amount */}
                      <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-bold font-tabular ${
                            tx.isStrikethrough
                              ? 'text-slate-400 line-through'
                              : isPositive
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {tx.isStrikethrough ? `${tx.amount.toLocaleString('vi-VN')} đ` : formattedAmount}
                        </span>
                      </td>

                      {/* Column 5: Status */}
                      <td className="py-4 px-5 align-top text-center">
                        {tx.type === 'merged' && !tx.isStrikethrough ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                              <span className="material-symbols-outlined text-[14px]">call_merge</span>
                              <span>Đã tự động gộp tránh trùng</span>
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Khớp 100% hóa đơn con
                            </span>
                          </div>
                        ) : tx.isStrikethrough ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                              <span className="material-symbols-outlined text-[14px]">link</span>
                              <span>Đã gộp vào kết ca</span>
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              MERGED - không tính 2 lần
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Đã đối soát</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination & Summary Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Hiển thị</span>
              <span className="font-bold text-slate-900">{filteredTransactions.length}</span>
              <span>trên tổng số</span>
              <span className="font-bold text-slate-900">38</span>
              <span>giao dịch đối soát hôm nay</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-xs disabled:opacity-40 transition-colors border border-slate-200 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                  currentPage === 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                  currentPage === 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                  currentPage === 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                3
              </button>
              <span className="px-1 text-slate-400 font-bold text-xs">...</span>
              <button
                onClick={() => setCurrentPage(7)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                  currentPage === 7
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                7
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(7, p + 1))}
                disabled={currentPage === 7}
                className="w-8 h-8 rounded-lg bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-xs transition-colors border border-slate-200 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Hardware & VietQR sync indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="md:col-span-2 p-5 bg-white rounded-2xl flex items-center gap-4 border border-slate-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <span className="material-symbols-outlined text-[24px]">tips_and_updates</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              Mẹo thông minh cho Chủ Cửa Hàng:
            </span>
            <span className="text-xs text-slate-500 leading-relaxed">
              Mọi khoản chi lẻ hay hóa đơn viết tay chụp bằng ứng dụng điện thoại sẽ tự động xuất hiện tại đây sau 2 giây với đầy đủ hạng mục đã phân loại.
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl flex items-center justify-between border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400">Đồng bộ VietQR &amp; POS</span>
              <span className="text-xs font-bold text-slate-900">
                Tự động bắt chéo đơn
              </span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            Chuẩn xác 100%
          </span>
        </div>
      </div>
    </div>
  );
};
