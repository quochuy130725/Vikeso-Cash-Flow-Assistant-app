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
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [backdateModalOpen, setBackdateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vikeso_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

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
    showToast(
      mode === 'login'
        ? `Chào mừng trở lại, ${user.name}! Đã đăng nhập vào ${user.storeName}.`
        : `Đăng ký thành công! Chào mừng ${user.name} đến với VikeSo.`
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('vikeso_user');
      localStorage.removeItem('vikeso_token');
    } catch {
      // ignore
    }
    showToast('Đã đăng xuất tài khoản thành công.');
  };

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
