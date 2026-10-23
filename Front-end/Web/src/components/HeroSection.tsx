import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Send,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Receipt,
  PieChart,
  CreditCard,
} from 'lucide-react';
import { ThreeHeroCanvas } from './ThreeHeroCanvas';
import { ThreeReceiptScanCanvas } from './ThreeReceiptScanCanvas';
import { ThreeCashflowCanvas } from './ThreeCashflowCanvas';

interface HeroSectionProps {
  onOpenScan: () => void;
  onOpenTelegram: () => void;
}

export type Hero3DMode = 'scanner' | 'cashflow' | 'card';

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenScan,
  onOpenTelegram,
}) => {
  const [active3D, setActive3D] = useState<Hero3DMode>('scanner');

  return (
    <section id="hero" className="relative w-full pt-4 pb-12 lg:pb-16 overflow-hidden">
      {/* Subtle ambient glow (kept light to preserve background clarity) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-[#d0f81b]/10 to-transparent blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Positioning & CTAs (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-full">
            {/* Value Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md mb-5 border border-white/90 shadow-xs max-w-full flex-wrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
              <span className="text-xs font-bold text-slate-950 tracking-tight">
                Dành riêng cho Chủ sạp, Cửa hàng &amp; Quán ăn Việt Nam
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-extrabold text-[#e11d48]">
                Dễ dùng như Zalo
              </span>
            </motion.div>

            {/* Main Headline - fixed overflow & transparent-friendly text */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[34px] xl:text-[38px] font-black tracking-tight leading-[1.25] text-slate-950 mb-4 max-w-full [text-shadow:_0_1px_8px_rgba(255,255,255,0.85)]"
            >
              Chụp Hóa Đơn Tự Vào Sổ Quỹ <br />
              <span className="text-[#e11d48] inline-block">
                Khỏi Lo Tính Nhầm, Thất Thoát
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm sm:text-base text-slate-950 max-w-xl mb-7 leading-relaxed font-bold [text-shadow:_0_1px_6px_rgba(255,255,255,0.85)]"
            >
              Chỉ cần 1 cú chụp ảnh: Chữ viết tay hay bill in mờ đều tự tính tiền. Tự trừ bill quẹt thẻ POS để không bị cộng trùng, tối 10 giờ tự báo lãi ròng về điện thoại.
            </motion.p>

            {/* Action Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-7"
            >
              {/* Primary CTA: Scan receipt demo */}
              <button
                onClick={onOpenScan}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm shadow-md hover:shadow-xl transition-all cursor-pointer group"
                type="button"
              >
                <Camera className="w-4 h-4 text-[#d0f81b] group-hover:scale-110 transition-transform" />
                <span>Chụp Thử Hóa Đơn Ngay</span>
              </button>

              {/* Bot Link shortcut */}
              <button
                onClick={onOpenTelegram}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/85 hover:bg-white text-sky-950 font-bold text-sm border border-sky-300/80 shadow-2xs transition-all cursor-pointer backdrop-blur-sm"
                type="button"
                title="Nhận báo cáo 22:00 qua Telegram"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>Báo Cáo 22h00 (Telegram)</span>
              </button>
            </motion.div>

            {/* Social Proof & Value Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs font-bold text-slate-950 pt-4 border-t border-slate-400/30 w-full"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/90 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Đọc rõ cả chữ viết ngoáy</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/90 shadow-2xs">
                <TrendingUp className="w-4 h-4 text-[#e11d48] shrink-0" />
                <span>Rảnh tay nghỉ sớm lúc 22:00</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/90 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Bảo mật dữ liệu tuyệt đối</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Three.js Interactive 3D Canvas Showcase (5 cols on lg) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* 3D Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs mb-3 z-20 max-w-full overflow-x-auto">
              <button
                onClick={() => setActive3D('scanner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  active3D === 'scanner'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
                type="button"
              >
                <Receipt className={`w-3.5 h-3.5 ${active3D === 'scanner' ? 'text-[#d0f81b]' : 'text-slate-500'}`} />
                <span>Đọc Hóa Đơn</span>
              </button>

              <button
                onClick={() => setActive3D('cashflow')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  active3D === 'cashflow'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
                type="button"
              >
                <PieChart className={`w-3.5 h-3.5 ${active3D === 'cashflow' ? 'text-[#d0f81b]' : 'text-slate-500'}`} />
                <span>Biểu Đồ Thu - Chi</span>
              </button>

              <button
                onClick={() => setActive3D('card')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  active3D === 'card'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
                type="button"
              >
                <CreditCard className={`w-3.5 h-3.5 ${active3D === 'card' ? 'text-[#ff4783]' : 'text-slate-500'}`} />
                <span>Thẻ Cửa Hàng</span>
              </button>
            </div>

            {/* Visual 3D Container - frameless, seamless with background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full rounded-3xl overflow-hidden min-h-[460px] flex items-center justify-center"
            >
              {/* Dynamic 3D Model Rendering */}
              {active3D === 'scanner' && <ThreeReceiptScanCanvas key="scanner" />}
              {active3D === 'cashflow' && <ThreeCashflowCanvas key="cashflow" />}
              {active3D === 'card' && <ThreeHeroCanvas key="card" />}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};


