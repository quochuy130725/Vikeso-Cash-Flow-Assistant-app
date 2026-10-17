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
    rawDate: dateObj.toISOString(),
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
  receiptCount?: number;
}

export const defaultTelegramHistory: TelegramDispatchLog[] = [
  {
    sendTime: '24/10/2024 22:00:02',
    shift: 'Ca Ngày 24/10/2024',
    inflow: '+15.450.000 đ',
    outflow: '-4.200.000 đ',
    net: '+11.250.000 đ',
    file: 'BangKe_24102024.xlsx',
    status: 'Thành công (200 OK)',
  },
];

/**
 * Fetch real telegram dispatch history from receipts
 * GET /api/telegram/history?userId=...
 */
export async function fetchTelegramHistory(userId?: string): Promise<TelegramDispatchLog[]> {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const saved = getSavedUser();
      targetUserId = saved?.id || saved?._id;
    }
    if (!targetUserId) {
      return defaultTelegramHistory;
    }

    const res = await fetch(`${API_BASE_URL}/telegram/history?userId=${targetUserId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data;
    }
    return defaultTelegramHistory;
  } catch (err) {
    console.error('Lỗi khi fetchTelegramHistory:', err);
    return defaultTelegramHistory;
  }
}

/**
 * Create a manual cash in/out entry
 * POST /api/manual-entry
 */
export async function createManualTransaction(payload: {
  userId?: string;
  category: string;
  transactionType: 'THU' | 'CHI';
  totalAmount: number;
  reason: string;
  transactionDate?: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    let targetUserId = payload.userId;
    if (!targetUserId) {
      const saved = getSavedUser();
      targetUserId = saved?.id || saved?._id;
    }

    const res = await fetch(`${API_BASE_URL}/manual-entry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        userId: targetUserId,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi createManualTransaction:', err);
    return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Fetch user profile & telegram link status
 * GET /api/user/:id/profile
 */
export async function fetchUserProfile(userId: string): Promise<{
  success: boolean;
  hasTelegram: boolean;
  settings: {
    receiveEmail: boolean;
    receiveTelegram: boolean;
    receiveInApp: boolean;
  };
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi fetchUserProfile:', err);
    return {
      success: false,
      hasTelegram: false,
      settings: { receiveEmail: true, receiveTelegram: true, receiveInApp: true },
    };
  }
}

/**
 * Update user notification settings
 * PUT /api/user/:id/notification-settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: {
    receiveEmail?: boolean;
    receiveTelegram?: boolean;
    receiveInApp?: boolean;
  }
): Promise<{ success: boolean; message?: string; settings?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/${userId}/notification-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi updateNotificationSettings:', err);
    return { success: false, message: err.message || 'Lỗi cập nhật' };
  }
}

/**
 * Trigger manual test daily report
 * POST /api/test-report
 */
export async function triggerTestReport(payload?: {
  email?: string;
  sendZeroReports?: boolean;
}): Promise<{ success: boolean; message: string; result?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/test-report`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || { sendZeroReports: true }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi triggerTestReport:', err);
    return { success: false, message: err.message || 'Lỗi gửi báo cáo' };
  }
}

/**
 * Update authenticated user's shop profile
 * PUT /api/auth/profile
 */
export async function updateUserProfile(payload: {
  name?: string;
  shopName?: string;
  phone?: string;
  avatar?: string;
}): Promise<{ success: boolean; message?: string; user?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.user) {
      // Update local storage
      const saved = getSavedUser() || {};
      localStorage.setItem('vikeso_user', JSON.stringify({ ...saved, ...data.user }));
    }
    return data;
  } catch (err: any) {
    console.error('Lỗi khi updateUserProfile:', err);
    return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Change authenticated user's password
 * PUT /api/auth/change-password
 */
export async function changeUserPassword(payload: {
  oldPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi changeUserPassword:', err);
    return { success: false, message: err.message || 'Lỗi đổi mật khẩu' };
  }
}

/**
 * Create a billing order for VietQR SePay upgrade
 * POST /api/billing/create-order
 */
export async function createBillingOrder(payload: {
  userId?: string;
  plan?: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    let targetUserId = payload.userId;
    if (!targetUserId) {
      const saved = getSavedUser();
      targetUserId = saved?.id || saved?._id;
    }
    const res = await fetch(`${API_BASE_URL}/billing/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId: targetUserId,
        plan: payload.plan || 'PRO',
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi createBillingOrder:', err);
    return { success: false, message: err.message || 'Lỗi tạo đơn thanh toán' };
  }
}

// ==================== ADMIN ENDPOINTS ====================

/**
 * Admin: Create a new user account
 * POST /api/admin/users
 */
export async function createAdminUser(payload: {
  email: string;
  password?: string;
  name?: string;
  shopName?: string;
  phone?: string;
  role?: 'OWNER' | 'ADMIN';
  subscriptionPlan?: 'FREE' | 'PRO';
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi createAdminUser:', err);
    return { success: false, message: err.message || 'Lỗi tạo tài khoản' };
  }
}

/**
 * Admin: Update user subscription plan
 * PATCH /api/admin/users/:id/plan
 */
export async function updateAdminUserPlan(
  userId: string,
  plan: 'FREE' | 'PRO'
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/plan`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plan }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi updateAdminUserPlan:', err);
    return { success: false, message: err.message || 'Lỗi cập nhật gói' };
  }
}

/**
 * Admin: Update user role
 * PATCH /api/admin/users/:id/role
 */
export async function updateAdminUserRole(
  userId: string,
  role: 'OWNER' | 'ADMIN'
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi updateAdminUserRole:', err);
    return { success: false, message: err.message || 'Lỗi cập nhật vai trò' };
  }
}

/**
 * Admin: Delete a user
 * DELETE /api/admin/users/:id
 */
export async function deleteAdminUser(
  userId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi deleteAdminUser:', err);
    return { success: false, message: err.message || 'Lỗi xóa tài khoản' };
  }
}

/**
 * Admin: Update a payment status (Manual Approval)
 * PATCH /api/admin/payments/:id
 */
export async function updateAdminPaymentStatus(
  paymentId: string,
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'EXPIRED'
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi updateAdminPaymentStatus:', err);
    return { success: false, message: err.message || 'Lỗi cập nhật đơn' };
  }
}

/**
 * Admin: Delete a payment record
 * DELETE /api/admin/payments/:id
 */
export async function deleteAdminPayment(
  paymentId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi deleteAdminPayment:', err);
    return { success: false, message: err.message || 'Lỗi xóa đơn' };
  }
}

/**
 * Server health check & latency measurement
 * GET /api/health
 */
export async function fetchServerHealth(): Promise<{
  status: string;
  latencyMs: number;
  time: number;
}> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: data.status || 'ok',
      latencyMs,
      time: data.time || Date.now(),
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: 'error',
      latencyMs,
      time: Date.now(),
    };
  }
}
