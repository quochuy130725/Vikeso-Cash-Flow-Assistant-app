import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, ArrowDownLeft, ArrowUpRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface BackdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { date: string; amount: number; label: string; type: 'thu' | 'chi' }) => void;
}

export const BackdateModal: React.FC<BackdateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Get yesterday's date formatted as YYYY-MM-DD
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(yesterdayStr);
  const [type, setType] = useState<'thu' | 'chi'>('chi');
  const [label, setLabel] = useState('Tiền mua bao tải & dây buộc (hôm qua mới nhớ)');
  const [amount, setAmount] = useState('180000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      setTimeout(() => {
        onSuccess({
          date,
          amount: Number(amount) || 180000,
          label,
          type,
        });
        onClose();
        setIsDone(false);
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#191c1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#24282a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d0f81b] text-slate-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Nhập Thủ Công Lùi Ngày</h3>
              <p className="text-xs text-white/60">Bổ sung giao dịch cũ • Chống sai lệch ca hôm nay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isDone ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switch */}
              <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setType('thu')}
                  className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'thu'
                      ? 'bg-[#d0f81b] text-slate-950 shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Tiền Vào (Thu)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('chi')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'chi'
                      ? 'bg-[#dc3545] text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Tiền Ra (Chi)</span>
                </button>
              </div>

              {/* Date Picker with future lock */}
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Chọn ngày phát sinh giao dịch <span className="text-[#d0f81b] font-bold">* (Khóa ngày mai)</span>
                </label>
                <input
                  type="date"
                  required
                  max={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#d0f81b] transition-colors"
                />
              </div>

              {/* Content label */}
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Lý do / Nội dung khoản tiền
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="VD: Trả tiền nước đá hôm qua"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#d0f81b] transition-colors"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="180000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-[#d0f81b] transition-colors"
                />
              </div>

              {/* Safety Constraint Note */}
              <div className="p-3 rounded-xl bg-[#d0f81b]/10 border border-[#d0f81b]/20 text-[11px] text-white/90 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#d0f81b] mt-0.5" />
                <span>
                  <strong>Cơ chế chống ô nhiễm dữ liệu:</strong> Khoản tiền lùi ngày này sẽ chỉ cộng vào sổ quỹ ngày <strong>{date}</strong>, tuyệt đối không tính vào ca hôm nay.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 font-black text-xs flex items-center justify-center gap-2 border border-[#bde412] shadow-lg shadow-[#d0f81b]/20 transition-all active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Đang ghi nhận vào sổ cũ...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Lưu Vào Sổ Quỹ Ngày {date}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Đã Ghi Nhận Thành Công!</h4>
              <p className="text-xs text-white/70">
                Khoản {type === 'thu' ? 'thu' : 'chi'} {Number(amount).toLocaleString('vi-VN')} đ đã được lưu vào ngày {date} mà không làm lệch ca hôm nay.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
