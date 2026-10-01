import React from 'react';
import { motion } from 'motion/react';
import {
  PlayCircle,
  Camera,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Receipt,
  BellRing,
} from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';
import { Magnet } from './reactbits/Magnet';
import { CountUp } from './reactbits/CountUp';
import { AuroraBackground } from './reactbits/AuroraBackground';

interface HeroSectionProps {
  onOpenScan: () => void;
  onOpenVideo: () => void;
  onOpenTelegram: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenScan,
  onOpenVideo,
  onOpenTelegram,
}) => {
  return (
    <section id="hero" className="relative w-full pt-6 pb-16 md:pb-24 overflow-hidden">
      {/* Dynamic background aurora glows with Emerald Green (#198754) & VikeSo Pink (#B31F56) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] bg-gradient-to-b from-[#198754]/18 via-[#b31f56]/12 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-36 -left-36 w-96 h-96 bg-[#198754]/12 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-24 -right-36 w-96 h-96 bg-[#b31f56]/12 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Hero Top Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Emotional Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card shadow-sm mb-6 border border-[#e1e3e4] group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#198754] animate-ping" />
            <span className="text-xs font-bold text-[#191c1d] tracking-wide flex items-center gap-1.5 uppercase">
              <span className="material-symbols-outlined text-[17px] text-[#b31f56]">bolt</span>
              <span>Slogan:</span>
              <span className="text-[#198754] font-extrabold normal-case tracking-normal text-xs sm:text-sm">
                “Chụp 1 giây – Đối soát cả ngày – Ngủ ngon 22h00 đêm”
              </span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#191c1d] tracking-tight leading-[1.18] max-w-3xl mb-6"
          >
            VikeSo -{' '}
            <span className="bg-gradient-to-r from-[#198754] via-[#146c43] to-[#b31f56] bg-clip-text text-transparent inline-block">
              Trợ lý AI Quản Lý Dòng Tiền
            </span>{' '}
            & Đối Soát Hóa Đơn Cho Hộ Kinh Doanh
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-[#584045] max-w-2xl mb-8 leading-relaxed text-balance font-normal"
          >
            Tạm biệt sổ nợ tay nhàu nát và nỗi lo trùng lặp bill POS. Chụp hóa đơn trong 1 giây, Gemini AI bóc tách tự động, Telegram báo cáo lúc 22:00 mỗi đêm.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10"
          >
            <Magnet padding={25} magnetStrength={0.3}>
              <button
                onClick={onOpenScan}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#198754] text-white text-base font-bold shadow-xl shadow-[#198754]/30 hover:bg-[#146c43] hover:shadow-2xl hover:shadow-[#198754]/40 active:scale-95 transition-all ring-4 ring-[#198754]/15"
              >
                <span className="material-symbols-outlined text-[22px]">center_focus_strong</span>
                <span>Trải Nghiệm Miễn Phí Ngay (1-Chạm)</span>
              </button>
            </Magnet>

            <button
              onClick={onOpenVideo}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-[#191c1d] text-base font-bold hover:bg-[#f3f4f5] border border-[#e1e3e4] transition-all shadow-sm group hover:border-[#b31f56]/30"
            >
              <PlayCircle className="w-5 h-5 text-[#b31f56] group-hover:scale-110 transition-transform" />
              <span>Xem Video Hoạt Động (2 phút)</span>
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 pb-5 glass-card px-8 rounded-2xl w-full max-w-xl text-center shadow-xs"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-black text-[#198754]">
                <CountUp to={99.8} decimals={1} suffix="%" duration={1.8} />
              </div>
              <div className="text-xs font-semibold text-[#584045] mt-0.5">
                Độ chính xác AI Gemini OCR
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-[#e1e3e4] pt-3 sm:pt-0">
              <div className="text-2xl font-black text-[#191c1d] flex items-center gap-1">
                <span>Tiết kiệm </span>
                <CountUp to={45} suffix=" phút" duration={1.5} />
              </div>
              <div className="text-xs font-semibold text-[#584045] mt-0.5">
                Mỗi ngày khỏi cộng sổ đêm
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual Mockup: Smartphone / Cockpit with Split-Screen & Telegram Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-14 relative max-w-5xl mx-auto"
        >
          {/* Floating Telegram Notification Bubble */}
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -top-7 -right-2 md:right-6 z-20 glass-card-dark p-3.5 rounded-2xl shadow-2xl border border-white/20 max-w-xs text-left animate-pulse-subtle cursor-pointer hidden sm:flex items-center gap-3"
            onClick={onOpenTelegram}
          >
            <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center text-white shrink-0 shadow-md">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <BellRing className="w-3 h-3 text-[#198754]" />
                <span className="font-bold text-white">VikeSo Telegram Bot</span>
                <span>• 22:00</span>
              </div>
              <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                +11.250.000 đ Lãi ròng hôm nay
              </div>
              <p className="text-[10px] text-white/70">Đã đối soát 42 đơn, ngủ ngon thôi chủ vựa!</p>
            </div>
          </motion.div>

          <SpotlightCard
            spotlightColor="rgba(25, 135, 84, 0.22)"
            className="relative bg-[#24282a] rounded-3xl p-5 sm:p-8 shadow-2xl text-[#f0f1f2] border border-white/10"
          >
            {/* Top Status Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#198754] to-[#0f5132] flex items-center justify-center font-black text-white text-base shadow-md">
                  BC
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-white">
                      Vựa Sầu Riêng Ba Cường
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#198754] text-white text-[11px] font-black uppercase tracking-wider">
                      PRO PLAN
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    Chợ Đầu Mối Nông Sản Thủ Đức • Chốt ca tự động 22h00
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenTelegram}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-2 transition-colors border border-white/10"
                >
                  <Send className="w-3.5 h-3.5 text-[#20c997]" />
                  <span>Bot Telegram Sẵn Sàng</span>
                </button>
              </div>
            </div>

            {/* 3 Cash KPI Cards with Emerald Green (#198754) & Red (#DC3545) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {/* Tiền Vào (Thu) */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Tiền Vào (Thu)
                  </span>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  +15.450.000 đ
                </div>
                <div className="text-xs text-white/60 mt-1 font-medium">
                  42 lượt thu (Đã đối soát gộp POS)
                </div>
              </div>

              {/* Tiền Ra (Chi) */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Tiền Ra (Chi)
                  </span>
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-400">
                  -4.200.000 đ
                </div>
                <div className="text-xs text-white/60 mt-1 font-medium">
                  Tiền thùng xốp, bao bì, xăng xe
                </div>
              </div>

              {/* Thực Thu (Lợi Nhuận Dòng Tiền) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#198754]/30 via-white/5 to-white/5 border border-[#198754]/40 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Lợi Nhuận Thực Thu
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#198754]/30 text-emerald-300 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-300">
                  +11.250.000 đ
                </div>
                <div className="text-xs text-emerald-200/80 mt-1 font-medium">
                  Tăng +18% so với hôm qua
                </div>
              </div>
            </div>

            {/* Split Screen Traffic Light Preview Inside Mockup */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-3.5 text-left w-full lg:w-auto">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#198754] to-[#146c43] flex items-center justify-center shrink-0 shadow-md">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#b31f56] rounded-full animate-ping" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Màn hình đối chiếu Đèn Giao Thông (Split-Screen)</span>
                    <span className="bg-[#b31f56]/30 text-[#ff5c8d] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#b31f56]/40">
                      Gemini Vision
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    Phân tách rõ ràng nợ gối đầu, tự động gạch trùng POS, đối chiếu ảnh gốc 1-chạm.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={onOpenScan}
                  className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl bg-[#198754] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#146c43] active:scale-95 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[17px]">center_focus_strong</span>
                  <span>Quét Hóa Đơn Thử Nghiệm</span>
                </button>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};
