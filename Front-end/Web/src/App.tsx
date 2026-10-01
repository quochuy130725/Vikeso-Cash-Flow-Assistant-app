/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { CoreFeaturesSection } from './components/CoreFeaturesSection';
import { WorkflowSection } from './components/WorkflowSection';
import { SpotlightSection } from './components/SpotlightSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

import { ScanModal } from './components/ScanModal';
import { VideoModal } from './components/VideoModal';
import { TelegramModal } from './components/TelegramModal';
import { PlanModal } from './components/PlanModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { BackdateModal } from './components/BackdateModal';
import { PortalView } from './components/PortalView';
import { PortalType } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [backdateModalOpen, setBackdateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Portal View states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  // Read saved session immediately on component initialization
  const getSavedUser = (): UserAccount | null => {
    try {
      const saved = localStorage.getItem('vikeso_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u) {
          if (u.shopName && !u.storeName) u.storeName = u.shopName;
          if (u.storeName && !u.shopName) u.shopName = u.storeName;
          if (u.role === 'ADMIN' && (u.email === 'test@example.com' || (u.name && u.name.toLowerCase() === 'admin'))) {
            u.name = u.name || 'Admin';
            u.shopName = u.shopName || 'Admin Quản Trị';
            u.storeName = u.storeName || 'Admin Quản Trị';
            u.role = 'ADMIN';
            u.subscriptionPlan = u.subscriptionPlan || 'FREE';
          }
          return u;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  const initialUser = getSavedUser();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(initialUser);
  const [portalType, setPortalType] = useState<PortalType>(() => {
    return initialUser?.role === 'ADMIN' ? 'admin' : 'owner';
  });
  const [viewMode, setViewMode] = useState<'landing' | 'portal'>(() => {
    // If user is already logged in, enter directly into Owner or Admin portal unless explicitly requested #landing
    if (initialUser && window.location.hash !== '#landing') {
      return 'portal';
    }
    return 'landing';
  });

  // Check saved session on mount & hash routing
  useEffect(() => {
    const checkHashRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const saved = localStorage.getItem('vikeso_user');
      const user: UserAccount | null = saved ? JSON.parse(saved) : currentUser;

      // If user explicitly chose to view the landing page from inside the portal
      if (hash === '#landing') {
        setViewMode('landing');
        return;
      }

      if (user) {
        // Determine if user is ADMIN strictly based on user.role
        const isUserAdmin = user.role === 'ADMIN';

        if (hash === '#admin-dashboard' || path === '/admin-dashboard') {
          if (isUserAdmin) {
            setPortalType('admin');
            setViewMode('portal');
          } else {
            setPortalType('owner');
            setViewMode('portal');
            showToast('❌ 403 Forbidden: Tài khoản Chủ shop không có quyền vào Bảng Quản Trị.');
          }
        } else if (hash === '#owner-dashboard' || path === '/owner-dashboard') {
          setPortalType('owner');
          setViewMode('portal');
        } else if (!hash || hash === '#') {
          // If logged in and at root or no hash, go directly into appropriate portal
          const target: PortalType = isUserAdmin ? 'admin' : 'owner';
          setPortalType(target);
          setViewMode('portal');
          window.history.replaceState(null, '', target === 'admin' ? '#admin-dashboard' : '#owner-dashboard');
        }
      } else {
        if (hash === '#admin-dashboard' || path === '/admin-dashboard' || hash === '#owner-dashboard' || path === '/owner-dashboard') {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount, mode: 'login' | 'register') => {
    setCurrentUser(user);
    try {
      localStorage.setItem('vikeso_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    const targetPortal: PortalType = user.role === 'ADMIN' ? 'admin' : 'owner';
    setPortalType(targetPortal);
    setViewMode('portal');
    window.location.hash = targetPortal === 'admin' ? '#admin-dashboard' : '#owner-dashboard';
    showToast(
      mode === 'login'
        ? `Chào mừng trở lại, ${user.name}! Đang mở ${user.role === 'ADMIN' ? 'Bảng Quản Trị Hệ Thống' : 'Sổ Thu Chi'}.`
        : `Đăng ký thành công! Chào mừng ${user.name} đến với VikeSo.`
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('landing');
    try {
      localStorage.removeItem('vikeso_user');
      localStorage.removeItem('vikeso_token');
    } catch {
      // ignore
    }
    window.location.hash = '';
    showToast('Đã đăng xuất tài khoản thành công.');
  };

  if (viewMode === 'portal') {
    return (
      <PortalView
        currentUser={currentUser}
        initialPortal={portalType}
        onLogout={handleLogout}
        onBackToLanding={() => {
          setViewMode('landing');
          window.location.hash = '#landing';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col font-sans selection:bg-[#198754]/20 selection:text-[#198754]">
      {/* Sticky Header with Glassmorphism */}
      <Header
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenScan={() => setScanModalOpen(true)}
        onOpenTelegram={() => setTelegramModalOpen(true)}
        onOpenVideo={() => setVideoModalOpen(true)}
        onOpenPortal={() => {
          setPortalType(currentUser?.role === 'ADMIN' ? 'admin' : 'owner');
          setViewMode('portal');
        }}
      />

      {/* Main Content Sections: Exact 10 Sections from Specification */}
      <main className="flex-1 w-full pt-20">
        {/* Section 1: Hero Section */}
        <HeroSection
          onOpenScan={() => setScanModalOpen(true)}
          onOpenVideo={() => setVideoModalOpen(true)}
          onOpenTelegram={() => setTelegramModalOpen(true)}
        />

        {/* Section 2: Problem & Agitation */}
        <ProblemSection
          onOpenScan={() => setScanModalOpen(true)}
        />

        {/* Section 3: Core Features Showcase */}
        <CoreFeaturesSection
          onOpenScan={() => setScanModalOpen(true)}
          onOpenTelegram={() => setTelegramModalOpen(true)}
          onOpenBackdate={() => setBackdateModalOpen(true)}
        />

        {/* Section 4: How It Works & Value Comparison Table */}
        <WorkflowSection
          onOpenScan={() => setScanModalOpen(true)}
        />

        {/* Section 5: Interactive Feature Spotlight (Split-Screen & 2-Way Deduplication) */}
        <SpotlightSection
          onOpenScan={() => setScanModalOpen(true)}
        />

        {/* Section 6: Pricing Plans */}
        <PricingSection
          onSelectStarter={() => {
            if (!currentUser) {
              handleOpenAuth('register');
            } else {
              setSelectedPlan('starter');
            }
          }}
          onSelectPro={() => {
            if (!currentUser) {
              handleOpenAuth('register');
            } else {
              setSelectedPlan('pro');
            }
          }}
        />

        {/* Section 7: FAQ */}
        <FaqSection />

        {/* Section 9: Final Call to Action */}
        <CtaSection
          onOpenScan={() => {
            if (!currentUser) {
              handleOpenAuth('register');
            } else {
              setScanModalOpen(true);
            }
          }}
          onOpenTelegram={() => setTelegramModalOpen(true)}
          onOpenAuth={handleOpenAuth}
        />
      </main>

      {/* Section 10: Footer */}
      <Footer
        onOpenTelegram={() => setTelegramModalOpen(true)}
        onOpenScan={() => setScanModalOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onSuccessResult={(data) => {
          showToast(`Đã đồng bộ hóa đơn "${data.title}" vào sổ quỹ thành công!`);
        }}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <TelegramModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
      />

      <BackdateModal
        isOpen={backdateModalOpen}
        onClose={() => setBackdateModalOpen(false)}
        onSuccess={(data) => {
          showToast(`Đã lưu giao dịch ${data.type === 'thu' ? 'thu' : 'chi'} ${data.amount.toLocaleString('vi-VN')}đ vào ngày ${data.date}.`);
        }}
      />

      <PlanModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => {
          showToast(`Chúc mừng bạn đã kích hoạt thành công Gói ${selectedPlan?.toUpperCase()}!`);
        }}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#191c1d] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
