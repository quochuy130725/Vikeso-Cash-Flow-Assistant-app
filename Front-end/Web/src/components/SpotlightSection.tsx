import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Info,
  ZoomIn,
  Check,
  Sparkles,
  ShieldCheck,
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

  // Spotlight 3: ROI Calculator state
  const [dailyBills, setDailyBills] = useState(35);
  const savedHoursMonth = Math.round((dailyBills * 2.5 * 30) / 60);
  const savedMoneyMonth = (dailyBills * 30 * 12500).toLocaleString('vi-VN');

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.35 : 1));
  };

  return (
    <section id="vu-khi-bi-mat" className="w-full bg-slate-50/80 py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-[#B31F56] text-xs uppercase font-extrabold tracking-wider inline-flex items-center gap-1.5 border border-rose-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5C8D]" />
          Vũ Khí Bí Mật Độc Quyền
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Khám Phá 2 Công Nghệ Đối Soát Chưa Từng Có
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
          Giải quyết dứt điểm 2 bài toán đau đầu nhất: Độ tin cậy của AI khi đọc nét chữ xấu và hiện tượng trùng bill POS làm sai lệch sổ quỹ.
        </p>
      </div>

      {/* FEATURE SPOTLIGHT 1: Split-Screen & Traffic Light Control */}
      <div className="mb-14 glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#B31F56] uppercase tracking-wider flex items-center gap-1">
              TIÊU ĐIỂM 1
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Đèn Giao Thông UX &amp; Màn Hình Đối Chiếu Split-Screen
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Nửa trên soi ảnh gốc chụp thực tế, nửa dưới hiển thị dữ liệu trích xuất kèm dán nhãn độ tin cậy bằng 3 màu đèn giao thông. Chạm sửa ngay trên thẻ.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Xanh (Khớp 100%)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Vàng (Duyệt nhanh)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Đỏ (Mờ rách)
            </span>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Real Receipt Image */}
          <div className="lg:col-span-5 bg-slate-100/90 rounded-2xl p-5 shadow-2xs border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">Chứng từ gốc (Vựa Ba Cường)</span>
              </div>
              <button
                onClick={toggleZoom}
                className="text-xs bg-white px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 border border-slate-200 font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                <span>{zoomLevel === 1 ? 'Phóng to soi chữ' : 'Thu nhỏ 1x'}</span>
              </button>
            </div>

            <TiltedCard maxAngle={6} scale={1.01} className="w-full">
              <div
                className="relative rounded-xl overflow-hidden shadow-inner h-84 sm:h-96 bg-slate-200 border border-white/60 cursor-pointer"
                onClick={toggleZoom}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNTjDMkeqMEaeQjZpRfcIF6E5p3EEJ-nM94FtSCMXtoWl3T3UsatHihHAWNxtcTbgiLn-nYuMG71zgG7C9DRGNsymt2zhTR9OX_XE0LPw2qDKxPpWvDo5F8KfY7RWOrZv0R64Ii3i-JJlRi7osjbVFXKmw5moeUMSED1wQkmSCZ6JPo_IHd-VjcgV9zbCmEB6qaeI3Vvc7N2chj19x4kefX74tjZtDdBbsr4UIaRU6H4zWamKmBBT2"
                  alt="Hóa đơn viết tay vựa sầu riêng"
                  referrerPolicy="no-referrer"
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="w-full h-full object-cover transition-transform duration-300"
                />

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md text-white flex items-center justify-between border border-white/10 shadow-lg text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gemini OCR bóc tách 3 dòng</span>
                  </span>
                  <span className="font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded font-tabular">
                    1.8s
                  </span>
                </div>
              </div>
            </TiltedCard>
          </div>

          {/* Right Column: Traffic Light AI Cards */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            {/* High Confidence (Green) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-2xs border border-slate-200 relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-600" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-extrabold uppercase border border-emerald-200">
                      TIỀN VÀO (THU)
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Độ tin cậy 99.8% (Xanh)
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    Bán lẻ 3kg Sầu Riêng Ri6 (95k/kg)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
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
                        className="w-28 px-2 py-1 text-sm border rounded bg-slate-50 text-right font-bold font-tabular text-slate-900 border-slate-300 focus:outline-emerald-600"
                      />
                      <button
                        onClick={() => setIsEditingGreen(false)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-emerald-600 font-tabular">
                      +{greenValue.toLocaleString('vi-VN')} đ
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditingGreen(!isEditingGreen)}
                    className="text-xs text-slate-500 hover:text-emerald-700 font-medium mt-1 underline decoration-dotted cursor-pointer transition-colors"
                  >
                    {isEditingGreen ? 'Lưu con số' : 'Chỉnh sửa 1-chạm'}
                  </button>
                </div>
              </div>
            </div>

            {/* Medium Confidence (Yellow / Amber) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-2xs border border-slate-200 relative overflow-hidden transition-all hover:shadow-md">
              <div
                className={`absolute left-0 top-0 bottom-0 w-2 ${
                  isConfirmedAmber ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] font-extrabold uppercase border border-rose-200">
                      TIỀN RA (CHI)
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        isConfirmedAmber ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {isConfirmedAmber ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã xác nhận chuẩn xác
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Nét chữ hơi ngoáy (Vàng)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    Nhập 50 Thùng Xốp Đóng Hàng
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Loại: Giấy than ghi tay • 07:15
                  </div>
                </div>

                <div className="text-right sm:self-center pl-2 flex flex-col items-end">
                  <div className="text-2xl font-black text-rose-600 font-tabular">-450.000 đ</div>
                  <button
                    onClick={() => setIsConfirmedAmber(!isConfirmedAmber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold mt-1 transition-all flex items-center gap-1 cursor-pointer ${
                      isConfirmedAmber
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
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

            {/* Low Confidence Alert (Red) */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-700">
                    Chế độ Đèn Đỏ: Cảnh báo ảnh mờ/rách (Low Confidence)
                  </div>
                  <div className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                    Hóa đơn rách mép hoặc thiếu sáng: AI tự động gợi ý chụp lại, không bao giờ đoán bừa số liệu.
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenScan}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                Chụp Lại Thử
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE SPOTLIGHT 2: Bidirectional Smart Deduplication Filter (Interactive Simulation) */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              TIÊU ĐIỂM 2
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Lưới Lọc Thông Minh 2 Chiều: Chống Trùng Bill Máy POS
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Thử nghiệm tương tác bên dưới: Bật/tắt nút quét Báo Cáo POS Kết Ca để xem hệ thống tự động gạch bỏ các bill lẻ đã lưu, bảo vệ số dư thực thu không bị x2 doanh thu ảo.
            </p>
          </div>

          {/* Interactive Simulation Switch */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 pl-2">Mô phỏng:</span>
            <button
              onClick={() => setPosShiftReportScanned(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !posShiftReportScanned
                  ? 'bg-rose-100 text-rose-800 shadow-2xs border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa Quét Báo Cáo POS
            </button>
            <button
              onClick={() => setPosShiftReportScanned(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                posShiftReportScanned
                  ? 'bg-gradient-to-r from-[#B31F56] to-[#FF5C8D] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-slate-100/80 border-slate-300 opacity-75'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500">09:30 Sáng</span>
              {posShiftReportScanned ? (
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-emerald-600" /> MERGED (ĐÃ GỘP)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  ĐỘC LẬP
                </span>
              )}
            </div>

            <div className={`text-sm font-bold ${posShiftReportScanned ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              Hóa đơn quẹt thẻ khách mua lẻ #102
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Thanh toán máy POS cà thẻ bàn 4
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className={`text-base font-black font-tabular ${posShiftReportScanned ? 'line-through text-slate-400' : 'text-emerald-600'}`}>
                +250.000 đ
              </span>
              <span className="text-[10px] text-slate-500">
                {posShiftReportScanned ? 'Đã vào Báo Cáo POS' : 'Chưa đối soát'}
              </span>
            </div>
          </div>

          {/* Card 2: Khoản Chi Thật (Bảo tồn không bị gộp!) */}
          <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500">14:15 Chiều</span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                CHI PHÍ THẬT
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900">
              Tiền nước đá &amp; tiền công bốc vác
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hóa đơn chi độc lập ngoài máy POS
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-base font-black text-rose-600 font-tabular">
                -120.000 đ
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">
                ✓ Luôn bảo tồn 100%
              </span>
            </div>
          </div>

          {/* Card 3: Tờ Báo Cáo POS Kết Ca Cuối Ngày */}
          <div className={`p-5 rounded-2xl transition-all border ${
            posShiftReportScanned
              ? 'bg-gradient-to-br from-emerald-50/70 to-white border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-dashed border-slate-300 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500">21:45 Đêm</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                posShiftReportScanned ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                POS KẾT CA
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900">
              Tổng Kết Ca Máy POS Ngày
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {posShiftReportScanned
                ? 'Đã bóc tách tổng thu và tự động gạch bỏ các hóa đơn lẻ bên trái.'
                : 'Chưa quét chứng từ kết ca'}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-base font-black text-emerald-600 font-tabular">
                {posShiftReportScanned ? '+2.450.000 đ' : 'Chờ quét'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                {posShiftReportScanned ? 'Không trùng 1 xu' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation summary badge */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="leading-relaxed">
              <strong className="text-slate-900">Nguyên tắc bảo vệ:</strong> Lưới lọc 2 chiều tự động gạch bỏ trạng thái MERGED với các hóa đơn thu POS, nhưng giữ nguyên 100% các hóa đơn chi ngoài POS để lợi nhuận luôn chuẩn xác.
            </span>
          </div>
        </div>
      </div>

      {/* FEATURE SPOTLIGHT 3: INTERACTIVE ROI CALCULATOR */}
      <div className="mb-14 glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#B31F56] uppercase tracking-wider flex items-center gap-1">
              TIÊU ĐIỂM 3 • TÍNH TOÁN HIỆU QUẢ ĐẦU TƯ
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Ước Tính Lợi Ích &amp; Thời Gian Tiết Kiệm Cho Hộ Kinh Doanh
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Kéo thanh trượt theo lượng hóa đơn mỗi ngày tại cửa hàng của bạn để xem lượng thời gian và tiền bạc VikeSo có thể giúp bạn bảo toàn.
            </p>
          </div>
        </div>

        {/* ROI Calculator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          {/* Slider input */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Số hóa đơn phát sinh trung bình mỗi ngày:</span>
              <span className="text-xl font-extrabold text-[#B31F56] font-mono bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                {dailyBills} hóa đơn / ngày
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={dailyBills}
              onChange={(e) => setDailyBills(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#B31F56]"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>10 bill (Tiệm nhỏ)</span>
              <span>75 bill (Quán cafe/sạp chợ)</span>
              <span>150 bill (Vựa đông khách)</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              * Ước tính dựa trên khảo sát thực tế: Mỗi hóa đơn ghi chép và đối chiếu thủ công tốn trung bình 2.5 phút và có tỷ lệ nhầm lẫn thất thoát từ 1 - 2% tổng doanh thu.
            </p>
          </div>

          {/* Real-time calculated benefits */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#B31F56] uppercase tracking-wider">
                Thời gian tiết kiệm mỗi tháng
              </span>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-black text-[#B31F56] font-mono">
                  ~{savedHoursMonth} Giờ
                </span>
              </div>
              <span className="text-xs text-[#B31F56]">
                Tương đương hơn <strong>{Math.round(savedHoursMonth / 8)} ngày làm việc</strong> để nghỉ ngơi cùng gia đình.
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                Tránh thất thoát sai lệch sổ
              </span>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">
                  ~{savedMoneyMonth} đ
                </span>
                <span className="text-xs text-indigo-600 block mt-0.5">/ tháng</span>
              </div>
              <span className="text-xs text-indigo-700">
                Đầu tư gói Pro 99k/tháng mang lại giá trị hoàn vốn gấp <strong>hàng chục lần</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE SPOTLIGHT 4: REALISTIC USE CASES */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#B31F56] uppercase tracking-wider px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5C8D]" />
            Kịch Bản Thực Tế
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            VikeSo Giải Quyết Bài Toán Của Từng Mô Hình Ra Sao?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Không cần thay đổi thói quen buôn bán hiện tại. VikeSo thích ứng linh hoạt với cách bạn làm việc mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Use Case 1: Vựa nông sản */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B31F56] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">agriculture</span>
              </div>
              <h4 className="font-bold text-base text-slate-900">Vựa Nông Sản &amp; Chợ Đầu Mối</h4>
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p><strong>Thực trạng:</strong> Giao dịch tiền mặt liên tục, hóa đơn cân hàng viết tay ngoáy vội, khách nợ gối đầu hẹn trả mai.</p>
                <p><strong>VikeSo giải quyết:</strong> Chụp ảnh phiếu cân hoặc sổ nợ, AI tự bóc tách số tiền khách trả trước vào "Tiền Vào", ghi chú phần nợ riêng để không ghi nhận lãi ảo.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-[#B31F56]">
              ✓ Tiết kiệm 45 phút cộng sổ đêm
            </div>
          </div>

          {/* Use Case 2: Quán F&B */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">local_cafe</span>
              </div>
              <h4 className="font-bold text-base text-slate-900">Quán Ăn &amp; Cafe (F&amp;B)</h4>
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p><strong>Thực trạng:</strong> Khách trả tiền mặt lẫn quét mã QR POS. Cuối ngày nhân viên in bill kết ca dễ bị cộng trùng 2 lần.</p>
                <p><strong>VikeSo giải quyết:</strong> Quét hóa đơn tổng POS kết ca, hệ thống tự động gạch bỏ toàn bộ bill lẻ trong ca, giữ nguyên hóa đơn chi mua đá, rau, trứng.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-700">
              ✓ Chặn đứng 100% doanh thu ảo kép
            </div>
          </div>

          {/* Use Case 3: Tiệm tạp hóa */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
              </div>
              <h4 className="font-bold text-base text-slate-900">Tiệm Tạp Hóa &amp; Bán Lẻ Gia Đình</h4>
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p><strong>Thực trạng:</strong> Hàng trăm hóa đơn nhập hàng in nhiệt mờ dần sau vài tuần, khó tra cứu khi cần kiểm tra giá vốn.</p>
                <p><strong>VikeSo giải quyết:</strong> Số hóa vĩnh viễn hóa đơn lên đám mây bảo mật, tự động gửi báo cáo thu chi mỗi đêm 22h00 về điện thoại của cả gia đình.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-teal-700">
              ✓ Không lo bay màu hóa đơn nhiệt
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


