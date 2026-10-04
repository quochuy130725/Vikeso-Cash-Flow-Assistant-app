import React, { useState } from 'react';
import { PortalType, OwnerTab, AdminTab } from '../types';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { MobileAppModal, NotificationModal } from './PortalModals';
import { UserAccount } from './AuthModal';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

// Views
import { OwnerCashflowLedger } from '../views/OwnerCashflowLedger';
import { OwnerReports } from '../views/OwnerReports';
import { OwnerTelegram } from '../views/OwnerTelegram';
import { OwnerSettings } from '../views/OwnerSettings';
import { AdminOverview } from '../views/AdminOverview';
import { AdminFinancial } from '../views/AdminFinancial';
import { AdminSettings } from '../views/AdminSettings';

interface PortalViewProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onBackToLanding: () => void;
  initialPortal?: PortalType;
}

export const PortalView: React.FC<PortalViewProps> = ({
  currentUser,
  onLogout,
  onBackToLanding,
  initialPortal,
}) => {
  const userRole = currentUser?.role || 'OWNER';
  // Strict Role Binding: ADMIN is strictly locked to 'admin', OWNER is strictly locked to 'owner'
  const portal: PortalType = userRole === 'ADMIN' ? 'admin' : 'owner';

  const [ownerTab, setOwnerTab] = useState<OwnerTab>('so-thu-chi-dong-tien');
  const [adminTab, setAdminTab] = useState<AdminTab>('tong-quan-van-hanh');

  // Modals & Toast
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  // Collapsible animated sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vikeso_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vikeso_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Strict Role Guard handler: No switching allowed
  const handleSetPortal = (target: PortalType) => {
    if (target !== portal) {
      if (userRole === 'ADMIN') {
        showToast('🔒 Chính sách Fiduciary: Admin không can thiệp sổ quỹ riêng tư của hộ kinh doanh.', 'error');
      } else {
        showToast('❌ 403 Forbidden: Bạn không có quyền truy cập không gian Quản trị viên (Admin).', 'error');
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setGlobalToast({ message, type });
    setTimeout(() => {
      setGlobalToast(null);
    }, 3500);
  };

  const handleDownloadExcel = () => {
    showToast('Đang kết xuất bảng kê Excel (.xlsx) theo chuẩn tài chính...', 'info');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Guard 1: 403 screen if an OWNER attempts to access admin
  if (initialPortal === 'admin' && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white rounded-3xl shadow-xl border border-rose-200 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[32px]">gpp_bad</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">403 - Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tài khoản của bạn ({currentUser?.email}) mang quyền <strong>CHỦ HỘ KINH DOANH (OWNER)</strong>. Bạn không có quyền truy cập trung tâm điều hành FINITY System Cockpit của Quản trị viên.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={onBackToLanding}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              Về Trang Chủ VikeSo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guard 2: 403 screen if an ADMIN attempts to access owner private ledger
  if (initialPortal === 'owner' && userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md p-8 bg-slate-800/90 rounded-3xl shadow-2xl border border-indigo-500/30 space-y-4 backdrop-blur-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[32px]">security</span>
          </div>
          <h2 className="text-xl font-bold text-white">403 - Giới Hạn Thẩm Quyền Quản Trị</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tài khoản <strong>ADMIN QUẢN TRỊ ({currentUser?.email})</strong> chỉ có thẩm quyền điều phối hạ tầng, thanh toán cước và theo dõi tổng tải. Nhằm tuân thủ chuẩn mực bảo mật Fiduciary, Admin không can thiệp trực tiếp vào sổ quỹ cá nhân của từng hộ kinh doanh.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={onBackToLanding}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
            >
              Về Trang Chủ VikeSo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRoleAdmin = userRole === 'ADMIN';

  const activeUser: UserAccount = currentUser || (isRoleAdmin ? {
    name: 'Admin',
    email: 'test@example.com',
    storeName: 'Admin Quản Trị',
    shopName: 'Admin Quản Trị',
    phone: '',
    role: 'ADMIN',
    subscriptionPlan: 'FREE',
  } : {
    name: 'Chủ Hộ Kinh Doanh',
    email: 'owner@example.com',
    storeName: 'Cửa Hàng Hộ Kinh Doanh',
    shopName: 'Cửa Hàng Hộ Kinh Doanh',
    phone: '',
    role: 'OWNER',
    subscriptionPlan: 'FREE',
  });

  const displayName = activeUser.name || (activeUser.email ? activeUser.email.split('@')[0] : (isRoleAdmin ? 'Admin' : 'Chủ Hộ'));
  const displayStoreName = activeUser.shopName || activeUser.storeName || (isRoleAdmin ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh');
  const displayEmail = activeUser.email || (isRoleAdmin ? 'test@example.com' : 'owner@example.com');
  const displayPlan = activeUser.subscriptionPlan || 'FREE';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 antialiased font-sans ${
      portal === 'owner' ? 'selection:bg-emerald-100 selection:text-emerald-800' : 'selection:bg-indigo-100 selection:text-indigo-800'
    }`}>
      {/* Animated Fixed Sidebar */}
      <PortalSidebar
        portal={portal}
        setPortal={handleSetPortal}
        ownerTab={ownerTab}
        setOwnerTab={setOwnerTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        userRole={userRole}
        storeName={displayStoreName}
        userEmail={displayEmail}
        subscriptionPlan={displayPlan}
        onLogout={onLogout}
        onBackToLanding={onBackToLanding}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area - Smooth Transition pl-72 <-> pl-20 */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'pl-20' : 'pl-72'}`}>
        {/* Animated Fixed Header */}
        <PortalHeader
          portal={portal}
          setPortal={handleSetPortal}
          onOpenMobileAppModal={() => setMobileModalOpen(true)}
          onOpenNotificationModal={() => setNotificationModalOpen(true)}
          userRole={userRole}
          storeName={displayStoreName}
          userName={displayName}
          userEmail={displayEmail}
          subscriptionPlan={displayPlan}
          onLogout={onLogout}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Dynamic Page Router */}
        <main className="w-full pt-16 bg-slate-50 min-h-screen pb-12">
          {portal === 'owner' ? (
            <>
              {/* Synchronized Cashflow & Full Ledger */}
              {ownerTab === 'so-thu-chi-dong-tien' && (
                <OwnerCashflowLedger
                  currentUser={activeUser}
                  onDownloadExcel={handleDownloadExcel}
                  onPrintReport={handlePrintReport}
                />
              )}

              {/* Financial & Tax Compliance Reporting */}
              {ownerTab === 'bao-cao-xuat-du-lieu' && (
                <OwnerReports
                  currentUser={activeUser}
                  onExportPdf={() => showToast('Đang tải file PDF báo cáo tài chính...', 'info')}
                  onExportExcel={handleDownloadExcel}
                />
              )}

              {/* Automated Telegram Bot Dispatch & Live Simulator */}
              {ownerTab === 'bao-cao-tu-dong-telegram' && <OwnerTelegram currentUser={activeUser} />}

              {/* Store & Hardware POS Settings */}
              {ownerTab === 'cai-dat-cua-hang' && <OwnerSettings currentUser={activeUser} onLogout={onLogout} />}
            </>
          ) : (
            <>
              {/* Synchronized Operations & Business Households */}
              {adminTab === 'tong-quan-van-hanh' && <AdminOverview currentUser={activeUser} />}

              {/* Financial & Subscription MRR Growth */}
              {adminTab === 'bao-cao-tai-chinh-doanh-thu' && <AdminFinancial currentUser={activeUser} />}

              {/* Telegram Engine & Channel Dispatch */}
              {adminTab === 'cau-hinh-telegram-bot' && <OwnerTelegram currentUser={activeUser} />}

              {/* System & AI Server Parameters */}
              {adminTab === 'cai-dat-he-thong' && <AdminSettings currentUser={activeUser} />}
            </>
          )}
        </main>
      </div>

      {/* Shared Modals */}
      <MobileAppModal
        isOpen={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
      />

      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        storeName={displayStoreName}
        subscriptionPlan={displayPlan}
      />

      {/* Modern High-End Floating Toast */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          {globalToast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold text-xs leading-snug">{globalToast.message}</span>
          <button
            onClick={() => setGlobalToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
