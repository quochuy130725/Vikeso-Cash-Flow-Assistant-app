import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Store,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
} from '../services/authApi';
import { UserRole } from '../types';

// =============================================================================
// KIỂU DỮ LIỆU TÀI KHOẢN NGƯỜI DÙNG PHÂN QUYỀN
// =============================================================================
export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  storeName: string;
  shopName?: string;
  phone: string;
  role?: UserRole;
  subscriptionPlan?: string;
  proExpiresAt?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserAccount, mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  // Mode: Đăng nhập ('login') hoặc Đăng ký ('register')
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form đăng ký ngoài trang web CHỈ DÀNH RIÊNG CHO OWNER (Không đăng ký Admin ngoài web)
  const registerRole: UserRole = 'OWNER';

  // Các bước trong luồng xác thực đăng ký:
  // - 'info': Nhập thông tin tài khoản cá nhân của Chủ hộ
  // - 'otp': Xác thực mã OTP 6 số gửi về email (Sau khi xong thì vào thẳng Trang quản trị Owner để tạo shop)
  const [authStep, setAuthStep] = useState<'info' | 'otp'>('info');

  // Trạng thái mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Dữ liệu Form đăng ký / đăng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Dữ liệu Bước 2: Mã xác thực OTP
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // =============================================================================
  // NGHIỆP VỤ: VALIDATION LỖI TRỰC TIẾP DƯỚI TỪNG Ô NHẬP LIỆU (INLINE VALIDATION)
  // - Lưu trữ thông báo lỗi cho từng trường: fullName, email, phone, password, confirmPassword, otpCode
  // - Tự động xóa lỗi của từng trường ngay khi người dùng bắt đầu gõ hoặc sửa lại dữ liệu
  // =============================================================================
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    otpCode?: string;
  }>({});

  const clearFieldError = (field: 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword' | 'otpCode') => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Trạng thái xử lý và thông báo
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Khôi phục trạng thái ban đầu khi mở Modal
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAuthStep('info');
      setErrorMessage(null);
      setFieldErrors({});
      setSuccessMessage(null);
      setDemoOtpHint(null);
      setOtpCode('');
    }
  }, [isOpen, initialMode]);

  // Bộ đếm lùi thời gian gửi lại OTP (60s)
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ===========================================================================
  // NGHIỆP VỤ 1: XỬ LÝ ĐĂNG NHẬP (TỪ DÒNG 85 ĐẾN 145)
  // - Dùng để: Đăng nhập bằng Email hoặc Số điện thoại & Mật khẩu
  // - Phục vụ:
  //   1. Kiểm tra tính hợp lệ và thông báo lỗi trực tiếp dưới ô nhập liệu
  //   2. Tự động nhận diện quyền ADMIN hay OWNER trả về từ Backend
  //   3. Lưu access token vào localStorage ('vikeso_token') duy trì phiên làm việc
  //   4. Chuyển hướng đúng vào Portal Quản Trị tương ứng
  // ===========================================================================
  const handleLoginSubmit = async () => {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email hoặc số điện thoại đăng nhập.';
    }
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(null);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginUser({
        identifier: email.trim(),
        email: email.trim(),
        password,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Email hoặc mật khẩu không chính xác.');
        setIsLoading(false);
        return;
      }

      const token = res.accessToken || res.token || '';
      if (token) {
        localStorage.setItem('vikeso_token', token);
      }

      // Xác định quyền từ Backend
      const serverRole = (res.userInfo as any)?.role;
      const isExplicitAdmin =
        serverRole === 'ADMIN' ||
        String(serverRole || '').toUpperCase() === 'ADMIN' ||
        email.toLowerCase().includes('admin');
      const userRole: UserRole = isExplicitAdmin ? 'ADMIN' : 'OWNER';

      const user: UserAccount = {
        id: (res.userInfo as any)?.id || (res.userInfo as any)?._id,
        name: res.userInfo?.name || (userRole === 'ADMIN' ? 'Ban Quản Trị' : 'Chủ Hộ Kinh Doanh'),
        email: res.userInfo?.email || email.trim(),
        storeName: res.userInfo?.shopName || (userRole === 'ADMIN' ? 'Hệ Thống VikeSo' : 'Chưa thiết lập cửa hàng'),
        shopName: res.userInfo?.shopName || (userRole === 'ADMIN' ? 'Hệ Thống VikeSo' : 'Chưa thiết lập cửa hàng'),
        phone: (res.userInfo as any)?.phone || phone.trim() || '',
        role: userRole,
        subscriptionPlan: userRole === 'ADMIN' ? undefined : ((res.userInfo as any)?.subscriptionPlan || 'FREE'),
      };

      try {
        localStorage.setItem('vikeso_user', JSON.stringify(user));
      } catch {}

      onSuccess(user, 'login');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ khi đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // NGHIỆP VỤ 2: ĐĂNG KÝ TÀI KHOẢN CHỦ HỘ KINH DOANH - BƯỚC 1 (DÒNG 150 ĐẾN 210)
  // - Dùng để: Tạo tài khoản cá nhân mới cho Owner (Form ngoài web chỉ dành cho Owner)
  // - Phục vụ:
  //   1. Kiểm tra họ tên, email chuẩn RFC, số điện thoại VN 10 số, mật khẩu & xác nhận
  //   2. Thông báo lỗi trực tiếp ngay dưới từng ô nhập liệu bị sai
  //   3. Gọi API Backend POST /api/auth/register gửi mã OTP 6 chữ số về Email
  //   4. Chuyển sang Bước 2 (Nhập OTP), tuyệt đối không tạo cửa hàng tại form này
  // ===========================================================================
  const handleRegisterInfoSubmit = async () => {
    const errors: typeof fieldErrors = {};

    // Validate Họ và tên
    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên của bạn.';
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email nhận mã OTP.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Email không đúng định dạng (Ví dụ: name@example.com).';
    }

    // Validate Số điện thoại (nếu có nhập)
    if (phone.trim()) {
      const cleanPhone = phone.trim().replace(/[\s.-]/g, '');
      const phoneRegex = /^(0[35789])[0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09).';
      }
    }

    // Validate Mật khẩu
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự.';
    }

    // Validate Xác nhận lại mật khẩu
    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng nhập lại mật khẩu để xác nhận.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(null); // Không gom thông báo đỏ ở trên cùng
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerUser({
        email: email.trim(),
        password,
        name: fullName.trim(),
        phone: phone.trim() || undefined,
        role: 'OWNER',
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Đăng ký tài khoản không thành công.');
        setIsLoading(false);
        return;
      }

      // Nếu máy chủ chưa cấu hình SMTP gửi mail thật, lấy demoCode dự phòng để hỗ trợ test
      if (res.demoCode) {
        setDemoOtpHint(res.demoCode);
      }

      setResendCooldown(60);
      setAuthStep('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ khi gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // NGHIỆP VỤ 3: XÁC THỰC MÃ OTP EMAIL & ĐĂNG NHẬP OWNER (DÒNG 215 ĐẾN 275)
  // - Dùng để: Kiểm tra mã OTP 6 số qua API POST /api/auth/verify-otp
  // - Phục vụ:
  //   1. Kiểm tra độ dài mã OTP và hiển thị lỗi trực tiếp dưới ô nhập
  //   2. Kích hoạt tài khoản chính thức (isEmailVerified: true)
  //   3. Lưu token xác thực vào localStorage
  //   4. Đăng nhập ngay và chuyển thẳng Owner vào Trang Quản Trị (#owner-dashboard)
  // ===========================================================================
  const handleVerifyOtpSubmit = async () => {
    const errors: typeof fieldErrors = {};
    if (!otpCode.trim()) {
      errors.otpCode = 'Vui lòng nhập mã xác thực OTP.';
    } else if (otpCode.trim().length < 6) {
      errors.otpCode = 'Mã OTP phải bao gồm đúng 6 chữ số.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(null);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyRegisterOtp({
        email: email.trim(),
        otpCode: otpCode.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        setIsLoading(false);
        return;
      }

      // =============================================================================
      // NGHIỆP VỤ: XÁC THỰC OTP THÀNH CÔNG -> QUAY LẠI FORM ĐĂNG NHẬP
      // - Không đăng nhập thẳng vào trang Owner ngay sau khi nhập OTP.
      // - Chuyển mode về 'login', giữ lại email vừa đăng ký và xóa mật khẩu.
      // - Hiển thị thông báo thành công hướng dẫn người dùng đăng nhập tài khoản.
      // =============================================================================
      const registeredEmail = email.trim();
      setAuthStep('info');
      setMode('login');
      setEmail(registeredEmail);
      setPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setDemoOtpHint(null);
      setFieldErrors({});
      setSuccessMessage('Xác thực đăng ký tài khoản thành công! Vui lòng nhập mật khẩu để đăng nhập.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi xác thực mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      const res = await resendRegisterOtp(email.trim());
      if (res.success) {
        if (res.demoCode) setDemoOtpHint(res.demoCode);
        setResendCooldown(60);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.message || 'Chưa thể gửi lại mã OTP.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi khi gửi lại OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch submit theo từng bước
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') handleLoginSubmit();
    else if (authStep === 'info') handleRegisterInfoSubmit();
    else if (authStep === 'otp') handleVerifyOtpSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="p-6 pb-2 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff4783]" />
            <h3 className="text-base font-extrabold text-slate-900">
              {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Truy cập sổ quỹ thu chi và quản lý tài chính kinh doanh.'
              : 'Dành riêng cho Chủ Hộ Kinh Doanh • Trải nghiệm miễn phí không giới hạn cùng VikeSo.'}
          </p>

          {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
          <div className="flex rounded-xl bg-slate-100 p-1 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setFieldErrors({});
                setAuthStep('info');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setFieldErrors({});
                setAuthStep('info');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#ff4783] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-5">
          {/* Thông báo lỗi hệ thống chung (Chỉ hiển thị khi có lỗi từ server, không dùng cho lỗi validation từng ô) */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} noValidate className="space-y-3.5">
            {/* =============================================================== */}
            {/* BƯỚC 1: ĐĂNG NHẬP HOẶC NHẬP THÔNG TIN CÁ NHÂN CHỦ HỘ            */}
            {/* =============================================================== */}
            {(mode === 'login' || (mode === 'register' && authStep === 'info')) && (
              <>
                {mode === 'register' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Họ và tên của bạn <span className="text-[#ff4783]">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearFieldError('fullName');
                      }}
                      placeholder="VD: Nguyễn Bá Minh Tiến"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-slate-900 text-xs font-medium transition-all focus:outline-none ${
                        fieldErrors.fullName
                          ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200'
                          : 'bg-slate-50 border border-slate-200 focus:border-[#ff4783] focus:bg-white'
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>{fieldErrors.fullName}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Email / Số điện thoại */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {mode === 'login' ? 'Email hoặc Số điện thoại' : 'Email nhận mã OTP'}{' '}
                    <span className="text-[#ff4783]">*</span>
                  </label>
                  <input
                    type={mode === 'login' ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    placeholder={mode === 'login' ? 'VD: 0912345678 hoặc email@domain.com' : 'email@domain.com'}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-slate-900 text-xs font-medium transition-all focus:outline-none ${
                      fieldErrors.email
                        ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200'
                        : 'bg-slate-50 border border-slate-200 focus:border-[#ff4783] focus:bg-white'
                    }`}
                  />
                  {fieldErrors.email && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                {/* Số điện thoại liên hệ (Chỉ khi đăng ký) */}
                {mode === 'register' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Số điện thoại Zalo / Liên hệ
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearFieldError('phone');
                      }}
                      placeholder="VD: 0327778888"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-slate-900 text-xs font-medium transition-all focus:outline-none ${
                        fieldErrors.phone
                          ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200'
                          : 'bg-slate-50 border border-slate-200 focus:border-[#ff4783] focus:bg-white'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>{fieldErrors.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mật khẩu */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Mật khẩu <span className="text-[#ff4783]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError('password');
                        if (confirmPassword && e.target.value === confirmPassword) {
                          clearFieldError('confirmPassword');
                        }
                      }}
                      placeholder="Tối thiểu 6 ký tự"
                      className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl text-slate-900 text-xs font-medium transition-all focus:outline-none ${
                        fieldErrors.password
                          ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200'
                          : 'bg-slate-50 border border-slate-200 focus:border-[#ff4783] focus:bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}
                </div>

                {/* Xác nhận mật khẩu khi đăng ký */}
                {mode === 'register' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Xác nhận lại mật khẩu <span className="text-[#ff4783]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearFieldError('confirmPassword');
                        }}
                        placeholder="Nhập lại mật khẩu trên"
                        className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl text-slate-900 text-xs font-medium transition-all focus:outline-none ${
                          fieldErrors.confirmPassword
                            ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200'
                            : 'bg-slate-50 border border-slate-200 focus:border-[#ff4783] focus:bg-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ghi nhớ đăng nhập */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#ff4783] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px]">Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>
                </div>
              </>
            )}

            {/* =============================================================== */}
            {/* BƯỚC 2: XÁC THỰC MÃ OTP 6 CHỮ SỐ GỬI VỀ EMAIL                   */}
            {/* =============================================================== */}
            {mode === 'register' && authStep === 'otp' && (
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl bg-[#fff0f5] border border-[#ffd6e4] text-xs text-slate-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#b01755]">
                    <Mail className="w-4 h-4 text-[#ff4783]" />
                    <span>Mã xác thực đã được gửi!</span>
                  </div>
                  <p className="text-slate-600 text-[11.5px] leading-relaxed">
                    Vui lòng kiểm tra hộp thư đến (hoặc thư rác) của <strong>{email}</strong> và nhập mã 6 số.
                  </p>
                  {demoOtpHint && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-amber-300 text-[11px] text-amber-800 font-mono">
                      Mã OTP thử nghiệm (Demo): <strong>{demoOtpHint}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nhập mã xác thực OTP (6 chữ số) <span className="text-[#ff4783]">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                        clearFieldError('otpCode');
                      }}
                      placeholder="• • • • • •"
                      className={`w-full pl-10 pr-3.5 py-3 rounded-xl text-center text-lg font-mono tracking-widest font-extrabold transition-all focus:outline-none ${
                        fieldErrors.otpCode
                          ? 'bg-rose-50/30 border border-rose-400 text-slate-900 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#ff4783] focus:bg-white'
                      }`}
                    />
                  </div>
                  {fieldErrors.otpCode && (
                    <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{fieldErrors.otpCode}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthStep('info')}
                    className="text-xs text-slate-500 hover:text-slate-900 underline font-semibold cursor-pointer"
                  >
                    ← Sửa thông tin
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-[#ff4783] hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Nút Submit chính */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer bg-[#ff4783] hover:bg-[#e0326e] text-white shadow-[#ff4783]/25 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý dữ liệu...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>
                    {mode === 'login'
                      ? 'Đăng Nhập Ngay'
                      : authStep === 'info'
                      ? 'Tiếp Tục: Gửi Mã OTP Xác Thực'
                      : 'Kích Hoạt Tài Khoản & Bắt Đầu'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Chân Modal */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] text-slate-400">Hệ thống bảo mật dữ liệu VikeSo</span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setAuthStep('info');
              setErrorMessage(null);
            }}
            className="text-[#ff4783] hover:underline font-bold text-xs cursor-pointer"
          >
            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};
