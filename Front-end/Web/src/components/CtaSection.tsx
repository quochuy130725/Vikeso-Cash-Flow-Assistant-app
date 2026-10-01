import React from 'react';
import { Rocket, Send, Check, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Magnet } from './reactbits/Magnet';

interface CtaSectionProps {
  onOpenScan: () => void;
  onOpenTelegram: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onOpenScan,
  onOpenTelegram,
  onOpenAuth,
}) => {
  return (
    <section className="w-full py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
      <div className="relative rounded-3xl bg-[#24282a] p-8 sm:p-16 overflow-hidden text-[#f0f1f2] shadow-2xl flex flex-col items-center text-center border border-white/10">
        {/* Neon Glow Background Effects: Emerald (#198754) & Pink (#B31F56) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#198754]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#b31f56]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full bg-[#198754] text-white text-xs font-black uppercase mb-6 shadow-md tracking-wider">
            KHÔNG CẦN THẺ TÍN DỤNG • MIỄN PHÍ KHỞI ĐẦU
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mt-1 tracking-tight leading-tight">
            Bắt Đầu Quản Lý Dòng Tiền Cùng VikeSo Ngay Hôm Nay
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mb-9 leading-relaxed mt-4">
            Giải phóng bản thân khỏi nỗi lo sổ sách mỗi đêm. Đăng ký tài khoản miễn phí chỉ trong 30 giây và bắt đầu giấc ngủ ngon lúc 22:00.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Magnet padding={25} magnetStrength={0.25}>
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#198754] text-white text-sm font-bold shadow-xl shadow-[#198754]/30 hover:bg-[#146c43] active:scale-95 transition-all ring-4 ring-[#198754]/20"
              >
                <Rocket className="w-4 h-4" />
                <span>Tạo Tài Khoản VikeSo Miễn Phí</span>
              </button>
            </Magnet>

            <button
              onClick={onOpenTelegram}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Kết Nối Bot Telegram 22h00</span>
            </button>

            <button
              onClick={() => alert('App VikeSo đã sẵn sàng trên nền tảng PWA di động. Bạn có thể thêm ngay vào màn hình chính của iPhone / Android mà không cần tải qua App Store.')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/15 text-white/90 text-sm font-semibold transition-all border border-white/10"
            >
              <Smartphone className="w-4 h-4 text-pink-300" />
              <span>Cài App Mobile (Android / iOS)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-9 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Không cần cài đặt phức tạp</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Kích hoạt trong 30 giây</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Hỗ trợ kỹ thuật trực tiếp 24/7</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
