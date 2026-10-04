import React from 'react';
import { FileWarning, CopyX, Moon, AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

export const ProblemSection: React.FC<{ onOpenScan: () => void }> = ({ onOpenScan }) => {
  const painPoints = [
    {
      icon: <FileWarning className="w-6 h-6 text-rose-600" />,
      badge: 'NỖI ĐAU 01',
      title: 'Sổ Nợ Lộn Xộn & Nợ Gối Đầu Chồng Chéo',
      desc: 'Ghi chép vội vàng bằng mực xanh, chữ ngoáy khó đọc tại quầy sạp chợ đầu mối. Khách trả trước một phần, hẹn mai trả nốt. Khi cộng sổ rất dễ cộng nhầm tiền nợ thành doanh thu thực tế, gây ảo tưởng "lãi giả nhưng lỗ thật" và thất thoát tiền triệu.',
      accent: 'border-rose-200 bg-rose-50/50',
      badgeColor: 'text-rose-700 bg-rose-100/80 border border-rose-200',
    },
    {
      icon: <CopyX className="w-6 h-6 text-indigo-600" />,
      badge: 'NỖI ĐAU 02',
      title: 'Trùng Lặp Doanh Thu Máy POS (x2 Doanh Thu Ảo)',
      desc: 'Quầy hàng vừa dùng máy cà thẻ POS vừa bán tiền mặt. Trong ngày nhân viên đã lưu hóa đơn lẻ máy POS, cuối ngày chủ vựa lại quét tiếp tờ báo cáo POS Kết Ca. Kết quả: cùng một khoản tiền bị cộng 2 lần, số liệu sổ sách bị đội khống nghiêm trọng.',
      accent: 'border-indigo-200 bg-indigo-50/50',
      badgeColor: 'text-indigo-700 bg-indigo-100/80 border border-indigo-200',
    },
    {
      icon: <Moon className="w-6 h-6 text-amber-600" />,
      badge: 'NỖI ĐAU 03',
      title: 'Mệt Mỏi Nửa Đêm Sau 14–16 Tiếng Buôn Bán',
      desc: '23h00 đêm, sau cả ngày đứng chợ rã rời chân tay, chủ quán vẫn phải căng mắt ngồi bấm máy tính tay cộng trừ từng trang sổ nhàu nát. Không có thời gian nghỉ ngơi cùng gia đình, đầu óc luôn căng thẳng vì sợ nhầm lẫn thất thoát tiền nong.',
      accent: 'border-amber-200 bg-amber-50/50',
      badgeColor: 'text-amber-800 bg-amber-100/80 border border-amber-200',
    },
  ];

  return (
    <section id="noi-dau" className="w-full py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border border-rose-200/80 shadow-2xs">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          Đánh Trúng Nỗi Đau Thực Tế Của Tiểu Thương
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
          Bạn Có Đang Mắc Kẹt Trong Cơn Ác Mộng Sổ Sách Mỗi Đêm?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Đa số hộ kinh doanh và chủ vựa nông sản mất ít nhất 45–60 phút mỗi tối chỉ để đối chiếu số tiền thực thu, nhưng kết quả vẫn lệch tiền và đầy âu lo.
        </p>
      </div>

      {/* 3 Pain Point Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {painPoints.map((item, idx) => (
          <SpotlightCard
            key={idx}
            spotlightColor="rgba(225, 29, 72, 0.08)"
            className="p-7 rounded-3xl glass-card border border-slate-200/90 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-rose-600">
              <ShieldAlert className="w-4 h-4" />
              <span>Hậu quả: Lệch tiền, thất thoát &amp; mất ngủ kéo dài</span>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Before vs After comparison banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-50/80 via-white to-pink-50/60 border border-rose-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#B31F56] to-[#FF5C8D] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-rose-500/25">
            ✓
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
              VikeSo sinh ra để giải phóng 100% cực hình sổ sách cho bạn
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Chỉ 1 giây chụp ảnh, AI tự nhận diện và tự lọc sạch nợ gối đầu, không cần gõ phím.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenScan}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B31F56] to-[#FF5C8D] hover:opacity-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
        >
          <span>Xem Giải Pháp Tức Thì</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
