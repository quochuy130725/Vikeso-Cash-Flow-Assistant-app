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
      <div className="relative rounded-3xl bg-gradient-to-br from-[#fff0f5] via-white to-[#f7fee7] p-8 sm:p-16 overflow-hidden text-slate-900 shadow-xl flex flex-col items-center text-center border border-[#ffd6e4]">
        {/* Glow Background Effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff4783]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#d0f81b]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full bg-[#d0f81b] border border-[#bde412] text-slate-950 text-xs font-black mb-6 shadow-xs tracking-wide">
            Không cần thẻ tín dụng • Miễn phí khởi đầu 0đ
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-1 tracking-tight leading-tight">
            Quản Lý Tiền Bán Hàng Nhẹ Nhàng Cùng VikeSo Ngay Hôm Nay
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mb-9 leading-relaxed mt-4 font-medium">
            Giải phóng bản thân khỏi nỗi lo sổ sách mỗi đêm. Đăng ký tài khoản miễn phí chỉ trong 30 giây và bắt đầu giấc ngủ ngon lúc 22:00.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Magnet padding={25} magnetStrength={0.25}>
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-sm font-black shadow-xl shadow-[#ff4783]/30 hover:shadow-[#ff4783]/50 active:scale-95 transition-all ring-4 ring-[#ff4783]/15 cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-white" />
                <span>Tạo Tài Khoản VikeSo Miễn Phí</span>
              </button>
            </Magnet>

            <button
              onClick={() => setPwaModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white hover:bg-[#fff0f5] text-slate-800 hover:text-[#ff4783] text-sm font-bold transition-all border border-[#ffd6e4] shadow-2xs cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#ff4783]" />
              <span>Dùng Trên Điện Thoại (iOS / Android)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-9 text-xs text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#ff4783] stroke-[3]" />
              <span>Không cần cài đặt phức tạp</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#ff4783] stroke-[3]" />
              <span>Kích hoạt trong 30 giây</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#ff4783] stroke-[3]" />
              <span>Hỗ trợ kỹ thuật trực tiếp 24/7</span>
            </span>
          </div>
        </div>
      </div>

      {/* PWA Mobile Dialog */}
      {pwaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d0f81b] border border-[#bde412] text-slate-950 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Sử Dụng VikeSo Trên Điện Thoại</h3>
                  <p className="text-[11px] text-slate-500">Nền tảng PWA mượt mà như app native</p>
                </div>
              </div>
              <button
                onClick={() => setPwaModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 mb-6">
              <div className="p-3.5 bg-[#f7fee7] rounded-2xl border border-[#d9f99d]">
                <p className="font-bold text-slate-900 mb-1">📱 Đối với iPhone / iPad (Safari):</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  1. Mở trang web bằng trình duyệt <strong>Safari</strong>.<br />
                  2. Bấm nút <strong>Chia sẻ (Biểu tượng mũi tên lên)</strong> ở thanh dưới.<br />
                  3. Chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-[#fff0f5] rounded-2xl border border-[#ffd6e4]">
                <p className="font-bold text-[#b01755] mb-1">🤖 Đối với Android (Chrome / Cốc Cốc):</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  1. Mở trang web bằng <strong>Google Chrome</strong>.<br />
                  2. Bấm menu <strong>3 dấu chấm (⋮)</strong> góc trên cùng.<br />
                  3. Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPwaModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white font-bold text-xs transition-colors cursor-pointer"
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
