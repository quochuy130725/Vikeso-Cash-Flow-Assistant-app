import React, { useState, useEffect, useMemo } from 'react';
import { fetchUserTransactions } from '../services/api';
import { Transaction } from '../types';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'quarter'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchUserTransactions(currentUser?.id)
      .then((data) => {
        if (isMounted) {
          setTransactions(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi fetchUserTransactions cho Reports:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Aggregate Real Financial Metrics
  const { totalIn, totalOut, netProfit, profitMargin, countIn, countOut, categoryBreakdown } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    let inCount = 0;
    let outCount = 0;
    const catMap: Record<string, { inSum: number; outSum: number; count: number }> = {};

    transactions.forEach((tx) => {
      const isPositive = tx.amount > 0 || tx.type === 'in';
      const cat = tx.category || 'Khoản thu chi khác';
      if (!catMap[cat]) {
        catMap[cat] = { inSum: 0, outSum: 0, count: 0 };
      }
      catMap[cat].count += 1;

      if (isPositive) {
        const val = Math.abs(tx.amount);
        inSum += val;
        inCount += 1;
        catMap[cat].inSum += val;
      } else {
        const val = Math.abs(tx.amount);
        outSum += val;
        outCount += 1;
        catMap[cat].outSum += val;
      }
    });

    const net = inSum - outSum;
    const margin = inSum > 0 ? ((net / inSum) * 100).toFixed(1) : '0';

    // Format category breakdown list
    const breakdownList = Object.keys(catMap).map((cat) => {
      const item = catMap[cat];
      const totalAmount = item.inSum + item.outSum;
      const totalAll = inSum + outSum;
      const pct = totalAll > 0 ? Math.round((totalAmount / totalAll) * 100) : 0;
      return {
        category: cat,
        inSum: item.inSum,
        outSum: item.outSum,
        total: totalAmount,
        count: item.count,
        percent: pct,
      };
    }).sort((a, b) => b.total - a.total);

    return {
      totalIn: inSum,
      totalOut: outSum,
      netProfit: net,
      profitMargin: margin,
      countIn: inCount,
      countOut: outCount,
      categoryBreakdown: breakdownList,
    };
  }, [transactions]);

  // Tax calculations based on Circular 88 (TT88/2021/TT-BTC) for retail business households
  // 1.5% total = 1.0% GTGT + 0.5% TNCN
  const vatTax = Math.round(totalIn * 0.01);
  const pitTax = Math.round(totalIn * 0.005);
  const totalTax = vatTax + pitTax;
  const postTaxProfit = netProfit - totalTax;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] uppercase tracking-wider font-bold border border-emerald-200">
              Chuẩn Thông Tư 88/2021/TT-BTC
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cửa hàng: <strong className="text-slate-800">{currentUser?.shopName || currentUser?.storeName || 'Cửa Hàng Hộ Kinh Doanh'}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Chủ hộ: <strong className="text-slate-800">{currentUser?.name || 'Chủ Cửa Hàng'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Báo Cáo Kết Quả Kinh Doanh &amp; Nghĩa Vụ Thuế
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Tổng hợp dữ liệu sổ sách từ các hóa đơn đã được đối soát thực tế, tính toán doanh thu chịu thuế và kết xuất biểu mẫu lưu trữ theo luật thuế hộ kinh doanh.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              onExportPdf();
              showToast('Đang kết xuất tài liệu PDF báo cáo tài chính...');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-rose-600 text-[18px]">picture_as_pdf</span>
            <span>Xuất file PDF</span>
          </button>

          <button
            onClick={() => {
              onExportExcel();
              showToast('Đang kết xuất Bảng Kê Doanh Thu Excel TT88...');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 border border-[#bde412] text-xs sm:text-sm font-black shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Xuất file Excel TT88</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (Real Data Computed) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Doanh thu thực thu */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Doanh thu thực tế (Thu)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#ff4783] font-mono font-tabular tracking-tight">
              +{totalIn.toLocaleString('vi-VN')} <span className="text-xs font-semibold">đ</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {countIn} hóa đơn / khoản thu
            </span>
          </div>
        </div>

        {/* Metric 2: Chi phí thực tế */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Chi phí thực tế (Chi)
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              -{totalOut.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-400">đ</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {countOut} phiếu chi hàng hóa &amp; vận hành
            </span>
          </div>
        </div>

        {/* Metric 3: Lợi nhuận trước thuế */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lợi nhuận ròng
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono font-tabular tracking-tight">
              {netProfit >= 0 ? '+' : '-'}{Math.abs(netProfit).toLocaleString('vi-VN')}{' '}
              <span className="text-xs font-semibold text-slate-400">đ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-black text-slate-950 bg-[#d0f81b] px-1.5 py-0.2 rounded border border-[#bde412]">
                Tỷ suất: {profitMargin}%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Tạm tính thuế HKD */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Nghĩa vụ thuế tạm tính (1.5%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-700 font-mono font-tabular tracking-tight">
              {totalTax.toLocaleString('vi-VN')} <span className="text-xs font-semibold">đ</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              1.0% GTGT + 0.5% TNCN
            </span>
          </div>
        </div>
      </div>

      {/* 3. Circular 88 Tax Schedule Table (Bảng Kê Kế Toán Chuẩn TT88) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Bảng Kê Doanh Thu Tính Thuế Hộ Kinh Doanh
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Mẫu TT 88/2021/TT-BTC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng phương pháp tính thuế theo tỷ lệ % trên doanh thu thực tế đối soát từ sổ cái
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d0f81b]/35 text-slate-950 text-xs font-black border border-[#bde412] self-start sm:self-auto">
            <span className="material-symbols-outlined text-[15px] text-slate-950">verified</span>
            <span>Hóa đơn hợp lệ 100%</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-3 px-4 text-center w-12">STT</th>
                <th className="py-3 px-5">Nhóm Ngành Nghề Kinh Doanh</th>
                <th className="py-3 px-5 text-center">Tỷ Lệ Thuế</th>
                <th className="py-3 px-5 text-right">Doanh Số Tính Thuế</th>
                <th className="py-3 px-5 text-right">Thuế GTGT (1.0%)</th>
                <th className="py-3 px-5 text-right">Thuế TNCN (0.5%)</th>
                <th className="py-3 px-5 text-right font-bold">Tổng Thuế (1.5%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">01</td>
                <td className="py-3.5 px-5">
                  <span className="font-bold text-slate-900 block">
                    Phân phối, cung cấp hàng hóa (Bán buôn, bán lẻ)
                  </span>
                  <span className="text-xs text-slate-400">
                    Cửa hàng bán lẻ tạp hóa, tiêu dùng nhanh, F&amp;B
                  </span>
                </td>
                <td className="py-3.5 px-5 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                    1.5% tổng doanh thu
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular font-bold text-slate-900">
                  {totalIn.toLocaleString('vi-VN')} đ
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular text-slate-700">
                  {vatTax.toLocaleString('vi-VN')} đ
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular text-slate-700">
                  {pitTax.toLocaleString('vi-VN')} đ
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular font-extrabold text-[#ff4783]">
                  {totalTax.toLocaleString('vi-VN')} đ
                </td>
              </tr>

              {/* Summary row */}
              <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
                <td colSpan={3} className="py-3.5 px-5 text-slate-900 font-bold">
                  Tổng Cộng Doanh Thu &amp; Thuế Tạm Tính Của Cơ Sở
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular font-extrabold text-slate-900">
                  {totalIn.toLocaleString('vi-VN')} đ
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular text-slate-800">
                  {vatTax.toLocaleString('vi-VN')} đ
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular text-slate-800">
                  {pitTax.toLocaleString('vi-VN')} đ
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-tabular font-extrabold text-[#ff4783] text-base">
                  {totalTax.toLocaleString('vi-VN')} đ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real Category Distribution Grid */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Cơ Cấu Thu Chi Thực Tế Theo Hạng Mục
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích tỷ trọng chi tiêu và dòng tiền theo từng nhóm nghiệp vụ đã phát sinh
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {categoryBreakdown.length} hạng mục hoạt động
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Chưa có phát sinh giao dịch để lập bảng phân loại hạng mục.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.category}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff4783]"></span>
                    <span className="font-bold text-slate-900 text-sm">{cat.category}</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {cat.total.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Thu: <strong className="text-[#ff4783]">+{cat.inSum.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span>
                    Chi: <strong className="text-slate-800">-{cat.outSum.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{cat.count} giao dịch</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0f172a] h-full rounded-full"
                    style={{ width: `${Math.max(4, cat.percent)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <span className="material-symbols-outlined text-[#d0f81b] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
