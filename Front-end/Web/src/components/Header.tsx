import React, { useState } from 'react';
import { Menu, X, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
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
    { label: 'Tính năng cốt lõi', href: '#tinh-nang', id: 'tinh-nang' },
    { label: 'Cách hoạt động', href: '#cach-hoat-dong', id: 'cach-hoat-dong' },
    { label: 'Vũ khí bí mật', href: '#vu-khi-bi-mat', id: 'vu-khi-bi-mat' },
    { label: 'Bảng giá', href: '#bang-gia', id: 'bang-gia' },
    { label: 'Hỏi đáp (FAQ)', href: '#faq', id: 'faq' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#f8f9fa]/90 backdrop-blur-xl border-b border-[#e1e3e4]/80 shadow-[0_1px_12px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-[1280px] h-20 mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveNav('hero');
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#198754] to-[#0f5132] flex items-center justify-center shadow-md shadow-[#198754]/25 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-[22px]">insights</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#191c1d]">
                  Vike<span className="text-[#b31f56]">So</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#198754]/10 text-[#198754] border border-[#198754]/20 hidden sm:inline-block">
                  AI FinTech
                </span>
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`text-xs font-medium transition-colors py-1.5 px-2 rounded-lg hover:bg-white/60 ${
                  activeNav === item.id
                    ? 'text-[#198754] font-bold bg-white shadow-2xs'
                    : 'text-[#584045] hover:text-[#191c1d]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {currentUser ? (
            /* Logged in user profile chip */
            <div className="relative flex items-center gap-2">
              {onOpenPortal && (
                <button
                  onClick={onOpenPortal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#198754] text-white text-xs font-bold hover:bg-[#146c43] transition-colors shadow-sm cursor-pointer"
                  title={currentUser.role === 'ADMIN' ? 'Mở Bảng Quản Trị Hệ Thống' : 'Mở Sổ Thu Chi & Dòng Tiền'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {currentUser.role === 'ADMIN' ? 'admin_panel_settings' : 'account_balance_wallet'}
                  </span>
                  <span>{currentUser.role === 'ADMIN' ? 'Bảng Quản Trị' : 'Sổ Thu Chi'}</span>
                </button>
              )}

              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white border border-[#e1e3e4] hover:border-[#198754] transition-all shadow-xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#198754] text-white flex items-center justify-center font-bold text-xs">
                  {((currentUser?.name || currentUser?.email || 'U').charAt(0)).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#191c1d] leading-none">
                    {currentUser?.name || currentUser?.email || 'Chủ Cửa Hàng'}
                  </div>
                  <div className="text-[10px] text-[#584045] leading-none mt-0.5 truncate max-w-[120px]">
                    {currentUser?.storeName || 'Cửa hàng của tôi'}
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#584045]">
                  expand_more
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-[#e1e3e4] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#f3f4f5]">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#191c1d] truncate">{currentUser.storeName}</div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {currentUser.role || 'OWNER'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#584045] truncate">{currentUser.email}</div>
                  </div>

                  {onOpenPortal && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenPortal();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-[#198754] hover:bg-emerald-50 rounded-xl flex items-center gap-2 mt-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {currentUser.role === 'ADMIN' ? 'admin_panel_settings' : 'account_balance_wallet'}
                      </span>
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
                    className="w-full px-3 py-2 text-left text-xs text-[#191c1d] hover:bg-[#f3f4f5] rounded-xl flex items-center gap-2 mt-1"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#198754]">
                      center_focus_strong
                    </span>
                    <span>Quét chứng từ 1-chạm</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenTelegram();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-[#191c1d] hover:bg-[#f3f4f5] rounded-xl flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#b31f56]">
                      send
                    </span>
                    <span>Báo cáo Telegram 22h00</span>
                  </button>
                  <div className="border-t border-[#f3f4f5] my-1" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
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
                className="inline-flex items-center px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-[#191c1d] hover:bg-white hover:text-[#198754] transition-all"
              >
                Đăng nhập
              </button>

              <Magnet padding={20} magnetStrength={0.25}>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#198754] text-xs font-bold text-white hover:bg-[#146c43] active:scale-95 transition-all shadow-md shadow-[#198754]/25 hover:shadow-lg hover:shadow-[#198754]/30"
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
            className="xl:hidden p-2 rounded-xl text-[#191c1d] hover:bg-[#e7e8e9] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#f8f9fa] border-b border-[#e1e3e4] px-6 py-4 space-y-2.5 shadow-lg">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveNav(item.id);
              }}
              className="block py-2 text-sm font-medium text-[#191c1d] hover:text-[#198754] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#e1e3e4] flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold"
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
                  className="w-full py-2.5 rounded-xl bg-white border border-[#e1e3e4] text-xs font-bold text-[#191c1d]"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#198754] text-xs font-bold text-white shadow-sm"
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
