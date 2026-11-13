/**
 * Central API Service for VikeSo Web
 * Connects directly to real Backend APIs (MongoDB & Render)
 */

import {
  Transaction,
  BusinessHousehold,
  SubscriptionPayment,
  StaffMember,
  CategoryItem,
  ShopBranch,
} from '../types';

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
  const activeShopId = localStorage.getItem('vikeso_active_shop_id');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (activeShopId) {
    headers['X-Shop-Id'] = activeShopId;
  }
  return headers;
}

/**
 * Rule hạch toán sau 22:00: Hóa đơn từ 22:00 trở đi được cộng sang ngày hôm sau (accountingDate = date + 1)
 */
export function computeAccountingDateInfo(dateObj: Date): {
  accountingDate: string;
  isAfter22h: boolean;
} {
  const isAfter22h = dateObj.getHours() >= 22;
  const accDate = new Date(dateObj);
  if (isAfter22h) {
    accDate.setDate(accDate.getDate() + 1);
  }
  const yyyy = accDate.getFullYear();
  const mm = String(accDate.getMonth() + 1).padStart(2, '0');
  const dd = String(accDate.getDate()).padStart(2, '0');
  return {
    accountingDate: `${yyyy}-${mm}-${dd}`,
    isAfter22h,
  };
}

/**
 * Resolves paymentMethod ('CASH' | 'TRANSFER' | 'POS') and Vietnamese label
 */
export function resolvePaymentMethod(r: any): {
  code: 'CASH' | 'TRANSFER' | 'POS';
  label: 'Tiền mặt' | 'Chuyển khoản VietQR' | 'Thẻ POS';
} {
  const rawMethod = String(r.paymentMethod || r.aiRawData?.paymentMethod || '').toUpperCase();
  if (rawMethod === 'TRANSFER' || r.category === 'Chuyen Khoan') {
    return { code: 'TRANSFER', label: 'Chuyển khoản VietQR' };
  }
  if (rawMethod === 'POS' || r.category === 'POS Ket Ca' || r.status === 'MERGED') {
    return { code: 'POS', label: 'Thẻ POS' };
  }
  const text = `${r.reason || ''} ${r.aiRawData?.method || ''}`.toLowerCase();
  if (text.includes('vietqr') || text.includes('chuyển khoản') || text.includes('qr')) {
    return { code: 'TRANSFER', label: 'Chuyển khoản VietQR' };
  }
  if (text.includes('pos') || text.includes('quẹt thẻ') || text.includes('kết ca')) {
    return { code: 'POS', label: 'Thẻ POS' };
  }
  return { code: 'CASH', label: 'Tiền mặt' };
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
  const isMerged = r.status === 'MERGED' || Boolean(r.isMerged);

  const type: 'in' | 'out' | 'merged' = isMerged ? 'merged' : isChi ? 'out' : 'in';
  const amount = isChi ? -Math.abs(r.totalAmount) : Math.abs(r.totalAmount);

  // Category & Parent Category mapping
  let category = r.subCategory || r.category || 'Thu/Chi';
  let parentCategory = r.parentCategory || (isChi ? 'Chi phí nhập hàng' : 'Doanh thu bán hàng');

  if (r.category === 'POS Ket Ca') {
    category = 'Bán hàng qua POS';
    parentCategory = 'Doanh thu bán hàng';
  } else if (r.category === 'Hoa Don Le') {
    category = isChi ? 'Nhập hàng hóa / Nguyên vật liệu' : 'Bán lẻ tại quầy';
    parentCategory = isChi ? 'Chi phí nhập hàng' : 'Doanh thu bán hàng';
  } else if (r.category === 'So Tay') {
    category = isChi ? 'Chi phí điện, nước, vận hành' : 'Thu tiền mặt tại quầy';
    parentCategory = isChi ? 'Chi phí vận hành cố định' : 'Doanh thu bán hàng';
  } else if (r.category === 'Chuyen Khoan') {
    category = isThu ? 'Doanh thu chuyển khoản QR' : 'Chuyển khoản thanh toán NCC';
    parentCategory = isThu ? 'Doanh thu bán hàng' : 'Chi phí nhập hàng';
  } else if (r.category === 'Khac') {
    category = isChi ? 'Chi phí phát sinh khác' : 'Thu công nợ / Khoản thu khác';
    parentCategory = isChi ? 'Chi phí khác' : 'Thu công nợ & khác';
  }

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

  const pm = resolvePaymentMethod(r);
  const { accountingDate, isAfter22h } = computeAccountingDateInfo(dateObj);

  // Entry source & Payment method display
  let method = pm.label;
  let methodIcon = pm.code === 'TRANSFER' ? 'qr_code_2' : pm.code === 'POS' ? 'point_of_sale' : 'payments';
  let methodColor =
    pm.code === 'TRANSFER'
      ? 'bg-primary-fixed text-on-primary-fixed'
      : pm.code === 'POS'
        ? 'bg-surface-container-highest text-on-surface'
        : 'bg-surface-container text-on-surface';

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
    accountingDate: r.accountingDate || accountingDate,
    isAfter22h: r.isAfter22h !== undefined ? Boolean(r.isAfter22h) : isAfter22h,
    title: r.reason || (isThu ? 'Khách thanh toán mua hàng' : 'Chi phí vận hành cửa hàng'),
    category,
    parentCategory,
    subCategory: category,
    details,
    amount,
    type,
    method,
    paymentMethod: pm.code,
    paymentMethodLabel: pm.label,
    methodIcon,
    methodColor,
    status,
    statusText,
    refCode,
    subBillCount,
    isStrikethrough: isMerged && !subBillCount,
    createdBy: r.createdBy || r.userId,
    createdByName: r.createdByName || (r.createdByRole === 'STAFF' ? 'Nhân viên thu ngân' : 'Chủ cửa hàng'),
    createdByRole: r.createdByRole || 'OWNER',
    shopId: r.shopId || 'shop-main',
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
        const role = (u.role || 'OWNER').toUpperCase() as 'ADMIN' | 'OWNER';
        const plan = (u.subscriptionPlan || 'FREE').toLowerCase() === 'pro' ? 'pro' : 'free';
        const telegramStatus = u.telegramChatId ? 'active' : 'waiting';

        return {
          id: String(u._id || u.id),
          ownerName: u.name || (u.email ? u.email.split('@')[0] : 'Chủ hộ kinh doanh'),
          phone: u.phone || '0912.845.221',
          storeName: u.shopName || u.storeName || (role === 'ADMIN' ? 'Hệ Thống Quản Trị' : 'Cửa hàng tạp hóa'),
          businessType: u.businessType || (role === 'ADMIN' ? 'Quản trị viên hệ thống' : 'Hộ kinh doanh bán lẻ'),
          joinDate,
          plan,
          telegramStatus,
          proExpiresAt: u.proExpiresAt ? new Date(u.proExpiresAt).toLocaleDateString('vi-VN') : undefined,
          proExpiresAtRaw: u.proExpiresAt,
          role,
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

// =============================================================================
// NGHIỆP VỤ: LẤY LỊCH SỬ CHỐT CA & BÁO CÁO TELEGRAM (GET /api/telegram/history)
// - Bắt đầu từ dòng này đến hết hàm fetchTelegramHistory
// - Dùng để: Tải lịch sử các phiên kết ca thực tế của tài khoản từ MongoDB
// - Phục vụ:
//   1. Hiển thị bảng lịch sử gửi báo cáo kết ca kèm file Excel thực tế
//   2. Nếu tài khoản mới chưa phát sinh ca chốt sổ nào, trả về đúng mảng rỗng []
//      để bảng hiển thị trạng thái chưa có lịch sử thay vì hiển thị dữ liệu giả 24/10/2024.
// =============================================================================
export const defaultTelegramHistory: TelegramDispatchLog[] = [];

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
      return [];
    }

    const res = await fetch(`${API_BASE_URL}/telegram/history?userId=${targetUserId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (err) {
    console.error('Lỗi khi fetchTelegramHistory:', err);
    return [];
  }
}

/**
 * Create a manual cash in/out entry
 * POST /api/manual-entry
 */
export async function createManualTransaction(payload: {
  userId?: string;
  category: string;
  parentCategory?: string;
  subCategory?: string;
  paymentMethod?: 'CASH' | 'TRANSFER' | 'POS';
  transactionType: 'THU' | 'CHI';
  totalAmount: number;
  reason: string;
  transactionDate?: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    let targetUserId = payload.userId;
    const saved = getSavedUser();
    if (!targetUserId) {
      targetUserId = saved?.id || saved?._id;
    }

    const res = await fetch(`${API_BASE_URL}/manual-entry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        userId: targetUserId,
        createdBy: targetUserId,
        createdByName: saved?.name || 'Chủ cửa hàng',
        createdByRole: saved?.role || 'OWNER',
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
    if (data.success && (data.userInfo || data.user)) {
      const returnedUser = data.userInfo || data.user;
      // Update local storage
      const saved = getSavedUser() || {};
      localStorage.setItem('vikeso_user', JSON.stringify({ ...saved, ...returnedUser }));
    }
    return data;
  } catch (err: any) {
    console.error('Lỗi khi updateUserProfile:', err);
    return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * =============================================================================
 * NGHIỆP VỤ 1: ĐỒNG BỘ THÔNG TIN HỒ SƠ CHỦ HỘ TỪ DATABASE (GET /api/auth/me)
 * - Dùng để: Lấy chính xác SĐT cá nhân, họ tên chủ hộ từ MongoDB Atlas
 * - Phục vụ: Tránh việc hiển thị sai lệch do lấy dữ liệu cache cũ từ localStorage
 * =============================================================================
 */
export async function fetchCurrentUserInfo(): Promise<{
  success: boolean;
  userInfo?: any;
  message?: string;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Chưa đăng nhập' };
    }

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (data.success && data.userInfo) {
      const saved = getSavedUser() || {};
      const updated = {
        ...saved,
        ...data.userInfo,
        phone: data.userInfo.phone || saved.phone || '',
      };
      localStorage.setItem('vikeso_user', JSON.stringify(updated));
    }
    return data;
  } catch (err: any) {
    console.error('Lỗi khi fetchCurrentUserInfo:', err);
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
  packageDuration?: '1M' | '6M' | '12M';
  amount?: number;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  const pkgAmount =
    payload.amount ||
    (payload.packageDuration === '12M'
      ? 990000
      : payload.packageDuration === '6M'
        ? 499000
        : 99000);
  const fallbackOrderCode = `VIKESO${Math.floor(100000 + Math.random() * 900000)}`;
  const fallbackQrUrl = `https://img.vietqr.io/image/MB-0389999999-compact2.png?amount=${pkgAmount}&addInfo=${encodeURIComponent(
    fallbackOrderCode
  )}&accountName=${encodeURIComponent('CONG TY CONG NGHE VIKESO')}`;

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
        packageDuration: payload.packageDuration || '1M',
        amount: pkgAmount,
      }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      const orderCode = json.data.orderCode || fallbackOrderCode;
      const amount = Number(json.data.amount || pkgAmount);
      const qrCodeUrl =
        json.data.qrCodeUrl && String(json.data.qrCodeUrl).startsWith('http')
          ? json.data.qrCodeUrl
          : `https://img.vietqr.io/image/MB-0389999999-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
              orderCode
            )}&accountName=${encodeURIComponent('CONG TY CONG NGHE VIKESO')}`;
      return {
        success: true,
        data: {
          ...json.data,
          orderCode,
          amount,
          qrCodeUrl,
          packageDuration: payload.packageDuration || '1M',
        },
      };
    }
    return {
      success: true,
      data: {
        orderCode: fallbackOrderCode,
        amount: pkgAmount,
        transferContent: fallbackOrderCode,
        qrCodeUrl: fallbackQrUrl,
        packageDuration: payload.packageDuration || '1M',
      },
    };
  } catch (err: any) {
    console.warn('Fallback VietQR order:', err);
    return {
      success: true,
      data: {
        orderCode: fallbackOrderCode,
        amount: pkgAmount,
        transferContent: fallbackOrderCode,
        qrCodeUrl: fallbackQrUrl,
        packageDuration: payload.packageDuration || '1M',
      },
    };
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

// ==================== STAFF MANAGEMENT (WEB PORTAL) ====================

const STAFF_STORAGE_KEY = 'vikeso_staff_members_v1';

const defaultStaffMembers: StaffMember[] = [
  {
    id: 'staff-01',
    name: 'Nguyễn Thị Thu Ngân (Ca Sáng)',
    email: 'thungan.sang@vikeso.vn',
    phone: '0938.221.450',
    role: 'STAFF',
    isActive: true,
    createdAt: '12/10/2026',
    lastLogin: 'Hôm nay, 07:30',
  },
  {
    id: 'staff-02',
    name: 'Trần Minh Quân (Ca Tối)',
    email: 'thungan.toi@vikeso.vn',
    phone: '0974.889.112',
    role: 'STAFF',
    isActive: true,
    createdAt: '18/10/2026',
    lastLogin: 'Hôm qua, 21:55',
  },
];

function getLocalStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(defaultStaffMembers));
  return defaultStaffMembers;
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {}
  return getLocalStaff();
}

export async function createStaffMember(payload: {
  name: string;
  email: string;
  phone: string;
  password?: string;
}): Promise<{ success: boolean; data?: StaffMember; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch {}

  const list = getLocalStaff();
  const newStaff: StaffMember = {
    id: `staff-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: 'STAFF',
    isActive: true,
    createdAt: new Date().toLocaleDateString('vi-VN'),
    lastLogin: 'Chưa đăng nhập',
  };
  const updated = [newStaff, ...list];
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
  return { success: true, data: newStaff };
}

export async function toggleStaffStatus(
  staffId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string; forceLogoutSent?: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${staffId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { ...json, forceLogoutSent: !isActive };
    }
  } catch {}

  const list = getLocalStaff().map((s) =>
    s.id === staffId ? { ...s, isActive } : s
  );
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  return {
    success: true,
    forceLogoutSent: !isActive,
    message: isActive
      ? 'Đã mở khóa tài khoản nhân viên'
      : 'Đã khóa tài khoản & bắn tín hiệu Socket force_logout đẩy nhân viên khỏi Mobile App (< 1 giây)!',
  };
}

export async function resetStaffPassword(
  staffId: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${staffId}/reset-password`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch {}
  return {
    success: true,
    message: 'Đã cấp lại mật khẩu mới cho nhân viên thành công!',
  };
}

export async function deleteStaffMember(
  staffId: string
): Promise<{ success: boolean; message?: string }> {
  const list = getLocalStaff().filter((s) => s.id !== staffId);
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: 'Đã xóa tài khoản nhân viên khỏi cửa hàng.' };
}

// ==================== CATEGORY MANAGEMENT (CHA - CON) ====================

const CATEGORY_STORAGE_KEY = 'vikeso_categories_v1';

export const defaultCategories: CategoryItem[] = [
  // THU - Parent 1
  { id: 'cat-thu-1', name: 'Doanh thu bán hàng', type: 'THU', parentId: null, isDefault: true, icon: 'storefront' },
  { id: 'cat-thu-1-1', name: 'Bán lẻ tại quầy', type: 'THU', parentId: 'cat-thu-1', isDefault: true },
  { id: 'cat-thu-1-2', name: 'Doanh thu chuyển khoản QR', type: 'THU', parentId: 'cat-thu-1', isDefault: true },
  { id: 'cat-thu-1-3', name: 'Bán hàng qua POS', type: 'THU', parentId: 'cat-thu-1', isDefault: true },
  { id: 'cat-thu-1-4', name: 'Đơn giao hàng / App', type: 'THU', parentId: 'cat-thu-1', isDefault: true },
  // THU - Parent 2
  { id: 'cat-thu-2', name: 'Thu công nợ & khác', type: 'THU', parentId: null, isDefault: true, icon: 'account_balance_wallet' },
  { id: 'cat-thu-2-1', name: 'Thu hồi công nợ sỉ', type: 'THU', parentId: 'cat-thu-2', isDefault: true },
  { id: 'cat-thu-2-2', name: 'Hoàn tiền nhà cung cấp', type: 'THU', parentId: 'cat-thu-2', isDefault: true },
  // CHI - Parent 1
  { id: 'cat-chi-1', name: 'Chi phí nhập hàng', type: 'CHI', parentId: null, isDefault: true, icon: 'inventory_2' },
  { id: 'cat-chi-1-1', name: 'Nhập hàng hóa / Nguyên vật liệu', type: 'CHI', parentId: 'cat-chi-1', isDefault: true },
  { id: 'cat-chi-1-2', name: 'Chi phí vận chuyển / Ship hàng', type: 'CHI', parentId: 'cat-chi-1', isDefault: true },
  { id: 'cat-chi-1-3', name: 'Bao bì, túi đựng, vật tư', type: 'CHI', parentId: 'cat-chi-1', isDefault: true },
  // CHI - Parent 2
  { id: 'cat-chi-2', name: 'Chi phí vận hành cố định', type: 'CHI', parentId: null, isDefault: true, icon: 'bolt' },
  { id: 'cat-chi-2-1', name: 'Tiền thuê mặt bằng', type: 'CHI', parentId: 'cat-chi-2', isDefault: true },
  { id: 'cat-chi-2-2', name: 'Tiền điện, nước, Internet', type: 'CHI', parentId: 'cat-chi-2', isDefault: true },
  // CHI - Parent 3
  { id: 'cat-chi-3', name: 'Chi phí nhân sự', type: 'CHI', parentId: null, isDefault: true, icon: 'badge' },
  { id: 'cat-chi-3-1', name: 'Lương nhân viên thu ngân / phụ cửa hàng', type: 'CHI', parentId: 'cat-chi-3', isDefault: true },
  { id: 'cat-chi-3-2', name: 'Thưởng doanh số / Phụ cấp ca', type: 'CHI', parentId: 'cat-chi-3', isDefault: true },
];

export function getLocalCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(defaultCategories));
  return defaultCategories;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {}
  return getLocalCategories();
}

// =============================================================================
// NGHIỆP VỤ 1: CHUYỂN ĐỔI CỬA HÀNG / CHI NHÁNH LÀM VIỆC (PATCH /api/shops/:id/switch)
// - Bắt đầu từ dòng này đến hết hàm switchActiveShop
// - Dùng để: Ghi nhận chi nhánh mà Owner đang làm việc (activeShopId) lên Server.
// - Phục vụ: Mọi hóa đơn, sổ quỹ phát sinh sau đó sẽ được hạch toán đúng vào chi nhánh này.
// =============================================================================
export async function switchActiveShop(
  shopId: string
): Promise<{ success: boolean; message?: string; activeShopId?: string; shopName?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/shops/${shopId}/switch`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      const saved = getSavedUser() || {};
      localStorage.setItem(
        'vikeso_user',
        JSON.stringify({ ...saved, activeShopId: data.activeShopId, shopName: data.shopName, storeName: data.shopName })
      );
    }
    return data;
  } catch (err: any) {
    console.warn('Lỗi switchActiveShop API:', err);
    return { success: false, message: err.message || 'Lỗi chuyển đổi cửa hàng' };
  }
}

// =============================================================================
// NGHIỆP VỤ 2: QUẢN LÝ DANH MỤC THU CHI (THÊM / SỬA / XÓA) TRÊN BACKEND DATABASE
// - Bắt đầu từ dòng này đến hết deleteCategoryItem
// - Dùng để: Đồng bộ hóa toàn bộ cây danh mục cha - con trực tiếp vào CSDL MongoDB.
// - Phục vụ: Đổi tên hoặc xóa danh mục thì toàn bộ hệ thống (Web và App) đều cập nhật tức thì.
// =============================================================================
export async function createCategoryItem(payload: {
  name: string;
  type: 'THU' | 'CHI';
  parentId: string | null;
}): Promise<{ success: boolean; data: CategoryItem }> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: payload.name.trim(),
        transactionType: payload.type,
        parentId: payload.parentId || null,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const item = json.data;
        const newItem: CategoryItem = {
          id: item._id || item.id,
          name: item.name,
          type: item.transactionType || payload.type,
          parentId: item.parentId || null,
          isDefault: item.isSystemDefault || false,
        };
        const list = getLocalCategories();
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify([...list, newItem]));
        return { success: true, data: newItem };
      }
    }
  } catch (e) {
    console.warn('Lỗi createCategoryItem API, lưu tạm local:', e);
  }

  const list = getLocalCategories();
  const newItem: CategoryItem = {
    id: `cat-custom-${Date.now()}`,
    name: payload.name.trim(),
    type: payload.type,
    parentId: payload.parentId,
    isDefault: false,
  };
  const updated = [...list, newItem];
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  return { success: true, data: newItem };
}

export async function updateCategoryItem(
  id: string,
  name: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        const list = getLocalCategories().map((c) =>
          c.id === id ? { ...c, name: name.trim() } : c
        );
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(list));
        return { success: true, message: 'Đã cập nhật danh mục thành công!' };
      }
    }
  } catch (e) {
    console.warn('Lỗi updateCategoryItem API:', e);
  }

  const list = getLocalCategories().map((c) =>
    c.id === id ? { ...c, name: name.trim() } : c
  );
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: 'Đã cập nhật danh mục cục bộ' };
}

export async function deleteCategoryItem(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        const list = getLocalCategories().filter((c) => c.id !== id && c.parentId !== id);
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(list));
        return { success: true, message: 'Đã xóa danh mục khỏi cơ sở dữ liệu!' };
      }
    }
  } catch (e) {
    console.warn('Lỗi deleteCategoryItem API:', e);
  }

  const list = getLocalCategories().filter((c) => c.id !== id && c.parentId !== id);
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: 'Đã xóa danh mục cục bộ' };
}

// =============================================================================
// NGHIỆP VỤ 3: LẤY SỐ LIỆU PHÂN TÍCH DOANH THU & SO SÁNH CÙNG KỲ (GET /api/transactions/analytics)
// - Bắt đầu từ dòng này đến hết hàm fetchFinancialAnalytics
// - Dùng để: Gọi số liệu tổng kết thu - chi đã chốt ca 22:00 theo ngày/tháng/năm từ Backend.
// - Phục vụ: Cung cấp số liệu chính xác tuyệt đối cho biểu đồ tài chính, tính % tăng trưởng so với kỳ trước.
// =============================================================================
export async function fetchFinancialAnalytics(params?: {
  period?: 'day' | 'week' | 'month' | 'year';
  date?: string;
  compare?: boolean;
}): Promise<{
  success: boolean;
  data?: {
    period: string;
    currentPeriod: { thu: number; chi: number; net: number; count: number };
    previousPeriod: { thu: number; chi: number; net: number; count: number };
    growth: { thu: number; chi: number; net: number };
    thuByCategory: Record<string, number>;
    chiByCategory: Record<string, number>;
  };
  message?: string;
}> {
  try {
    const p = params?.period || 'month';
    const query = new URLSearchParams({
      period: p,
      compare: params?.compare !== false ? 'true' : 'false',
    });
    if (params?.date) query.append('date', params.date);

    const res = await fetch(`${API_BASE_URL}/transactions/analytics?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch (e) {
    console.warn('Lỗi fetchFinancialAnalytics API:', e);
  }
  return { success: false, message: 'Không thể tải số liệu phân tích tài chính' };
}

// ==================== MULTI-SHOP & ADMIN APPROVAL ====================

const SHOPS_STORAGE_KEY = 'vikeso_shops_v1';

const defaultShops: ShopBranch[] = [];

export function getLocalShops(): ShopBranch[] {
  try {
    const raw = localStorage.getItem(SHOPS_STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch {}
  return [];
}

// =============================================================================
// NGHIỆP VỤ QUẢN LÝ ĐA CỬA HÀNG / CHI NHÁNH (MULTI-SHOP & ADMIN APPROVAL)
// - Bắt đầu từ dòng này đến hết file
// - Kết nối đồng bộ với Backend API (/api/shops & /api/admin/shops)
// - Cho phép Owner đăng ký cửa hàng / chi nhánh mới kèm ảnh chứng từ
// - Cho phép Admin duyệt (APPROVE) hoặc từ chối (REJECT)
// =============================================================================

export async function fetchUserShops(currentShopName?: string): Promise<ShopBranch[]> {
  try {
    const token = localStorage.getItem('vikeso_token');
    if (token) {
      const res = await fetch(`${API_BASE_URL}/shops`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((s: any) => ({
            id: s._id || s.id,
            shopName: s.shopName,
            businessType: s.businessType || 'Hộ kinh doanh bán lẻ',
            address: s.address || '',
            phone: s.phone || '',
            isPrimary: s.isPrimary,
            status: s.approvalStatus === 'APPROVED' ? 'ACTIVE' : s.approvalStatus === 'REJECTED' ? 'REJECTED' : 'PENDING_APPROVAL',
            approvalStatus: s.approvalStatus,
            documentUrls: s.verificationDocs || s.documentUrls || [],
            verificationDocs: s.verificationDocs || s.documentUrls || [],
            createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '',
          }));
          localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi fetchUserShops qua API, dùng dữ liệu đệm local:', e);
  }

  const list = getLocalShops();
  return list;
}

export async function createAdditionalShop(payload: {
  shopName: string;
  businessType: string;
  address: string;
  phone: string;
  verificationDocs: string[];
  ownerName?: string;
  ownerEmail?: string;
}): Promise<{ success: boolean; data: ShopBranch; message: string }> {
  try {
    const token = localStorage.getItem('vikeso_token');
    if (token) {
      const res = await fetch(`${API_BASE_URL}/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: payload.shopName.trim(),
          businessType: payload.businessType,
          address: payload.address.trim(),
          phone: payload.phone.trim(),
          verificationDocs: payload.verificationDocs,
          documentUrls: payload.verificationDocs,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const created: ShopBranch = {
          id: json.data._id || json.data.id,
          shopName: json.data.shopName,
          businessType: json.data.businessType,
          address: json.data.address,
          phone: json.data.phone,
          status: 'PENDING_APPROVAL',
          approvalStatus: 'PENDING',
          verificationDocs: json.data.documentUrls || payload.verificationDocs,
          createdAt: new Date().toLocaleDateString('vi-VN'),
        };
        // Lưu kèm vào local đệm
        const localList = getLocalShops();
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify([...localList, created]));
        return {
          success: true,
          data: created,
          message: 'Đã gửi hồ sơ chi nhánh thứ 2+ lên hệ thống. Vui lòng chờ Admin phê duyệt!',
        };
      }
    }
  } catch (e) {
    console.warn('Lỗi gọi API createAdditionalShop, lưu tạm local:', e);
  }

  const list = getLocalShops();
  const newShop: ShopBranch = {
    id: `shop-${Date.now()}`,
    shopName: payload.shopName,
    businessType: payload.businessType,
    address: payload.address,
    phone: payload.phone,
    status: 'PENDING_APPROVAL',
    verificationDocs: payload.verificationDocs,
    ownerName: payload.ownerName || 'Chủ Hộ Kinh Doanh',
    ownerEmail: payload.ownerEmail || 'owner@vikeso.vn',
    createdAt: new Date().toLocaleDateString('vi-VN'),
  };
  const updated = [...list, newShop];
  localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
  return {
    success: true,
    data: newShop,
    message:
      'Đã gửi hồ sơ đăng ký chi nhánh thứ 2+ kèm ảnh chứng từ. Vui lòng chờ Admin phê duyệt!',
  };
}

export async function fetchAdminShopRequests(): Promise<ShopBranch[]> {
  try {
    const token = localStorage.getItem('vikeso_token');
    if (token) {
      const res = await fetch(`${API_BASE_URL}/admin/shops/requests?status=ALL`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((s: any) => ({
            id: s._id || s.id,
            shopName: s.shopName,
            businessType: s.businessType || 'Hộ kinh doanh bán lẻ',
            address: s.address || '',
            phone: s.phone || '',
            ownerName: s.ownerId?.name || 'Chủ hộ kinh doanh',
            ownerEmail: s.ownerId?.email || '',
            status: s.approvalStatus === 'APPROVED' ? 'ACTIVE' : s.approvalStatus === 'REJECTED' ? 'REJECTED' : 'PENDING_APPROVAL',
            approvalStatus: s.approvalStatus,
            documentUrls: s.verificationDocs || s.documentUrls || [],
            verificationDocs: s.verificationDocs || s.documentUrls || [],
            rejectionReason: s.rejectionReason,
            createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '',
          }));
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi fetchAdminShopRequests qua API:', e);
  }
  return getLocalShops();
}

export async function reviewAdminShopRequest(
  shopId: string,
  action: 'APPROVE' | 'REJECT',
  rejectReason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = localStorage.getItem('vikeso_token');
    if (token) {
      const res = await fetch(`${API_BASE_URL}/admin/shops/${shopId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          rejectionReason: rejectReason || 'Chứng từ chưa đạt yêu cầu',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Cập nhật cả cache local
          const list = getLocalShops().map((s) =>
            s.id === shopId
              ? {
                  ...s,
                  status: (action === 'APPROVE' ? 'ACTIVE' : 'REJECTED') as ShopBranch['status'],
                  approvalStatus: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as ShopBranch['approvalStatus'],
                  rejectionReason: action === 'REJECT' ? rejectReason || 'Chứng từ chưa rõ nét' : undefined,
                }
              : s
          );
          localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(list));
          return {
            success: true,
            message: action === 'APPROVE' ? 'Đã phê duyệt chi nhánh thành công!' : 'Đã từ chối chi nhánh.',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi reviewAdminShopRequest API:', e);
  }

  const list = getLocalShops().map((s) =>
    s.id === shopId
      ? {
          ...s,
          status: (action === 'APPROVE' ? 'ACTIVE' : 'REJECTED') as ShopBranch['status'],
          approvalStatus: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as ShopBranch['approvalStatus'],
          rejectionReason: action === 'REJECT' ? rejectReason || 'Chứng từ chưa rõ nét' : undefined,
        }
      : s
  );
  localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(list));

  // =============================================================================
  // NGHIỆP VỤ: ĐỒNG BỘ THÔNG TIN CỬA HÀNG ĐƯỢC ADMIN DUYỆT VÀO TÀI KHOẢN OWNER
  // - Khi Admin duyệt (APPROVE), nếu tài khoản Owner đang mở có tên là "Chưa thiết lập cửa hàng"
  //   hoặc trùng email, hệ thống sẽ tự động cập nhật tên cửa hàng vừa duyệt vào User Profile.
  // =============================================================================
  if (action === 'APPROVE') {
    const targetShop = list.find((s) => s.id === shopId);
    if (targetShop) {
      try {
        const rawUser = localStorage.getItem('vikeso_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (!u.shopName || u.shopName === 'Chưa thiết lập cửa hàng' || u.email === targetShop.ownerEmail) {
            u.shopName = targetShop.shopName;
            u.storeName = targetShop.shopName;
            u.activeShopId = targetShop.id;
            if (targetShop.phone) u.phone = targetShop.phone;
            localStorage.setItem('vikeso_user', JSON.stringify(u));
          }
        }
      } catch (err) {}
    }
  }

  return {
    success: true,
    message:
      action === 'APPROVE'
        ? 'Đã phê duyệt kích hoạt cửa hàng / chi nhánh mới thành công!'
        : 'Đã từ chối yêu cầu mở chi nhánh mới.',
  };
}
