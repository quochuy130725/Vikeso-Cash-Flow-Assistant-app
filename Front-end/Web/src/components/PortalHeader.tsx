import React, { useState } from 'react';
import { PortalType } from '../types';
import {
  Menu,
  Store,
  Calendar,
  ChevronDown,
  Bell,
  LogOut,
  Smartphone,
  Shield,
  Layers,
  ArrowRightLeft,
  Server,
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
      className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-xl z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-b border-slate-200/80 transition-all duration-300 ease-in-out ${
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
              title={sidebarCollapsed ? 'Mở rộng menu bên' : 'Thu gọn menu bên'}
              className="w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {portal === 'owner' ? (
            <div className="flex items-center gap-2.5">
              {/* Store / Branch Selector */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 cursor-pointer transition-colors border border-slate-200/70 text-slate-800 text-xs font-semibold">
                <Store className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[150px] sm:max-w-none">{storeName}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold uppercase">
                  {subscriptionPlan}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Period Selector */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/70 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
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

              {/* Realtime Bank Sync Badge */}
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Đồng bộ tự động</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/70 text-xs">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Cụm máy chủ:</span>
                <span className="font-bold text-slate-800">
                  Hà Nội (VN-01)
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>{storeName || 'Admin Quản Trị'}</span>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>OCR Engine: 99.8% Ổn định</span>
              </div>
            </div>
          )}
        </div>

        {/* Right header group */}
        <div className="flex items-center gap-3">
          {/* Mobile App Link for Store Owner */}
          {portal === 'owner' && (
            <button
              onClick={onOpenMobileAppModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors border border-slate-200/70 text-xs font-medium cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
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
              portal === 'owner' ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}></span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {userName || (userRole === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}
              </span>
              <span className={`text-[10px] font-semibold truncate max-w-[150px] ${
                portal === 'owner' ? 'text-emerald-700' : 'text-indigo-700'
              }`}>
                {userRole === 'ADMIN' ? 'Quản Trị Viên (Admin)' : 'Chủ Hộ Kinh Doanh'}
              </span>
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
              portal === 'owner'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20'
                : 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-600/20'
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
