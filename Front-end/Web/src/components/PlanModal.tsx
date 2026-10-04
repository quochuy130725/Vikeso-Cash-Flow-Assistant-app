import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Rocket, ShieldCheck, Zap } from 'lucide-react';

interface PlanModalProps {
  plan: 'starter' | 'pro' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ plan, onClose, onSuccess }) => {
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCompleted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setCompleted(false);
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-[#191c1d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#24282a]">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              plan === 'pro' ? 'bg-[#059669] text-white shadow-md' : 'bg-white/10 text-white'
            }`}>
              {plan === 'pro' ? <Rocket className="w-4 h-4" /> : <Zap className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {plan === 'pro' ? 'Đăng Ký Gói PRO (99.000 đ/tháng)' : 'Bắt Đầu Gói STARTER Miễn Phí'}
              </h3>
              <p className="text-xs text-white/60">Kích hoạt tài khoản quản trị dòng tiền VikeSo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!completed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Tên Hộ kinh doanh / Cửa hàng / Vựa nông sản
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="VD: Vựa Sầu Riêng Ba Cường"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#059669] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Số điện thoại Zalo / Telegram nhận báo cáo 22h00
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0988 888 999"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#059669] transition-colors"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1 text-white/80">
                <div className="flex justify-between font-semibold">
                  <span>Gói lựa chọn:</span>
                  <span className={plan === 'pro' ? 'text-emerald-400 font-bold' : 'text-white'}>
                    {plan === 'pro' ? 'Gói PRO (99.000 đ/tháng)' : 'Gói STARTER (0 đ vĩnh viễn)'}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Thời gian kích hoạt:</span>
                  <span className="text-emerald-300">Ngay tức thì</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md bg-[#059669] hover:bg-[#047857] text-white shadow-[#059669]/30 active:scale-95"
              >
                {isSubmitting ? (
                  <span>Đang thiết lập hệ thống...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Kích Hoạt 1-Chạm</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-white/50">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Không cần thẻ tín dụng • Hủy bất kỳ lúc nào</span>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Đã Kích Hoạt Thành Công!</h4>
              <p className="text-xs text-white/70">
                Hệ thống đối soát VikeSo đã sẵn sàng cho cửa hàng của bạn. Đang đồng bộ hóa...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
