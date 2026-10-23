import React, { useState } from 'react';
import { Rocket, Send, Check, Smartphone, X, QrCode } from 'lucide-react';
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
  const [pwaModalOpen, setPwaModalOpen] = useState(false);

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
            Quản Lý Tiền Bán Hàng Nhẹ Nhàng Cùng VikeSo Ngay Hôm Nay
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-9 leading-relaxed mt-4">
            Giải phóng bản thân khỏi nỗi lo sổ sách mỗi đêm. Đăng ký tài khoản miễn phí chỉ trong 30 giây và bắt đầu giấc ngủ ngon lúc 22:00.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Magnet padding={25} magnetStrength={0.25}>
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-sm font-black shadow-xl shadow-[#ff4783]/30 hover:shadow-[#ff4783]/50 active:scale-95 transition-all ring-4 ring-[#ff4783]/20 cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-white" />
                <span>Tạo Tài Khoản VikeSo Miễn Phí</span>
              </button>
            </Magnet>

            <button
              onClick={onOpenTelegram}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-all border border-white/10 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#d0f81b]" />
              <span>Nhận Báo Cáo Tối (Telegram)</span>
            </button>

            <button
              onClick={() => setPwaModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all border border-white/10 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-slate-300" />
              <span>Dùng Trên Điện Thoại (iOS / Android)</span>
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

      {/* PWA Mobile Dialog */}
      {pwaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#191c1d] border border-white/10 rounded-3xl p-6 shadow-2xl text-white text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#d0f81b] text-slate-950 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Sử Dụng VikeSo Trên Điện Thoại</h3>
                  <p className="text-[11px] text-slate-400">Nền tảng PWA mượt mà như app native</p>
                </div>
              </div>
              <button
                onClick={() => setPwaModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-[#d0f81b] mb-1">📱 Đối với iPhone / iPad (Safari):</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. Mở trang web bằng trình duyệt <strong>Safari</strong>.<br />
                  2. Bấm nút <strong>Chia sẻ (Biểu tượng mũi tên lên)</strong> ở thanh dưới.<br />
                  3. Chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                </p>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-[#ff4783] mb-1">🤖 Đối với Android (Chrome / Cốc Cốc):</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. Mở trang web bằng <strong>Google Chrome</strong>.<br />
                  2. Bấm menu <strong>3 dấu chấm (⋮)</strong> góc trên cùng.<br />
                  3. Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPwaModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#d0f81b] hover:bg-[#bde412] text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Đã Rõ, Tôi Sẽ Thử Ngay!
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
