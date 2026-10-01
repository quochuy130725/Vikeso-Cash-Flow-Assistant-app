import React from 'react';
import { motion } from 'motion/react';
import { FileWarning, CopyX, Moon, AlertOctagon, ArrowRight, Check } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

export const ProblemSection: React.FC<{ onOpenScan: () => void }> = ({ onOpenScan }) => {
  const painPoints = [
    {
      icon: <FileWarning className="w-6 h-6 text-[#dc3545]" />,
      badge: 'NỖI ĐAU 01',
      title: 'Sổ Nợ Lộn Xộn & Nợ Gối Đầu Chồng Chéo',
      desc: 'Ghi chép vội vàng bằng mực xanh, chữ ngoáy khó đọc tại quầy sạp chợ đầu mối. Khách trả trước một phần, hẹn mai trả nốt. Khi cộng sổ rất dễ cộng nhầm tiền nợ thành doanh thu thực tế, gây ảo tưởng "lãi giả nhưng lỗ thật" và thất thoát tiền triệu.',
      accent: 'border-rose-200 bg-rose-50/50',
      badgeColor: 'text-[#dc3545] bg-rose-100',
    },
    {
      icon: <CopyX className="w-6 h-6 text-[#b31f56]" />,
      badge: 'NỖI ĐAU 02',
      title: 'Trùng Lặp Doanh Thu Máy POS (x2 Doanh Thu Ảo)',
      desc: 'Quầy hàng vừa dùng máy cà thẻ POS vừa bán tiền mặt. Trong ngày nhân viên đã lưu hóa đơn lẻ máy POS, cuối ngày chủ vựa lại quét tiếp tờ báo cáo POS Kết Ca. Kết quả: cùng một khoản tiền bị cộng 2 lần, số liệu sổ sách bị đội khống nghiêm trọng.',
      accent: 'border-pink-200 bg-pink-50/50',
      badgeColor: 'text-[#b31f56] bg-pink-100',
    },
    {
      icon: <Moon className="w-6 h-6 text-[#ffc107]" />,
      badge: 'NỖI ĐAU 03',
      title: 'Mệt Mỏi Nửa Đêm Sau 14–16 Tiếng Buôn Bán',
      desc: '23h00 đêm, sau cả ngày đứng chợ rã rời chân tay, chủ quán vẫn phải căng mắt ngồi bấm máy tính tay cộng trừ từng trang sổ nhàu nát. Không có thời gian nghỉ ngơi cùng gia đình, đầu óc luôn căng thẳng vì sợ nhầm lẫn thất thoát tiền nong.',
      accent: 'border-amber-200 bg-amber-50/50',
      badgeColor: 'text-amber-800 bg-amber-100',
    },
  ];

  return (
    <section id="noi-dau" className="w-full py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-[#dc3545] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border border-rose-200 shadow-2xs">
          <AlertOctagon className="w-3.5 h-3.5" />
          Đánh Trúng Nỗi Đau Thực Tế Của Tiểu Thương
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1d] mt-3.5 tracking-tight leading-tight">
          Bạn Có Đang Mắc Kẹt Trong Cơn Ác Mộng Sổ Sách Mỗi Đêm?
        </h2>
        <p className="text-sm sm:text-base text-[#584045] mt-3 leading-relaxed">
          Đa số hộ kinh doanh và chủ vựa nông sản mất ít nhất 45–60 phút mỗi tối chỉ để đối chiếu số tiền thực thu, nhưng kết quả vẫn lệch tiền và đầy âu lo.
        </p>
      </div>

      {/* 3 Pain Point Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {painPoints.map((item, idx) => (
          <SpotlightCard
            key={idx}
            spotlightColor="rgba(220, 53, 69, 0.12)"
            className="p-7 rounded-3xl glass-card border border-[#e1e3e4] flex flex-col justify-between shadow-sm hover:shadow-lg transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#e1e3e4] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#191c1d] mb-3 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#584045] leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f3f4f5] flex items-center text-xs font-bold text-[#dc3545]">
              <span>Hậu quả: Mất tiền & Mất ngủ</span>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Before vs After comparison pill */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-white to-emerald-50 border border-[#e1e3e4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#198754] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
            ✓
          </div>
          <div>
            <h4 className="text-base font-extrabold text-[#191c1d]">
              VikeSo sinh ra để giải phóng 100% cực hình sổ sách cho bạn
            </h4>
            <p className="text-xs sm:text-sm text-[#584045] mt-0.5">
              Chỉ 1 giây chụp ảnh, AI tự nhận diện và tự lọc sạch nợ gối đầu, không cần gõ phím.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenScan}
          className="px-6 py-3 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-95"
        >
          <span>Xem Giải Pháp Tức Thì</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
