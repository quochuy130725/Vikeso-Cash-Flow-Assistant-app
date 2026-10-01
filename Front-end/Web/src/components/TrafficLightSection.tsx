import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Receipt, CheckCircle2, AlertTriangle, Link2, Info, ZoomIn, Check, Sparkles } from 'lucide-react';
import { TiltedCard } from './reactbits/TiltedCard';

interface TrafficLightSectionProps {
  onOpenScan: () => void;
}

export const TrafficLightSection: React.FC<TrafficLightSectionProps> = ({ onOpenScan }) => {
  const [isConfirmedAmber, setIsConfirmedAmber] = useState(false);
  const [isEditingGreen, setIsEditingGreen] = useState(false);
  const [greenValue, setGreenValue] = useState(150000);
  const [zoomLevel, setZoomLevel] = useState(1);

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.4 : 1));
  };

  return (
    <section id="giai-phap-1-cham" className="w-full py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="px-3.5 py-1 rounded-full bg-[#dce944] text-[#191c1d] text-xs uppercase font-bold tracking-wider inline-block">
          Kiểm soát minh bạch
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191c1d] mt-3 tracking-tight">
          Cơ Chế Đèn Giao Thông - Minh Bạch & Tin Cậy Tuyệt Đối
        </h2>
        <p className="text-sm sm:text-base text-[#584045] mt-2 leading-relaxed">
          Hệ thống phân cấp độ tin cậy trực quan bằng màu sắc: Bạn luôn biết chắc chắn con số nào chuẩn xác và con số nào cần lướt qua xem lại.
        </p>
      </div>

      {/* Split Screen Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scanned Document with React Bits TiltedCard */}
        <div className="lg:col-span-5 bg-[#e7e8e9] rounded-3xl p-6 shadow-sm border border-[#e1e3e4]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#b31f56]" />
              <span className="font-bold text-base text-[#191c1d]">Ảnh Chứng Từ Chụp Thực Tế</span>
            </div>
            <button
              onClick={toggleZoom}
              className="text-xs bg-white px-3 py-1 rounded-md text-[#584045] hover:text-[#191c1d] border border-[#e1e3e4] font-medium flex items-center gap-1 shadow-2xs transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{zoomLevel === 1 ? 'Pinch to zoom' : 'Thu nhỏ 1x'}</span>
            </button>
          </div>

          <TiltedCard maxAngle={8} scale={1.01} className="w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-inner h-96 bg-[#edeeef] border border-white/50 cursor-pointer" onClick={toggleZoom}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNTjDMkeqMEaeQjZpRfcIF6E5p3EEJ-nM94FtSCMXtoWl3T3UsatHihHAWNxtcTbgiLn-nYuMG71zgG7C9DRGNsymt2zhTR9OX_XE0LPw2qDKxPpWvDo5F8KfY7RWOrZv0R64Ii3i-JJlRi7osjbVFXKmw5moeUMSED1wQkmSCZ6JPo_IHd-VjcgV9zbCmEB6qaeI3Vvc7N2chj19x4kefX74tjZtDdBbsr4UIaRU6H4zWamKmBBT2"
                alt="Chụp cận cảnh tờ giấy nháp viết tay tính tiền nông sản vựa sầu riêng với nét mực xanh, ghi chép số cân 3kg sầu riêng, tiền bao bì và con dấu hóa đơn bán lẻ"
                referrerPolicy="no-referrer"
                style={{ transform: `scale(${zoomLevel})` }}
                className="w-full h-full object-cover transition-transform duration-300"
              />

              {/* Bottom Scrim Bar */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#2e3132]/85 backdrop-blur-md text-white flex items-center justify-between border border-white/10 shadow-lg">
                <span className="text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Đã bóc tách 3 dòng thu chi</span>
                </span>
                <span className="text-xs font-bold text-[#dce944] bg-white/10 px-2 py-0.5 rounded">
                  1.8 giây
                </span>
              </div>
            </div>
          </TiltedCard>
        </div>

        {/* Right Column: Traffic Light AI Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-base font-bold text-[#191c1d]">Kết Quả AI Trích Xuất & Phân Loại</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-[#584045] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" /> Cao
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#584045] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" /> Duyệt
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#584045] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" /> Chú ý
              </span>
            </div>
          </div>

          {/* High Confidence Card (Green #4CAF50 indicator) */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-[#e1e3e4] relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                    TIỀN VÀO (THU)
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Độ tin cậy 99%
                  </span>
                </div>
                <div className="text-base font-bold text-[#191c1d] mt-1.5">Bán lẻ 3kg Sầu Riêng Ri6</div>
                <div className="text-xs text-[#584045] mt-0.5">Loại: Hóa đơn lẻ chợ sớm • 06:45</div>
              </div>

              <div className="text-right sm:self-center pl-2 flex flex-col items-end">
                {isEditingGreen ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={greenValue}
                      onChange={(e) => setGreenValue(Number(e.target.value))}
                      className="w-28 px-2 py-1 text-sm border rounded bg-[#f8f9fa] text-right font-bold"
                    />
                    <button
                      onClick={() => setIsEditingGreen(false)}
                      className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-2xl font-extrabold text-emerald-600">
                    +{greenValue.toLocaleString('vi-VN')} đ
                  </div>
                )}
                <button
                  onClick={() => setIsEditingGreen(!isEditingGreen)}
                  className="text-xs text-[#584045] hover:text-[#b31f56] font-medium mt-1 underline decoration-dotted"
                >
                  {isEditingGreen ? 'Hoàn tất' : 'Chỉnh sửa 1-chạm'}
                </button>
              </div>
            </div>
          </div>

          {/* Medium Confidence Card (Amber #FFB300 indicator) */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-[#e1e3e4] relative overflow-hidden transition-all hover:shadow-md">
            <div
              className={`absolute left-0 top-0 bottom-0 w-2 ${
                isConfirmedAmber ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold uppercase">
                    TIỀN RA (CHI)
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 ${
                      isConfirmedAmber ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {isConfirmedAmber ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận chuẩn xác
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Cần duyệt nhanh nét chữ
                      </>
                    )}
                  </span>
                </div>
                <div className="text-base font-bold text-[#191c1d] mt-1.5">
                  Nhập 50 Thùng Xốp Đóng Hàng
                </div>
                <div className="text-xs text-[#584045] mt-0.5">Loại: Giấy than ghi tay • 07:15</div>
              </div>

              <div className="text-right sm:self-center pl-2 flex flex-col items-end">
                <div className="text-2xl font-extrabold text-rose-600">-450.000 đ</div>
                <button
                  onClick={() => setIsConfirmedAmber(!isConfirmedAmber)}
                  className={`px-3 py-1 rounded text-xs font-bold mt-1 transition-all flex items-center gap-1 ${
                    isConfirmedAmber
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  {isConfirmedAmber ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Đã xác nhận
                    </>
                  ) : (
                    'Xác nhận đúng'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* MERGED Card (Slate Gray with Badge & Strikethrough) */}
          <div className="p-5 rounded-2xl bg-[#e7e8e9] opacity-85 border border-[#e1e3e4] relative overflow-hidden transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#979797]" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#2e3132] text-white text-xs font-bold flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-[#dce944]" />
                    ĐÃ GỘP VÀO POS KẾT CA
                  </span>
                  <span className="text-xs text-[#584045] font-mono">status: MERGED</span>
                </div>
                <div className="text-base font-medium text-[#584045] line-through mt-1.5">
                  Hóa đơn POS Khách quẹt thẻ
                </div>
                <p className="text-xs text-[#584045] mt-0.5 max-w-md">
                  Đã được cộng tự động trong Báo cáo POS cuối ngày, hệ thống gạch bỏ chống tính 2 lần doanh thu.
                </p>
              </div>

              <div className="text-right sm:self-center pl-2 flex flex-col items-end">
                <div className="text-xl font-bold text-[#584045] line-through">250.000 đ</div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1">
                  Đã bảo vệ 0đ lệch
                </span>
              </div>
            </div>
          </div>

          {/* Alert / Low Confidence Card (Red #F44336 indicator) */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">Chế độ cảnh báo ảnh mờ/rách (Low Confidence)</div>
                <div className="text-xs text-rose-700 mt-0.5">
                  AI tự động gợi ý chụp lại nếu ảnh chụp thiếu sáng hoặc lệch khung hình.
                </div>
              </div>
            </div>
            <button
              onClick={onOpenScan}
              className="px-4 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0"
            >
              Chụp Lại
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
