import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, X, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#191c1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#24282a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#198754] flex items-center justify-center text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>1-Chạm Bóc Tách Chứng Từ Thực Tế</span>
                <span className="text-[10px] bg-[#198754]/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-white/60">Đọc chữ viết tay • Lọc nợ gối đầu • Đối soát 2 chiều</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preset Selector */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                setSelectedPreset('receipt');
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedPreset === 'receipt'
                  ? 'bg-[#198754] text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Hóa Đơn Viết Tay
            </button>
            <button
              onClick={() => {
                setSelectedPreset('carbon');
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedPreset === 'carbon'
                  ? 'bg-[#198754] text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Giấy Than Mờ
            </button>
            <button
              onClick={() => {
                setSelectedPreset('pos');
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedPreset === 'pos'
                  ? 'bg-[#198754] text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Phiếu POS Kết Ca
            </button>
          </div>

          {/* Viewport Frame */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-white/15 flex items-center justify-center group">
            <img
              src={currentData.img}
              alt={currentData.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Corner Framing Marks */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#198754]" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#198754]" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#198754]" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#198754]" />

            {/* Scanning Line Animation */}
            {step === 'processing' && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#198754] to-transparent shadow-[0_0_15px_#198754]"
              />
            )}

            {/* Status overlay */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{currentData.title}</span>
            </div>

            {step === 'camera' && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <button
                  onClick={handleStartScan}
                  className="px-6 py-3 rounded-2xl bg-[#198754] hover:bg-[#146c43] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#198754]/40 hover:scale-105 transition-all flex items-center gap-2 ring-4 ring-[#198754]/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bấm Bóc Tách 1-Chạm</span>
                </button>
              </div>
            )}
          </div>

          {/* Processing Indicator */}
          {step === 'processing' && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Gemini Vision OCR đang quét nhận diện nét chữ & lọc nợ...
                </span>
                <span className="font-mono text-white/80">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#198754] to-[#20c997]"
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
              <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                <span>Dòng bóc tách chi tiết</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Xử lý hoàn tất trong 1.8s
                </span>
              </div>

              <div className="space-y-2">
                {currentData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
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
                      <div className="text-xs text-white/50">
                        Phân loại: {item.type === 'thu' ? 'Tiền Vào (Doanh thu)' : item.type === 'chi' ? 'Tiền Ra (Chi phí)' : 'Đã gộp POS (Không tính 2 lần)'}
                      </div>
                    </div>
                    <div
                      className={`font-black text-sm ${
                        item.type === 'thu'
                          ? 'text-emerald-400'
                          : item.type === 'chi'
                          ? 'text-rose-400'
                          : 'text-white/50 line-through'
                      }`}
                    >
                      {item.type === 'thu' ? '+' : item.type === 'chi' ? '-' : ''}
                      {item.amount.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#24282a] border border-[#198754]/40 flex items-center justify-between">
                <span className="text-xs text-white/80 font-medium">Tổng thực thu ghi nhận sổ quỹ:</span>
                <span className="text-base font-black text-emerald-400">
                  +{currentData.total.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#24282a] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Chụp lại mẫu khác
          </button>
          <button
            onClick={() => {
              if (onSuccessResult) onSuccessResult(currentData);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Đồng ý & Lưu Sổ Quỹ
          </button>
        </div>
      </motion.div>
    </div>
  );
};
