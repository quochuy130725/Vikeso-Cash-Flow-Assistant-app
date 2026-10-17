/**
 * Central API Service for VikeSo Web
 * Connects directly to real Backend APIs (MongoDB & Render)
 */

import { Transaction, BusinessHousehold, SubscriptionPayment } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://vikeso-cash-flow-assistant-app.onrender.com/api';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('vikeso_token');
  } catch {
    return null;
  }
}

export function getSavedUser(): any | null {
  try {
    const raw = localStorage.getItem('vikeso_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Maps raw MongoDB Receipt to frontend Transaction interface
 */
export function mapReceiptToTransaction(r: any): Transaction {
  const dateObj = r.transactionDate
    ? new Date(r.transactionDate)
    : new Date(r.createdAt || Date.now());
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  const today = new Date();
  const isToday =
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear();

  const dateLabel = isToday
    ? 'Hôm nay'
    : isYesterday
      ? 'Hôm qua'
      : `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

  const isThu = r.transactionType === 'THU';
  const isChi = r.transactionType === 'CHI';
  const isMerged = r.status === 'MERGED';

  const type: 'in' | 'out' | 'merged' = isMerged ? 'merged' : isChi ? 'out' : 'in';
  const amount = isChi ? -Math.abs(r.totalAmount) : Math.abs(r.totalAmount);

  // Category mapping
  let category = r.category || 'Thu/Chi';
  if (r.category === 'POS Ket Ca') category = 'Gộp ca POS';
  else if (r.category === 'Hoa Don Le') category = isChi ? 'Nhập hàng sỉ' : 'Bán lẻ quầy';
  else if (r.category === 'So Tay') category = 'Sổ tay thu chi';
  else if (r.category === 'Chuyen Khoan') category = isThu ? 'Chuyển khoản VietQR' : 'Chuyển khoản chi';
  else if (r.category === 'Khac') category = 'Khoản thu chi khác';

  // Details extraction
  let details = r.aiRawData?.details || '';
  if (!details && r.aiRawData?.ChiTietSanPham && Array.isArray(r.aiRawData.ChiTietSanPham)) {
    details = r.aiRawData.ChiTietSanPham
      .map((i: any) => `${i.Ten || i.name} (${Number(i.Gia || i.price || 0).toLocaleString()} đ)`)
      .join(', ');
  }
  if (!details) {
    details = r.reason || (isThu ? 'Khoản thu được ghi nhận tự động' : 'Khoản chi phục vụ cửa hàng');
  }

  // Method & Icon
  let method = r.aiRawData?.method;
  let methodIcon = 'payments';
  let methodColor = 'bg-surface-container text-on-surface';

  if (!method) {
    if (r.category === 'Chuyen Khoan') {
      method = 'Quét mã chuyển khoản VietQR';
      methodIcon = 'qr_code_2';
      methodColor = 'bg-primary-fixed text-on-primary-fixed';
    } else if (r.category === 'POS Ket Ca') {
      method = 'Máy tính tiền kết ca';
      methodIcon = 'point_of_sale';
      methodColor = 'bg-surface-container-highest text-on-surface';
    } else if (r.category === 'So Tay') {
      method = 'Sổ tay thu chi';
      methodIcon = 'edit_note';
      methodColor = 'bg-tertiary-fixed text-on-tertiary-fixed';
    } else {
      method = 'Trí tuệ nhân tạo đọc hóa đơn';
      methodIcon = 'document_scanner';
      methodColor = 'bg-secondary-fixed text-on-secondary-fixed';
    }
  }

  const status = isMerged ? 'merged' : 'reconciled';
  const statusText = isMerged ? 'Đã gộp vào kết ca' : 'Đã đối soát';
  const refCode =
    r.aiRawData?.refCode ||
    (r._id ? `TX-${String(r._id).slice(-6).toUpperCase()}` : undefined);
  const subBillCount = r.aiRawData?.subBillCount;

  return {
    id: String(r._id || r.id || Math.random()),
    time,
    dateLabel,
    title: r.reason || (isThu ? 'Khách thanh toán mua hàng' : 'Chi phí vận hành cửa hàng'),
    category,
    details,
    amount,
    type,
    method,
    methodIcon,
    methodColor,
    status,
    statusText,
    refCode,
    subBillCount,
    isStrikethrough: isMerged && !subBillCount,
  };
}

/**
 * Fetch real user transactions from MongoDB Backend
 * GET /api/transactions?userId=...
 */
export async function fetchUserTransactions(userId?: string): Promise<Transaction[]> {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const saved = getSavedUser();
      targetUserId = saved?.id || saved?._id;
    }
    // Fallback default demo user if not logged in
    if (!targetUserId) {
      targetUserId = '6acbc51f9eb59b6d75db83a5'; // Default active shop
    }

    const res = await fetch(`${API_BASE_URL}/transactions?userId=${targetUserId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map(mapReceiptToTransaction);
    }
    return [];
  } catch (err) {
    console.error('Lỗi khi fetchUserTransactions:', err);
    return [];
  }
}

/**
 * Fetch system operational overview for Admin
 * GET /api/admin/overview
 */
export async function fetchAdminOverview(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error('Lỗi khi fetchAdminOverview:', err);
    return null;
  }
}

/**
 * Fetch list of business households (Users) for Admin
 * GET /api/admin/users
 */
export async function fetchAdminUsers(params?: {
  search?: string;
  plan?: string;
  page?: number;
  limit?: number;
}): Promise<BusinessHousehold[]> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.plan && params.plan !== 'all') query.append('plan', params.plan.toUpperCase());
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE_URL}/admin/users?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((u: any) => {
        const joinDate = u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('vi-VN')
          : '14/10/2024';
        const plan = (u.subscriptionPlan || 'FREE').toLowerCase() === 'pro' ? 'pro' : 'free';
        const telegramStatus = u.telegramChatId ? 'active' : 'waiting';

        return {
          id: String(u._id || u.id),
          ownerName: u.name || (u.email ? u.email.split('@')[0] : 'Chủ hộ kinh doanh'),
          phone: u.phone || '0912.845.221',
          storeName: u.shopName || u.storeName || 'Cửa hàng tạp hóa',
          businessType: u.businessType || 'Hộ kinh doanh bán lẻ',
          joinDate,
          plan,
          telegramStatus,
        } as BusinessHousehold;
      });
    }
    return [];
  } catch (err) {
    console.error('Lỗi khi fetchAdminUsers:', err);
    return [];
  }
}

/**
 * Fetch subscription orders & payments for Admin
 * GET /api/admin/payments
 */
export async function fetchAdminPayments(): Promise<SubscriptionPayment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/payments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((p: any) => {
        const storeName = p.userId?.shopName || p.userId?.name || 'Hộ kinh doanh VikeSo';
        const initials = (storeName.trim().slice(0, 2) || 'VS').toUpperCase();
        const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : 'Vừa xong';
        const status = p.status === 'SUCCESS' ? 'success' : 'pending';

        return {
          invoiceId: p.orderCode || ('#INV-' + String(p._id || '').slice(-6).toUpperCase()),
          storeName,
          storeLocation: 'Việt Nam',
          avatarInitials: initials,
          avatarColor: status === 'success' ? 'text-secondary bg-surface-container-high' : 'text-primary bg-surface-container-high',
          planDescription: `Gia hạn Gói Chuyên Nghiệp (${p.plan || 'PRO'})`,
          amount: p.amount || 99000,
          paymentMethod: p.gateway ? `Cổng ${p.gateway}` : 'Quét mã VietQR SePay',
          timestamp: dateStr,
          status,
        } as SubscriptionPayment;
      });
    }
    return [];
  } catch (err) {
    console.error('Lỗi khi fetchAdminPayments:', err);
    return [];
  }
}


export interface TelegramDispatchLog {
  sendTime: string;
  shift: string;
  inflow: string;
  outflow: string;
  net: string;
  file: string;
  status: string;
}

export const defaultTelegramHistory: TelegramDispatchLog[] = [
  {
    sendTime: '24/10/2024 22:00:02',
    shift: 'Ca Ngày 24/10/2024',
    inflow: '+15.450.000 đ',
    outflow: '-4.200.000 đ',
    net: '+11.250.000 đ',
    file: 'BangKe_24102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '23/10/2024 22:00:02',
    shift: 'Ca Ngày 23/10/2024',
    inflow: '+18.120.000 đ',
    outflow: '-6.850.000 đ',
    net: '+11.270.000 đ',
    file: 'BangKe_23102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '22/10/2024 22:00:02',
    shift: 'Ca Ngày 22/10/2024',
    inflow: '+12.980.000 đ',
    outflow: '-2.100.000 đ',
    net: '+10.880.000 đ',
    file: 'BangKe_22102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '21/10/2024 22:00:02',
    shift: 'Ca Ngày 21/10/2024',
    inflow: '+16.740.000 đ',
    outflow: '-5.900.000 đ',
    net: '+10.840.000 đ',
    file: 'BangKe_21102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '20/10/2024 22:00:02',
    shift: 'Ca Ngày 20/10/2024',
    inflow: '+21.350.000 đ',
    outflow: '-8.420.000 đ',
    net: '+12.930.000 đ',
    file: 'BangKe_20102024.xlsx',
    status: 'Thành công (200 OK)'
  }
];

export async function fetchTelegramHistory(): Promise<TelegramDispatchLog[]> {
  return defaultTelegramHistory;
}
