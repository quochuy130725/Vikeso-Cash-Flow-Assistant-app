import React, { useState } from 'react';
import { PortalType, OwnerTab, AdminTab } from '../types';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { MobileAppModal, NotificationModal } from './PortalModals';
import { UserAccount } from './AuthModal';

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
  const defaultPortal: PortalType = initialPortal || (userRole === 'ADMIN' ? 'admin' : 'owner');

  const [portal, setPortalInternal] = useState<PortalType>(defaultPortal);
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('so-thu-chi-dong-tien');
  const [adminTab, setAdminTab] = useState<AdminTab>('tong-quan-van-hanh');

  // Modals & Toast
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

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

  // Role Guard handler for switching portals
  const handleSetPortal = (target: PortalType) => {
    if (target === 'admin' && userRole !== 'ADMIN') {
      showToast('❌ 403 Forbidden: Bạn không có quyền truy cập không gian Quản trị viên (Admin).');
      return;
    }
    setPortalInternal(target);
  };

  const showToast = (message: string) => {
    setGlobalToast(message);
    setTimeout(() => {
      setGlobalToast(null);
    }, 3500);
  };

  const handleDownloadExcel = () => {
    showToast('Đang kết xuất bảng kê Excel (.xlsx) theo chuẩn tài chính...');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // 403 screen if an OWNER somehow loads portal === 'admin'
  if (portal === 'admin' && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl border border-rose-200 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">gpp_bad</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">403 - Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-sm text-gray-600">
            Tài khoản của bạn ({currentUser?.email}) mang quyền <strong>CHỦ CỬA HÀNG (OWNER)</strong>. Bạn không có quyền xem bảng quản trị FINITY System Cockpit.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={() => setPortalInternal('owner')}
              className="px-4 py-2 bg-[#198754] text-white text-sm font-semibold rounded-xl hover:bg-[#146c43] transition-colors"
            >
              Về Sổ Thu Chi Của Tôi
            </button>
            <button
              onClick={onBackToLanding}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Về Trang Chủ
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
    <div className="min-h-screen bg-background text-on-surface antialiased font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
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
        <main className="w-full pt-16 bg-background min-h-screen">
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
                  onExportPdf={() => showToast('Đang tải file PDF báo cáo tài chính...')}
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

      {/* Global Toast */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface shadow-2xl border border-surface-container animate-bounce">
          <span className="material-symbols-outlined text-primary text-[20px]">
            check_circle
          </span>
          <span className="font-semibold text-sm">{globalToast}</span>
        </div>
      )}
    </div>
  );
};
