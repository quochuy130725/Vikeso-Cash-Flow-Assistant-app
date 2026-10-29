/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BentoFeaturesSection } from './components/BentoFeaturesSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

import { ScanModal } from './components/ScanModal';
import { TelegramModal } from './components/TelegramModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { PortalView } from './components/PortalView';
import { prewarmServer } from './services/authApi';
import { PortalType } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
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
          if (u.role === 'ADMIN') {
            if (u.email === 'test@example.com' || (u.name && u.name.toLowerCase() === 'admin')) {
              u.name = u.name || 'Admin';
              u.shopName = u.shopName || 'Admin Quản Trị';
              u.storeName = u.storeName || 'Admin Quản Trị';
            }
            u.subscriptionPlan = undefined;
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
  const isLandingHash = (h: string) => {
    return (
      h === '#landing' ||
      h === '#noi-dau' ||
      h === '#tinh-nang' ||
      h === '#features' ||
      h === '#cach-hoat-dong' ||
      h === '#boc-tach-ai' ||
      h === '#vu-khi-bi-mat' ||
      h === '#bang-gia' ||
      h === '#faq' ||
      h === '#hero'
    );
  };

  const [viewMode, setViewMode] = useState<'landing' | 'portal'>(() => {
    // If user is already logged in, enter directly into Owner or Admin portal unless explicitly requested landing page or landing section
    if (initialUser && !isLandingHash(window.location.hash)) {
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

      // If viewing landing page or any landing section anchor
      if (isLandingHash(hash)) {
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
    <div className="min-h-screen text-[#191c1d] flex flex-col font-sans selection:bg-[#ff4783]/20 selection:text-[#ff4783] relative overflow-x-hidden">
      {/* Visual Retail Store Background (Option 2) */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/retail_store_bg.jpg')` }}
      />
      {/* Light Clean Scrim Overlay (0 blur) to keep the store crisp & vivid */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-white/60 via-white/40 to-white/65" />

      {/* Sticky Header with Glassmorphism */}
      <Header
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenScan={() => setScanModalOpen(true)}
        onOpenTelegram={() => setTelegramModalOpen(true)}
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
          onOpenTelegram={() => setTelegramModalOpen(true)}
        />

        {/* Section 2: Streamlined Bento Grid Core Features */}
        <BentoFeaturesSection
          onOpenScan={() => setScanModalOpen(true)}
          onOpenTelegram={() => setTelegramModalOpen(true)}
        />

        {/* Section 6: Pricing Plans */}
        <PricingSection
          onSelectStarter={() => {
            if (!currentUser) {
              handleOpenAuth('register');
            } else {
              setPortalType(currentUser.role === 'ADMIN' ? 'admin' : 'owner');
              setViewMode('portal');
              window.location.hash = '#so-quy';
            }
          }}
          onSelectPro={() => {
            if (!currentUser) {
              handleOpenAuth('register');
            } else {
              setPortalType('owner');
              setViewMode('portal');
              window.location.hash = '#cai-dat-cua-hang';
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

      <TelegramModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-[#ff4783]/30 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#ff4783] shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
