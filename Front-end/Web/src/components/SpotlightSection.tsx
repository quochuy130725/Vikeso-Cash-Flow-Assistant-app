import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Info,
  ZoomIn,
  Check,
  Filter,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { TiltedCard } from './reactbits/TiltedCard';

interface SpotlightSectionProps {
  onOpenScan: () => void;
}

export const SpotlightSection: React.FC<SpotlightSectionProps> = ({ onOpenScan }) => {
  // Spotlight 1: Traffic light state
  const [isConfirmedAmber, setIsConfirmedAmber] = useState(false);
  const [isEditingGreen, setIsEditingGreen] = useState(false);
  const [greenValue, setGreenValue] = useState(285000);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Spotlight 2: Deduplication filter simulation state
  const [posShiftReportScanned, setPosShiftReportScanned] = useState(true);

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.35 : 1));
  };

  return (
    <section id="vu-khi-bi-mat" className="w-full bg-[#f8f9fa] py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="px-3.5 py-1.5 rounded-full bg-[#b31f56]/10 text-[#b31f56] text-xs uppercase font-extrabold tracking-wider inline-flex items-center gap-1.5 border border-[#b31f56]/20">
          <Sparkles className="w-3.5 h-3.5" />
          Vũ Khí Bí Mật Độc Quyền
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1d] mt-3 tracking-tight">
          Khám Phá 2 Công Nghệ Đối Soát Chưa Từng Có
        </h2>
        <p className="text-sm sm:text-base text-[#584045] mt-2.5 leading-relaxed">
          Giải quyết dứt điểm 2 bài toán đau đầu nhất: Độ tin cậy của AI khi đọc nét chữ xấu và hiện tượng trùng bill POS làm sai lệch sổ quỹ.
        </p>
      </div>

      {/* FEATURE SPOTLIGHT 1: Split-Screen & Traffic Light Control */}
      <div className="mb-20 glass-card rounded-3xl p-6 sm:p-10 border border-[#e1e3e4] shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#198754] uppercase tracking-wider flex items-center gap-1">
              TIÊU ĐIỂM 1
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#191c1d] mt-1">
              Đèn Giao Thông UX & Màn Hình Đối Chiếu Split-Screen
            </h3>
            <p className="text-xs sm:text-sm text-[#584045] mt-1 max-w-2xl">
              Nửa trên soi ảnh gốc chụp thực tế, nửa dưới hiển thị dữ liệu trích xuất kèm dán nhãn độ tin cậy bằng 3 màu đèn giao thông. Chạm sửa ngay trên thẻ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-[#584045] font-semibold bg-white px-3 py-1.5 rounded-xl border border-[#e1e3e4]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Xanh (Khớp 100%)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#584045] font-semibold bg-white px-3 py-1.5 rounded-xl border border-[#e1e3e4]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Vàng (Duyệt nhanh)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#584045] font-semibold bg-white px-3 py-1.5 rounded-xl border border-[#e1e3e4]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Đỏ (Mờ rách)
            </span>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Real Receipt Image */}
          <div className="lg:col-span-5 bg-[#e7e8e9] rounded-2xl p-5 shadow-sm border border-[#e1e3e4]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#198754]" />
                <span className="font-bold text-xs sm:text-sm text-[#191c1d]">Chứng từ gốc (Vựa Ba Cường)</span>
              </div>
              <button
                onClick={toggleZoom}
                className="text-xs bg-white px-2.5 py-1 rounded-lg text-[#584045] hover:text-[#191c1d] border border-[#e1e3e4] font-medium flex items-center gap-1 shadow-2xs transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{zoomLevel === 1 ? 'Phóng to soi chữ' : 'Thu nhỏ 1x'}</span>
              </button>
            </div>

            <TiltedCard maxAngle={6} scale={1.01} className="w-full">
              <div
                className="relative rounded-xl overflow-hidden shadow-inner h-84 sm:h-96 bg-[#edeeef] border border-white/60 cursor-pointer"
                onClick={toggleZoom}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNTjDMkeqMEaeQjZpRfcIF6E5p3EEJ-nM94FtSCMXtoWl3T3UsatHihHAWNxtcTbgiLn-nYuMG71zgG7C9DRGNsymt2zhTR9OX_XE0LPw2qDKxPpWvDo5F8KfY7RWOrZv0R64Ii3i-JJlRi7osjbVFXKmw5moeUMSED1wQkmSCZ6JPo_IHd-VjcgV9zbCmEB6qaeI3Vvc7N2chj19x4kefX74tjZtDdBbsr4UIaRU6H4zWamKmBBT2"
                  alt="Hóa đơn viết tay vựa sầu riêng"
                  referrerPolicy="no-referrer"
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="w-full h-full object-cover transition-transform duration-300"
                />

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#24282a]/90 backdrop-blur-md text-white flex items-center justify-between border border-white/10 shadow-lg text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gemini OCR bóc tách 3 dòng</span>
                  </span>
                  <span className="font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
                    1.8s
                  </span>
                </div>
              </div>
            </TiltedCard>
          </div>

          {/* Right Column: Traffic Light AI Cards */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            {/* High Confidence (Green #198754) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-sm border border-[#e1e3e4] relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#198754]" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#198754] text-[11px] font-extrabold uppercase">
                      TIỀN VÀO (THU)
                    </span>
                    <span className="text-xs font-semibold text-[#198754] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Độ tin cậy 99.8% (Xanh)
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#191c1d] mt-1">
                    Bán lẻ 3kg Sầu Riêng Ri6 (95k/kg)
                  </div>
                  <div className="text-xs text-[#584045]">
                    Loại: Hóa đơn lẻ chợ sớm • Đã loại trừ 50k nợ gối đầu
                  </div>
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
                        className="p-1 rounded bg-[#198754] text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-[#198754]">
                      +{greenValue.toLocaleString('vi-VN')} đ
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditingGreen(!isEditingGreen)}
                    className="text-xs text-[#584045] hover:text-[#198754] font-medium mt-1 underline decoration-dotted"
                  >
                    {isEditingGreen ? 'Lưu con số' : 'Chỉnh sửa 1-chạm'}
                  </button>
                </div>
              </div>
            </div>

            {/* Medium Confidence (Yellow / Amber #FFC107) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-sm border border-[#e1e3e4] relative overflow-hidden transition-all hover:shadow-md">
              <div
                className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  isConfirmedAmber ? 'bg-[#198754]' : 'bg-[#ffc107]'
                }`}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-[#dc3545] text-[11px] font-extrabold uppercase">
                      TIỀN RA (CHI)
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        isConfirmedAmber ? 'text-[#198754]' : 'text-amber-800'
                      }`}
                    >
                      {isConfirmedAmber ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#198754]" /> Đã xác nhận chuẩn xác
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Nét chữ hơi ngoáy (Vàng)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#191c1d] mt-1">
                    Nhập 50 Thùng Xốp Đóng Hàng
                  </div>
                  <div className="text-xs text-[#584045]">
                    Loại: Giấy than ghi tay • 07:15
                  </div>
                </div>

                <div className="text-right sm:self-center pl-2 flex flex-col items-end">
                  <div className="text-2xl font-black text-[#dc3545]">-450.000 đ</div>
                  <button
                    onClick={() => setIsConfirmedAmber(!isConfirmedAmber)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold mt-1 transition-all flex items-center gap-1 ${
                      isConfirmedAmber
                        ? 'bg-emerald-100 text-[#198754]'
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

            {/* Low Confidence Alert (Red #DC3545) */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#dc3545] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#dc3545]">
                    Chế độ Đèn Đỏ: Cảnh báo ảnh mờ/rách (Low Confidence)
                  </div>
                  <div className="text-xs text-rose-800 mt-0.5">
                    Hóa đơn rách mép hoặc thiếu sáng: AI tự động gợi ý chụp lại, không bao giờ đoán bừa số liệu.
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenScan}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0"
              >
                Chụp Lại Thử
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE SPOTLIGHT 2: Bidirectional Smart Deduplication Filter (Interactive Simulation) */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#e1e3e4] shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#b31f56] uppercase tracking-wider flex items-center gap-1">
              TIÊU ĐIỂM 2
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#191c1d] mt-1">
              Lưới Lọc Thông Minh 2 Chiều: Chống Trùng Bill Máy POS
            </h3>
            <p className="text-xs sm:text-sm text-[#584045] mt-1 max-w-2xl">
              Thử nghiệm tương tác bên dưới: Bật/tắt nút quét Báo Cáo POS Kết Ca để xem hệ thống tự động gạch bỏ các bill lẻ đã lưu, bảo vệ số dư thực thu không bị x2 doanh thu ảo.
            </p>
          </div>

          {/* Interactive Simulation Switch */}
          <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white border border-[#e1e3e4] shadow-xs">
            <span className="text-xs font-bold text-[#584045] pl-2">Mô phỏng:</span>
            <button
              onClick={() => setPosShiftReportScanned(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !posShiftReportScanned
                  ? 'bg-rose-100 text-[#dc3545] shadow-xs'
                  : 'text-[#584045] hover:text-[#191c1d]'
              }`}
            >
              Chưa Quét Báo Cáo POS
            </button>
            <button
              onClick={() => setPosShiftReportScanned(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                posShiftReportScanned
                  ? 'bg-[#198754] text-white shadow-xs'
                  : 'text-[#584045] hover:text-[#191c1d]'
              }`}
            >
              ✓ Đã Quét POS Kết Ca
            </button>
          </div>
        </div>

        {/* Interactive Visualization Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Bill Lẻ POS #102 */}
          <div
            className={`p-5 rounded-2xl transition-all border ${
              posShiftReportScanned
                ? 'bg-gray-100/80 border-gray-300 opacity-70'
                : 'bg-white border-[#e1e3e4] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#584045]">09:30 Sáng</span>
              {posShiftReportScanned ? (
                <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-[#198754]" /> MERGED (ĐÃ GỘP)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#198754] text-[10px] font-bold">
                  ĐỘC LẬP
                </span>
              )}
            </div>

            <div className={`text-sm font-bold ${posShiftReportScanned ? 'line-through text-gray-500' : 'text-[#191c1d]'}`}>
              Hóa đơn quẹt thẻ khách mua lẻ #102
            </div>
            <p className="text-xs text-[#584045] mt-1">
              Thanh toán máy POS cà thẻ bàn 4
            </p>

            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className={`text-base font-black ${posShiftReportScanned ? 'line-through text-gray-400' : 'text-emerald-600'}`}>
                +250.000 đ
              </span>
              <span className="text-[10px] text-[#584045]">
                {posShiftReportScanned ? 'Đã vào Báo Cáo POS' : 'Chưa đối soát'}
              </span>
            </div>
          </div>

          {/* Card 2: Khoản Chi Thật (Bảo tồn không bị gộp!) */}
          <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#584045]">14:15 Chiều</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-[#dc3545] text-[10px] font-bold">
                CHI PHÍ THẬT
              </span>
            </div>

            <div className="text-sm font-bold text-[#191c1d]">
              Tiền nước đá & tiền công bốc vác
            </div>
            <p className="text-xs text-[#584045] mt-1">
              Hóa đơn chi độc lập ngoài máy POS
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-base font-black text-[#dc3545]">
                -120.000 đ
              </span>
              <span className="text-[10px] text-[#198754] font-bold">
                ✓ Luôn bảo tồn 100%
              </span>
            </div>
          </div>

          {/* Card 3: Tờ Báo Cáo POS Kết Ca Cuối Ngày */}
          <div className={`p-5 rounded-2xl transition-all border ${
            posShiftReportScanned
              ? 'bg-gradient-to-br from-emerald-50 to-white border-[#198754] shadow-md ring-2 ring-[#198754]/20'
              : 'bg-white border-dashed border-gray-300 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#584045]">21:45 Đêm</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                posShiftReportScanned ? 'bg-[#198754] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                POS KẾT CA
              </span>
            </div>

            <div className="text-sm font-bold text-[#191c1d]">
              Tổng Kết Ca Máy POS Ngày
            </div>
            <p className="text-xs text-[#584045] mt-1">
              {posShiftReportScanned
                ? 'Đã bóc tách tổng thu và tự động gạch bỏ các hóa đơn lẻ bên trái.'
                : 'Chưa quét chứng từ kết ca'}
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-base font-black text-[#198754]">
                {posShiftReportScanned ? '+2.450.000 đ' : 'Chờ quét'}
              </span>
              <span className="text-[10px] font-bold text-[#198754]">
                {posShiftReportScanned ? 'Không trùng 1 xu' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation summary badge */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-[#e1e3e4] text-xs text-[#584045] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#198754] shrink-0" />
            <span>
              <strong>Nguyên tắc bảo vệ:</strong> Lưới lọc 2 chiều tự động gạch bỏ trạng thái MERGED với các hóa đơn thu POS, nhưng giữ nguyên 100% các hóa đơn chi ngoài POS để lợi nhuận luôn chuẩn xác.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
