import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, X, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessResult?: (item: any) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, onSuccessResult }) => {
  const [step, setStep] = useState<'camera' | 'processing' | 'result'>('camera');
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<'receipt' | 'carbon' | 'pos'>('receipt');

  const presets = {
    receipt: {
      title: 'Hóa đơn viết tay Vựa Sầu Riêng',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNTjDMkeqMEaeQjZpRfcIF6E5p3EEJ-nM94FtSCMXtoWl3T3UsatHihHAWNxtcTbgiLn-nYuMG71zgG7C9DRGNsymt2zhTR9OX_XE0LPw2qDKxPpWvDo5F8KfY7RWOrZv0R64Ii3i-JJlRi7osjbVFXKmw5moeUMSED1wQkmSCZ6JPo_IHd-VjcgV9zbCmEB6qaeI3Vvc7N2chj19x4kefX74tjZtDdBbsr4UIaRU6H4zWamKmBBT2',
      items: [
        { label: 'Sầu Riêng Ri6 (3kg x 95.000đ)', amount: 285000, type: 'thu', confidence: 99.8 },
        { label: 'Tiền bao bì, cọc thùng xốp', amount: 40000, type: 'thu', confidence: 98 },
      ],
      total: 325000,
    },
    carbon: {
      title: 'Phiếu thu than carbon Chợ Đầu Mối',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNTjDMkeqMEaeQjZpRfcIF6E5p3EEJ-nM94FtSCMXtoWl3T3UsatHihHAWNxtcTbgiLn-nYuMG71zgG7C9DRGNsymt2zhTR9OX_XE0LPw2qDKxPpWvDo5F8KfY7RWOrZv0R64Ii3i-JJlRi7osjbVFXKmw5moeUMSED1wQkmSCZ6JPo_IHd-VjcgV9zbCmEB6qaeI3Vvc7N2chj19x4kefX74tjZtDdBbsr4UIaRU6H4zWamKmBBT2',
      items: [
        { label: '50 Thùng xốp đóng hàng lớn', amount: 450000, type: 'chi', confidence: 91 },
        { label: 'Xăng xe ba gác chuyển hàng', amount: 150000, type: 'chi', confidence: 96 },
      ],
      total: 600000,
    },
    pos: {
      title: 'Phiếu POS kết ca chiều (Máy quẹt thẻ)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNTjDMkeqMEaeQjZpRfcIF6E5p3EEJ-nM94FtSCMXtoWl3T3UsatHihHAWNxtcTbgiLn-nYuMG71zgG7C9DRGNsymt2zhTR9OX_XE0LPw2qDKxPpWvDo5F8KfY7RWOrZv0R64Ii3i-JJlRi7osjbVFXKmw5moeUMSED1wQkmSCZ6JPo_IHd-VjcgV9zbCmEB6qaeI3Vvc7N2chj19x4kefX74tjZtDdBbsr4UIaRU6H4zWamKmBBT2',
      items: [
        { label: 'Tổng doanh thu quẹt thẻ POS kết ca', amount: 2450000, type: 'thu', confidence: 100 },
        { label: 'Đối chiếu hóa đơn lẻ: MERGED (Đã gộp)', amount: -250000, type: 'merged', confidence: 99.8 },
      ],
      total: 2200000,
    },
  };

  const handleStartScan = () => {
    setStep('processing');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('result');
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleReset = () => {
    setStep('camera');
    setScanProgress(0);
  };

  useEffect(() => {
    if (!isOpen) {
      setStep('camera');
      setScanProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentData = presets[selectedPreset];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d0f81b] flex items-center justify-center text-slate-950 shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>1-Chạm Bóc Tách Chứng Từ Thực Tế</span>
                <span className="text-[10px] bg-[#d0f81b]/20 text-[#d0f81b] font-bold px-2 py-0.5 rounded-full border border-[#d0f81b]/30">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">Đọc chữ viết tay • Lọc nợ gối đầu • Đối soát 2 chiều</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preset Selector */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700">
            <button
              onClick={() => {
                setSelectedPreset('receipt');
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPreset === 'receipt'
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Hóa Đơn Viết Tay
            </button>
            <button
              onClick={() => {
                setSelectedPreset('carbon');
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPreset === 'carbon'
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Giấy Than Mờ
            </button>
            <button
              onClick={() => {
                setSelectedPreset('pos');
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPreset === 'pos'
                  ? 'bg-[#d0f81b] text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Phiếu POS Kết Ca
            </button>
          </div>

          {/* Viewport Frame */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-slate-700 flex items-center justify-center group">
            <img
              src={currentData.img}
              alt={currentData.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Corner Framing Marks */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#d0f81b]" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#d0f81b]" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#d0f81b]" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#d0f81b]" />

            {/* Scanning Line Animation */}
            {step === 'processing' && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d0f81b] to-transparent shadow-[0_0_15px_#d0f81b]"
              />
            )}

            {/* Status overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d0f81b] animate-ping" />
              <span>{currentData.title}</span>
            </div>

            {step === 'camera' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={handleStartScan}
                  className="px-6 py-3 rounded-2xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-[#d0f81b]/30 hover:scale-105 transition-all flex items-center gap-2 ring-4 ring-[#d0f81b]/20 cursor-pointer border border-[#bde412]"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Bấm Bóc Tách 1-Chạm</span>
                </button>
              </div>
            )}
          </div>

          {/* Processing Indicator */}
          {step === 'processing' && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#d0f81b] font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Gemini Vision OCR đang quét nhận diện nét chữ &amp; lọc nợ...
                </span>
                <span className="font-tabular font-mono text-slate-300">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  className="h-full bg-[#d0f81b]"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results Display */}
          {step === 'result' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Dòng bóc tách chi tiết</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Xử lý hoàn tất trong 1.8s
                </span>
              </div>

              <div className="space-y-2">
                {currentData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {item.label}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                            item.confidence > 95
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {item.confidence}% tin cậy
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Phân loại: {item.type === 'thu' ? 'Tiền Vào (Doanh thu)' : item.type === 'chi' ? 'Tiền Ra (Chi phí)' : 'Đã gộp POS (Không tính 2 lần)'}
                      </div>
                    </div>
                    <div
                      className={`font-black text-sm font-tabular ${
                        item.type === 'thu'
                          ? 'text-emerald-400'
                          : item.type === 'chi'
                          ? 'text-rose-400'
                          : 'text-slate-500 line-through'
                      }`}
                    >
                      {item.type === 'thu' ? '+' : item.type === 'chi' ? '-' : ''}
                      {item.amount.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Tổng thực thu ghi nhận sổ quỹ:</span>
                <span className="text-base font-black text-emerald-400 font-tabular">
                  +{currentData.total.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Chụp lại mẫu khác
          </button>
          <button
            onClick={() => {
              if (onSuccessResult) onSuccessResult(currentData);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-[#bde412]"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" /> Đồng ý &amp; Lưu Sổ Quỹ
          </button>
        </div>
      </motion.div>
    </div>
  );
};

