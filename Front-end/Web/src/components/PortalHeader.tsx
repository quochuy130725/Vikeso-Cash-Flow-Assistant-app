import React, { useState } from 'react';
import { PortalType } from '../types';

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
  subscriptionPlan = 'FREE',
  onLogout,
  sidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Tháng này (Tháng 5/2024)');

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md z-40 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-slate-200/80 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'left-20' : 'left-72'
      }`}
    >
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left header group */}
        <div className="flex items-center gap-3">
          {/* Sidebar collapse/expand toggle button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? 'Mở rộng thanh menu bên (Sidebar)' : 'Thu gọn thanh menu bên (Sidebar)'}
              className="w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-slate-200/80 shrink-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                {sidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>
          )}

          {portal === 'owner' ? (
            <div className="flex items-center gap-2.5">
            {/* Store / Branch Selector - Clean single-row pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 cursor-pointer transition-colors border border-slate-200/60 text-slate-800 text-xs font-semibold">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                storefront
              </span>
              <span>{storeName}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">
                {subscriptionPlan}
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[16px]">
                expand_more
              </span>
            </div>

            {/* Period Selector - Slim inline */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs text-slate-600">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">
                calendar_today
              </span>
              <span className="text-slate-500 font-medium">Kỳ:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Kỳ báo cáo"
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Hôm nay">Hôm nay</option>
                <option value="Tháng này (Tháng 5/2024)">Tháng 5/2024</option>
                <option value="Quý 2/2024">Quý 2/2024</option>
                <option value="Năm 2024">Năm 2024</option>
              </select>
            </div>

            {/* Realtime Bank Sync Badge - Elegant minimalist status */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Đồng bộ tự động</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">dns</span>
              <span className="text-slate-500">Cụm máy chủ:</span>
              <span className="font-bold text-slate-800">
                Hà Nội (VN-01)
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 font-semibold">
              <span className="material-symbols-outlined text-[15px]">shield_person</span>
              <span>{storeName || 'Admin Quản Trị'}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Máy chủ OCR: 99.8% Ổn định</span>
            </div>
          </div>
        )}
        </div>

        {/* Right header group */}
        <div className="flex items-center gap-3">
          {/* Quick Portal Switcher Button in Header - only for ADMIN */}
          {userRole === 'ADMIN' && (
            <button
              onClick={() => setPortal(portal === 'owner' ? 'admin' : 'owner')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                portal === 'owner'
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {portal === 'owner' ? 'admin_panel_settings' : 'storefront'}
              </span>
              <span>{portal === 'owner' ? 'Bảng Quản Trị' : 'Cổng Chủ Hộ'}</span>
            </button>
          )}

          {/* Mobile App Link for Store Owner */}
          {portal === 'owner' && (
            <button
              onClick={onOpenMobileAppModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors border border-slate-200/60 text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">smartphone</span>
              <span>App Di Động</span>
            </button>
          )}

          {/* System Log button for Admin */}
          {portal === 'admin' && (
            <button
              onClick={() => {
                alert('Đang tải System Log kiểm toán thời gian thực...');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors border border-slate-200/60 text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-slate-500 text-[16px]">download</span>
              <span>Xuất System Log</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotificationModal}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 relative transition-colors cursor-pointer flex items-center justify-center"
            title="Thông báo hệ thống"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* User Profile Card - Clean & accurate */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {userName || (userRole === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                {userEmail || (userRole === 'ADMIN' ? 'Quản Trị Viên (ADMIN)' : 'Chủ Hộ Kinh Doanh (OWNER)')}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {(userName || (userRole === 'ADMIN' ? 'A' : 'C')).charAt(0).toUpperCase()}
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
