import React from 'react';
import { PortalType, OwnerTab, AdminTab } from '../types';
import {
  TrendingUp,
  FileSpreadsheet,
  Send,
  Store,
  LayoutDashboard,
  CircleDollarSign,
  Settings2,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Users,
  FolderTree,
  X,
} from 'lucide-react';

interface SidebarProps {
  portal: PortalType;
  setPortal: (p: PortalType) => void;
  ownerTab: OwnerTab;
  setOwnerTab: (t: OwnerTab) => void;
  adminTab: AdminTab;
  setAdminTab: (t: AdminTab) => void;
  userRole?: string;
  storeName?: string;
  userEmail?: string;
  subscriptionPlan?: string;
  onLogout?: () => void;
  onBackToLanding?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const PortalSidebar: React.FC<SidebarProps> = ({
  portal,
  setPortal,
  ownerTab,
  setOwnerTab,
  adminTab,
  setAdminTab,
  userRole = 'ADMIN',
  storeName = 'Admin Quản Trị',
  userEmail = 'test@example.com',
  subscriptionPlan,
  onLogout,
  onBackToLanding,
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  // Khi mở drawer trên điện thoại luôn hiển thị đầy đủ nhãn menu dù desktop đang thu gọn
  const compact = isCollapsed && !mobileOpen;

  const selectOwnerTab = (tab: OwnerTab) => {
    setOwnerTab(tab);
    onCloseMobile?.();
  };

  const selectAdminTab = (tab: AdminTab) => {
    setAdminTab(tab);
    onCloseMobile?.();
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 h-full bg-white z-50 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border-r border-slate-200/80 transition-all duration-300 ease-in-out w-72 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${compact ? 'md:w-20' : 'md:w-72'}`}
      >
      <div className="flex flex-col overflow-y-auto">
        {/* Unified Brand Header & Collapse Toggle */}
        <div
          className={`h-16 flex items-center border-b border-slate-100 transition-all duration-300 shrink-0 ${
            compact ? 'px-3 justify-center' : 'px-5 justify-between'
          }`}
        >
          {!compact ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl p-1 bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
                  <img src="/logo.png" alt="VikeSo Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-slate-900 leading-none tracking-tight truncate">
                    Vike<span className="text-slate-950 bg-[#d0f81b] px-1 py-0.5 rounded font-black border border-slate-900/15">So</span>
                  </span>
                  <span className="text-xs text-slate-600 font-bold tracking-wider uppercase mt-1 truncate">
                    {portal === 'owner' ? 'Trợ lý dòng tiền' : 'Quản trị hệ thống'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onCloseMobile && (
                  <button
                    onClick={onCloseMobile}
                    title="Đóng menu"
                    className="md:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Sidebar Collapse Toggle (Desktop) */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    title="Thu gọn thanh menu"
                    className="hidden md:flex w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onToggleCollapse}
                title="Mở rộng thanh menu bên"
                className="w-10 h-10 rounded-xl p-1 bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer border border-slate-200/80"
                type="button"
              >
                <img src="/logo.png" alt="VikeSo Logo" className="w-full h-full object-contain" />
              </button>
            </div>
          )}
        </div>

        {/* Space indicator / Current Workspace Label */}
        <div className={`pt-3 pb-2 transition-all ${compact ? 'px-2 flex justify-center' : 'px-4'}`}>
          {!compact ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    portal === 'owner'
                      ? 'bg-emerald-600 border border-emerald-700/30'
                      : 'bg-[#ff4783]'
                  }`}
                ></span>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {portal === 'owner' ? 'Không gian Chủ Hộ' : 'Không gian Quản Trị'}
                </span>
              </div>
            </div>
          ) : (
            <div
              title={portal === 'owner' ? 'Không gian Chủ Hộ' : 'Không gian Quản Trị'}
              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center cursor-help"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  portal === 'owner' ? 'bg-emerald-600' : 'bg-[#ff4783]'
                }`}
              ></span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        {portal === 'owner' || portal === 'staff' ? (
          <nav className={`flex-1 py-2 space-y-1.5 transition-all ${compact ? 'px-2' : 'px-4'}`}>
            {/* Tab 1: Sổ thu chi & Dòng tiền (Available for both OWNER & STAFF) */}
            <button
              onClick={() => selectOwnerTab('so-thu-chi-dong-tien')}
              title={compact ? 'Sổ thu chi & Dòng tiền' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                compact
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                ownerTab === 'so-thu-chi-dong-tien'
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              {!compact && (
                <span className="truncate">
                  {userRole === 'STAFF' ? 'Sổ thu chi ca làm việc' : 'Sổ thu chi & Dòng tiền'}
                </span>
              )}

              {compact && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Sổ thu chi &amp; Dòng tiền
                </span>
              )}
            </button>

            {userRole !== 'STAFF' && (
              <>
                {/* Tab 2: Báo cáo & Xuất dữ liệu */}
                <button
                  onClick={() => selectOwnerTab('bao-cao-xuat-du-lieu')}
                  title={compact ? 'Báo cáo & Xuất dữ liệu' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                    compact
                      ? 'justify-center p-3'
                      : 'gap-3 px-3.5 py-2.5 text-left'
                  } ${
                    ownerTab === 'bao-cao-xuat-du-lieu'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 shrink-0" />
                  {!compact && <span className="truncate">Báo cáo &amp; Xuất dữ liệu</span>}

                  {compact && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Báo cáo &amp; Xuất dữ liệu
                    </span>
                  )}
                </button>

                {/* Tab 3: Danh mục Thu - Chi (Cha - Con) */}
                <button
                  onClick={() => selectOwnerTab('quan-ly-danh-muc')}
                  title={compact ? 'Danh mục Thu - Chi (Cha - Con)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                    compact
                      ? 'justify-center p-3'
                      : 'gap-3 px-3.5 py-2.5 text-left'
                  } ${
                    ownerTab === 'quan-ly-danh-muc'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FolderTree className="w-5 h-5 shrink-0" />
                  {!compact && <span className="truncate">Danh mục Thu - Chi</span>}

                  {compact && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Danh mục Thu - Chi
                    </span>
                  )}
                </button>

                {/* Tab 4: Quản lý nhân viên (STAFF) */}
                <button
                  onClick={() => selectOwnerTab('quan-ly-nhan-vien')}
                  title={compact ? 'Quản lý nhân viên (STAFF)' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                    compact
                      ? 'justify-center p-3'
                      : 'gap-3 px-3.5 py-2.5 text-left'
                  } ${
                    ownerTab === 'quan-ly-nhan-vien'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-5 h-5 shrink-0" />
                  {!compact && <span className="truncate">Quản lý nhân viên</span>}

                  {compact && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Quản lý nhân viên
                    </span>
                  )}
                </button>

                {/* Tab 5: Báo cáo tự động Telegram */}
                <button
                  onClick={() => selectOwnerTab('bao-cao-tu-dong-telegram')}
                  title={compact ? 'Báo cáo tự động Telegram' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                    compact
                      ? 'justify-center p-3'
                      : 'gap-3 px-3.5 py-2.5 text-left'
                  } ${
                    ownerTab === 'bao-cao-tu-dong-telegram'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-5 h-5 shrink-0" />
                  {!compact && <span className="truncate">Báo cáo tự động Telegram</span>}

                  {compact && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Báo cáo tự động Telegram
                    </span>
                  )}
                </button>

                {/* Tab 6: Cài đặt cửa hàng & Tài khoản */}
                <button
                  onClick={() => selectOwnerTab('cai-dat-cua-hang')}
                  title={compact ? 'Cài đặt cửa hàng & Tài khoản' : undefined}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                    compact
                      ? 'justify-center p-3'
                      : 'gap-3 px-3.5 py-2.5 text-left'
                  } ${
                    ownerTab === 'cai-dat-cua-hang'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Store className="w-5 h-5 shrink-0" />
                  {!compact && <span className="truncate">Cài đặt cửa hàng &amp; Tài khoản</span>}

                  {compact && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Cài đặt cửa hàng &amp; Tài khoản
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>
        ) : (
          <nav className={`flex-1 py-2 space-y-1.5 transition-all ${compact ? 'px-2' : 'px-4'}`}>
            {/* Admin Tab 1 */}
            <button
              onClick={() => selectAdminTab('tong-quan-van-hanh')}
              title={compact ? 'Tổng quan người dùng & Vận hành' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                compact
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'tong-quan-van-hanh'
                  ? 'bg-[#fff0f5] text-[#ff4783] font-extrabold shadow-xs border border-[#ffd6e4]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0 ${adminTab === 'tong-quan-van-hanh' ? 'text-[#ff4783]' : ''}`} />
              {!compact && <span className="truncate">Người dùng &amp; Duyệt cửa hàng</span>}

              {compact && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Người dùng &amp; Duyệt cửa hàng
                </span>
              )}
            </button>

            {/* Admin Tab 2 */}
            <button
              onClick={() => selectAdminTab('bao-cao-tai-chinh-doanh-thu')}
              title={compact ? 'Quản lý thanh toán & Doanh thu' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                compact
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'bao-cao-tai-chinh-doanh-thu'
                  ? 'bg-[#fff0f5] text-[#ff4783] font-extrabold shadow-xs border border-[#ffd6e4]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CircleDollarSign className={`w-5 h-5 shrink-0 ${adminTab === 'bao-cao-tai-chinh-doanh-thu' ? 'text-[#ff4783]' : ''}`} />
              {!compact && <span className="truncate">Thanh toán &amp; Doanh thu</span>}

              {compact && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Thanh toán &amp; Doanh thu
                </span>
              )}
            </button>

            {/* Admin Tab 3 (Telegram tab removed per FE-WEB-04 as Admin does not own a shop) */}
            <button
              onClick={() => selectAdminTab('cai-dat-he-thong')}
              title={compact ? 'Hạ tầng máy chủ & Cài đặt' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                compact
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'cai-dat-he-thong'
                  ? 'bg-[#fff0f5] text-[#ff4783] font-extrabold shadow-xs border border-[#ffd6e4]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings2 className={`w-5 h-5 shrink-0 ${adminTab === 'cai-dat-he-thong' ? 'text-[#ff4783]' : ''}`} />
              {!compact && <span className="truncate">Hạ tầng &amp; Cài đặt hệ thống</span>}

              {compact && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Hạ tầng &amp; Cài đặt hệ thống
                </span>
              )}
            </button>
          </nav>
        )}
      </div>

      {/* Bottom sidebar info & Actions */}
      <div className={`border-t border-slate-100 transition-all shrink-0 ${compact ? 'p-2 space-y-2' : 'p-4 space-y-3'}`}>
        {!compact ? (
          <>
            {portal === 'owner' ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#ff4783]/15 text-[#ff4783] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{storeName}</span>
                    <span className="text-xs text-slate-600 truncate">{userEmail}</span>
                  </div>
                </div>
                {userRole !== 'ADMIN' && subscriptionPlan && (
                  <span className="text-xs font-black text-slate-950 bg-[#d0f81b] px-2 py-0.5 rounded border border-[#bde412] uppercase">
                    {subscriptionPlan}
                  </span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#fff0f5] text-[#ff4783] border border-[#ffd6e4] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{storeName || 'Admin Quản Trị'}</span>
                    <span className="text-xs text-slate-600 truncate">{userEmail}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-950 bg-[#d0f81b] px-1.5 py-0.5 rounded border border-slate-900/20">
                  ADMIN
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {onBackToLanding && (
                <button
                  onClick={() => {
                    onCloseMobile?.();
                    onBackToLanding();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
                  title="Về Trang Chủ Giới Thiệu"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Trang chủ</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={() => {
                    onCloseMobile?.();
                    onLogout();
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-100"
                  title="Đăng xuất khỏi phiên làm việc"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Thoát</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Collapsed Store / Admin Indicator */}
            {portal === 'owner' ? (
              <div
                title={userRole === 'ADMIN' ? storeName : `${storeName} • Gói ${subscriptionPlan || 'FREE'}`}
                className="w-10 h-10 rounded-xl bg-[#ff4783]/10 text-[#ff4783] border border-[#ff4783]/20 flex items-center justify-center cursor-help"
              >
                <Store className="w-5 h-5" />
              </div>
            ) : (
              <div
                title="Quản Trị Viên Hệ Thống • VikeSo Admin"
                className="w-10 h-10 rounded-xl bg-[#fff0f5] text-[#ff4783] border border-[#ffd6e4] flex items-center justify-center cursor-help"
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}

            {/* Back to landing */}
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer relative group"
                title="Về Trang Chủ"
              >
                <Home className="w-4 h-4" />
                <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Trang chủ
                </span>
              </button>
            )}

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer relative group"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
                <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-white text-slate-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Đăng xuất
                </span>
              </button>
            )}

            {/* Expand sidebar button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Mở rộng menu bên"
                className="w-10 h-10 mt-1 rounded-xl bg-slate-50 hover:bg-slate-200/70 border border-slate-200/80 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                type="button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      </aside>
    </>
  );
};
