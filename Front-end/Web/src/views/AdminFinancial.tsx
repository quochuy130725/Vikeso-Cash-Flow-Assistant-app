import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAdminPayments,
  deleteAdminPayment,
} from '../services/api';
import { SubscriptionPayment } from '../types';
import { UserAccount } from '../components/AuthModal';

interface AdminFinancialProps {
  currentUser?: UserAccount | null;
}

export const AdminFinancial: React.FC<AdminFinancialProps> = ({ currentUser }) => {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);

  // Helper date extractor
  const extractDate = (timestamp: string): string => {
    if (!timestamp) return 'Hôm nay';
    const match = timestamp.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
    if (match) return match[0];
    const parts = timestamp.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : timestamp;
  };

  const formatShortAmount = (amount: number): string => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
    return `${amount}`;
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchAdminPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Lỗi khi fetchAdminPayments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered payments (strictly completed, paid orders for actual revenue)
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Exclude all pending orders completely
      if (p.status !== 'success') return false;

      if (selectedChartDate) {
        const pDate = extractDate(p.timestamp);
        if (pDate !== selectedChartDate) return false;
      }
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesInvoice = p.invoiceId?.toLowerCase().includes(query);
        const matchesStore = p.storeName?.toLowerCase().includes(query);
        const matchesPlan = p.planDescription?.toLowerCase().includes(query);
        return matchesInvoice || matchesStore || matchesPlan;
      }
      return true;
    });
  }, [payments, selectedChartDate, searchTerm]);

  // Real aggregate numbers: Revenue & Profit (Only Completed Orders)
  const {
    totalRevenue,
    netProfit,
    operatingCost,
    countSuccess,
    dailyData,
    maxDailyVal,
  } = useMemo(() => {
    let rev = 0;
    let sCount = 0;

    const dateMap: {
      [dateKey: string]: {
        date: string;
        grossRev: number;
        netProfit: number;
        successCount: number;
      };
    } = {};

    payments.forEach((p) => {
      if (p.status !== 'success') return; // Strictly ignore any pending transactions

      const dateKey = extractDate(p.timestamp);
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          grossRev: 0,
          netProfit: 0,
          successCount: 0,
        };
      }

      rev += p.amount;
      sCount++;
      dateMap[dateKey].grossRev += p.amount;
      dateMap[dateKey].netProfit += Math.round(p.amount * 0.8);
      dateMap[dateKey].successCount++;
    });

    const net = Math.round(rev * 0.8);
    const opCost = rev - net;

    // Sort dates chronologically
    const sortedDates = Object.values(dateMap).sort((a, b) => {
      const parseDMY = (s: string) => {
        const parts = s.split('/');
        if (parts.length === 3) {
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
        }
        return 0;
      };
      return parseDMY(a.date) - parseDMY(b.date);
    });

    let maxVal = 1;
    sortedDates.forEach((d) => {
      if (d.grossRev > maxVal) maxVal = d.grossRev;
    });

    return {
      totalRevenue: rev,
      netProfit: net,
      operatingCost: opCost,
      countSuccess: sCount,
      dailyData: sortedDates,
      maxDailyVal: maxVal,
    };
  }, [payments]);

  // Handle Delete Payment
  const handleDeletePayment = async (p: SubscriptionPayment) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn thanh toán "${p.invoiceId}" của "${p.storeName}"?`)) {
      return;
    }
    const cleanId = p.invoiceId.replace(/^#INV-/, '').replace(/^TX-/, '');
    try {
      const res = await deleteAdminPayment(cleanId);
      if (res.success) {
        showToast(`Đã xóa đơn thanh toán "${p.invoiceId}"!`);
        loadData(true);
      } else {
        showToast(res.message || 'Lỗi xóa đơn', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tài Chính Nền Tảng
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-700 font-semibold">
              Cổng thanh toán tự động: <strong className="text-slate-900">SePay VietQR</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Webhook 24/7 trực tuyến
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Doanh Thu Thuê Bao &amp; Đơn Hàng SePay
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Theo dõi dòng tiền thuê bao PRO thực tế, kiểm soát các giao dịch chuyển khoản VietQR và phê duyệt đơn thủ công khi cần.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadData(true);
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. Key Revenue Metrics (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tổng doanh thu đã thu */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng doanh thu đã thu
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              {totalRevenue.toLocaleString('vi-VN')} <span className="text-xs font-semibold">đ</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {countSuccess} đơn thanh toán thành công
            </span>
          </div>
        </div>

        {/* Metric 2: Lợi nhuận ròng (80%) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lợi Nhuận Ròng (80%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#ff4783] flex items-center justify-center border border-pink-200">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#ff4783] font-mono font-tabular tracking-tight">
              {netProfit.toLocaleString('vi-VN')} <span className="text-xs font-semibold">đ</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Sau chi phí cổng SePay &amp; AI OCR
            </span>
          </div>
        </div>

        {/* Metric 3: Đơn hoàn tất */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Đơn hoàn tất (PRO)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              {countSuccess} <span className="text-xs font-normal text-slate-400">gói đã kích hoạt</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Gia hạn 30 ngày tự động
            </span>
          </div>
        </div>

        {/* Metric 4: Giá gói cước niêm yết */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Giá Gói Chuyên Nghiệp (PRO)
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <span className="material-symbols-outlined text-[18px]">sell</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              99.000 <span className="text-xs font-semibold text-slate-400">đ / tháng</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Đã gồm VAT &amp; phí cổng SePay
            </span>
          </div>
        </div>
      </div>

      {/* 2.5. Single Unified Chart: Doanh Thu & Lợi Nhuận Thuê Bao (Full Width, Actionable) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
        {/* Header & Mini KPI Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
                <span className="material-symbols-outlined text-[17px]">trending_up</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Biến Động Doanh Thu &amp; Lợi Nhuận Thuê Bao
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Phân tích doanh thu gộp và lợi nhuận ròng thực nhận (80%) theo từng mốc thời gian.
            </p>
          </div>

          {/* 2 Mini KPI Badges (Only Completed / Paid) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d0f81b]/25 border border-[#bde412] text-slate-950 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
              <span className="text-[11px] font-semibold text-slate-600">Thực thu:</span>
              <strong className="font-mono font-black">{totalRevenue.toLocaleString('vi-VN')} đ</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-[#ff4783] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#ff4783]"></span>
              <span className="text-[11px] font-semibold text-slate-600">Lợi nhuận (80%):</span>
              <strong className="font-mono font-black">{netProfit.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 flex-wrap font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#d0f81b] border border-[#bde412]"></span>
              <span>Doanh thu gộp (Gross)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#ff4783]"></span>
              <span>Lợi nhuận ròng (Net 80%)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            * Nhấn vào cột ngày để lọc nhanh danh sách đơn bên dưới
          </span>
        </div>

        {/* Chart Canvas (Interactive Bars) */}
        {dailyData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Chưa có phát sinh dữ liệu thanh toán để vẽ biểu đồ.
          </div>
        ) : (
          <div className="pt-6 pb-2">
            <div className="h-52 flex items-end justify-between gap-2 sm:gap-3">
              {dailyData.map((d) => {
                const isSelected = selectedChartDate === d.date;
                const revHeight = d.grossRev > 0 ? Math.max(12, Math.round((d.grossRev / maxDailyVal) * 100)) : 0;
                const profitHeight = d.netProfit > 0 ? Math.max(10, Math.round((d.netProfit / maxDailyVal) * 100)) : 0;

                return (
                  <div
                    key={d.date}
                    onClick={() => {
                      setSelectedChartDate(isSelected ? null : d.date);
                    }}
                    title={`${d.date}: Doanh thu ${d.grossRev.toLocaleString('vi-VN')} đ | Lợi nhuận ${d.netProfit.toLocaleString('vi-VN')} đ`}
                    className={`flex-1 flex flex-col items-center justify-end h-full p-2 rounded-xl transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-100 ring-2 ring-slate-900 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 h-36">
                      {/* Bar 1: Gross Revenue */}
                      <div className="w-1/2 max-w-[22px] flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${revHeight}%` }}
                          className={`w-full bg-[#d0f81b] border border-[#bde412] rounded-t-md transition-all duration-300 ${
                            revHeight === 0 ? 'opacity-0' : 'opacity-100 group-hover:brightness-95'
                          }`}
                        ></div>
                      </div>

                      {/* Bar 2: Net Profit */}
                      <div className="w-1/2 max-w-[22px] flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${profitHeight}%` }}
                          className={`w-full bg-[#ff4783] rounded-t-md transition-all duration-300 ${
                            profitHeight === 0 ? 'opacity-0' : 'opacity-100 group-hover:brightness-105'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Date label */}
                    <span
                      className={`text-[11px] font-bold mt-2.5 truncate max-w-full font-mono ${
                        isSelected ? 'text-slate-950 font-black' : 'text-slate-600'
                      }`}
                    >
                      {d.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actionable Insight Banner */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#d0f81b] shrink-0 mt-0.5 sm:mt-0">
              verified
            </span>
            <div className="text-xs leading-relaxed">
              <span>
                <strong className="text-[#d0f81b]">Toàn bộ giao dịch đã được đối soát thành công</strong> qua cổng SePay VietQR. Tỷ suất lợi nhuận ròng thực nhận đạt mức tối ưu <strong className="text-white font-black">80%</strong> ({netProfit.toLocaleString('vi-VN')} đ).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {selectedChartDate && (
              <button
                onClick={() => setSelectedChartDate(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                <span>Bỏ lọc ngày ({selectedChartDate})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. SePay Orders Data Grid */}
      <div id="sepay-orders-table" className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Active Date Filter Alert if set */}
        {selectedChartDate && (
          <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#ff4783]">filter_alt</span>
              <span>Đang lọc giao dịch theo ngày trên biểu đồ: <strong className="text-slate-900 font-black">{selectedChartDate}</strong></span>
            </span>
            <button
              onClick={() => setSelectedChartDate(null)}
              className="text-[#ff4783] hover:text-[#d8356c] font-bold underline cursor-pointer"
            >
              Xem tất cả ngày
            </button>
          </div>
        )}

        {/* Table Title Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4783]"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Danh Sách Đơn Hàng &amp; Đối Soát Giao Dịch SePay
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Kiểm soát trạng thái thanh toán gói PRO và doanh thu thực nhận tự động qua cổng SePay VietQR.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              {filteredPayments.length} giao dịch đã thanh toán
            </span>
          </div>
        </div>

        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn (#INV), tên cửa hàng, gói cước..."
              className="w-full h-9.5 pl-9 pr-8 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all shadow-xs font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đã thanh toán ({filteredPayments.length})</span>
            </div>
          </div>
        </div>

        {/* Real Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[880px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 whitespace-nowrap w-[110px]">Mã Đơn</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[130px]">Cửa Hàng</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[120px]">Gói Dịch Vụ</th>
                <th className="py-3 px-3 whitespace-nowrap text-right min-w-[90px]">Số Tiền</th>
                <th className="py-3 px-3 whitespace-nowrap text-center min-w-[120px]">Kênh Thanh Toán</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[95px]">Thời Gian</th>
                <th className="py-3 px-3 whitespace-nowrap text-center min-w-[115px]">Trạng Thái</th>
                <th className="py-3 px-3 whitespace-nowrap text-right w-[100px] pr-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] animate-spin text-[#ff4783]">
                      progress_activity
                    </span>
                    <p className="text-xs font-semibold text-slate-500 mt-2">Đang tải lịch sử thanh toán SePay...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 text-xs">
                    Chưa có giao dịch thanh toán nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  // Format clean concise package description
                  const planText = p.planDescription?.includes('PRO')
                    ? 'Gói PRO'
                    : (p.planDescription || 'Gói PRO');

                  // Format payment method text
                  const cleanMethod = p.paymentMethod?.replace('Quét mã ', '') || 'VietQR';

                  return (
                    <tr key={p.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[11px] whitespace-nowrap inline-block">
                          {p.invoiceId}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-xs whitespace-nowrap">
                            {p.storeName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {p.storeLocation || 'Việt Nam'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 text-[#ff4783] text-[11px] font-bold border border-pink-200 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                          <span>{planText}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 text-xs whitespace-nowrap">
                          {p.amount.toLocaleString('vi-VN')} đ
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[13px] text-blue-600">qr_code_2</span>
                          <span>{cleanMethod}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                        <div className="flex flex-col leading-tight whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{p.timestamp?.split(' ')[1] || p.timestamp}</span>
                          <span className="text-slate-400 text-[10px]">{p.timestamp?.split(' ')[0]}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d0f81b]/35 text-slate-950 text-[11px] font-black border border-[#bde412] whitespace-nowrap shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>Đã Thanh Toán</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap pr-4">
                        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {/* Delete Order button */}
                          <button
                            onClick={() => handleDeletePayment(p)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            type="button"
                            title="Xóa đơn hàng"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 px-5 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Hiển thị <strong>{filteredPayments.length}</strong> đơn hàng đã thanh toán thành công
          </span>
          <span className="font-semibold text-slate-700">Đồng bộ tự động qua SePay VietQR Webhook</span>
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
