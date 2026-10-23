import React from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  TrendingUp,
  Send,
  GitMerge,
  Sparkles,
  ArrowRight,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface BentoFeaturesSectionProps {
  onOpenScan: () => void;
  onOpenTelegram: () => void;
}

export const BentoFeaturesSection: React.FC<BentoFeaturesSectionProps> = ({
  onOpenScan,
  onOpenTelegram,
}) => {
  return (
    <section id="tinh-nang" className="scroll-mt-24 py-16 sm:py-20 bg-white/15 border-y border-slate-200/60 relative overflow-hidden">
      <div id="features" className="absolute top-0 left-0 pointer-events-none" />
      <div id="noi-dau" className="absolute top-0 left-0 pointer-events-none" />
      <div id="boc-tach-ai" className="absolute top-0 left-0 pointer-events-none" />
      <div id="vu-khi-bi-mat" className="absolute top-0 left-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-white shadow-2xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#d0f81b]" />
            <span>TIỆN ÍCH DÀNH CHO TIỂU THƯƠNG</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight [text-shadow:_0_1px_8px_rgba(255,255,255,0.85)]">
            Tạm Biệt Nỗi Lo Tính Sổ Mỗi Đêm
          </h2>
          <p className="text-sm sm:text-base text-slate-950 font-bold mt-3 leading-relaxed [text-shadow:_0_1px_6px_rgba(255,255,255,0.85)]">
            4 tiện ích thực tế được thiết kế riêng cho các chủ vựa, cửa hàng bán lẻ và quán ăn tại Việt Nam.
          </p>
        </div>

        {/* Bento Grid 4 Cells */}
        <div id="tinh-nang" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Bento Cell 1: Large Feature (AI Gemini OCR) - spans 2 columns on lg */}
          <motion.div
            id="boc-tach-ai"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="scroll-mt-24 lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div id="vu-khi-bi-mat" className="absolute top-0 left-0 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#d0f81b]/20 to-transparent rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform"></div>

            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#d0f81b]/30 text-slate-950 flex items-center justify-center border border-[#bde412]">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                  Tốc độ xử lý 3 giây
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                Chụp Ảnh Hóa Đơn Giấy &amp; Chữ Viết Tay
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Không cần ngồi gõ từng dòng nợ. Chữ viết vội ngoài chợ, giấy than quăn mép hay bill tính tiền mờ mực đều được máy đọc chuẩn xác và tự động gom vào sổ quỹ.
              </p>
            </div>

            {/* Interactive Visual Card inside Cell 1 */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Hóa đơn nhập rau củ #892</div>
                  <div className="text-[11px] text-slate-400">Ảnh chụp camera • Viết tay</div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">ĐÃ VÀO SỔ QUỸ</div>
                  <div className="text-sm font-extrabold text-[#d0f81b] font-mono">1.250.000 đ</div>
                </div>
                <button
                  onClick={onOpenScan}
                  className="px-3 py-1.5 rounded-lg bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  type="button"
                >
                  <span>Chụp Thử</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bento Cell 2: Telegram Automated Reports */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 font-mono">ĐÚNG 22:00</span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">
                Tin Nhắn Báo Doanh Thu Mỗi Tối Lúc 22:00
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đúng 10 giờ đêm, điện thoại tự nhận thông báo: Hôm nay bán được bao nhiêu, chi ra những khoản nào, tiền lời thực tế bao nhiêu mà không cần đụng tới máy vi tính.
              </p>
            </div>

            <div className="mt-5 p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-[11px]">VikeSo Assistant Bot</span>
                <span className="text-[10px] text-sky-600 font-semibold">22:00</span>
              </div>
              <p className="text-[11px] text-sky-900 leading-tight">
                📊 <strong>Chốt sổ hôm nay:</strong> Doanh thu <strong>4.850.000 đ</strong> • Lời ròng <strong>1.150.000 đ (24%)</strong>. Đã khớp 12 đơn.
              </p>
              <button
                onClick={onOpenTelegram}
                className="text-[11px] font-black text-sky-700 hover:text-sky-900 underline pt-1 cursor-pointer"
                type="button"
              >
                Bấm để nhận báo cáo mẫu qua Telegram &rarr;
              </button>
            </div>
          </motion.div>

          {/* Bento Cell 3: Realtime Cash Flow & Net Profit */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#ff4783] flex items-center justify-center border border-pink-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Lãi ròng thực 24%
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">
                Biết Rõ Tiền Bỏ Túi, Không Sợ Lãi Ảo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tách bạch rõ ràng tiền khách trả ngay và tiền còn nợ gối đầu. Nắm chắc số tiền tươi thực nhận mỗi ngày, khỏi sợ cảnh 'thấy bán nhiều nhưng không thấy tiền đâu'.
              </p>
            </div>

            {/* Visual Mini Chart */}
            <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-end justify-between gap-2 h-24">
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-[#d0f81b] rounded-t-sm h-[55%] border border-[#bde412]"></div>
                <span className="text-[9px] font-mono text-slate-400">T2</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-[#ff4783] rounded-t-sm h-[75%]"></div>
                <span className="text-[9px] font-mono text-slate-400">T3</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-[#d0f81b] rounded-t-sm h-[90%] border border-[#bde412]"></div>
                <span className="text-[9px] font-mono text-slate-400">T4</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-[#ff4783] rounded-t-sm h-[65%]"></div>
                <span className="text-[9px] font-mono text-slate-400">T5</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-[#d0f81b] rounded-t-sm h-[100%] border border-[#bde412]"></div>
                <span className="text-[9px] font-mono text-slate-400 font-bold text-slate-900">H.Nay</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Cell 4: 2-Way Anti-Duplicate Filter (POS vs Bill) - spans 2 columns on lg */}
          <motion.div
            id="cach-hoat-dong"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="scroll-mt-24 lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#d0f81b]/30 text-[#243505] font-black text-xs border border-[#d0f81b]">
                    QUY TRÌNH TỰ ĐỘNG HÓA
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                  Chống tính đúp 100%
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                Tự Động Lọc Trùng Bill: Chống Tính Đúp Giữa Máy POS &amp; Hóa Đơn Lẻ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Ban ngày lỡ chụp bill lẻ cà thẻ POS, cuối ngày lại chụp thêm phiếu kết ca? VikeSo tự nhận diện và gạch bỏ phần trùng, đảm bảo sổ sách không bao giờ bị tính tiền 2 lần.
              </p>
            </div>

            {/* Visual Deduplication Flow */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 w-full sm:w-auto">
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>5 hóa đơn lẻ POS (1.200.000 đ)</span>
              </div>
              <span className="text-slate-400 font-black text-sm">&rarr;</span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Chụp Báo Cáo POS Kết Ca</span>
              </div>
              <span className="text-slate-400 font-black text-sm">&rarr;</span>
              <div className="p-2.5 rounded-xl bg-slate-900 text-[#d0f81b] font-mono font-black text-xs w-full sm:w-auto text-center">
                Tự Gạch Trùng Bill (KHÔNG BỊ TÍNH ĐÚP)
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
