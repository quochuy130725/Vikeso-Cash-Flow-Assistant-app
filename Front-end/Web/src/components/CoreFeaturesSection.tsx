import React from 'react';
import {
  Camera,
  BrainCircuit,
  TrafficCone,
  Filter,
  CalendarCheck,
  Bot,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

interface CoreFeaturesSectionProps {
  onOpenScan: () => void;
  onOpenTelegram: () => void;
  onOpenBackdate?: () => void;
}

export const CoreFeaturesSection: React.FC<CoreFeaturesSectionProps> = ({
  onOpenScan,
  onOpenTelegram,
  onOpenBackdate,
}) => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-slate-950" />,
      iconBg: 'bg-[#d0f81b] border border-[#bde412] shadow-xs',
      badge: 'ZERO-FRICTION UX',
      title: '1. Giao Diện 1-Chạm Không Cần Gõ Phím',
      desc: 'Loại bỏ hoàn toàn các form biểu nhập liệu rườm rà. Nút bấm to tròn dễ thao tác ngay cả khi tay đang ướt hoặc đeo găng tay buôn bán. Thuật ngữ kế toán được bình dân hóa thành "Tiền Vào" (Thu) và "Tiền Ra" (Chi). Hoàn tất dưới 5 giây.',
      highlight: 'Chỉ 1 nút bấm duy nhất',
      actionColor: 'text-slate-950 font-black',
      onClick: onOpenScan,
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border border-indigo-200/80',
      badge: 'GEMINI 2.5 FLASH',
      title: '2. Gemini AI Đọc Chữ Viết Tay & Lọc Nợ Gối Đầu',
      desc: 'Mô hình thị giác ngôn ngữ đọc thấu chữ viết ngoáy vội, mực nhòe, giấy than carbon của thương lái. Tự động nhận diện ngữ cảnh: các khoản "còn thiếu", "hẹn mai trả", "nợ gối đầu" sẽ bị tách riêng, chỉ ghi nhận tiền tươi thực thu.',
      highlight: 'Độ chính xác 99.8%',
      actionColor: 'text-indigo-700',
      onClick: onOpenScan,
    },
    {
      icon: <TrafficCone className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-50 border border-amber-200/80',
      badge: 'MINH BẠCH & TIN CẬY',
      title: '3. Cơ Chế Đèn Giao Thông & Màn Hình Chia Đôi',
      desc: 'Màn hình Split-Screen: nửa trên soi ảnh chụp thực tế (pinch to zoom), nửa dưới hiển thị thẻ giao dịch bóc tách. Đèn Xanh (Chính xác 100%), Đèn Vàng (Cần liếc nhanh qua), Đèn Đỏ (Cảnh báo mờ rách). Chạm trực tiếp sửa tức thì.',
      highlight: 'Soi chứng từ gốc trực quan',
      actionColor: 'text-amber-700',
      onClick: onOpenScan,
    },
    {
      icon: <Filter className="w-6 h-6 text-teal-600" />,
      iconBg: 'bg-teal-50 border border-teal-200/80',
      badge: 'GIẢI THUẬT ĐỘC QUYỀN',
      title: '4. Lưới Lọc Thông Minh 2 Chiều Chống Trùng POS',
      desc: 'Quét báo cáo "POS Kết Ca" cuối ngày? Hệ thống tự động gạch bỏ trạng thái MERGED toàn bộ bill lẻ máy POS đã quét trong ngày. Bảo tồn 100% các khoản CHI thực để lợi nhuận ròng luôn tuyệt đối chính xác.',
      highlight: 'Chặn đứng x2 doanh thu ảo',
      actionColor: 'text-teal-700',
      onClick: onOpenScan,
    },
    {
      icon: <CalendarCheck className="w-6 h-6 text-slate-700" />,
      iconBg: 'bg-slate-100 border border-slate-200',
      badge: 'KHÔNG Ô NHIỄM SỔ SÁCH',
      title: '5. Nhập Thủ Công Lùi Ngày Linh Hoạt',
      desc: 'Hôm nay mới nhớ ra hóa đơn hôm qua hoặc tuần trước? Nhập bù lùi ngày dễ dàng với bộ chọn ngày có khóa ngày tương lai. Dữ liệu chỉ cập nhật vào đúng ngày phát sinh, tuyệt đối không làm sai lệch báo cáo đêm nay.',
      highlight: 'Khóa lịch chống nhập nhầm',
      actionColor: 'text-slate-800',
      onClick: onOpenBackdate || onOpenScan,
    },
    {
      icon: <Bot className="w-6 h-6 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border border-indigo-200/80',
      badge: 'TỰ ĐỘNG HÓA TỐI THƯỢNG',
      title: '6. Báo Cáo Đêm 22h00 Qua Telegram Bot & Email',
      desc: 'Không cần nhớ mở app! Đúng 22h00 đêm mỗi ngày, serverless cronjob tự động tổng hợp và gửi bảng biểu chi tiết (Tiền Vào, Tiền Ra, Lãi Ròng) trực tiếp vào Telegram và Email của chủ vựa. Kết nối bot chỉ với 1-chạm.',
      highlight: 'Ngủ ngon không cần cộng sổ',
      actionColor: 'text-indigo-700',
      onClick: onOpenTelegram,
    },
  ];

  return (
    <section id="tinh-nang" className="w-full bg-slate-50/80 py-20 px-4 md:px-8 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#d0f81b]/25 border border-[#d0f81b]/50 inline-flex w-fit shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Nền Tảng Công Nghệ Đột Phá
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight leading-tight">
              6 Tính Năng Cốt Lõi Định Nghĩa Lại Quản Trị Dòng Tiền
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            Không thuật ngữ kế toán rườm rà. Mọi quy trình tinh gọn chỉ bằng 1 cú chụp hình và thuật toán AI bóc tách đỉnh cao cho hộ kinh doanh và chuỗi điểm bán.
          </p>
        </div>

        {/* 6 Features Grid (Glassmorphism Bento Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(208, 248, 27, 0.14)"
              className="p-7 rounded-3xl glass-card border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all group cursor-pointer"
              onClick={feat.onClick}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs`}>
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5 group-hover:text-slate-950 transition-colors">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between ${feat.actionColor} text-xs font-bold`}>
                <span>{feat.highlight}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Trải nghiệm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};
