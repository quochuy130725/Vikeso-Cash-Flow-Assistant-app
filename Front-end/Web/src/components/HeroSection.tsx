import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlayCircle,
  Camera,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Send,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Receipt,
  BellRing,
  Zap,
  RotateCcw,
  Check,
  Cpu,
  Layers,
} from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';
import { Magnet } from './reactbits/Magnet';

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
  const [activeHeroTab, setActiveHeroTab] = useState<'cockpit' | 'scan-demo'>('cockpit');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const handleTriggerDemoScan = () => {
    setIsScanning(true);
    setHasScanned(false);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  return (
    <section id="hero" className="relative w-full pt-8 pb-16 md:pb-24 overflow-hidden">
      {/* Dynamic ambient fintech glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-gradient-to-b from-[#d0f81b]/20 via-lime-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-[#d0f81b]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-28 -right-40 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero Top Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Emotional Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white shadow-2xs mb-6 border border-slate-200 hover:border-slate-300 transition-all"
          >
            <span className="px-2.5 py-0.5 rounded-full bg-[#d0f81b] text-slate-950 font-black text-[11px] border border-[#bde412] tracking-wide uppercase">
              v1.0 MỚI
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Bắt Đầu Miễn Phí 0đ • Trợ Lý AI Chốt Sổ 22:00
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black tracking-tight leading-[1.25] mb-6"
          >
            <span className="text-[#ff4583]">Trợ Lý AI Quản Lý Dòng Tiền</span>{' '}
            <br className="hidden md:inline" />
            <span className="text-slate-950">&amp; Đối Soát Hóa Đơn Cho Hộ Kinh Doanh</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed font-normal"
          >
            Không cần máy vi tính, không lo sổ nợ tay nhàu nát hay trùng lặp bill máy POS. Chụp hóa đơn trong 1 giây, Gemini AI bóc tách tự động, Telegram báo cáo chốt sổ lúc 22:00 mỗi đêm.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10"
          >
            <Magnet padding={25} magnetStrength={0.3}>
              <button
                onClick={onOpenScan}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 text-base font-black shadow-xl shadow-[#d0f81b]/35 active:scale-95 transition-all ring-4 ring-[#d0f81b]/25 border border-[#bde412] cursor-pointer"
              >
                <Camera className="w-5 h-5 text-slate-950" />
                <span>Trải Nghiệm Miễn Phí Ngay (0đ)</span>
              </button>
            </Magnet>

            <button
              onClick={onOpenVideo}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-slate-900 text-base font-bold hover:bg-slate-50 border border-slate-200 transition-all shadow-xs group hover:border-slate-300 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-slate-900 group-hover:scale-110 transition-transform" />
              <span>Xem Video Hoạt Động (2 phút)</span>
            </button>
          </motion.div>

          {/* Honest Engineering Benchmarks (Zero Fake User Numbers) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 px-6 glass-card rounded-2xl w-full max-w-2xl text-center shadow-xs border border-slate-200/90"
          >
            <div className="flex flex-col items-center justify-center p-2">
              <div className="text-xl sm:text-2xl font-black text-slate-950 font-mono flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#d0f81b]" />
                &lt; 1.2 Giây
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Tốc độ bóc tách ảnh AI
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0">
              <div className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">
                99.4%
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Độ chính xác thử nghiệm OCR
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                0 VNĐ
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Phụ phí thiết bị phần cứng
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual Cockpit & Interactive Live Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-14 relative max-w-5xl mx-auto"
        >
          {/* Floating Telegram Notification Bubble */}
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -top-7 -right-2 md:right-6 z-20 glass-card-dark p-3.5 rounded-2xl shadow-2xl border border-white/20 max-w-xs text-left animate-pulse-subtle cursor-pointer hidden sm:flex items-center gap-3"
            onClick={onOpenTelegram}
          >
            <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center text-white shrink-0 shadow-md">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                <BellRing className="w-3 h-3 text-emerald-400" />
                <span className="font-bold text-white">VikeSo Bot Telegram</span>
                <span>• 22:00</span>
              </div>
              <div className="text-xs font-extrabold text-emerald-400 mt-0.5 font-mono">
                +11.250.000 đ Lãi ròng hôm nay
              </div>
              <p className="text-[10px] text-white/80">Đã chốt đối soát 42 đơn, ngủ ngon thôi chủ hộ!</p>
            </div>
          </motion.div>

          {/* Interactive Cockpit Card with Tab Switcher */}
          <SpotlightCard
            spotlightColor="rgba(208, 248, 27, 0.18)"
            className="relative bg-slate-950 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-100 border border-slate-800"
          >
            {/* Top Bar with Mode Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d0f81b] flex items-center justify-center font-black text-slate-950 text-base shadow-md shadow-[#d0f81b]/25">
                  VK
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-white">
                      Cửa Hàng Mẫu VikeSo
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] border border-[#d0f81b]/40 text-[11px] font-black uppercase tracking-wider">
                      LIVE DEMO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mô phỏng trải nghiệm thực tế • Sổ quỹ tức thì &amp; bóc tách AI
                  </p>
                </div>
              </div>

              {/* Tab Selector: Cockpit vs Live Scan Demo */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveHeroTab('cockpit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeHeroTab === 'cockpit'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sổ Quỹ Tức Thì</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHeroTab('scan-demo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeHeroTab === 'scan-demo'
                      ? 'bg-[#d0f81b] text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Thử Quét Hóa Đơn Mẫu</span>
                </button>
              </div>
            </div>

            {/* TAB 1: COCKPIT OVERVIEW */}
            {activeHeroTab === 'cockpit' && (
              <motion.div
                key="cockpit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* 3 Cash KPI Cards with Emerald Green & Rose */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                  {/* Tiền Vào (Thu) */}
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Tiền Vào (Thu)
                      </span>
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono font-tabular">
                      +15.450.000 đ
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">
                      42 lượt thu (Đã đối soát gộp POS)
                    </div>
                  </div>

                  {/* Tiền Ra (Chi) */}
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Tiền Ra (Chi)
                      </span>
                      <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-rose-400 font-mono font-tabular">
                      -4.200.000 đ
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">
                      Tiền thùng hàng, bao bì, xăng xe
                    </div>
                  </div>

                  {/* Thực Thu (Lợi Nhuận Dòng Tiền) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600/30 via-slate-800/80 to-slate-800/80 border border-emerald-500/40 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Lợi Nhuận Thực Thu
                      </span>
                      <div className="w-7 h-7 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-300 font-mono font-tabular">
                      +11.250.000 đ
                    </div>
                    <div className="text-xs text-emerald-200/90 mt-1 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Số liệu đối chiếu sạch 100% không lệch</span>
                    </div>
                  </div>
                </div>

                {/* Split Screen Traffic Light Preview Inside Mockup */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-3.5 text-left w-full lg:w-auto">
                    <div className="relative w-12 h-12 rounded-2xl bg-[#d0f81b] flex items-center justify-center shrink-0 shadow-md shadow-[#d0f81b]/20">
                      <Camera className="w-6 h-6 text-slate-950" />
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#d0f81b] rounded-full animate-ping" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Màn hình đối chiếu Đèn Giao Thông (Split-Screen)</span>
                        <span className="bg-[#d0f81b]/20 text-[#d0f81b] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#d0f81b]/30">
                          AI Gemini Vision
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Phân tách rõ ràng nợ gối đầu, tự động gạch trùng POS, đối chiếu ảnh gốc 1-chạm.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button
                      onClick={() => setActiveHeroTab('scan-demo')}
                      className="px-4 py-2 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-slate-950" />
                      <span>Xem AI Quét Thử Ngay</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: LIVE INTERACTIVE SCAN DEMO */}
            {activeHeroTab === 'scan-demo' && (
              <motion.div
                key="scan-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="my-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  {/* Left: Simulated Receipt with Laser Scanner Line */}
                  <div className="md:col-span-6 bg-slate-950 rounded-2xl p-4 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                        <Receipt className="w-4 h-4 text-[#d0f81b]" />
                        <span>Hóa Đơn Mẫu (In Nhiệt Quầy Sạp)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">BILL#2026-889</span>
                    </div>

                    {/* Receipt Body Simulation */}
                    <div className="my-3 p-4 bg-white text-slate-900 rounded-xl font-mono text-[11px] leading-relaxed shadow-inner relative overflow-hidden select-none">
                      {/* Laser Bar Animation */}
                      {isScanning && (
                        <div className="absolute left-0 w-full h-1 bg-[#d0f81b] shadow-[0_0_15px_#d0f81b] animate-laser-scan z-10 pointer-events-none" />
                      )}

                      <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300">
                        VỰA NÔNG SẢN THỦ ĐỨC
                        <div className="text-[9px] font-normal text-slate-500">Kiot 14, Đường D2, Chợ Đầu Mối</div>
                      </div>

                      <div className="py-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Sầu Riêng Ri6 (25kg x 110k)</span>
                          <span className="font-bold">2.750.000</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Phí Thùng Xốp Đóng Hàng</span>
                          <span>100.000</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Tiền chuyển khoản POS: 2.850.000</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-400 flex justify-between font-extrabold text-xs">
                        <span>TỔNG THANH TOÁN:</span>
                        <span className="text-slate-950 font-black">2.850.000 đ</span>
                      </div>
                    </div>

                    {/* Scan trigger button */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleTriggerDemoScan}
                        disabled={isScanning}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                          isScanning
                            ? 'bg-slate-700 text-slate-300 cursor-wait'
                            : 'bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 shadow-[#d0f81b]/25'
                        }`}
                      >
                        {isScanning ? (
                          <>
                            <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Đang bóc tách qua AI Vision...</span>
                          </>
                        ) : hasScanned ? (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>Quét Lại Lần Nữa</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-slate-950" />
                            <span>Bấm Vào Đây Để AI Quét Thử (1.2s)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right: AI Extraction Output */}
                  <div className="md:col-span-6 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Kết Quả AI Bóc Tách Tự Động</span>
                      </span>
                      {hasScanned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đã Khớp (Đèn Xanh)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Chờ Quét
                        </span>
                      )}
                    </div>

                    <div className="my-3 space-y-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Tổng tiền thực thu</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {hasScanned ? '2.850.000 đ' : '--- đ'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Phân loại dòng tiền</span>
                        <span className="text-xs font-bold text-slate-200">
                          {hasScanned ? 'Tiền Vào (Bán Hàng Nông Sản)' : '---'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Đối chiếu trùng POS</span>
                        <span className="text-xs font-bold text-indigo-300">
                          {hasScanned ? 'Đã gạch trùng hóa đơn lẻ POS' : '---'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Độ tin cậy nhận diện</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {hasScanned ? '99.8% (Đạt chuẩn ghi sổ)' : '---'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Thời gian phân tích: <strong className="text-white font-mono">{hasScanned ? '0.98s' : '0.00s'}</strong></span>
                      <button
                        type="button"
                        onClick={onOpenScan}
                        className="text-[#d0f81b] hover:underline font-bold transition-colors cursor-pointer"
                      >
                        Thử tải ảnh của bạn &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};
