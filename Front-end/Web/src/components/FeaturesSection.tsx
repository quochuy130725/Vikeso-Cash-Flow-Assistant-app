import React from 'react';
import { Camera, Edit3, Filter, Bot, ArrowRight } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

interface FeaturesSectionProps {
  onOpenScan: () => void;
  onOpenTelegram: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onOpenScan, onOpenTelegram }) => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-[#b31f56]" />,
      iconBg: 'bg-[#ff5c8d]/20',
      title: 'Camera 1-Chạm Siêu Tốc',
      desc: 'Zero-Friction UX. Chỉ cần bấm 1 nút chụp, AI tự nhận diện tài liệu, tự cắt góc phẳng và xử lý ngầm trong 3 giây.',
      action: 'Không cần căn chỉnh',
      actionColor: 'text-[#b31f56]',
      onClick: onOpenScan,
    },
    {
      icon: <Edit3 className="w-6 h-6 text-[#5c6300]" />,
      iconBg: 'bg-[#dce944]/40',
      title: 'AI Gemini OCR Chữ Viết Tay',
      desc: 'Đọc thấu nét chữ vội, hóa đơn rách lem, giấy than carbon đặc thù của thương lái thu mua tại ruộng và kho bãi.',
      action: 'Chính xác 99.4%',
      actionColor: 'text-[#5c6300]',
      onClick: onOpenScan,
    },
    {
      icon: <Filter className="w-6 h-6 text-[#191c1d]" />,
      iconBg: 'bg-[#e7e8e9]',
      title: 'Lưới Lọc 2 Chiều Chống Trùng',
      desc: 'Tự động đối chiếu POS Kết Ca với các Hóa Đơn Lẻ trong ngày. Đánh dấu MERGED thông minh ngăn chặn đôn khống doanh thu.',
      action: 'Bidirectional Filter',
      actionColor: 'text-[#191c1d]',
      onClick: onOpenScan,
    },
    {
      icon: <Bot className="w-6 h-6 text-white" />,
      iconBg: 'bg-[#ff5c8d]',
      title: 'Báo Cáo Telegram Bot 22h00',
      desc: 'Không cần mở app! Tự động tổng kết chốt ca, gửi chi tiết tiền mặt, chuyển khoản và công nợ thẳng vào Telegram chủ vựa mỗi đêm.',
      action: 'Báo cáo tự động 0đ phí',
      actionColor: 'text-[#b31f56]',
      onClick: onOpenTelegram,
    },
  ];

  return (
    <section id="tinh-nang" className="w-full bg-[#f3f4f5] py-20 px-4 md:px-8 border-y border-[#e1e3e4]/60">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-[#b31f56] uppercase tracking-widest">
              Nền tảng công nghệ chuyên sâu
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1d] mt-2 tracking-tight">
              Giải Pháp Số Hóa Sổ Sách & Quản Lý Dòng Tiền Đột Phá
            </h2>
          </div>
          <p className="text-sm text-[#584045] max-w-md leading-relaxed">
            Không thuật ngữ kế toán rườm rà. Mọi quy trình tinh gọn chỉ bằng 1 cú chụp hình và thuật toán tự động nhận diện đỉnh cao cho hộ kinh doanh và chuỗi điểm bán.
          </p>
        </div>

        {/* 4 Cards Grid with React Bits SpotlightCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(255, 92, 141, 0.12)"
              className="p-6 rounded-2xl bg-white border border-[#e1e3e4]/80 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={feat.onClick}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl ${feat.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-[#191c1d] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#584045] leading-relaxed">{feat.desc}</p>
              </div>

              <div
                className={`mt-6 pt-4 border-t border-[#f3f4f5] flex items-center ${feat.actionColor} text-xs font-bold`}
              >
                <span>{feat.action}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};
