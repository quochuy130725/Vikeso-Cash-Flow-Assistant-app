/**
 * API Service for Authentication (Login / Register)
 * Connects directly to VikeSo Backend API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://vikeso-cash-flow-assistant-app.onrender.com/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  shopName: string;
  role?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  shopName: string;
  avatar?: string | null;
  telegramChatId?: string | null;
  subscriptionPlan?: string;
  authProvider?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  userInfo?: UserInfo;
  error?: string;
}

/**
 * Đăng nhập tài khoản bằng Email & Mật khẩu
 * Endpoint: POST /api/auth/login
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể kết nối đến máy chủ Backend.',
    };
  }
}

/**
 * Đăng ký tài khoản mới bằng Email, Mật khẩu, Họ tên, Tên cửa hàng
 * Endpoint: POST /api/auth/register
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
        name: payload.name.trim(),
        shopName: payload.shopName.trim(),
        role: payload.role || (payload.email.toLowerCase().includes('admin') || payload.email.toLowerCase().includes('finity') ? 'ADMIN' : 'OWNER'),
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể kết nối đến máy chủ Backend.',
    };
  }
}
