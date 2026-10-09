import React, { useState } from 'react';
import { Check, Mail, Send, Phone, ShieldCheck, Heart } from 'lucide-react';

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
    <footer className="w-full bg-slate-50 border-t border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-[#d0f81b] p-1.5 flex items-center justify-center border border-[#bde412] shadow-md shadow-[#d0f81b]/20">
                <img
                  src="/logo.png"
                  alt="VikeSo Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                Vike<span className="text-slate-950 bg-[#d0f81b] px-1.5 py-0.5 rounded-lg border border-[#bde412] ml-1">So</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              <strong>VikeSo</strong> — Giải pháp công nghệ tài chính (FinTech) tinh gọn ứng dụng Google Gemini AI dành riêng cho Hộ kinh doanh vừa &amp; nhỏ (SME), cửa hàng bán lẻ và Thương lái Nông sản đầu mối.
            </p>

            <p className="text-xs text-slate-950 font-bold italic">
              “Chụp 1 giây – Đối soát cả ngày – Ngủ ngon 22h00 đêm”
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#d0f81b]/25 text-slate-950 border border-[#d0f81b]/50 text-[11px] font-black">
                Mã hóa SSL 256-bit
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold">
                Gemini Vision OCR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold">
                SME Certified
              </span>
            </div>
          </div>

          {/* Col 2: Tính năng & Sản phẩm */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tính Năng Nổi Bật
            </h4>
            <nav className="flex flex-col gap-2">
              <a href="#tinh-nang" className="text-xs text-slate-600 hover:text-slate-950 transition-colors">
                Giao diện 1-chạm (Zero-Friction)
              </a>
              <a href="#vu-khi-bi-mat" className="text-xs text-slate-600 hover:text-slate-950 transition-colors">
                Cơ chế Đèn Giao Thông UX
              </a>
              <a href="#vu-khi-bi-mat" className="text-xs text-slate-600 hover:text-slate-950 transition-colors">
                Lưới lọc 2 chiều chống trùng POS
              </a>
              <button
                onClick={onOpenScan}
                className="text-xs text-left text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              >
                Nhập lùi ngày linh hoạt
              </button>
              <button
                onClick={onOpenTelegram}
                className="text-xs text-left text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              >
                Bot Telegram Báo Cáo 22h00
              </button>
            </nav>
          </div>

          {/* Col 3: Hỗ trợ & Pháp lý */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hỗ Trợ &amp; Pháp Lý
            </h4>
            <nav className="flex flex-col gap-2">
              <a
                href="#faq"
                className="text-xs text-slate-600 hover:text-slate-950 transition-colors"
              >
                Hỏi đáp thường gặp (FAQ)
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Chính sách bảo mật: Dữ liệu tài chính của bạn được mã hóa riêng biệt chuẩn SSL 256-bit trên MongoDB Atlas Cloud và không chia sẻ cho bên thứ ba.');
                }}
                className="text-xs text-slate-600 hover:text-slate-950 transition-colors"
              >
                Chính sách bảo mật dữ liệu
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Điều khoản dịch vụ: Cam kết hoàn tiền và bảo vệ quyền sở hữu dữ liệu 100% cho chủ kinh doanh.');
                }}
                className="text-xs text-slate-600 hover:text-slate-950 transition-colors"
              >
                Điều khoản dịch vụ
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTelegram();
                }}
                className="text-xs text-slate-600 hover:text-slate-950 transition-colors"
              >
                Hỗ trợ kỹ thuật 24/7
              </a>
            </nav>
          </div>

          {/* Col 4: Cộng đồng & Đăng ký bản tin */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Kết Nối &amp; Tin Tức
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nhận mẹo quản trị dòng tiền và cập nhật giá nông sản chợ đầu mối hàng tuần.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#d0f81b] focus:ring-2 focus:ring-[#d0f81b]/30 shadow-2xs"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#d0f81b] hover:bg-[#c2ea14] text-slate-950 rounded-lg text-xs font-black transition-colors border border-[#bde412] cursor-pointer"
                >
                  Gửi
                </button>
              </div>
              {subscribed && (
                <div className="text-[11px] text-slate-900 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Đăng ký nhận tin thành công!</span>
                </div>
              )}
            </form>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenTelegram}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:border-slate-400 transition-colors cursor-pointer"
                title="Telegram Bot"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:border-slate-400 transition-colors cursor-pointer"
                title="Đăng nhập tài khoản"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2024–2026 VikeSo FinTech Inc. Mọi quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-1">
            <span>Thiết kế vì người buôn bán Việt Nam với</span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#d0f81b] mx-1" />
            <span>và Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
