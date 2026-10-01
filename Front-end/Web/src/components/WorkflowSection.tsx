import React from 'react';
import { Camera, Cpu, Send, Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { SpotlightCard } from './reactbits/SpotlightCard';

export const WorkflowSection: React.FC<{ onOpenScan: () => void }> = ({ onOpenScan }) => {
  const steps = [
    {
      num: '01',
      badgeBg: 'bg-[#198754] text-white',
      icon: <Camera className="w-6 h-6 text-[#198754]" />,
      title: 'Bước 1: Chụp Hóa Đơn 1-Chạm',
      desc: 'Mở app VikeSo, bấm nút chụp tròn chính giữa màn hình. Chụp bất kỳ hóa đơn mua lẻ, sổ nợ chép tay hay phiếu POS kết ca. Không cần căn lề, không lo mực nhòe hay giấy quăn.',
      proof: 'Tự cân bằng sáng & cắt góc phẳng',
    },
    {
      num: '02',
      badgeBg: 'bg-[#b31f56] text-white',
      icon: <Cpu className="w-6 h-6 text-[#b31f56]" />,
      title: 'Bước 2: AI Bóc Tách & Đối Soát 2 Chiều',
      desc: 'Gemini Vision xử lý dưới 3 giây: tự bóc tách mặt hàng, phân tách Tiền Vào / Tiền Ra, lọc sạch nợ gối đầu và tự động gộp bill lẻ vào POS để chống trùng tiền kép.',
      proof: 'Đèn giao thông Xanh/Vàng/Đỏ minh bạch',
    },
    {
      num: '03',
      badgeBg: 'bg-[#191c1d] text-white',
      icon: <Send className="w-6 h-6 text-[#198754]" />,
      title: 'Bước 3: Ngủ Ngon & Nhận Báo Cáo 22h00',
      desc: 'Sổ quỹ tự động khóa sổ. Đúng 22:00 đêm, tin nhắn tổng kết tiền mặt, chuyển khoản và công nợ tồn đọng được gửi thẳng vào Telegram và Email của bạn.',
      proof: 'Không cần bấm máy tính nửa đêm',
    },
  ];

  const comparisonRows = [
    {
      criteria: 'Thời gian ghi nhận',
      traditional: '3 - 5 phút/hóa đơn, gõ tay từng con số',
      vikeso: 'Dưới 3 giây/hóa đơn, chỉ cần 1 cú chụp',
      isHighlight: false,
    },
    {
      criteria: 'Xử lý nợ gối đầu',
      traditional: 'Dễ tính nhầm nợ vào doanh thu tiền tươi (lãi giả)',
      vikeso: 'AI tự phân tích ngữ cảnh, lọc bỏ 100% nợ chưa trả',
      isHighlight: true,
    },
    {
      criteria: 'Đối soát hóa đơn POS',
      traditional: 'Dễ bị cộng trùng giữa bill lẻ và bill kết ca (x2 ảo)',
      vikeso: 'Lưới lọc 2 chiều tự động phát hiện và gạch bỏ bill trùng',
      isHighlight: true,
    },
    {
      criteria: 'Kiểm tra sai sót',
      traditional: 'Phải lục tìm lại từng tờ giấy lộn xộn trong thùng',
      vikeso: 'Split-Screen đối chiếu ảnh gốc & Đèn giao thông UX',
      isHighlight: false,
    },
    {
      criteria: 'Báo cáo cuối ngày',
      traditional: 'Tự cộng trừ lúc 23h00 đêm, mệt mỏi và dễ sai lệch',
      vikeso: 'Telegram Bot tự động gửi báo cáo lúc 22h00',
      isHighlight: false,
    },
    {
      criteria: 'Chi phí & Độ phức tạp',
      traditional: 'Phần mềm POS đắt đỏ (3-5 triệu/năm), rườm rà',
      vikeso: 'Miễn phí khởi đầu, gói Pro chỉ 99k/tháng, siêu dễ dùng',
      isHighlight: false,
    },
  ];

  return (
    <section id="cach-hoat-dong" className="w-full py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-[#198754] uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#198754]/10 border border-[#198754]/20 inline-block">
          Đơn giản như dùng máy ảnh
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1d] mt-3 tracking-tight">
          3 Bước Tự Động Hóa Toàn Diện Dòng Tiền
        </h2>
        <p className="text-sm sm:text-base text-[#584045] mt-2.5 leading-relaxed">
          Không cần biết kế toán, không cần mở máy vi tính. Mọi thương lái hay chủ tạp hóa đều thành thạo sau 30 giây.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
        {steps.map((step, idx) => (
          <SpotlightCard
            key={idx}
            spotlightColor="rgba(25, 135, 84, 0.15)"
            className="p-8 rounded-3xl glass-card border border-[#e1e3e4] flex flex-col justify-between shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl ${step.badgeBg} text-base font-black flex items-center justify-center shadow-md`}>
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-[#e1e3e4] flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#191c1d] mb-2.5 group-hover:text-[#198754] transition-colors">
                {step.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#584045] leading-relaxed">
                {step.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f3f4f5] text-xs font-semibold text-[#198754] flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[#198754]/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-[#198754] stroke-[3]" />
              </div>
              <span>{step.proof}</span>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Value Comparison Table: VikeSo vs Traditional */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#e1e3e4] shadow-md overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-extrabold text-[#b31f56] uppercase tracking-widest">
            Bảng So Sánh Giá Trị
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#191c1d] mt-1.5">
            Ghi Sổ Tay Truyền Thống vs Trợ Lý AI VikeSo
          </h3>
          <p className="text-xs sm:text-sm text-[#584045] mt-1">
            Minh chứng rõ ràng vì sao VikeSo là giải pháp tối ưu cho quản lý dòng tiền hộ kinh doanh
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-[#e1e3e4]">
                <th className="py-4 px-4 text-xs font-bold text-[#584045] uppercase tracking-wider w-1/4">
                  Tiêu Chí Đối Soát
                </th>
                <th className="py-4 px-4 text-xs font-bold text-[#dc3545] uppercase tracking-wider w-3/8 bg-rose-50/50 rounded-tl-xl">
                  Ghi Sổ Tay / Excel Cũ
                </th>
                <th className="py-4 px-4 text-xs font-bold text-[#198754] uppercase tracking-wider w-3/8 bg-emerald-50 rounded-tr-xl">
                  Giải Pháp VikeSo AI (Mới)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e4]/60 text-xs sm:text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className={row.isHighlight ? 'bg-amber-50/30' : ''}>
                  <td className="py-4 px-4 font-bold text-[#191c1d]">
                    {row.criteria}
                  </td>
                  <td className="py-4 px-4 text-[#584045] bg-rose-50/20">
                    <div className="flex items-start gap-2">
                      <X className="w-4 h-4 text-[#dc3545] shrink-0 mt-0.5" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#191c1d] font-semibold bg-emerald-50/40">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#198754] shrink-0 mt-0.5 stroke-[3]" />
                      <span className="text-[#198754] font-bold">{row.vikeso}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onOpenScan}
            className="px-6 py-3 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <span>Trải Nghiệm Sự Khác Biệt Trong 3 Giây</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
