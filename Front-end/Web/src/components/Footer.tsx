import React, { useState } from 'react';
import { Check, Mail, Send, Phone, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenTelegram: () => void;
  onOpenScan: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTelegram, onOpenScan, onOpenAuth }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#f3f4f5] border-t border-[#e1e3e4]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-14 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#198754] to-[#0f5132] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-[22px]">insights</span>
              </div>
              <span className="text-2xl font-black text-[#191c1d] tracking-tight">
                Vike<span className="text-[#b31f56]">So</span>
              </span>
            </div>

            <p className="text-xs text-[#584045] max-w-sm leading-relaxed">
              <strong>VikeSo</strong> — Giải pháp công nghệ tài chính (FinTech) tinh gọn ứng dụng Google Gemini AI dành riêng cho Hộ kinh doanh vừa & nhỏ (SME), cửa hàng bán lẻ và Thương lái Nông sản đầu mối.
            </p>

            <p className="text-xs text-[#198754] font-bold italic">
              “Chụp 1 giây – Đối soát cả ngày – Ngủ ngon 22h00 đêm”
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#198754]/10 text-[#198754] border border-[#198754]/20 text-[11px] font-bold">
                Mã hóa SSL 256-bit
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#b31f56]/10 text-[#b31f56] border border-[#b31f56]/20 text-[11px] font-bold">
                Gemini Vision OCR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e1e3e4] text-[#584045] text-[11px] font-semibold">
                SME Certified
              </span>
            </div>
          </div>

          {/* Col 2: Tính năng & Sản phẩm */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#191c1d] uppercase tracking-wider">
              Tính Năng Nổi Bật
            </h4>
            <nav className="flex flex-col gap-2">
              <a href="#tinh-nang" className="text-xs text-[#584045] hover:text-[#198754] transition-colors">
                Giao diện 1-chạm (Zero-Friction)
              </a>
              <a href="#vu-khi-bi-mat" className="text-xs text-[#584045] hover:text-[#198754] transition-colors">
                Cơ chế Đèn Giao Thông UX
              </a>
              <a href="#vu-khi-bi-mat" className="text-xs text-[#584045] hover:text-[#198754] transition-colors">
                Lưới lọc 2 chiều chống trùng POS
              </a>
              <button
                onClick={onOpenScan}
                className="text-xs text-left text-[#584045] hover:text-[#198754] transition-colors"
              >
                Nhập lùi ngày linh hoạt
              </button>
              <button
                onClick={onOpenTelegram}
                className="text-xs text-left text-[#584045] hover:text-[#198754] transition-colors"
              >
                Bot Telegram Báo Cáo 22h00
              </button>
            </nav>
          </div>

          {/* Col 3: Hỗ trợ & Pháp lý */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#191c1d] uppercase tracking-wider">
              Hỗ Trợ & Pháp Lý
            </h4>
            <nav className="flex flex-col gap-2">
              <a
                href="#faq"
                className="text-xs text-[#584045] hover:text-[#198754] transition-colors"
              >
                Hỏi đáp thường gặp (FAQ)
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Chính sách bảo mật: Dữ liệu tài chính của bạn được mã hóa riêng biệt chuẩn SSL 256-bit trên MongoDB Atlas Cloud và không chia sẻ cho bên thứ ba.');
                }}
                className="text-xs text-[#584045] hover:text-[#198754] transition-colors"
              >
                Chính sách bảo mật dữ liệu
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Điều khoản dịch vụ: Cam kết hoàn tiền và bảo vệ quyền sở hữu dữ liệu 100% cho chủ kinh doanh.');
                }}
                className="text-xs text-[#584045] hover:text-[#198754] transition-colors"
              >
                Điều khoản dịch vụ
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTelegram();
                }}
                className="text-xs text-[#584045] hover:text-[#198754] transition-colors"
              >
                Hỗ trợ kỹ thuật 24/7
              </a>
            </nav>
          </div>

          {/* Col 4: Cộng đồng & Đăng ký bản tin */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#198754] uppercase tracking-wider">
              Kết Nối & Tin Tức
            </h4>
            <p className="text-xs text-[#584045] leading-relaxed">
              Nhận mẹo quản trị dòng tiền và cập nhật giá nông sản chợ đầu mối hàng tuần.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e1e3e4] text-[#191c1d] text-xs placeholder:text-[#584045]/60 focus:outline-none focus:border-[#198754]"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-[#198754] hover:bg-[#146c43] text-white text-xs font-bold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã nhận thông tin!</span>
                  </>
                ) : (
                  <span>Đăng ký bản tin</span>
                )}
              </button>
            </form>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenTelegram}
                title="Kênh Telegram"
                className="w-8 h-8 rounded-xl bg-[#0088cc] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
              <button
                onClick={() => alert('Liên hệ hotline Zalo hỗ trợ kỹ thuật: 0988 123 456')}
                title="Hỗ trợ Zalo"
                className="px-2.5 py-1.5 rounded-xl bg-[#0068ff] text-white text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <span>Zalo Hỗ Trợ</span>
              </button>
              <button
                onClick={() => alert('Fanpage Facebook: VikeSo - Trợ lý dòng tiền AI')}
                title="Facebook"
                className="px-2.5 py-1.5 rounded-xl bg-[#1877f2] text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
              >
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="w-full pt-6 border-t border-[#e1e3e4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#584045]">
          <p>© 2026 VikeSo Technologies. Bản quyền đã được bảo hộ toàn diện.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px]">
              Thiết kế dành cho <Heart className="w-3.5 h-3.5 text-[#b31f56] fill-[#b31f56]" /> Hộ kinh doanh & Thương lái Việt Nam
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
