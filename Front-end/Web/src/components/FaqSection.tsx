import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Chữ viết tay của tôi rất xấu, app VikeSo có đọc được không?',
      a: 'Hoàn toàn đọc được. Kể cả nét chữ viết ngoáy, viết vội lúc đông khách, giấy than bị nhăn hay mực bút bi lem mờ ngoài chợ, ứng dụng đều nhận diện chính xác tên hàng và số tiền.',
    },
    {
      q: 'Tôi quét tờ POS Kết Ca thì có bị cộng trùng với bill lẻ ban ngày không?',
      a: 'Chắc chắn không. Khi bạn chụp phiếu "Tổng kết ca POS" cuối ngày, hệ thống sẽ tự động đối chiếu và loại bỏ các hóa đơn cà thẻ lẻ đã quét trong ngày để không bị tính đúp. Các khoản chi thực tế bằng tiền mặt (như tiền nước đá, bao bì, xăng xe) vẫn được giữ nguyên đầy đủ.',
    },
    {
      q: 'Nếu tôi quên quét hóa đơn hôm qua hoặc tuần trước thì sao?',
      a: 'Bạn hoàn toàn có thể dùng tính năng "Nhập Lùi Ngày" bất kỳ lúc nào. Bạn có thể chọn ngày hôm qua hoặc tuần trước để bù chứng từ, hệ thống sẽ tự cập nhật vào đúng ngày phát sinh và tổng kết tháng mà không làm lệch tiền của hôm nay.',
    },
    {
      q: 'Dữ liệu kinh doanh của tôi có an toàn và bảo mật không?',
      a: 'Tuyệt đối an toàn. Dữ liệu kinh doanh và doanh thu của bạn được bảo mật nghiêm ngặt như tài khoản ngân hàng. Chỉ duy nhất một mình bạn mới có quyền xem sổ quỹ của cửa hàng. VikeSo cam kết không chia sẻ dữ liệu cho bất kỳ bên thứ ba nào và bạn toàn quyền xuất file Excel bất cứ lúc nào.',
    },
    {
      q: 'Tôi không rành công nghệ, có cần mua thêm máy tính hay máy móc phụ trợ gì không?',
      a: 'Hoàn toàn không. VikeSo được thiết kế tối giản cho người bận rộn: Bạn chỉ cần chiếc điện thoại thông minh đang dùng hằng ngày để chụp ảnh, hoặc nhận báo cáo chốt ca tự động mỗi đêm qua ứng dụng nhắn tin Telegram quen thuộc. Không cần mua thêm máy quét, không cần đầu tư máy tính bàn tốn kém.',
    },
    {
      q: 'Ứng dụng mới ra mắt, nếu gặp khó khăn trong quá trình sử dụng thì liên hệ ai?',
      a: 'Đội ngũ kỹ thuật phát triển VikeSo hỗ trợ trực tiếp 1-1 qua Zalo và Telegram. Bạn sẽ được hướng dẫn kết nối bot Telegram và giải đáp mọi thắc mắc ngay trong ngày, đảm bảo cửa hàng của bạn vận hành trơn tru từ ngày đầu tiên.',
    },
  ];

  return (
    <section id="faq" className="scroll-mt-24 w-full py-20 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14 max-w-3xl mx-auto">
        <span className="text-xs font-black text-slate-950 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#d0f81b] border border-[#bde412] inline-flex items-center gap-1.5 shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-slate-950" />
          Giải Đáp Thắc Mắc (FAQ)
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight [text-shadow:_0_1px_8px_rgba(255,255,255,0.85)]">
          Câu Hỏi Thường Gặp Về VikeSo
        </h2>
        <p className="text-sm sm:text-base text-slate-950 font-bold mt-2.5 [text-shadow:_0_1px_6px_rgba(255,255,255,0.85)]">
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
                  ? 'glass-card border-[#d0f81b] ring-1 ring-[#d0f81b]/40 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none cursor-pointer"
              >
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  {faq.q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[#d0f81b] text-slate-950 border border-[#bde412] rotate-180' : 'bg-slate-100 text-slate-600'
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
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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
