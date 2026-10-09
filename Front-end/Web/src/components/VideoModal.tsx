import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Play, Pause, RotateCcw, CheckCircle, Volume2, ShieldCheck } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-[#191c1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#2e3132]/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dce944] animate-ping" />
            <h3 className="font-bold text-sm text-white">Video Trải Nghiệm Thực Tế (60 Giây)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Display Container */}
        <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden group">
          {/* Simulated Screen Content */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#191c1d] via-[#2e3132] to-[#191c1d] flex flex-col p-6 justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
                <span className="font-bold text-[#d0f81b]">VikeSo App</span>
                <span className="text-white/40">|</span>
                <span className="text-white/80">Quy trình thực tế tại Vựa Sầu Riêng Ba Cường</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                  HD 1080p
                </span>
              </div>
            </div>

            {/* Video Active Step Visual */}
            <div className="my-auto text-center space-y-3">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
              >
                {activeStep === 1 && (
                  <div className="space-y-2">
                    <span className="text-[#d0f81b] text-xs font-bold uppercase tracking-wider">
                      Bước 1: Chụp 1-Chạm
                    </span>
                    <h4 className="text-lg font-bold text-white">Bấm nút tròn giữa màn hình</h4>
                    <p className="text-xs text-white/70">
                      Camera góc rộng tự cân bằng sáng, bắt trọn hóa đơn viết tay dù chữ nghệch ngoạc.
                    </p>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="space-y-2">
                    <span className="text-[#d0f81b] text-xs font-bold uppercase tracking-wider">
                      Bước 2: AI Bóc Tách & Lọc Trùng
                    </span>
                    <h4 className="text-lg font-bold text-white">Gemini OCR bóc tách dưới 2 giây</h4>
                    <p className="text-xs text-white/70">
                      Phân tách tiền thu, chi phí bao bì, cọc thùng; kiểm tra bill quẹt thẻ chống cộng dồn 2 lần.
                    </p>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="space-y-2">
                    <span className="text-[#d0f81b] text-xs font-bold uppercase tracking-wider">
                      Bước 3: Báo Cáo Telegram 22h00
                    </span>
                    <h4 className="text-lg font-bold text-white">Gửi tổng kết tức thì vào Telegram</h4>
                    <p className="text-xs text-white/70">
                      Chủ vựa không cần mở app, điện thoại rung báo số dư thực thu, tiền mặt và công nợ mỗi tối.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Step indicator buttons */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveStep(s)}
                    className={`h-2 rounded-full transition-all ${
                      activeStep === s ? 'w-8 bg-[#d0f81b]' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Video Controls bar */}
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-[#d0f81b] text-slate-950 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="text-xs text-white/80 font-mono">
                  {activeStep === 1 ? '00:18' : activeStep === 2 ? '00:39' : '00:58'} / 01:00
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex-1 mx-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d0f81b] transition-all duration-300"
                  style={{ width: `${(activeStep / 3) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Volume2 className="w-4 h-4" />
                <span>Tiếng Việt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#2e3132]/60 flex items-center justify-between">
          <div className="text-xs text-white/70 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Hơn 2.400+ chủ vựa & cửa hàng đang sử dụng hàng ngày
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
