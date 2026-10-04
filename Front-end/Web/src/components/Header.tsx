import React, { useState } from 'react';
import { Menu, X, ArrowRight, LogOut, Wallet, ShieldCheck, Sparkles, Send, Scan, ChevronDown } from 'lucide-react';
import { Magnet } from './reactbits/Magnet';
import { UserAccount } from './AuthModal';

interface HeaderProps {
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenScan: () => void;
  onOpenTelegram: () => void;
  onOpenVideo: () => void;
  onOpenPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenScan,
  onOpenTelegram,
  onOpenPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');

  const navItems = [
    { label: 'Nỗi đau', href: '#noi-dau', id: 'noi-dau' },
    { label: 'Tính năng', href: '#tinh-nang', id: 'tinh-nang' },
    { label: 'Cách hoạt động', href: '#cach-hoat-dong', id: 'cach-hoat-dong' },
    { label: 'Bóc tách AI', href: '#vu-khi-bi-mat', id: 'vu-khi-bi-mat' },
    { label: 'Bảng giá', href: '#bang-gia', id: 'bang-gia' },
    { label: 'Hỏi đáp (FAQ)', href: '#faq', id: 'faq' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_15px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl h-20 mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveNav('hero');
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100/80 p-1 flex items-center justify-center border border-rose-200/70 shadow-md shadow-rose-500/10 group-hover:scale-105 group-hover:shadow-rose-500/25 transition-all duration-300">
              <img
                src="/logo.png"
                alt="VikeSo Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  Vike<span className="text-[#FF5C8D]">So</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-[#B31F56] border border-rose-200/70 inline-flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-[#FF5C8D]" />
                  <span>AI Cashflow</span>
                </span>
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`text-xs font-semibold transition-all py-1.5 px-3 rounded-xl cursor-pointer ${
                  activeNav === item.id
                    ? 'text-[#B31F56] bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            /* Logged in user profile chip */
            <div className="relative flex items-center gap-2">
              {onOpenPortal && (
                <button
                  onClick={onOpenPortal}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  }`}
                  title={currentUser.role === 'ADMIN' ? 'Mở Bảng Quản Trị Hệ Thống' : 'Mở Sổ Thu Chi & Dòng Tiền'}
                >
                  {currentUser.role === 'ADMIN' ? (
                    <ShieldCheck className="w-4 h-4 text-indigo-100" />
                  ) : (
                    <Wallet className="w-4 h-4 text-emerald-100" />
                  )}
                  <span>{currentUser.role === 'ADMIN' ? 'Bảng Quản Trị' : 'Sổ Thu Chi'}</span>
                </button>
              )}

              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-full bg-white border border-slate-200 transition-all shadow-xs cursor-pointer ${
                  currentUser.role === 'ADMIN' ? 'hover:border-indigo-500' : 'hover:border-emerald-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-2xs ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-800'
                      : 'bg-gradient-to-br from-emerald-600 to-teal-700'
                  }`}
                >
                  {((currentUser?.name || currentUser?.email || 'U').charAt(0)).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    {currentUser?.name || currentUser?.email || 'Chủ Cửa Hàng'}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none mt-1 truncate max-w-[120px]">
                    {currentUser?.storeName || 'Cửa hàng của tôi'}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 truncate">{currentUser.storeName}</div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          currentUser.role === 'ADMIN'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        }`}
                      >
                        {currentUser.role || 'OWNER'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email}</div>
                  </div>

                  {onOpenPortal && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenPortal();
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-bold rounded-xl flex items-center gap-2 mt-1 cursor-pointer transition-colors ${
                        currentUser.role === 'ADMIN'
                          ? 'text-indigo-700 hover:bg-indigo-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {currentUser.role === 'ADMIN' ? (
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Wallet className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>
                        {currentUser.role === 'ADMIN' ? 'Vào Bảng Quản Trị Hệ Thống' : 'Vào Sổ Thu Chi & Dòng Tiền'}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenScan();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 mt-0.5 cursor-pointer transition-colors"
                  >
                    <Scan className="w-4 h-4 text-[#B31F56]" />
                    <span>Quét chứng từ 1-chạm</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenTelegram();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span>Báo cáo Telegram 22h00</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest buttons */
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#B31F56] hover:bg-rose-50/60 transition-all cursor-pointer"
              >
                Đăng nhập
              </button>

              <Magnet padding={20} magnetStrength={0.25}>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B31F56] to-[#FF5C8D] text-xs font-bold text-white hover:opacity-95 active:scale-95 transition-all shadow-md shadow-rose-500/25 cursor-pointer"
                >
                  <span>Dùng thử miễn phí</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Magnet>
            </>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-4 space-y-2.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveNav(item.id);
              }}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#B31F56] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B31F56] to-[#FF5C8D] text-xs font-bold text-white shadow-sm cursor-pointer"
                >
                  Đăng ký tài khoản mới (Miễn phí)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
