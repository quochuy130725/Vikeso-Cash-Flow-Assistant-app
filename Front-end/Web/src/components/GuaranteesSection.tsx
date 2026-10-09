import React from 'react';
import { ShieldCheck, Headphones, CheckCircle2, Lock } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

export const GuaranteesSection: React.FC = () => {
  return (
    <section className="w-full bg-[#f3f4f5] py-20 px-4 md:px-8 border-y border-[#e1e3e4]">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-[#d0f81b]/25 border border-[#d0f81b]/50 text-slate-950 text-xs font-black uppercase tracking-widest inline-block shadow-2xs">
            Minh bạch & Đáng tin cậy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3 tracking-tight">
            Cam Kết Sản Phẩm & Quyền Lợi
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Chính sách bảo vệ quyền lợi người dùng và cam kết hỗ trợ toàn diện trong suốt quá trình triển khai.
          </p>
        </div>

        {/* 2 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <SpotlightCard
            spotlightColor="rgba(208, 248, 27, 0.14)"
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#d0f81b] text-slate-950 border border-[#bde412] flex items-center justify-center shrink-0 shadow-2xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Bảo Mật Tuyệt Đối & Sở Hữu Dữ Liệu
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cam kết dữ liệu tài chính của cửa hàng được mã hóa riêng biệt, không chia sẻ cho bên thứ ba, bạn toàn quyền xuất file hoặc xóa dữ liệu bất kỳ lúc nào.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Mã hóa SSL 256-bit chuẩn ngân hàng</span>
            </div>
          </SpotlightCard>

          {/* Card 2 */}
          <SpotlightCard
            spotlightColor="rgba(208, 248, 27, 0.14)"
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#d0f81b] text-slate-950 border border-[#bde412] flex items-center justify-center shrink-0 shadow-2xs">
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
