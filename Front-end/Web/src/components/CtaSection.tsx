import React from 'react';
import { Rocket, Send, Check, Smartphone } from 'lucide-react';
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
    <section className="w-full py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-slate-950 p-8 sm:p-16 overflow-hidden text-slate-100 shadow-2xl flex flex-col items-center text-center border border-slate-800">
        {/* Glow Background Effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#d0f81b]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full bg-[#d0f81b]/20 border border-[#d0f81b]/40 text-[#d0f81b] text-xs font-black uppercase mb-6 shadow-md tracking-wider">
            KHÔNG CẦN THẺ TÍN DỤNG • MIỄN PHÍ KHỞI ĐẦU 0Đ
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mt-1 tracking-tight leading-tight">
            Bắt Đầu Quản Lý Dòng Tiền Cùng VikeSo Ngay Hôm Nay
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-9 leading-relaxed mt-4">
            Giải phóng bản thân khỏi nỗi lo sổ sách mỗi đêm. Đăng ký tài khoản miễn phí chỉ trong 30 giây và bắt đầu giấc ngủ ngon lúc 22:00.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Magnet padding={25} magnetStrength={0.25}>
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 text-sm font-black shadow-xl shadow-[#d0f81b]/25 hover:shadow-[#d0f81b]/40 active:scale-95 transition-all ring-4 ring-[#d0f81b]/20 cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-slate-950" />
                <span>Tạo Tài Khoản VikeSo Miễn Phí</span>
              </button>
            </Magnet>

            <button
              onClick={onOpenTelegram}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-all border border-white/10 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#d0f81b]" />
              <span>Kết Nối Bot Telegram 22h00</span>
            </button>

            <button
              onClick={() => alert('App VikeSo đã sẵn sàng trên nền tảng PWA di động. Bạn có thể thêm ngay vào màn hình chính của iPhone / Android mà không cần tải qua App Store.')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all border border-white/10 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-slate-300" />
              <span>Cài App Mobile (Android / iOS)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-9 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#d0f81b] stroke-[3]" />
              <span>Không cần cài đặt phức tạp</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#d0f81b] stroke-[3]" />
              <span>Kích hoạt trong 30 giây</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#d0f81b] stroke-[3]" />
              <span>Hỗ trợ kỹ thuật trực tiếp 24/7</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
