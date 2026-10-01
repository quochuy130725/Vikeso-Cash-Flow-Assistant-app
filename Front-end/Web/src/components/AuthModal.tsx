import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Store,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ShinyText } from './reactbits/ShinyText';
import { loginUser, registerUser } from '../services/authApi';

export interface UserAccount {
  name: string;
  email: string;
  storeName: string;
  phone: string;
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
    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (mode === 'register') {
      if (!fullName) {
        setErrorMessage('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (!storeName) {
        setErrorMessage('Vui lòng nhập tên vựa / cửa hàng / hộ kinh doanh.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp.');
        return;
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
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Đăng ký không thành công. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }

        if (res.accessToken) {
          localStorage.setItem('vikeso_token', res.accessToken);
        }

        const user: UserAccount = {
          name: res.userInfo?.name || fullName.trim(),
          email: res.userInfo?.email || email.trim(),
          storeName: res.userInfo?.shopName || storeName.trim(),
          phone: phone || '',
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
          email: email.trim(),
          password,
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Email hoặc mật khẩu không chính xác.');
          setIsLoading(false);
          return;
        }

        if (res.accessToken) {
          localStorage.setItem('vikeso_token', res.accessToken);
        }

        const user: UserAccount = {
          name: res.userInfo?.name || (email.split('@')[0] || 'Chủ Vựa'),
          email: res.userInfo?.email || email.trim(),
          storeName: res.userInfo?.shopName || 'Cửa hàng VikeSo',
          phone: phone || '',
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

  const handleQuickDemoFill = () => {
    setEmail('chuvua.bacuong@gmail.com');
    setPassword('VikeSo@2026');
    setFullName('Ba Cường');
    setStoreName('Vựa Sầu Riêng Ba Cường');
    setPhone('0988 888 999');
    setConfirmPassword('VikeSo@2026');
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-lg bg-[#191c1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#24282a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#198754] flex items-center justify-center text-white font-bold shadow-md">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>{mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#198754]/30 text-emerald-300 font-semibold border border-[#198754]/40">
                  VikeSo AI
                </span>
              </h3>
              <p className="text-xs text-white/60">
                {mode === 'login'
                  ? 'Quản trị dòng tiền 1-chạm & xem báo cáo đối soát'
                  : 'Bắt đầu dùng thử miễn phí không giới hạn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Đăng nhập vs Đăng ký */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#198754] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
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
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#198754] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {successMode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {successMode === 'login' ? 'Đăng Nhập Thành Công!' : 'Đăng Ký Thành Công!'}
              </h4>
              <p className="text-xs text-white/70 max-w-xs mx-auto">
                Đang chuyển hướng vào hệ thống quản lý dòng tiền VikeSo...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Extra registration fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">
                      Họ và Tên chủ cơ sở <span className="text-[#198754]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="VD: Nguyễn Văn Cường"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-[#198754] transition-colors"
                      />
                      <User className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">
                      Tên Vựa / Cửa hàng / Hộ kinh doanh <span className="text-[#198754]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="VD: Vựa Sầu Riêng Ba Cường"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-[#198754] transition-colors"
                      />
                      <Store className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">
                      Số điện thoại Zalo / Telegram
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="VD: 0988 888 999"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-[#198754] transition-colors"
                      />
                      <Phone className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    </div>
                  </div>
                </>
              )}

              {/* Email field */}
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Email đăng nhập <span className="text-[#198754]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-[#198754] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-white/80">
                    Mật khẩu <span className="text-[#198754]">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Vui lòng liên hệ hỗ trợ hoặc kiểm tra email để đặt lại mật khẩu.')}
                      className="text-[11px] text-emerald-400 hover:underline"
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
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-[#198754] transition-colors"
                  />
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field in Register Mode */}
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Xác nhận lại mật khẩu <span className="text-[#198754]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu trên"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-[#198754] transition-colors"
                    />
                    <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me & terms */}
              <div className="flex items-center justify-between text-xs text-white/70 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#198754] focus:ring-0"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#198754]/30 active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang xử lý dữ liệu...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký (1-Chạm)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Fill Button for Demo Testing */}
              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1.5 opacity-90 hover:opacity-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Điền nhanh tài khoản thử nghiệm (Ba Cường)</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#24282a] flex items-center justify-between text-xs text-white/60">
          <span>Bảo mật SSL 256-bit chuẩn ngân hàng</span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage(null);
            }}
            className="text-white hover:text-emerald-400 font-semibold transition-colors underline"
          >
            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
