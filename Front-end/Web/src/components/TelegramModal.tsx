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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#fff0f5]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff4783] text-white flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Kết Nối Bot Kế Toán Telegram</h3>
              <p className="text-xs text-slate-500">Tự động nhận báo cáo chốt ca 22h00 mỗi tối</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isLinked ? (
            <>
              {/* Telegram Preview Message Mockup */}
              <div className="p-4 rounded-2xl bg-[#fff0f5]/60 border border-[#ffd6e4] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#d0f81b] border border-[#bde412] flex items-center justify-center text-[10px] font-black text-slate-950">
                    V
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">VikeSo Accountant Bot</span>
                  <span className="text-[10px] text-slate-500 font-semibold">22:00</span>
                </div>
                <div className="text-xs text-slate-800 space-y-1 font-mono bg-white p-3 rounded-xl border border-[#ffd6e4] shadow-2xs">
                  <p className="text-[#b01755] font-extrabold">📊 BÁO CÁO CHỐT CA NGÀY HÔM NAY (22:00)</p>
                  <p>• Tiền vào (Thu): +15.450.000 đ (42 đơn)</p>
                  <p>• Tiền ra (Chi): -4.200.000 đ (Vật tư, bao bì)</p>
                  <p className="text-emerald-700 font-extrabold">👉 Thực thu tiền tươi: +11.250.000 đ</p>
                  <p className="text-slate-500 text-[11px] mt-1">Đã loại nợ gối đầu & gộp bill POS chống trùng.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Số điện thoại hoặc Telegram Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="VD: 0988 123 456 hoặc @chuvua_bacuong"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#ff4783] focus:bg-white"
                  />
                  <button
                    onClick={() => {
                      if (phoneNumber.trim()) setIsLinked(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black transition-all shadow-md shadow-[#ff4783]/25 cursor-pointer border border-[#ff4783]"
                  >
                    Kết Nối
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Shield className="w-3.5 h-3.5 text-[#ff4783]" />
                <span>Hoàn toàn miễn phí, hủy nhận báo cáo bất kỳ lúc nào</span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#d0f81b]/30 border border-[#bde412] text-slate-900 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">Kết Nối Thành Công!</h4>
                <p className="text-xs text-slate-600">
                  Bot @VikeSo_Bot đã được kích hoạt cho tài khoản của bạn. Báo cáo chốt ca đầu tiên sẽ được gửi lúc 22h00 tối nay.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-bold transition-colors cursor-pointer"
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
