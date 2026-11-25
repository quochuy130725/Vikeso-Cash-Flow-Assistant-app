import React from 'react';
import { PortalType } from '../types';
import {
  Menu,
  Store,
  ChevronDown,
  Bell,
  LogOut,
  Smartphone,
  Shield,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

interface HeaderProps {
  portal: PortalType;
  setPortal: (p: PortalType) => void;
  onOpenMobileAppModal: () => void;
  onOpenNotificationModal: () => void;
  userRole?: string;
  storeName?: string;
  userName?: string;
  userEmail?: string;
  subscriptionPlan?: string;
  onLogout?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const PortalHeader: React.FC<HeaderProps> = ({
  portal,
  setPortal,
  onOpenMobileAppModal,
  onOpenNotificationModal,
  userRole = 'ADMIN',
  storeName = 'Admin Quản Trị',
  userName = 'Admin',
  userEmail = 'test@example.com',
  subscriptionPlan,
  onLogout,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  return (
    <header
      className={`fixed top-0 right-0 left-0 h-16 bg-white/90 backdrop-blur-xl z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-b border-slate-200/80 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:left-20' : 'md:left-72'
      }`}
    >
      <div className="w-full h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Left header group */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Mobile menu drawer button */}
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              title="Mở menu điều hướng"
              className="md:hidden w-9 h-9 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              type="button"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Sidebar collapse/expand toggle button (Desktop) */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? 'Mở rộng menu bên' : 'Thu gọn menu bên'}
              className="hidden md:flex w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {portal === 'owner' ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              {/* Store / Branch Selector - sleek flat trigger */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors text-slate-800 text-xs font-semibold min-w-0">
                <Store className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="truncate max-w-[115px] sm:max-w-[240px]">{storeName}</span>
                {subscriptionPlan && userRole !== 'ADMIN' && (
                  <span className="text-[10px] sm:text-xs bg-[#d0f81b] text-slate-950 px-1.5 sm:px-2 py-0.5 rounded-md font-black uppercase border border-[#bde412] shrink-0">
                    {subscriptionPlan}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
              </div>

              {/* Realtime Bank Sync Badge - flat text and dot */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Đồng bộ tự động</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#b01755] font-bold min-w-0">
                <Shield className="w-4 h-4 text-[#ff4783] shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">{storeName || 'Admin Quản Trị'}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Đồng bộ thời gian thực</span>
              </div>
            </div>
          )}
        </div>

        {/* Right header group */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile App Link for Store Owner */}
          {portal === 'owner' && (
            <button
              onClick={onOpenMobileAppModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors border border-slate-200/70 text-xs font-medium cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-900" />
              <span>App Di Động</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotificationModal}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 relative transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white ${
              portal === 'owner' ? 'bg-[#d0f81b] border border-slate-900/40' : 'bg-[#ff4783]'
            }`}></span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {userName || (userRole === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}
              </span>
              <span className="text-xs font-medium truncate max-w-[150px] text-slate-600">
                {userRole === 'ADMIN' ? 'Quản Trị Viên (Admin)' : 'Chủ Hộ Kinh Doanh'}
              </span>
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
              portal === 'owner'
                ? 'bg-[#d0f81b] text-slate-950 border border-[#bde412]'
                : 'bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4]'
            }`}>
              {(userName || (userRole === 'ADMIN' ? 'A' : 'C')).charAt(0).toUpperCase()}
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
