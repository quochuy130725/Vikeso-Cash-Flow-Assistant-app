/**
 * API Service for Authentication (Login / Register)
 * Connects directly to VikeSo Backend API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://vikeso-cash-flow-assistant-app.onrender.com/api';

export interface LoginPayload {
  identifier?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  shopName: string;
  phone?: string;
  role?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  shopName?: string;
  phone?: string;
  avatar?: string;
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
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  userInfo?: UserInfo;
  requireOtp?: boolean;
  requireOnboarding?: boolean;
  demoCode?: string | null;
  maskedEmail?: string;
  data?: any;
  error?: string;
}

/**
 * Đăng nhập tài khoản bằng Email hoặc Số điện thoại & Mật khẩu
 * Endpoint: POST /api/auth/login
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const identifier = (payload.identifier || payload.email || '').trim();
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: identifier,
        identifier: identifier,
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
 * Bước 1: Đăng ký thông tin cá nhân & Gửi mã OTP 6 chữ số về Email
 * Endpoint: POST /api/auth/register
 */
export async function sendRegisterOtp(payload: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: string;
}): Promise<AuthResponse> {
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
        phone: payload.phone?.trim() || undefined,
        role: payload.role || (payload.email.toLowerCase().includes('admin') ? 'ADMIN' : 'OWNER'),
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
 * Bước 2: Xác thực mã OTP 6 số nhận qua Email
 * Endpoint: POST /api/auth/verify-otp
 */
export async function verifyRegisterOtp(payload: {
  email: string;
  otpCode: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email.trim(),
        otpCode: payload.otpCode.trim(),
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể xác thực mã OTP.',
    };
  }
}

/**
 * Gửi lại mã OTP 6 số về Email
 * Endpoint: POST /api/auth/resend-otp
 */
export async function resendRegisterOtp(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể gửi lại mã OTP.',
    };
  }
}

/**
 * Bước 3: Khởi tạo cửa hàng đầu tiên (Onboarding Shop) sau khi xác thực OTP
 * Endpoint: POST /api/shops/onboarding
 */
export async function onboardingShop(
  payload: {
    shopName: string;
    businessType?: string;
    address?: string;
    phone?: string;
  },
  token: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/shops/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shopName: payload.shopName.trim(),
        businessType: payload.businessType?.trim() || 'Tạp hóa & Bán lẻ tiêu dùng',
        address: payload.address?.trim() || '',
        phone: payload.phone?.trim() || '',
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể khởi tạo cửa hàng.',
    };
  }
}

/**
 * Đăng ký tài khoản mới bằng Email, Mật khẩu, Họ tên, Tên cửa hàng (Legacy)
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
        role: payload.role || (payload.email.toLowerCase().includes('admin') ? 'ADMIN' : 'OWNER'),
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
 * Cập nhật thông tin cá nhân (SĐT, Tên, Cửa hàng) bằng Bearer token
 * Endpoint: PUT /api/auth/profile
 */
export async function updateProfile(
  payload: UpdateProfilePayload,
  token: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể cập nhật thông tin cá nhân.',
    };
  }
}

/**
 * Tự động đánh thức máy chủ Backend (Prewarm / Keep-alive)
 * Giúp tránh độ trễ Cold Start của gói Render Free Tier khi người dùng vừa vào trang hoặc mở modal
 */
export function prewarmServer(): void {
  try {
    fetch(`${API_BASE_URL}/health`, { method: 'GET' }).catch(() => {});
  } catch {
    // ignore
  }
}
