import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, LogOut, Wallet, ShieldCheck, Sparkles, Send, Scan, ChevronDown } from 'lucide-react';
import { Magnet } from './reactbits/Magnet';
import { UserAccount } from './AuthModal';

interface HeaderProps {
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenScan: () => void;
  onOpenTelegram: () => void;
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
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Streamlined 4 core sections: Non-overlapping, crystal-clear navigation
  const navItems = [
    { label: 'Tính năng', href: '#tinh-nang', id: 'tinh-nang' },
    { label: 'Cách hoạt động', href: '#cach-hoat-dong', id: 'cach-hoat-dong' },
    { label: 'Bảng giá', href: '#bang-gia', id: 'bang-gia' },
    { label: 'Hỏi đáp (FAQ)', href: '#faq', id: 'faq' },
  ];

  // Scroll spy to highlight active section on navbar (disabled during click animation to prevent flickering)
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPos = window.scrollY + 180;
      const sectionIds = ['faq', 'bang-gia', 'cach-hoat-dong', 'tinh-nang'];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset;
          if (scrollPos >= top) {
            setActiveNav(id);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveNav('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setActiveNav(targetId);
    setMobileMenuOpen(false);

    // Lock scroll spy during smooth scroll transition
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);

    if (targetId === 'hero' || targetId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element =
      document.getElementById(targetId) ||
      (targetId === 'boc-tach-ai' || targetId === 'noi-dau' || targetId === 'features' || targetId === 'vu-khi-bi-mat'
        ? document.getElementById('tinh-nang')
        : null);

    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_1px_15px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl h-20 mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <a
            href="#landing"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveNav('hero');
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f8fee0] to-[#ecfcc2] p-1 flex items-center justify-center border border-[#d0f81b]/80 shadow-md shadow-[#d0f81b]/15 group-hover:scale-105 group-hover:shadow-[#d0f81b]/35 transition-all duration-300">
              <img
                src="/logo.png"
                alt="VikeSo Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-950">
                  Vike<span className="text-[#ff4783]">So</span>
                </span>
                <span className="text-[11px] font-black tracking-wide px-2 py-0.5 rounded-full bg-[#d0f81b]/25 text-[#243505] border border-[#d0f81b] inline-flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-[#557800]" />
                  <span>Sổ Quỹ Thông Minh</span>
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
                onClick={(e) => scrollToSection(e, item.id)}
                className={`text-xs font-semibold transition-all py-1.5 px-3 rounded-xl cursor-pointer ${
                  activeNav === item.id
                    ? 'text-slate-950 bg-white shadow-xs font-bold ring-1 ring-[#d0f81b]'
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
                      : 'bg-[#ff4783] hover:bg-[#e0326e] shadow-[#ff4783]/25'
                  }`}
                  title={currentUser.role === 'ADMIN' ? 'Mở Bảng Quản Trị Hệ Thống' : 'Mở Sổ Thu Chi & Dòng Tiền'}
                >
                  {currentUser.role === 'ADMIN' ? (
                    <ShieldCheck className="w-4 h-4 text-indigo-100" />
                  ) : (
                    <Wallet className="w-4 h-4 text-white" />
                  )}
                  <span>{currentUser.role === 'ADMIN' ? 'Bảng Quản Trị' : 'Sổ Thu Chi'}</span>
                </button>
              )}

              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-full bg-white border border-slate-200 transition-all shadow-xs cursor-pointer ${
                  currentUser.role === 'ADMIN' ? 'hover:border-indigo-500' : 'hover:border-[#ff4783]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-2xs ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-800'
                      : 'bg-gradient-to-br from-[#ff4783] to-[#e0326e]'
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
                            : 'bg-[#ff4783]/10 text-[#ff4783] border-[#ff4783]/20'
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
                          : 'text-[#ff4783] hover:bg-[#ff4783]/10'
                      }`}
                    >
                      {currentUser.role === 'ADMIN' ? (
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Wallet className="w-4 h-4 text-[#ff4783]" />
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
                    <Scan className="w-4 h-4 text-slate-950" />
                    <span>Chụp hóa đơn vào sổ</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenTelegram();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span>Báo cáo cuối ngày (Telegram)</span>
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
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-[#d0f81b]/15 transition-all cursor-pointer"
              >
                Đăng nhập
              </button>

              <Magnet padding={20} magnetStrength={0.25}>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-xs font-black text-white border border-[#ff4783] active:scale-95 transition-all shadow-md shadow-[#ff4783]/35 hover:shadow-lg hover:shadow-[#ff4783]/50 cursor-pointer"
                >
                  <span>Dùng thử miễn phí</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
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
              onClick={(e) => scrollToSection(e, item.id)}
              className={`block py-2 text-sm font-semibold transition-colors cursor-pointer rounded-xl px-2 ${
                activeNav === item.id
                  ? 'text-slate-950 font-bold bg-[#d0f81b]/25 border border-[#d0f81b]/50'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
              }`}
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
                  className="w-full py-2.5 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-xs font-black text-slate-950 shadow-sm border border-[#bde412] cursor-pointer"
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
