import React, { useState, useMemo, useEffect } from 'react';
import { fetchUserTransactions, createManualTransaction } from '../services/api';
import { Transaction } from '../types';
import { UserAccount } from '../components/AuthModal';

interface OwnerCashflowLedgerProps {
  currentUser?: UserAccount | null;
  onDownloadExcel: () => void;
  onPrintReport: () => void;
  onNavigateToSettings?: () => void;
}

export const OwnerCashflowLedger: React.FC<OwnerCashflowLedgerProps> = ({
  currentUser,
  onDownloadExcel,
  onPrintReport,
  onNavigateToSettings,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'merged'>('all');
  const [timeChip, setTimeChip] = useState<'all' | 'today' | 'yesterday' | '7days' | 'month'>('all');
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);
  const [selectedChartCategory, setSelectedChartCategory] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Manual Entry Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualType, setManualType] = useState<'THU' | 'CHI'>('THU');
  const [manualCategory, setManualCategory] = useState('Hoa Don Le');
  const [manualAmount, setManualAmount] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatShortAmount = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace('.0', '') + ' tỷ';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace('.0', '') + ' tr';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(0) + ' k';
    }
    return num.toString() + ' đ';
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchUserTransactions(currentUser?.id);
      setTransactions(data);
    } catch (err) {
      console.error('Lỗi tải giao dịch:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  // Aggregate Key Real Metrics
  const { totalIn, totalOut, netCashflow, countIn, countOut, countMerged, inRatio } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    let inCount = 0;
    let outCount = 0;
    let mergedCount = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'merged') {
        mergedCount++;
      } else if (tx.amount > 0 || tx.type === 'in') {
        inSum += Math.abs(tx.amount);
        inCount++;
      } else {
        outSum += Math.abs(tx.amount);
        outCount++;
      }
    });

    const net = inSum - outSum;
    const ratio = inSum > 0 ? Math.min(100, Math.max(0, Math.round((net / inSum) * 100))) : 0;

    return {
      totalIn: inSum,
      totalOut: outSum,
      netCashflow: net,
      countIn: inCount,
      countOut: outCount,
      countMerged: mergedCount,
      inRatio: ratio,
    };
  }, [transactions]);

  // Compute PRO Subscription Expiration status
  const proExpiresAt = currentUser?.proExpiresAt;
  const isPro = (currentUser?.subscriptionPlan || '').toUpperCase() === 'PRO';
  const diffDays = useMemo(() => {
    if (!proExpiresAt) return null;
    const expiryTime = new Date(proExpiresAt).getTime();
    if (isNaN(expiryTime)) return null;
    const diffTime = expiryTime - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [proExpiresAt]);

  // 1. Calculate Daily Cashflow (Last 7 days timeline)
  const dailyCashflowData = useMemo(() => {
    const daysMap: Record<
      string,
      {
        dateKey: string;
        label: string;
        inflow: number;
        outflow: number;
        net: number;
        deficit: number;
        count: number;
      }
    > = {};
    const dateKeys: string[] = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      dateKeys.push(key);

      const isToday = i === 0;
      const isYesterday = i === 1;
      const label = isToday ? 'Hôm nay' : isYesterday ? 'Hôm qua' : `${d.getDate()}/${d.getMonth() + 1}`;

      daysMap[key] = {
        dateKey: key,
        label,
        inflow: 0,
        outflow: 0,
        net: 0,
        deficit: 0,
        count: 0,
      };
    }

    transactions.forEach((tx) => {
      let key = '';
      if (tx.rawDate) {
        key = tx.rawDate.slice(0, 10);
      } else if (tx.dateLabel === 'Hôm nay') {
        key = dateKeys[dateKeys.length - 1];
      } else if (tx.dateLabel === 'Hôm qua') {
        key = dateKeys[dateKeys.length - 2];
      }

      if (key && daysMap[key]) {
        daysMap[key].count++;
        if (tx.amount > 0 || tx.type === 'in') {
          daysMap[key].inflow += Math.abs(tx.amount);
        } else if (tx.type === 'out' || tx.amount < 0) {
          daysMap[key].outflow += Math.abs(tx.amount);
        }
      } else if (key) {
        if (!daysMap[key]) {
          dateKeys.push(key);
          daysMap[key] = {
            dateKey: key,
            label: tx.dateLabel || key.slice(5),
            inflow: 0,
            outflow: 0,
            net: 0,
            deficit: 0,
            count: 0,
          };
        }
        daysMap[key].count++;
        if (tx.amount > 0 || tx.type === 'in') {
          daysMap[key].inflow += Math.abs(tx.amount);
        } else if (tx.type === 'out' || tx.amount < 0) {
          daysMap[key].outflow += Math.abs(tx.amount);
        }
      }
    });

    const result = dateKeys.slice(-7).map((k) => {
      const item = daysMap[k];
      const net = item.inflow - item.outflow;
      const deficit = item.outflow > item.inflow ? item.outflow - item.inflow : 0;
      return {
        ...item,
        net,
        deficit,
      };
    });

    const maxVal = Math.max(...result.map((d) => Math.max(d.inflow, d.outflow)), 100000);
    const deficitDaysCount = result.filter((d) => d.deficit > 0).length;
    const maxDeficit = Math.max(...result.map((d) => d.deficit), 0);

    return {
      items: result,
      maxVal,
      deficitDaysCount,
      maxDeficit,
    };
  }, [transactions]);

  // 2. Calculate Top Expense Breakdown
  const topExpensesData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    let totalExpenseSum = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'out' || tx.amount < 0) {
        const cat = tx.category || 'Khoản chi khác';
        const val = Math.abs(tx.amount);
        totalExpenseSum += val;
        if (!map[cat]) {
          map[cat] = { amount: 0, count: 0 };
        }
        map[cat].amount += val;
        map[cat].count += 1;
      }
    });

    const list = Object.keys(map)
      .map((cat) => ({
        category: cat,
        amount: map[cat].amount,
        count: map[cat].count,
        percent: totalExpenseSum > 0 ? Math.round((map[cat].amount / totalExpenseSum) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      items: list,
      totalExpenseSum,
    };
  }, [transactions]);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'in' && tx.type !== 'in') return false;
        if (typeFilter === 'out' && tx.type !== 'out') return false;
        if (typeFilter === 'merged' && tx.type !== 'merged') return false;
      }

      // Time Chip Filter
      if (timeChip === 'today' && tx.dateLabel !== 'Hôm nay') return false;
      if (timeChip === 'yesterday' && tx.dateLabel !== 'Hôm qua') return false;

      // Chart Filter (Date)
      if (selectedChartDate) {
        const matchesDate =
          tx.dateLabel === selectedChartDate ||
          (tx.rawDate && tx.rawDate.startsWith(selectedChartDate));
        if (!matchesDate) return false;
      }

      // Chart Filter (Category)
      if (selectedChartCategory) {
        if (tx.category !== selectedChartCategory) return false;
      }

      // Search Query
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesDetails = tx.details?.toLowerCase().includes(query);
        const matchesRef = tx.refCode?.toLowerCase().includes(query);
        const matchesAmount = Math.abs(tx.amount).toString().includes(query);
        return matchesTitle || matchesCategory || matchesDetails || matchesRef || matchesAmount;
      }

      return true;
    });
  }, [transactions, typeFilter, timeChip, selectedChartDate, selectedChartCategory, searchTerm]);

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Handle Manual Transaction Submit
  const handleSaveManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(manualAmount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ (> 0)', 'error');
      return;
    }
    if (!manualReason.trim()) {
      showToast('Vui lòng nhập nội dung diễn giải thu/chi', 'error');
      return;
    }

    setManualSubmitting(true);
    try {
      const res = await createManualTransaction({
        userId: currentUser?.id,
        category: manualCategory,
        transactionType: manualType,
        totalAmount: numAmount,
        reason: manualReason.trim(),
        transactionDate: new Date().toISOString(),
      });

      if (res.success) {
        showToast(
          `Đã ghi nhận khoản ${manualType === 'THU' ? 'tiền vào' : 'tiền ra'} ${numAmount.toLocaleString('vi-VN')} đ thành công!`
        );
        setManualAmount('');
        setManualReason('');
        setManualModalOpen(false);
        // Refresh list
        loadData(true);
      } else {
        showToast(res.message || 'Không thể ghi nhận giao dịch', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi yêu cầu', 'error');
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Store Information */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sổ Quỹ Thu Chi &amp; Dòng Tiền
            </h1>
            <span className="bg-[#d0f81b] text-slate-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#bde412] shadow-2xs uppercase">
              <span className="w-2 h-2 rounded-full bg-[#ff4783] animate-pulse"></span>
              {currentUser?.subscriptionPlan === 'PRO' ? 'Gói Chuyên Nghiệp (PRO)' : 'Gói Cơ Bản (FREE)'}
            </span>
          </div>
          <p className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900">
              {currentUser?.shopName || currentUser?.storeName || 'Cửa Hàng Hộ Kinh Doanh'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs">Chủ hộ: {currentUser?.name || 'Chủ Cửa Hàng'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Đồng bộ dữ liệu thời gian thực
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadData(true);
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            type="button"
            title="Làm mới sổ quỹ"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>

          <button
            onClick={onDownloadExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">file_download</span>
            <span>Xuất Excel TT88</span>
          </button>

          <button
            onClick={() => setManualModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black shadow-sm shadow-[#ff4783]/20 hover:shadow transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Ghi Thu / Chi Nhanh</span>
          </button>
        </div>
      </div>

      {/* Expiry Warning Banner (<= 2 days) */}
      {isPro && diffDays !== null && diffDays <= 2 && diffDays > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">
              warning
            </span>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Gói PRO của bạn sắp hết hạn sau {diffDays === 1 ? '1 ngày' : `${diffDays} ngày`} ({new Date(proExpiresAt!).toLocaleDateString('vi-VN')})
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Vui lòng gia hạn để duy trì kết nối đối soát tự động & nhận báo cáo tổng kết kinh doanh mỗi tối 22:00.
              </p>
            </div>
          </div>
          {onNavigateToSettings ? (
            <button
              onClick={onNavigateToSettings}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer text-center"
              type="button"
            >
              <span>Gia Hạn Ngay</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <a
              href="#cai-dat-cua-hang"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer text-center"
            >
              <span>Gia Hạn Ngay</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          )}
        </div>
      )}

      {/* 2. Three Real High-Contrast Cashflow KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Tiền Vào (Inflow) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng tiền vào (Thu)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#ff4783]"></span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#ff4783] tracking-tight font-tabular">
              +{totalIn.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-[#ff4783]">đ</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900 bg-pink-50 text-[#ff4783] px-2 py-0.5 rounded-md border border-pink-200">
                {countIn} lượt thu
              </span>
              <span>Bán lẻ, chuyển khoản VietQR</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#ff4783] h-full rounded-full" style={{ width: totalIn > 0 ? '100%' : '0%' }}></div>
          </div>
        </div>

        {/* Card 2: Tiền Ra (Outflow) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng tiền ra (Chi)
            </span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-tabular">
              -{totalOut.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-slate-500">đ</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {countOut} lượt chi
              </span>
              <span>Tiền hàng sỉ, vận hành, điện nước</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-700 h-full rounded-full"
              style={{ width: totalIn > 0 ? `${Math.min(100, Math.round((totalOut / totalIn) * 100))}%` : '0%' }}
            ></div>
          </div>
        </div>

        {/* Card 3: Dòng Tiền Ròng / Tồn Quỹ (Net Surplus) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dòng tiền thực thu (Tồn quỹ)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#d0f81b]"></span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-tabular">
              {netCashflow >= 0 ? '+' : '-'}{Math.abs(netCashflow).toLocaleString('vi-VN')}{' '}
              <span className="text-sm font-semibold text-slate-500">đ</span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
              <span className="bg-[#d0f81b] text-slate-950 px-2 py-0.5 rounded-md font-black border border-[#bde412]">
                Tỷ lệ ròng: {inRatio}%
              </span>
              <span className="text-slate-600 font-semibold">
                {countMerged > 0 ? `Đã tự động gộp ${countMerged} đơn POS` : 'Quỹ tiền mặt ổn định'}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0f172a] h-full rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, inRatio))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2.5. Two Clean Core Charts (Zero Noise, High Contrast) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: THU VS CHI THEO NGÀY */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-slate-700">bar_chart</span>
                  <span>Thu &amp; Chi Theo Ngày</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  So sánh 7 ngày gần nhất &bull; Bấm vào ngày để lọc giao dịch
                </p>
              </div>

              {/* Minimal Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#ff4783]"></span>
                  <span>Thu</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-900"></span>
                  <span>Chi</span>
                </span>
              </div>
            </div>

            {/* Vertical Bar Columns */}
            <div className="h-44 pt-5 pb-2 flex items-end justify-between gap-1 sm:gap-2">
              {dailyCashflowData.items.map((day) => {
                const isSelected = selectedChartDate === day.label || selectedChartDate === day.dateKey;
                const inHeight = day.inflow > 0 ? Math.max(8, Math.round((day.inflow / dailyCashflowData.maxVal) * 100)) : 0;
                const outHeight = day.outflow > 0 ? Math.max(8, Math.round((day.outflow / dailyCashflowData.maxVal) * 100)) : 0;
                const hasDeficit = day.deficit > 0;

                return (
                  <div
                    key={day.dateKey}
                    onClick={() => {
                      const newFilter = isSelected ? null : day.label;
                      setSelectedChartDate(newFilter);
                      setCurrentPage(1);
                    }}
                    title={`${day.label}: Thu +${day.inflow.toLocaleString('vi-VN')} đ | Chi -${day.outflow.toLocaleString('vi-VN')} đ`}
                    className={`flex-1 flex flex-col items-center justify-end h-full p-1 rounded-xl transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-100 ring-2 ring-slate-900'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Deficit Alert Tag if Outflow > Inflow */}
                    {hasDeficit && (
                      <div className="absolute -top-3 z-10">
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                          -{formatShortAmount(day.deficit)}
                        </span>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-28">
                      {/* Inflow Bar */}
                      <div className="w-1/2 max-w-[14px] flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${inHeight}%` }}
                          className={`w-full bg-[#ff4783] rounded-t-sm transition-all duration-300 ${
                            inHeight === 0 ? 'opacity-0' : 'opacity-100 group-hover:brightness-105'
                          }`}
                        ></div>
                      </div>

                      {/* Outflow Bar */}
                      <div className="w-1/2 max-w-[14px] flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${outHeight}%` }}
                          className={`w-full bg-slate-900 rounded-t-sm transition-all duration-300 ${
                            outHeight === 0 ? 'opacity-0' : 'opacity-100 group-hover:bg-slate-800'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Day label */}
                    <span className={`text-[11px] font-bold mt-2 truncate max-w-full ${
                      isSelected ? 'text-slate-950 font-black' : 'text-slate-600'
                    }`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Status */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {dailyCashflowData.deficitDaysCount > 0 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Có {dailyCashflowData.deficitDaysCount} ngày Chi vượt Thu (lớn nhất -{dailyCashflowData.maxDeficit.toLocaleString('vi-VN')} đ)</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Dòng tiền ổn định &bull; Thu bù đắp đủ Chi ở mọi ngày</span>
              </span>
            )}
            {selectedChartDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChartDate(null);
                  setCurrentPage(1);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold underline cursor-pointer"
              >
                Bỏ chọn ngày
              </button>
            )}
          </div>
        </div>

        {/* CHART 2: XẾP HẠNG CÁC KHOẢN CHI */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-slate-700">pie_chart</span>
                  <span>Cơ Cấu Tiền Chi Ra</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xếp hạng các hạng mục tiêu tốn tiền nhất &bull; Bấm để lọc
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold font-mono">
                Tổng: -{topExpensesData.totalExpenseSum.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Horizontal Ranked Bars */}
            <div className="space-y-3 min-h-[160px] flex flex-col justify-center">
              {topExpensesData.items.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa ghi nhận khoản tiền chi nào trong sổ quỹ
                </div>
              ) : (
                topExpensesData.items.slice(0, 4).map((item, idx) => {
                  const isSelected = selectedChartCategory === item.category;

                  return (
                    <div
                      key={item.category}
                      onClick={() => {
                        const newCat = isSelected ? null : item.category;
                        setSelectedChartCategory(newCat);
                        setCurrentPage(1);
                      }}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100 ring-2 ring-slate-900'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <span className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                            idx === 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{item.category}</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-extrabold text-slate-900">{item.percent}%</span>
                          <span className="text-slate-400 text-[11px]">
                            (-{item.amount.toLocaleString('vi-VN')} đ)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(3, item.percent)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-slate-900' : 'bg-slate-600'
                          }`}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Status */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {topExpensesData.items.length > 0 ? (
              <span className="text-slate-700 font-medium">
                Khoản chi lớn nhất:{' '}
                <strong className="text-slate-900 font-extrabold">
                  {topExpensesData.items[0]?.category} ({topExpensesData.items[0]?.percent}%)
                </strong>
              </span>
            ) : (
              <span className="text-slate-400">Không có dữ liệu chi phí</span>
            )}

            {selectedChartCategory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChartCategory(null);
                  setCurrentPage(1);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold underline cursor-pointer"
              >
                Bỏ chọn hạng mục
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Master Ledger Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Title Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4783]"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Nhật Ký Giao Dịch Sổ Quỹ Tiền Mặt
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Chi tiết các khoản tiền vào, tiền ra và biên lai thanh toán đã được đối soát thực tế.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              {filteredTransactions.length} giao dịch hiển thị
            </span>
          </div>
        </div>

        {/* Table Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/60 space-y-3.5">
          {/* Active Chart Filter Banner */}
          {(selectedChartDate || selectedChartCategory) && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs flex-wrap">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#d0f81b]">filter_alt</span>
                Đang lọc từ biểu đồ:
              </span>
              {selectedChartDate && (
                <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
                  Ngày: {selectedChartDate}
                </span>
              )}
              {selectedChartCategory && (
                <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
                  Hạng mục: {selectedChartCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedChartDate(null);
                  setSelectedChartCategory(null);
                  setCurrentPage(1);
                }}
                className="ml-auto text-[#d0f81b] hover:underline font-bold cursor-pointer"
              >
                ✕ Xóa lọc biểu đồ
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm nội dung, danh mục, số tiền..."
                className="w-full h-9.5 pl-9 pr-8 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all shadow-xs"
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

            {/* Time Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => { setTimeChip('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  timeChip === 'all'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                Tất cả
              </button>
              <button
                onClick={() => { setTimeChip('today'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  timeChip === 'today'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                Hôm nay
              </button>
              <button
                onClick={() => { setTimeChip('yesterday'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  timeChip === 'yesterday'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                Hôm qua
              </button>
            </div>
          </div>

          {/* Type Filter Pills & Fast Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                Tất cả ({transactions.length})
              </button>

              <button
                onClick={() => { setTypeFilter('in'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  typeFilter === 'in'
                    ? 'bg-[#ff4783] text-white font-black shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>Tiền Vào (+{countIn})</span>
              </button>

              <button
                onClick={() => { setTypeFilter('out'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  typeFilter === 'out'
                    ? 'bg-[#0f172a] text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>Tiền Ra (-{countOut})</span>
              </button>

              {countMerged > 0 && (
                <button
                  onClick={() => { setTypeFilter('merged'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === 'merged'
                      ? 'bg-purple-900 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">call_merge</span>
                  <span>Đã gộp POS ({countMerged})</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
              <span>Hiển thị: <strong className="text-slate-900">{filteredTransactions.length}</strong> giao dịch</span>
            </div>
          </div>
        </div>

        {/* Real Transactions Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap w-28">Thời Gian</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[220px]">Nội Dung &amp; Hạng Mục</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[160px]">Hình Thức Thanh Toán</th>
                <th className="py-3 px-4 whitespace-nowrap text-right min-w-[130px]">Số Tiền (VNĐ)</th>
                <th className="py-3 px-4 whitespace-nowrap text-center min-w-[120px] pr-5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] animate-spin text-[#ff4783]">
                      progress_activity
                    </span>
                    <p className="text-xs font-semibold text-slate-500 mt-2">Đang tải dữ liệu sổ quỹ...</p>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">Không tìm thấy giao dịch nào</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Chưa có phát sinh thu chi phù hợp với bộ lọc hiện tại. Bạn có thể nhấn nút "Ghi Thu/Chi Nhanh" để tạo khoản giao dịch mới.
                    </p>
                    <button
                      onClick={() => setManualModalOpen(true)}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff4783] text-white text-xs font-bold hover:bg-[#e0326e] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Ghi khoản đầu tiên</span>
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isPositive = tx.amount > 0 || tx.type === 'in';
                  const formattedAmount = `${isPositive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('vi-VN')} đ`;

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        tx.isStrikethrough
                          ? 'opacity-60 bg-slate-50/40'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Time */}
                      <td className="py-3.5 px-4 sm:px-5 align-top whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${tx.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {tx.time}
                          </span>
                          <span className="text-[11px] text-slate-400">{tx.dateLabel}</span>
                        </div>
                      </td>

                      {/* Content & Category */}
                      <td className="py-3.5 px-4 sm:px-5 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-xs sm:text-sm ${tx.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {tx.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                tx.type === 'out'
                                  ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                  : tx.type === 'merged'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : 'bg-[#ff4783]/10 text-[#ff4783] border border-[#ff4783]/20'
                              }`}
                            >
                              {tx.category}
                            </span>
                          </div>
                          {tx.details && tx.details !== tx.title && (
                            <span className="text-xs text-slate-500 line-clamp-1">{tx.details}</span>
                          )}
                          {tx.refCode && (
                            <span className="text-[10px] text-slate-400 font-mono">Mã: {tx.refCode}</span>
                          )}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 sm:px-5 align-top whitespace-nowrap">
                        <span className="text-xs text-slate-700 font-medium">
                          {tx.method || 'Nhập thủ công'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 sm:px-5 align-top text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-extrabold font-tabular ${
                            tx.isStrikethrough
                              ? 'text-slate-400 line-through'
                              : isPositive
                              ? 'text-[#ff4783]'
                              : 'text-slate-900'
                          }`}
                        >
                          {formattedAmount}
                        </span>
                      </td>

                      {/* Reconcile Status */}
                      <td className="py-3.5 px-4 sm:px-5 align-top text-center whitespace-nowrap">
                        {tx.type === 'merged' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            <span>Đã gộp POS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Đã đối soát</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-3.5 px-5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang <strong className="text-slate-900">{currentPage}</strong> / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 shadow-xs disabled:opacity-40 cursor-pointer"
                type="button"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 shadow-xs disabled:opacity-40 cursor-pointer"
                type="button"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Quick Manual Entry Modal (POST /api/manual-entry) */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ff4783]/10 text-[#ff4783] flex items-center justify-center border border-[#ff4783]/20">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ghi Thu / Chi Nhanh</h3>
                  <p className="text-xs text-slate-500">Lưu trực tiếp vào sổ cái đối soát điện tử</p>
                </div>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveManualEntry} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại giao dịch *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('THU')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      manualType === 'THU'
                        ? 'bg-[#ff4783] text-white border-[#ff4783] shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    <span>TIỀN VÀO (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('CHI')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      manualType === 'CHI'
                        ? 'bg-[#0f172a] text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    <span>TIỀN RA (-)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="manual_amount">
                  Số tiền (VNĐ) *
                </label>
                <div className="relative">
                  <input
                    id="manual_amount"
                    type="text"
                    value={manualAmount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setManualAmount(clean ? Number(clean).toLocaleString('vi-VN') : '');
                    }}
                    placeholder="Ví dụ: 150.000"
                    required
                    className="w-full h-11 px-3.5 bg-slate-50 rounded-xl text-slate-900 text-base font-extrabold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    đ
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="manual_category">
                  Danh mục phân loại *
                </label>
                <select
                  id="manual_category"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all cursor-pointer"
                >
                  <option value="Hoa Don Le">Bán lẻ quầy / Hóa đơn bán lẻ</option>
                  <option value="Chuyen Khoan">Chuyển khoản VietQR</option>
                  <option value="POS Ket Ca">Kết ca máy tính tiền POS</option>
                  <option value="So Tay">Sổ tay thu chi viết tay</option>
                  <option value="Khac">Khoản thu chi khác</option>
                </select>
              </div>

              {/* Reason / Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="manual_reason">
                  Nội dung diễn giải *
                </label>
                <textarea
                  id="manual_reason"
                  rows={2}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Ví dụ: Khách thanh toán mua bia hoặc Tiền điện tháng 10"
                  required
                  className="w-full p-3 bg-slate-50 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] border border-slate-200 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {manualSubmitting ? 'Đang lưu...' : 'Lưu Vào Sổ Quỹ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
