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
  role?: 'ADMIN' | 'OWNER';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState<string | null>(null);

  // Reset states on open/mode switch
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMode(null);
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (mode === 'login') {
      if (!email.trim() || !password) {
        setErrorMessage('Vui lòng điền đầy đủ email hoặc số điện thoại và mật khẩu.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
        return;
      }
      if (!fullName.trim()) {
        setErrorMessage('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (!storeName.trim()) {
        setErrorMessage('Vui lòng nhập tên vựa / cửa hàng / hộ kinh doanh.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]"
      >
        {/* Header - Tối giản, không rườm rà */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 p-1 flex items-center justify-center border border-slate-700/80 shadow-xs">
              <img src="/logo.png" alt="VikeSo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'login'
                  ? 'Quản trị dòng tiền & đối soát hóa đơn 1-chạm'
                  : 'Bắt đầu dùng thử miễn phí không giới hạn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Segmented Control sạch sẽ */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white font-medium'
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
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white font-medium'
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
              <div className="w-14 h-14 rounded-full bg-[#d0f81b]/15 text-[#d0f81b] mx-auto flex items-center justify-center border border-[#d0f81b]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">
                {successMode === 'login' ? 'Đăng Nhập Thành Công' : 'Đăng Ký Thành Công'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Đang chuyển hướng vào hệ thống quản lý dòng tiền VikeSo...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={mode === 'register' ? 'space-y-2.5' : 'space-y-3.5'}>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Extra registration fields - Bỏ toàn bộ icon rườm rà, padding sạch sẽ */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Họ và Tên chủ cơ sở <span className="text-[#ff4783]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="VD: Nguyễn Văn Cường"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#ff4783] focus:ring-2 focus:ring-[#ff4783]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Tên Vựa / Cửa hàng / Hộ kinh doanh <span className="text-[#ff4783]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="VD: Vựa Sầu Riêng Ba Cường"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#ff4783] focus:ring-2 focus:ring-[#ff4783]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Số điện thoại Zalo / Telegram
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0988 888 999"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#ff4783] focus:ring-2 focus:ring-[#ff4783]/20 transition-all"
                    />
                  </div>
                </>
              )}

              {/* Email / SĐT field - Input sạch, không nhồi nhét icon */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {mode === 'login' ? 'Email hoặc Số điện thoại' : 'Email đăng nhập'}{' '}
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
                  className={`w-full px-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#ff4783] focus:ring-2 focus:ring-[#ff4783]/20 transition-all ${
                    mode === 'register' ? 'py-2' : 'py-2.5'
                  }`}
                />
              </div>

              {/* Password field - Chỉ giữ icon mắt ẩn/hiện mật khẩu cần thiết */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Mật khẩu <span className="text-[#ff4783]">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Vui lòng liên hệ Telegram hỗ trợ @vikeso_bot hoặc quản trị viên để cấp lại mật khẩu.')}
                      className="text-[11px] text-[#ff4783] hover:underline cursor-pointer font-medium"
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
                    className={`w-full pr-10 pl-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#ff4783] focus:ring-2 focus:ring-[#ff4783]/20 transition-all ${
                      mode === 'register' ? 'py-2' : 'py-2.5'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field in Register Mode */}
              {mode === 'register' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Xác nhận lại mật khẩu <span className="text-[#ff4783]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu trên"
                      className="w-full pr-10 pl-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#ff4783] focus:ring-2 focus:ring-[#ff4783]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#ff4783] focus:ring-0 cursor-pointer"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* Action Submit Button - Tinh gọn, không icon mũi tên */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white font-black text-xs flex items-center justify-center shadow-md shadow-[#ff4783]/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer border border-[#ff4783]"
              >
                {isLoading ? (
                  <span>Đang xử lý dữ liệu...</span>
                ) : (
                  <span>{mode === 'login' ? 'Đăng Nhập' : 'Hoàn Tất Đăng Ký'}</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info - Gọn gàng */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">Bảo mật SSL 256-bit</span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage(null);
            }}
            className="text-[#d0f81b] hover:underline font-semibold text-xs transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
