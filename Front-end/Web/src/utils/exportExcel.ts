import { Transaction } from '../types';
import { fetchUserTransactions } from '../services/api';

/**
 * Utility to export real transactions from MongoDB to CSV / Excel spreadsheet
 * Formatted with UTF-8 BOM (\uFEFF) for 100% native Vietnamese character rendering in Microsoft Excel.
 */
export async function exportTransactionsToExcel(
  transactionsOrUserId?: Transaction[] | string,
  storeName?: string
): Promise<{ success: boolean; count: number; filename: string }> {
  try {
    let transactions: Transaction[] = [];

    if (Array.isArray(transactionsOrUserId)) {
      transactions = transactionsOrUserId;
    } else {
      transactions = await fetchUserTransactions(transactionsOrUserId);
    }

    if (!transactions || transactions.length === 0) {
      // Re-fetch fallback
      transactions = await fetchUserTransactions();
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `Bang_Ke_Thu_Chi_VikeSo_${dateFormatted}.csv`;

    // CSV Header row
    const headers = [
      'STT',
      'Mã Giao Dịch',
      'Ngày Ghi Nhận',
      'Thời Gian',
      'Nội Dung / Diễn Giải',
      'Loại Giao Dịch',
      'Khoản Thu (Vào - VNĐ)',
      'Khoản Chi (Ra - VNĐ)',
      'Hình Thức Thanh Toán',
      'Danh Mục Phân Loại',
      'Trạng Thái Đối Soát',
    ];

    let totalIn = 0;
    let totalOut = 0;

    const rows = transactions.map((t, index) => {
      const isThu = t.type === 'in' || (t.type !== 'out' && t.amount > 0);
      const isChi = t.type === 'out' || t.amount < 0;

      const thuAmount = isThu ? Math.abs(t.amount) : 0;
      const chiAmount = isChi ? Math.abs(t.amount) : 0;

      totalIn += thuAmount;
      totalOut += chiAmount;

      return [
        index + 1,
        `"${t.id || t.refCode || ''}"`,
        `"${t.dateLabel || t.rawDate || ''}"`,
        `"${t.time || ''}"`,
        `"${(t.title || '').replace(/"/g, '""')} - ${(t.details || '').replace(/"/g, '""')}"`,
        `"${isThu ? 'Thu (Vào)' : isChi ? 'Chi (Ra)' : 'Gộp ca'}"`,
        thuAmount,
        chiAmount,
        `"${(t.method || '').replace(/"/g, '""')}"`,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.statusText || t.status || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Summary calculation row
    const netProfit = totalIn - totalOut;
    const summaryRow = [
      '',
      '"TỔNG CỘNG"',
      '""',
      '""',
      `"Cửa hàng: ${(storeName || 'Hộ Kinh Doanh VikeSo').replace(/"/g, '""')}"`,
      `"Lãi ròng: ${netProfit.toLocaleString('vi-VN')} đ"`,
      totalIn,
      totalOut,
      '""',
      '""',
      `"Khớp ${transactions.length} chứng từ"`,
    ].join(',');

    // UTF-8 BOM prefix ensures Microsoft Excel renders Vietnamese correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: transactions.length, filename };
  } catch (error) {
    console.error('Lỗi khi xuất bảng kê Excel:', error);
    return { success: false, count: 0, filename: '' };
  }
}

/**
 * Trigger formatted print for A4 PDF Tax / Cashflow Ledger report
 */
export function printFinancialReport(title = 'Báo Cáo Sổ Quỹ Thu Chi VikeSo') {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}
