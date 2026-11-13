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
  phone?: string;
  role?: 'OWNER' | 'ADMIN';
  adminSecretCode?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otpCode: string;
}

export interface OnboardingShopPayload {
  shopName: string;
  businessType?: string;
  address?: string;
  phone?: string;
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
  token?: string;
  requireOtp?: boolean;
  maskedEmail?: string;
  demoCode?: string;
  userInfo?: UserInfo;
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

// =============================================================================
// NGHIỆP VỤ 1: ĐĂNG KÝ TÀI KHOẢN NGƯỜI DÙNG MỚI (CHỦ HỘ HOẶC ADMIN)
// - Bắt đầu từ dòng này đến hết hàm registerUser
// - Không bắt buộc truyền shopName (Chủ hộ tạo cửa hàng sau khi kích hoạt OTP)
// - Gửi yêu cầu lên server để sinh mã OTP 6 số và gửi mail
// =============================================================================
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
        phone: payload.phone?.trim() || undefined,
        role: payload.role || 'OWNER',
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

// =============================================================================
// NGHIỆP VỤ 2: XÁC THỰC MÃ OTP EMAIL KÍCH HOẠT TÀI KHOẢN
// - Bắt đầu từ dòng này đến hết hàm verifyRegisterOtp
// - Gửi mã 6 số người dùng nhập lên server kiểm tra
// - Nếu đúng: Backend kích hoạt isEmailVerified: true và trả về accessToken
// =============================================================================
export async function verifyRegisterOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
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

// =============================================================================
// NGHIỆP VỤ 3: GỬI LẠI MÃ XÁC THỰC OTP
// - Hỗ trợ khi mã hết hạn (5 phút) hoặc người dùng chưa nhận được email
// =============================================================================
export async function resendRegisterOtp(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
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

// =============================================================================
// NGHIỆP VỤ 4: THIẾT LẬP CỬA HÀNG ĐẦU TIÊN CHO CHỦ HỘ (ONBOARDING SHOP)
// - Bắt đầu từ dòng này đến hết hàm onboardingFirstShop
// - Sau khi xác thực OTP thành công, Owner điền thông tin cửa hàng thực tế
// - Tự động kích hoạt trạng thái APPROVED cho cơ sở chính (isPrimary: true)
// =============================================================================
export async function onboardingFirstShop(
  payload: OnboardingShopPayload,
  token: string
): Promise<{ success: boolean; message?: string; data?: any; userInfo?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/shops/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shopName: payload.shopName.trim(),
        businessType: payload.businessType || 'Hộ kinh doanh bán lẻ',
        address: payload.address?.trim() || '',
        phone: payload.phone?.trim() || '',
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể khởi tạo thông tin cửa hàng.',
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
