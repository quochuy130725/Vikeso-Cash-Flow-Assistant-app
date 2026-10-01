import React, { useState, useMemo } from 'react';
import { ownerTransactions } from '../data/mockData';
import { Transaction } from '../types';

interface OwnerLedgerProps {
  onDownloadExcel: () => void;
  onPrintReport: () => void;
}

export const OwnerLedger: React.FC<OwnerLedgerProps> = ({
  onDownloadExcel,
  onPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | '7days' | 'month'>('today');
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
    <div className="flex flex-col w-full space-y-space-lg px-gutter-desktop py-space-lg">
      {/* Header and Summary stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Hệ thống sổ cái thời gian thực
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span className="font-label-sm text-label-sm text-primary font-bold">Trực tuyến</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Sổ Nhật Ký Thu Chi &amp; Lịch Sử Giao Dịch
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đối soát chéo nguồn tiền POS máy tính tiền, mã VietQR động và hóa đơn quét AI
          </p>
        </div>

        {/* 3 Stats Chips */}
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-surface-container">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                Tổng lượt ghi
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                38 <span className="font-label-md text-label-md text-on-surface-variant font-normal">giao dịch</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-surface-container">
            <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-primary-container uppercase font-semibold">
                Tiền Vào (+)
              </span>
              <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                32
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-surface-container">
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary-container">
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-tertiary-container uppercase font-semibold">
                Tiền Ra (-)
              </span>
              <span className="font-headline-sm text-headline-sm text-tertiary-container font-bold">
                6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container space-y-space-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          {/* Live Search */}
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo nội dung, mã giao dịch, số tiền..."
              className="w-full h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface placeholder:text-outline rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container border border-surface-container transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Time chips */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-primary text-on-primary shadow-xs font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeFilter('yesterday')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                timeFilter === 'yesterday'
                  ? 'bg-primary text-on-primary shadow-xs font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              Hôm qua
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                timeFilter === '7days'
                  ? 'bg-primary text-on-primary shadow-xs font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-primary text-on-primary shadow-xs font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              Tháng này
            </button>
          </div>
        </div>

        {/* Categories and Action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md pt-space-xs border-t border-surface-container/60">
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-space-xs cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-on-surface text-surface font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span>Tất cả giao dịch</span>
              <span className="w-1.5 h-1.5 rounded-full bg-surface"></span>
            </button>

            <button
              onClick={() => setTypeFilter('in')}
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-space-xs cursor-pointer ${
                typeFilter === 'in'
                  ? 'bg-on-surface text-surface font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span>Tiền Vào (+)</span>
            </button>

            <button
              onClick={() => setTypeFilter('out')}
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-space-xs cursor-pointer ${
                typeFilter === 'out'
                  ? 'bg-on-surface text-surface font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
              <span>Tiền Ra (-)</span>
            </button>

            <button
              onClick={() => setTypeFilter('merged')}
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-space-xs cursor-pointer ${
                typeFilter === 'merged'
                  ? 'bg-on-surface text-surface font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">call_merge</span>
              <span>Đã gộp máy tính tiền (MERGED)</span>
            </button>
          </div>

          <div className="flex items-center gap-space-sm self-end sm:self-auto">
            <button
              onClick={onDownloadExcel}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">download</span>
              <span>Tải file Excel sổ sách</span>
            </button>

            <button
              onClick={onPrintReport}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>In báo cáo ngày</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-surface-container">
                <th className="py-space-md px-space-lg font-label-md text-label-md tracking-wider uppercase w-32">
                  Thời gian
                </th>
                <th className="py-space-md px-space-lg font-label-md text-label-md tracking-wider uppercase">
                  Nội dung &amp; Danh mục
                </th>
                <th className="py-space-md px-space-lg font-label-md text-label-md tracking-wider uppercase w-64">
                  Phương thức ghi nhận
                </th>
                <th className="py-space-md px-space-lg font-label-md text-label-md tracking-wider uppercase text-right w-48">
                  Số tiền (VNĐ)
                </th>
                <th className="py-space-md px-space-lg font-label-md text-label-md tracking-wider uppercase text-center w-56">
                  Trạng thái đối soát
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                const formattedAmount = `${isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('vi-VN')} đ`;

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors ${
                      tx.isStrikethrough
                        ? 'opacity-60 hover:opacity-100 bg-surface-container-low/20'
                        : 'hover:bg-surface-container-low/60'
                    }`}
                  >
                    {/* Column 1: Time */}
                    <td className="py-space-md px-space-lg align-top">
                      <div className="flex flex-col">
                        <span
                          className={`font-label-lg text-label-lg font-bold ${
                            tx.isStrikethrough ? 'text-outline line-through' : 'text-on-surface'
                          }`}
                        >
                          {tx.time}
                        </span>
                        <span className="font-label-sm text-label-sm text-outline">
                          {tx.dateLabel}
                        </span>
                      </div>
                    </td>

                    {/* Column 2: Content & Category */}
                    <td className="py-space-md px-space-lg align-top">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span
                            className={`font-body-md text-body-md font-semibold ${
                              tx.isStrikethrough ? 'text-outline line-through' : 'text-on-surface'
                            }`}
                          >
                            {tx.title}
                          </span>
                          <span
                            className={`font-label-sm text-label-sm px-space-xs py-0.5 rounded font-medium ${
                              tx.type === 'out'
                                ? 'bg-tertiary-fixed/40 text-on-tertiary-fixed'
                                : tx.type === 'merged'
                                ? 'bg-surface-container-highest text-on-surface'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {tx.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          {tx.type === 'merged' && !tx.isStrikethrough && (
                            <span className="material-symbols-outlined text-outline text-[16px]">
                              inventory_2
                            </span>
                          )}
                          <span
                            className={`font-body-sm text-body-sm ${
                              tx.isStrikethrough ? 'text-outline' : 'text-on-surface-variant'
                            }`}
                          >
                            {tx.details}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Method */}
                    <td className="py-space-md px-space-lg align-top">
                      <div
                        className={`flex items-center gap-space-xs ${
                          tx.isStrikethrough ? 'text-outline' : 'text-on-surface'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            tx.methodColor || 'bg-surface-container text-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {tx.methodIcon}
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm font-medium">{tx.method}</span>
                      </div>
                    </td>

                    {/* Column 4: Amount */}
                    <td className="py-space-md px-space-lg align-top text-right whitespace-nowrap">
                      <span
                        className={`font-headline-sm text-headline-sm font-bold ${
                          tx.isStrikethrough
                            ? 'text-outline line-through'
                            : isPositive
                            ? 'text-primary-container'
                            : 'text-tertiary-container'
                        }`}
                      >
                        {tx.isStrikethrough ? `${tx.amount.toLocaleString('vi-VN')} đ` : formattedAmount}
                      </span>
                    </td>

                    {/* Column 5: Status */}
                    <td className="py-space-md px-space-lg align-top text-center">
                      {tx.type === 'merged' && !tx.isStrikethrough ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[14px]">call_merge</span>
                            <span>Đã tự động gộp tránh trùng</span>
                          </span>
                          <span className="font-label-sm text-[10px] text-outline mt-0.5">
                            Khớp 100% hóa đơn con
                          </span>
                        </div>
                      ) : tx.isStrikethrough ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[14px]">link</span>
                            <span>Đã gộp vào kết ca</span>
                          </span>
                          <span className="font-label-sm text-[10px] text-outline mt-0.5">
                            MERGED - không tính 2 lần
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-primary-fixed/40 text-on-primary-fixed font-label-sm text-label-sm font-semibold">
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

        {/* Pagination bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-lg bg-surface-container-low/40 border-t border-surface-container">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span>Hiển thị</span>
            <span className="font-bold text-on-surface">{filteredTransactions.length}</span>
            <span>trên tổng số</span>
            <span className="font-bold text-on-surface">38</span>
            <span>giao dịch đối soát hôm nay</span>
          </div>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg bg-surface-container-lowest text-outline hover:text-on-surface flex items-center justify-center shadow-xs disabled:opacity-40 transition-colors border border-surface-container cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`w-9 h-9 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                currentPage === 1
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container'
              }`}
              type="button"
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-9 h-9 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                currentPage === 2
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container'
              }`}
              type="button"
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-9 h-9 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                currentPage === 3
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container'
              }`}
              type="button"
            >
              3
            </button>
            <span className="px-space-xs text-outline font-bold">...</span>
            <button
              onClick={() => setCurrentPage(7)}
              className={`w-9 h-9 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center shadow-xs cursor-pointer ${
                currentPage === 7
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container'
              }`}
              type="button"
            >
              7
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(7, p + 1))}
              disabled={currentPage === 7}
              className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center shadow-xs transition-colors border border-surface-container cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="md:col-span-2 p-space-md bg-surface-container-low rounded-xl flex items-center gap-space-md border border-surface-container">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">tips_and_updates</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-bold">
              Mẹo thông minh cho Chủ Cửa Hàng:
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Mọi khoản chi lẻ hay hóa đơn viết tay chụp bằng ứng dụng điện thoại sẽ tự động xuất hiện tại đây sau 2 giây với đầy đủ hạng mục đã phân loại.
            </span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline">Đồng bộ VietQR &amp; POS</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">
                Tự động bắt chéo đơn
              </span>
            </div>
          </div>
          <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-primary-container/10 text-primary-container font-semibold border border-primary-container/20">
            Chuẩn xác 100%
          </span>
        </div>
      </div>
    </div>
  );
};
