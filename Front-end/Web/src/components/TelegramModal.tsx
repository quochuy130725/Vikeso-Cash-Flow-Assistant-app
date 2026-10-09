import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, X, Bell, Shield, Smartphone, Bot } from 'lucide-react';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  if (!isOpen) return null;

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
            <div className="w-8 h-8 rounded-xl bg-[#0088cc] text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Kết Nối Bot Kế Toán Telegram</h3>
              <p className="text-xs text-white/60">Tự động nhận báo cáo chốt ca 22h00 mỗi tối</p>
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
          {!isLinked ? (
            <>
              {/* Telegram Preview Message Mockup */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#d0f81b] flex items-center justify-center text-[10px] font-black text-slate-950">
                    V
                  </div>
                  <span className="text-xs font-bold text-white">VikeSo Accountant Bot</span>
                  <span className="text-[10px] text-white/40">22:00</span>
                </div>
                <div className="text-xs text-white/90 space-y-1 font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[#d0f81b] font-bold">📊 BÁO CÁO CHỐT CA NGÀY HÔM NAY (22:00)</p>
                  <p>• Tiền vào (Thu): +15.450.000 đ (42 đơn)</p>
                  <p>• Tiền ra (Chi): -4.200.000 đ (Vật tư, bao bì)</p>
                  <p className="text-[#d0f81b] font-bold">👉 Thực thu tiền tươi: +11.250.000 đ</p>
                  <p className="text-white/60 text-[11px] mt-1">Đã loại nợ gối đầu & gộp bill POS chống trùng.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80">Số điện thoại hoặc Telegram Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="VD: 0988 123 456 hoặc @chuvua_bacuong"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#d0f81b]"
                  />
                  <button
                    onClick={() => {
                      if (phoneNumber.trim()) setIsLinked(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#d0f81b] text-slate-950 text-xs font-black hover:bg-[#c2ea14] transition-colors shadow-sm cursor-pointer"
                  >
                    Kết Nối
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/60 pt-2">
                <Shield className="w-3.5 h-3.5 text-[#d0f81b]" />
                <span>Hoàn toàn miễn phí, hủy nhận báo cáo bất kỳ lúc nào</span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#d0f81b]/20 text-[#d0f81b] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Kết Nối Thành Công!</h4>
                <p className="text-xs text-white/70">
                  Bot @VikeSo_Bot đã được kích hoạt cho tài khoản của bạn. Báo cáo chốt ca đầu tiên sẽ được gửi lúc 22h00 tối nay.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
              >
                Hoàn Tất
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
