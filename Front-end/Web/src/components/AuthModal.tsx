import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { loginUser, registerUser, updateProfile } from '../services/authApi';

export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  storeName: string;
  shopName?: string;
  phone: string;
  role?: 'ADMIN' | 'OWNER' | 'STAFF';
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
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [registerStep, setRegisterStep] = useState<'info' | 'otp' | 'onboarding'>('info');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: OTP state
  const [otpCode, setOtpCode] = useState('');

  // Step 3: First Shop Onboarding state
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('Tạp hóa & Bán lẻ tiêu dùng');
  const [storeAddress, setStoreAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState<string | null>(null);

  // Reset states on open/mode switch
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegisterStep('info');
      setErrorMessage(null);
      setSuccessMode(null);
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setErrorMessage('Vui lòng điền đầy đủ email hoặc số điện thoại và mật khẩu.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
        return;
      }
    } else {
      // Multi-step Registration Flow (FE-WEB-12): Step 1 (info) -> Step 2 (otp) -> Step 3 (onboarding)
      if (registerStep === 'info') {
        if (!fullName.trim()) {
          setErrorMessage('Vui lòng nhập họ và tên của bạn.');
          return;
        }
        if (!email.trim() || !password) {
          setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Mật khẩu xác nhận không khớp.');
          return;
        }
        setRegisterStep('otp');
        return;
      }

      if (registerStep === 'otp') {
        if (otpCode.trim().length < 6) {
          setErrorMessage('Vui lòng nhập đủ mã xác thực OTP gồm 6 chữ số đã gửi về Email.');
          return;
        }
        setRegisterStep('onboarding');
        return;
      }

      if (registerStep === 'onboarding') {
        if (!storeName.trim()) {
          setErrorMessage('Vui lòng nhập tên cửa hàng / hộ kinh doanh đầu tiên của bạn.');
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await registerUser({
          email: email.trim(),
          password,
          name: fullName.trim(),
          shopName: storeName.trim(),
          phone: phone.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Đăng ký không thành công. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }

        if (res.accessToken) {
          localStorage.setItem('vikeso_token', res.accessToken);
          // Tự động lưu Số điện thoại qua route profile có sẵn của Backend nếu người dùng có nhập
          if (phone.trim()) {
            try {
              await updateProfile({ phone: phone.trim() }, res.accessToken);
            } catch (profileErr) {
              console.warn('Lưu số điện thoại sau đăng ký:', profileErr);
            }
          }
        }

        const serverRole = (res.userInfo as any)?.role;
        const isExplicitAdmin =
          serverRole === 'ADMIN' ||
          String(serverRole || '').toUpperCase() === 'ADMIN' ||
          email.toLowerCase().includes('admin');

        const userRole: 'ADMIN' | 'OWNER' = isExplicitAdmin ? 'ADMIN' : 'OWNER';

        const user: UserAccount = {
          id: (res.userInfo as any)?.id || (res.userInfo as any)?._id,
          name: res.userInfo?.name || fullName.trim() || (userRole === 'ADMIN' ? 'Admin' : 'Chủ Hộ'),
          email: res.userInfo?.email || email.trim(),
          storeName: res.userInfo?.shopName || storeName.trim() || (userRole === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh'),
          shopName: res.userInfo?.shopName || storeName.trim() || (userRole === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh'),
          phone: phone.trim() || (res.userInfo as any)?.phone || '',
          role: userRole,
          subscriptionPlan: userRole === 'ADMIN' ? undefined : ((res.userInfo as any)?.subscriptionPlan || 'FREE'),
          proExpiresAt: (res.userInfo as any)?.proExpiresAt,
        };

        setSuccessMode('register');

        setTimeout(() => {
          onSuccess(user, 'register');
          onClose();
          setPassword('');
          setConfirmPassword('');
        }, 800);
      } else {
        const res = await loginUser({
          identifier: email.trim(),
          password,
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Email, số điện thoại hoặc mật khẩu không chính xác.');
          setIsLoading(false);
          return;
        }

        if (res.accessToken) {
          localStorage.setItem('vikeso_token', res.accessToken);
        }

        const serverRole = (res.userInfo as any)?.role;
        const isExplicitAdmin =
          serverRole === 'ADMIN' ||
          String(serverRole || '').toUpperCase() === 'ADMIN' ||
          email.toLowerCase().includes('admin');

        const userRole: 'ADMIN' | 'OWNER' = isExplicitAdmin ? 'ADMIN' : 'OWNER';

        const user: UserAccount = {
          id: (res.userInfo as any)?.id || (res.userInfo as any)?._id,
          name: res.userInfo?.name || (email.split('@')[0] || (userRole === 'ADMIN' ? 'Admin' : 'Chủ Hộ')),
          email: res.userInfo?.email || email.trim(),
          storeName: res.userInfo?.shopName || (userRole === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh'),
          shopName: res.userInfo?.shopName || (userRole === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh'),
          phone: (res.userInfo as any)?.phone || phone || '',
          role: userRole,
          subscriptionPlan: userRole === 'ADMIN' ? undefined : ((res.userInfo as any)?.subscriptionPlan || 'FREE'),
          proExpiresAt: (res.userInfo as any)?.proExpiresAt,
        };

        setSuccessMode('login');

        setTimeout(() => {
          onSuccess(user, 'login');
          onClose();
          setPassword('');
          setConfirmPassword('');
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]"
      >
        {/* Header - Tối giản, không rườm rà */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#fff0f5]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center border border-[#ffd6e4] shadow-xs">
              <img src="/logo.png" alt="VikeSo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'login'
                  ? 'Quản trị dòng tiền & đối soát hóa đơn 1-chạm'
                  : 'Bắt đầu dùng thử miễn phí không giới hạn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Segmented Control sạch sẽ */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#ff4783] text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#ff4783] text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="px-6 py-4 overflow-y-auto">
          {successMode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-[#d0f81b]/30 text-slate-900 mx-auto flex items-center justify-center border border-[#bde412]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                {successMode === 'login' ? 'Đăng Nhập Thành Công' : 'Đăng Ký Thành Công'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Đang chuyển hướng vào hệ thống quản lý dòng tiền VikeSo...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={mode === 'register' ? 'space-y-2.5' : 'space-y-3.5'}>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Step Indicator for Registration (FE-WEB-12) */}
              {mode === 'register' && (
                <div className="flex items-center justify-between text-[11px] font-bold pb-1.5 border-b border-slate-100">
                  <span className={registerStep === 'info' ? 'text-[#ff4783]' : 'text-slate-400'}>
                    1. Tài khoản cá nhân
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={registerStep === 'otp' ? 'text-[#ff4783]' : 'text-slate-400'}>
                    2. Xác thực OTP
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={registerStep === 'onboarding' ? 'text-[#ff4783]' : 'text-slate-400'}>
                    3. Tạo cửa hàng
                  </span>
                </div>
              )}

              {/* REGISTER STEP 2: EMAIL 6-DIGIT OTP */}
              {mode === 'register' && registerStep === 'otp' && (
                <div className="space-y-3 py-2">
                  <div className="p-3 rounded-xl bg-[#fff0f5] border border-[#ffd6e4] text-xs text-slate-700 space-y-1">
                    <div>
                      Mã xác thực 6 chữ số đã được gửi tới email:{' '}
                      <strong className="text-[#ff4783]">{email}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      (Bản Demo: Bạn có thể nhập mã <strong>123456</strong> để tiếp tục ngay)
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nhập mã OTP gồm 6 chữ số <span className="text-[#ff4783]">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center tracking-[0.5em] font-mono font-extrabold text-lg text-[#ff4783] focus:outline-none focus:border-[#ff4783]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegisterStep('info')}
                    className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer font-semibold"
                  >
                    ← Quay lại sửa thông tin email
                  </button>
                </div>
              )}

              {/* REGISTER STEP 3: FIRST SHOP ONBOARDING */}
              {mode === 'register' && registerStep === 'onboarding' && (
                <div className="space-y-3 py-1">
                  <div className="p-2.5 rounded-xl bg-[#f7fee7] border border-[#d9f99d] text-[11px] text-slate-900 font-bold">
                    ✓ Đã xác thực Email! Hãy khởi tạo cửa hàng đầu tiên của bạn (Kích hoạt ngay lập tức).
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tên Cửa hàng / Hộ kinh doanh đầu tiên <span className="text-[#ff4783]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="VD: Tạp Hóa Minh Phát"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Ngành nghề kinh doanh
                    </label>
                    <input
                      type="text"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="VD: Bán lẻ tạp hóa, F&B, Vựa nông sản..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Địa chỉ cửa hàng
                    </label>
                    <input
                      type="text"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="VD: 128 Nguyễn Trãi, Quận 5, TP.HCM"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* LOGIN OR REGISTER STEP 1 (PERSONAL INFO ONLY - NO SHOP NAME FIELD) */}
              {(mode === 'login' || registerStep === 'info') && (
                <>
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Họ và Tên của bạn <span className="text-[#ff4783]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="VD: Nguyễn Văn Cường"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white focus:ring-2 focus:ring-[#ff4783]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Số điện thoại Zalo / Telegram
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="VD: 0988 888 999"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white focus:ring-2 focus:ring-[#ff4783]/15 transition-all"
                        />
                      </div>
                    </>
                  )}

                  {/* Email / SĐT field */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {mode === 'login' ? 'Email hoặc Số điện thoại' : 'Email đăng nhập (Nhận mã OTP)'}{' '}
                      <span className="text-[#ff4783]">*</span>
                    </label>
                    <input
                      type={mode === 'login' ? 'text' : 'email'}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        mode === 'login'
                          ? 'VD: 0988 888 999 hoặc email@example.com'
                          : 'email@example.com'
                      }
                      className={`w-full px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white focus:ring-2 focus:ring-[#ff4783]/15 transition-all ${
                        mode === 'register' ? 'py-2' : 'py-2.5'
                      }`}
                    />
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Mật khẩu <span className="text-[#ff4783]">*</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setErrorMessage('Vui lòng liên hệ Telegram hỗ trợ @vikeso_bot hoặc quản trị viên để cấp lại mật khẩu.')}
                          className="text-[11px] text-[#ff4783] hover:underline cursor-pointer font-semibold"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className={`w-full pr-10 pl-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white focus:ring-2 focus:ring-[#ff4783]/15 transition-all ${
                          mode === 'register' ? 'py-2' : 'py-2.5'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field in Register Mode */}
                  {mode === 'register' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Xác nhận lại mật khẩu <span className="text-[#ff4783]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu trên"
                          className="w-full pr-10 pl-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white focus:ring-2 focus:ring-[#ff4783]/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Remember me */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 bg-white text-[#ff4783] focus:ring-0 cursor-pointer"
                      />
                      <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                    </label>
                  </div>
                </>
              )}

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white font-black text-xs flex items-center justify-center shadow-md shadow-[#ff4783]/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer border border-[#ff4783]"
              >
                {isLoading ? (
                  <span>Đang xử lý dữ liệu...</span>
                ) : (
                  <span>
                    {mode === 'login'
                      ? 'Đăng Nhập'
                      : registerStep === 'info'
                        ? 'Tiếp Tục: Nhận Mã OTP Email'
                        : registerStep === 'otp'
                          ? 'Xác Thực OTP & Tiếp Tục'
                          : 'Hoàn Tất & Khởi Tạo Cửa Hàng'}
                  </span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info - Gọn gàng */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] text-slate-500">Bảo mật SSL 256-bit</span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage(null);
            }}
            className="text-[#ff4783] hover:underline font-bold text-xs transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
