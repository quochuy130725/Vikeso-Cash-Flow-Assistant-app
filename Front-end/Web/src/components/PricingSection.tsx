import React from 'react';
import { Check, Flame, ArrowRight, Coffee, Sparkles } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';
import { Magnet } from './reactbits/Magnet';
import { ShinyText } from './reactbits/ShinyText';

interface PricingSectionProps {
  onSelectStarter: () => void;
  onSelectPro: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectStarter, onSelectPro }) => {
  return (
    <section id="bang-gia" className="w-full py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold text-slate-950 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#d0f81b]/25 border border-[#d0f81b]/50 inline-flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          Chi phí tối ưu cho mọi vựa &amp; tiểu thương
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight max-w-2xl mx-auto">
          Bảng Giá Minh Bạch — Đầu Tư Nhỏ, Lợi Ích Lớn
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
          Bắt đầu hoàn toàn miễn phí. Chỉ nâng cấp khi hoạt động buôn bán của bạn mở rộng quy mô.
        </p>
      </div>

      {/* Pricing Cards Container */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Package 1: STARTER */}
        <SpotlightCard
          spotlightColor="rgba(208, 248, 27, 0.12)"
          className="p-8 sm:p-10 rounded-3xl glass-card border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                CƠ BẢN
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                Miễn Phí Vĩnh Viễn
              </span>
            </div>

            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              STARTER
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              Phù hợp tiểu thương mới kinh doanh, sạp rau củ nhỏ số hóa sổ sách bán lẻ.
            </p>

            <div className="py-5 border-y border-slate-200/80 my-6 flex items-baseline">
              <span className="text-5xl font-black text-slate-900 tracking-tight font-sans">
                0
              </span>
              <span className="text-2xl font-bold text-slate-600 ml-1.5">đ</span>
              <span className="text-sm text-slate-500 ml-2 font-medium">/ tháng</span>
            </div>

            <ul className="flex flex-col gap-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/25 text-slate-950 flex items-center justify-center shrink-0 border border-[#d0f81b]/60">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong>Quét tối đa 30</strong> hóa đơn AI / tháng
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/25 text-slate-950 flex items-center justify-center shrink-0 border border-[#d0f81b]/60">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Nhập liệu thủ công lùi ngày <strong>không giới hạn</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/25 text-slate-950 flex items-center justify-center shrink-0 border border-[#d0f81b]/60">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Báo cáo dòng tiền cơ bản trên ứng dụng</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/25 text-slate-950 flex items-center justify-center shrink-0 border border-[#d0f81b]/60">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Cơ chế Đèn giao thông Xanh/Vàng/Đỏ</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={onSelectStarter}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200/90 text-slate-900 text-sm font-bold flex items-center justify-center transition-colors border border-slate-200 cursor-pointer active:scale-95"
            >
              Bắt Đầu Miễn Phí (0đ)
            </button>
          </div>
        </SpotlightCard>

        {/* Package 2: PRO Nâng Cấp */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 border border-[#d0f81b]/40 shadow-[0_20px_50px_rgba(15,23,42,0.8),0_0_35px_rgba(208,248,27,0.15)] ring-1 ring-[#d0f81b]/25 flex flex-col justify-between relative transform md:-translate-y-2 hover:-translate-y-3 transition-transform">
          {/* Top Pill Highlight */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#d0f81b] text-slate-950 text-[11px] font-black tracking-wider uppercase shadow-md shadow-[#d0f81b]/30 border border-[#bde412] flex items-center gap-1.5 whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <ShinyText text="PHỔ BIẾN / KHUYÊN DÙNG" className="text-slate-950 font-black" />
          </div>

          <div>
            {/* Header with Title and Subtitle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#d0f81b]" />
                <span>Chỉ 3 ly cà phê</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] border border-[#d0f81b]/30 text-xs font-bold shrink-0">
                Tiết kiệm 85% giờ làm
              </span>
            </div>

            <h3 className="text-3xl font-black text-white tracking-tight mb-2">
              GÓI PRO
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Tất cả những gì chủ vựa, F&amp;B &amp; hộ kinh doanh cần để ngủ ngon lúc 22:00.
            </p>

            <div className="py-5 border-y border-slate-800 my-6 flex items-baseline">
              <span className="text-5xl font-black text-white tracking-tight font-sans">
                99.000
              </span>
              <span className="text-2xl font-bold text-[#d0f81b] ml-1.5">đ</span>
              <span className="text-sm text-slate-400 ml-2 font-medium">/ tháng</span>
            </div>

            <ul className="flex flex-col gap-4 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] flex items-center justify-center shrink-0 border border-[#d0f81b]/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong>Không giới hạn</strong> số lượng quét hóa đơn AI
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] flex items-center justify-center shrink-0 border border-[#d0f81b]/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong>Tự động gửi báo cáo Telegram</strong> lúc 22h00
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] flex items-center justify-center shrink-0 border border-[#d0f81b]/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong>Lưới lọc 2 chiều</strong> tự động gạch trùng POS
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] flex items-center justify-center shrink-0 border border-[#d0f81b]/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong>Xuất file Excel &amp; PDF</strong> chuẩn kế toán thuế
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] flex items-center justify-center shrink-0 border border-[#d0f81b]/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Ưu tiên đường truyền bóc tách AI siêu tốc (&lt; 1.2s)</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Magnet padding={20} magnetStrength={0.2}>
              <button
                onClick={onSelectPro}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#d0f81b]/25 hover:shadow-[#d0f81b]/40 cursor-pointer active:scale-95 group"
              >
                <span>Nâng Cấp Pro Ngay</span>
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            </Magnet>
          </div>
        </div>
      </div>
    </section>
  );
};
