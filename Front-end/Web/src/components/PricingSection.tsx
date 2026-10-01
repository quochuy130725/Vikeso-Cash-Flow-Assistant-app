import React from 'react';
import { CheckCircle2, Rocket, Flame, ArrowRight, ShieldCheck, Coffee } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';
import { Magnet } from './reactbits/Magnet';
import { ShinyText } from './reactbits/ShinyText';

interface PricingSectionProps {
  onSelectStarter: () => void;
  onSelectPro: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectStarter, onSelectPro }) => {
  return (
    <section id="bang-gia" className="w-full py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold text-[#198754] uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#198754]/10 border border-[#198754]/20 inline-block">
          Chi phí tối ưu cho mọi vựa & tiểu thương
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1d] mt-3 tracking-tight">
          Bảng Giá Minh Bạch - Đầu Tư Nhỏ, Lợi Ích Lớn
        </h2>
        <p className="text-sm sm:text-base text-[#584045] mt-2.5 leading-relaxed">
          Bắt đầu hoàn toàn miễn phí. Chỉ nâng cấp khi hoạt động buôn bán của bạn mở rộng quy mô.
        </p>
      </div>

      {/* Pricing Cards Container */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Package 1: STARTER */}
        <SpotlightCard
          spotlightColor="rgba(25, 135, 84, 0.1)"
          className="p-8 rounded-3xl glass-card border border-[#e1e3e4] shadow-sm flex flex-col justify-between hover:shadow-lg transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#584045] uppercase tracking-wider">
                  CƠ BẢN
                </span>
                <h3 className="text-2xl font-black text-[#191c1d] tracking-tight">STARTER</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#e7e8e9] text-xs font-bold text-[#191c1d]">
                Miễn Phí Vĩnh Viễn
              </span>
            </div>

            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-[#191c1d] tracking-tight">
                0 đ
              </span>
              <span className="text-xs text-[#584045]">/ tháng</span>
            </div>

            <p className="text-xs sm:text-sm text-[#584045] mb-6 pb-4 border-b border-[#e1e3e4]">
              Phù hợp tiểu thương mới kinh doanh, sạp rau củ nhỏ bắt đầu số hóa sổ sách bán lẻ.
            </p>

            <ul className="flex flex-col gap-3.5 text-xs sm:text-sm text-[#191c1d]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
                <span>
                  <strong>Quét tối đa 50</strong> hóa đơn AI / tháng
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
                <span>Nhập liệu thủ công lùi ngày <strong>không giới hạn</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
                <span>Báo cáo dòng tiền cơ bản trên ứng dụng</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
                <span>Cơ chế Đèn giao thông Xanh/Vàng/Đỏ</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={onSelectStarter}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-bold flex items-center justify-center transition-colors border border-[#e1e3e4]"
            >
              Bắt Đầu Miễn Phí Ngay
            </button>
          </div>
        </SpotlightCard>

        {/* Package 2: PRO Nâng Cấp */}
        <div className="p-8 rounded-3xl bg-[#24282a] text-[#f0f1f2] border border-white/10 shadow-2xl flex flex-col justify-between relative transform md:-translate-y-2 hover:-translate-y-3 transition-transform">
          {/* Top Pill Highlight */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#198754] text-white text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
            <ShinyText text="HOT / KHUYÊN DÙNG" className="text-white" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  CHUYÊN NGHIỆP • CHỈ BẰNG 3 LY CÀ PHÊ <Coffee className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">GÓI PRO</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#b31f56] text-white text-xs font-black shadow-sm">
                TIẾT KIỆM 50%
              </span>
            </div>

            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                99.000 đ
              </span>
              <span className="text-xs text-white/60">/ tháng</span>
            </div>

            <p className="text-xs sm:text-sm text-white/70 mb-6 pb-4 border-b border-white/10">
              Tất cả những gì một chủ vựa, F&B & hộ kinh doanh cần để rảnh tay ngủ ngon lúc 22:00.
            </p>

            <ul className="flex flex-col gap-3.5 text-xs sm:text-sm text-white/90">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Không giới hạn</strong> số lượng quét hóa đơn AI
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Tự động gửi báo cáo Telegram & Email lúc 22h00</strong>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Lưới lọc 2 chiều tự động gạch trùng POS</strong>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Phân tích biểu đồ dòng tiền chuyên sâu & Cảnh báo chi phí</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Xuất file Excel (.xlsx) bảng tính 1-chạm</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Hỗ trợ kỹ thuật ưu tiên 24/7 trực tiếp</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Magnet padding={20} magnetStrength={0.2} className="w-full">
              <button
                onClick={onSelectPro}
                className="w-full py-4 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#198754]/30"
              >
                <Rocket className="w-4 h-4" />
                <span>Đăng ký Gói PRO (99.000 đ)</span>
              </button>
            </Magnet>
          </div>
        </div>
      </div>
    </section>
  );
};
