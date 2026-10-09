import React from 'react';
import { PortalType, OwnerTab, AdminTab } from '../types';
import {
  TrendingUp,
  FileSpreadsheet,
  Send,
  Store,
  LayoutDashboard,
  CircleDollarSign,
  Bot,
  Settings2,
  Home,
  LogOut,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
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
                <div className="w-9 h-9 rounded-xl p-1 bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
                  <img src="/logo.png" alt="VikeSo Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-slate-900 leading-none tracking-tight truncate">
                    Vike<span className={portal === 'owner' ? 'text-slate-950 bg-[#d0f81b] px-1 py-0.5 rounded font-black' : 'text-indigo-600'}>So</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 truncate">
                    {portal === 'owner' ? 'Trợ lý dòng tiền' : 'FINITY System Cockpit'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Sidebar Collapse Toggle */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    title="Thu gọn thanh menu"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
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
        <div className={`pt-3 pb-2 transition-all ${isCollapsed ? 'px-2 flex justify-center' : 'px-4'}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    portal === 'owner' ? 'bg-[#d0f81b] border border-slate-900/20 animate-pulse' : 'bg-indigo-600'
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
                  portal === 'owner' ? 'bg-[#d0f81b] animate-pulse' : 'bg-indigo-600'
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
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">Sổ thu chi &amp; Dòng tiền</span>}

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
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 shrink-0" />
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
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Send className="w-5 h-5 shrink-0" />
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
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-sm border border-[#bde412]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Store className="w-5 h-5 shrink-0" />
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-900'
              }`}
            >
              <CircleDollarSign className="w-5 h-5 shrink-0" />
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-900'
              }`}
            >
              <Bot className="w-5 h-5 shrink-0" />
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-900'
              }`}
            >
              <Settings2 className="w-5 h-5 shrink-0" />
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
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{storeName}</span>
                    <span className="text-[10px] text-slate-500 truncate">{userEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-950 bg-[#d0f81b] px-2 py-0.5 rounded border border-[#bde412] uppercase">
                  {subscriptionPlan || 'FREE'}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{storeName || 'Admin Quản Trị'}</span>
                    <span className="text-[10px] text-slate-500 truncate">{userEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
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
                  <Home className="w-3.5 h-3.5" />
                  <span>Trang chủ</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
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
                title={`${storeName} • Gói ${subscriptionPlan || 'FREE'}`}
                className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center cursor-help"
              >
                <Store className="w-5 h-5" />
              </div>
            ) : (
              <div
                title="Hệ Thống FINITY • Cụm Máy Chủ Trực Tuyến 99.8%"
                className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center cursor-help"
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
                <LogOut className="w-4 h-4" />
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
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
