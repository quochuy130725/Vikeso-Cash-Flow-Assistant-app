import React from 'react';
import { PortalType, OwnerTab, AdminTab } from '../types';

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
  subscriptionPlan = 'FREE',
  onLogout,
  onBackToLanding,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white z-50 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border-r border-slate-200/80 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col">
        {/* Unified Brand Header & Collapse Toggle */}
        <div
          className={`h-16 flex items-center border-b border-slate-100 transition-all duration-300 ${
            isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                    portal === 'owner' ? 'bg-[#198754] text-white' : 'bg-slate-900 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {portal === 'owner' ? 'account_balance_wallet' : 'admin_panel_settings'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-slate-900 leading-none tracking-tight truncate">
                    VikeSo
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 truncate">
                    {portal === 'owner' ? 'Trợ lý dòng tiền' : 'Hệ thống quản trị'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Switch button for admins */}
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => setPortal(portal === 'owner' ? 'admin' : 'owner')}
                    title="Chuyển đổi giao diện Chủ hộ / Admin"
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>{portal === 'owner' ? 'Admin' : 'Chủ Hộ'}</span>
                    <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                  </button>
                )}

                {/* Sidebar Collapse Toggle */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    title="Thu gọn thanh menu"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onToggleCollapse}
                title="Mở rộng thanh menu bên"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                  portal === 'owner'
                    ? 'bg-[#198754] hover:bg-[#146c43] text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {portal === 'owner' ? 'account_balance_wallet' : 'admin_panel_settings'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Space indicator / Current Workspace Label */}
        <div className={`pt-3 pb-2 transition-all ${isCollapsed ? 'px-2 flex justify-center' : 'px-4'}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    portal === 'owner' ? 'bg-[#198754] animate-pulse' : 'bg-purple-600'
                  }`}
                ></span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {portal === 'owner' ? 'Không gian Chủ Hộ' : 'Không gian Quản Trị'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">v4.2</span>
            </div>
          ) : (
            <div
              title={portal === 'owner' ? 'Không gian Chủ Hộ (v4.2)' : 'Không gian Quản Trị (v4.2)'}
              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center cursor-help"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  portal === 'owner' ? 'bg-[#198754] animate-pulse' : 'bg-purple-600'
                }`}
              ></span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        {portal === 'owner' ? (
          <nav className={`flex-1 py-2 space-y-1.5 transition-all ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {/* Tab 1 */}
            <button
              onClick={() => setOwnerTab('so-thu-chi-dong-tien')}
              title={isCollapsed ? 'Sổ thu chi & Dòng tiền' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                ownerTab === 'so-thu-chi-dong-tien'
                  ? 'bg-[#198754] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">monitoring</span>
              {!isCollapsed && <span className="truncate">Sổ thu chi &amp; Dòng tiền</span>}

              {/* Hover Tooltip when collapsed */}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Sổ thu chi &amp; Dòng tiền
                </span>
              )}
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => setOwnerTab('bao-cao-xuat-du-lieu')}
              title={isCollapsed ? 'Báo cáo & Xuất dữ liệu' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                ownerTab === 'bao-cao-xuat-du-lieu'
                  ? 'bg-[#198754] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">analytics</span>
              {!isCollapsed && <span className="truncate">Báo cáo &amp; Xuất dữ liệu</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Báo cáo &amp; Xuất dữ liệu
                </span>
              )}
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => setOwnerTab('bao-cao-tu-dong-telegram')}
              title={isCollapsed ? 'Báo cáo tự động Telegram' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                ownerTab === 'bao-cao-tu-dong-telegram'
                  ? 'bg-[#198754] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">send</span>
              {!isCollapsed && <span className="truncate">Báo cáo tự động Telegram</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Báo cáo tự động Telegram
                </span>
              )}
            </button>

            {/* Tab 4 */}
            <button
              onClick={() => setOwnerTab('cai-dat-cua-hang')}
              title={isCollapsed ? 'Cài đặt cửa hàng & POS' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                ownerTab === 'cai-dat-cua-hang'
                  ? 'bg-[#198754] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">store</span>
              {!isCollapsed && <span className="truncate">Cài đặt cửa hàng &amp; POS</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Cài đặt cửa hàng &amp; POS
                </span>
              )}
            </button>
          </nav>
        ) : (
          <nav className={`flex-1 py-2 space-y-1.5 transition-all ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {/* Admin Tab 1 */}
            <button
              onClick={() => setAdminTab('tong-quan-van-hanh')}
              title={isCollapsed ? 'Tổng quan vận hành' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'tong-quan-van-hanh'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">hub</span>
              {!isCollapsed && <span className="truncate">Tổng quan vận hành</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Tổng quan vận hành
                </span>
              )}
            </button>

            {/* Admin Tab 2 */}
            <button
              onClick={() => setAdminTab('bao-cao-tai-chinh-doanh-thu')}
              title={isCollapsed ? 'Báo cáo tài chính & MRR' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'bao-cao-tai-chinh-doanh-thu'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">payments</span>
              {!isCollapsed && <span className="truncate">Báo cáo tài chính &amp; MRR</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Báo cáo tài chính &amp; MRR
                </span>
              )}
            </button>

            {/* Admin Tab 3 */}
            <button
              onClick={() => setAdminTab('cau-hinh-telegram-bot')}
              title={isCollapsed ? 'Cấu hình Telegram Bot' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'cau-hinh-telegram-bot'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">smart_toy</span>
              {!isCollapsed && <span className="truncate">Cấu hình Telegram Bot</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Cấu hình Telegram Bot
                </span>
              )}
            </button>

            {/* Admin Tab 4 */}
            <button
              onClick={() => setAdminTab('cai-dat-he-thong')}
              title={isCollapsed ? 'Cài đặt hệ thống & Máy chủ AI' : undefined}
              className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative group ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5 text-left'
              } ${
                adminTab === 'cai-dat-he-thong'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">tune</span>
              {!isCollapsed && <span className="truncate">Cài đặt hệ thống &amp; Máy chủ AI</span>}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Cài đặt hệ thống &amp; Máy chủ AI
                </span>
              )}
            </button>
          </nav>
        )}
      </div>

      {/* Bottom sidebar info & Actions */}
      <div className={`border-t border-slate-100 transition-all ${isCollapsed ? 'p-2 space-y-2' : 'p-4 space-y-3'}`}>
        {!isCollapsed ? (
          <>
            {portal === 'owner' ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#198754] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{storeName}</span>
                    <span className="text-[10px] text-slate-400 truncate">{userEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                  {subscriptionPlan || 'FREE'}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{storeName || 'Admin Quản Trị'}</span>
                    <span className="text-[10px] text-slate-400 truncate">{userEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  ADMIN
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
                  title="Về Trang Chủ Giới Thiệu"
                >
                  <span className="material-symbols-outlined text-[16px]">home</span>
                  <span>Trang chủ</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-100"
                  title="Đăng xuất khỏi phiên làm việc"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
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
                title={`${storeName} • Gói ${subscriptionPlan || 'FREE'}`}
                className="w-10 h-10 rounded-xl bg-emerald-50 text-[#198754] border border-emerald-200 flex items-center justify-center cursor-help"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
              </div>
            ) : (
              <div
                title="Hệ Thống FINITY • Cụm Máy Chủ Trực Tuyến 99.8%"
                className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center cursor-help"
              >
                <span className="material-symbols-outlined text-[18px]">security</span>
              </div>
            )}

            {/* Quick Portal Switcher for Admin when collapsed */}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => setPortal(portal === 'owner' ? 'admin' : 'owner')}
                title={portal === 'owner' ? 'Chuyển sang Bảng Quản Trị (Admin)' : 'Chuyển sang Sổ Thu Chi (Chủ Hộ)'}
                className="w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 flex items-center justify-center transition-colors cursor-pointer relative group border border-purple-200"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {portal === 'owner' ? 'Vào Bảng Admin' : 'Vào Sổ Chủ Hộ'}
                </span>
              </button>
            )}

            {/* Back to landing */}
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer relative group"
                title="Về Trang Chủ"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
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
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
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
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
