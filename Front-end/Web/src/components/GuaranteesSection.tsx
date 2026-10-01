import React from 'react';
import { ShieldCheck, Headphones, CheckCircle2, Lock } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

export const GuaranteesSection: React.FC = () => {
  return (
    <section className="w-full bg-[#f3f4f5] py-20 px-4 md:px-8 border-y border-[#e1e3e4]">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#b31f56] uppercase tracking-widest">
            Minh bạch & Đáng tin cậy
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1d] mt-2 tracking-tight">
            Cam Kết Sản Phẩm & Quyền Lợi
          </h2>
          <p className="text-sm text-[#584045] mt-2 leading-relaxed">
            Chính sách bảo vệ quyền lợi người dùng và cam kết hỗ trợ toàn diện trong suốt quá trình triển khai.
          </p>
        </div>

        {/* 2 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <SpotlightCard
            spotlightColor="rgba(255, 92, 141, 0.12)"
            className="p-8 rounded-3xl bg-white border border-[#e1e3e4] shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff5c8d]/20 text-[#b31f56] flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#191c1d] mb-2">
                  Bảo Mật Tuyệt Đối & Sở Hữu Dữ Liệu
                </h3>
                <p className="text-sm text-[#584045] leading-relaxed">
                  Cam kết dữ liệu tài chính của cửa hàng được mã hóa riêng biệt, không chia sẻ cho bên thứ ba, bạn toàn quyền xuất file hoặc xóa dữ liệu bất kỳ lúc nào.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#f3f4f5] flex items-center gap-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Mã hóa SSL 256-bit chuẩn ngân hàng</span>
            </div>
          </SpotlightCard>

          {/* Card 2 */}
          <SpotlightCard
            spotlightColor="rgba(220, 233, 68, 0.2)"
            className="p-8 rounded-3xl bg-white border border-[#e1e3e4] shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#dce944]/40 text-[#5c6300] flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#191c1d] mb-2">
                  Trải Nghiệm Đầy Đủ Tính Năng
                </h3>
                <p className="text-sm text-[#584045] leading-relaxed">
                  Trải nghiệm trọn vẹn toàn bộ tính năng nâng cao không giới hạn, sẵn sàng hỗ trợ trực tiếp 1-1 từ đội ngũ phát triển.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#f3f4f5] flex items-center gap-2 text-[#5c6300] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Hỗ trợ cài đặt kỹ thuật nhanh chóng 24/7</span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};
