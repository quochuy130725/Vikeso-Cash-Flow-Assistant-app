import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Chữ viết tay của tôi rất xấu, app VikeSo có đọc được không?',
      a: 'Có, hoàn toàn đọc được. Nhờ mô hình thị giác trí tuệ nhân tạo thế hệ mới (Google Gemini Multimodal Vision) được tối ưu riêng cho thói quen ghi chép buôn bán tại Việt Nam, hệ thống nhận diện cực tốt cả nét chữ viết ngoáy, viết vội, mực bút bi nhòe, tiếng lóng thương lái và giấy than carbon nhàu nát.',
    },
    {
      q: 'Tôi quét tờ POS Kết Ca thì có bị cộng trùng với bill lẻ ban ngày không?',
      a: 'Hoàn toàn không. Đây chính là giải thuật độc quyền Lưới Lọc 2 Chiều (Bidirectional Filter) của VikeSo. Khi bạn quét tờ báo cáo "POS Kết Ca" cuối ngày, hệ thống tự động nhận diện và gạch bỏ (chuyển trạng thái sang MERGED) toàn bộ các hóa đơn lẻ POS đã lưu trong ngày. Đồng thời, toàn bộ hóa đơn CHI thực (tiền nước đá, bao bì, xăng xe) vẫn được giữ nguyên 100%.',
    },
    {
      q: 'Nếu tôi quên quét hóa đơn hôm qua hoặc tuần trước thì sao?',
      a: 'Bạn hoàn toàn có thể dùng tính năng "Nhập Thủ Công Lùi Ngày" bất kỳ lúc nào. Bộ chọn ngày thông minh cho phép bạn lùi về ngày hôm qua hoặc tuần trước, đồng thời có cơ chế khóa ngày tương lai để chống nhập nhầm ngày mai. Dữ liệu lùi ngày chỉ cập nhật vào đúng ngày phát sinh và tổng kết tháng, tuyệt đối không làm sai lệch báo cáo dòng tiền hôm nay.',
    },
    {
      q: 'Dữ liệu kinh doanh của tôi có an toàn và bảo mật không?',
      a: 'Tuyệt đối an toàn. Toàn bộ thông tin tài chính của cửa hàng được mã hóa riêng biệt chuẩn SSL 256-bit ngân hàng và xác thực phân quyền qua JWT. Dữ liệu được lưu trữ an toàn trên hạ tầng đám mây MongoDB Atlas Cloud chuẩn doanh nghiệp quốc tế. VikeSo cam kết không chia sẻ dữ liệu cho bên thứ ba và bạn toàn quyền xuất file Excel hoặc xóa sổ quỹ bất cứ lúc nào.',
    },
  ];

  return (
    <section id="faq" className="w-full py-20 px-4 md:px-8 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-xs font-bold text-[#198754] uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#198754]/10 border border-[#198754]/20 inline-flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          Giải Đáp Thắc Mắc (FAQ)
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1d] mt-3 tracking-tight">
          Câu Hỏi Thường Gặp Về VikeSo
        </h2>
        <p className="text-sm sm:text-base text-[#584045] mt-2.5">
          Mọi điều bạn cần biết trước khi bắt đầu sử dụng VikeSo cho cửa hàng của mình.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all border overflow-hidden ${
                isOpen
                  ? 'glass-card border-[#198754]/40 shadow-sm'
                  : 'bg-white border-[#e1e3e4] hover:border-gray-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
              >
                <span className="font-bold text-sm sm:text-base text-[#191c1d]">
                  {faq.q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[#198754] text-white rotate-180' : 'bg-[#f3f4f5] text-[#584045]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#584045] leading-relaxed border-t border-[#f3f4f5]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
