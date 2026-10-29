import React, { useState } from 'react';
import { Check, Mail, Send, Phone, ShieldCheck, Heart, X } from 'lucide-react';

interface FooterProps {
  onOpenTelegram: () => void;
  onOpenScan: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTelegram, onOpenScan, onOpenAuth }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-white/75 backdrop-blur-xl border-t border-white/50">
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
                Vike<span className="text-[#ff4783]">So</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              <strong>VikeSo</strong> — Sổ thu chi thông minh giúp hộ kinh doanh, tiệm buôn bán và chủ vựa nông sản quản lý tiền bạc nhẹ nhàng, thảnh thơi ngủ ngon mỗi tối.
            </p>

            <p className="text-xs text-slate-950 font-bold italic">
              “Chụp 1 giây – Đối soát cả ngày – Ngủ ngon 22h00 đêm”
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#d0f81b]/25 text-slate-950 border border-[#d0f81b]/50 text-[11px] font-black">
                Bảo mật thông tin 100%
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold">
                Đọc hóa đơn tự động
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold">
                Dễ dùng cho tiểu thương
              </span>
            </div>
          </div>

          {/* Col 2: Tính năng & Sản phẩm */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tiện Ích Nổi Bật
            </h3>
            <nav className="flex flex-col gap-2">
              <a href="#tinh-nang" className="text-xs text-slate-600 hover:text-slate-950 transition-colors">
                Chụp hình tự động vào sổ
              </a>
              <a href="#tinh-nang" className="text-xs text-slate-600 hover:text-slate-950 transition-colors">
                Phân loại Thu - Chi rõ ràng
              </a>
              <a href="#cach-hoat-dong" className="text-xs text-slate-600 hover:text-slate-950 transition-colors">
                Tự động chống cộng trùng bill POS
              </a>
              <button
                onClick={onOpenScan}
                className="text-xs text-left text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              >
                Nhập bù ngày đã qua
              </button>
              <button
                onClick={onOpenTelegram}
                className="text-xs text-left text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              >
                Báo cáo tối 22h00 (Telegram)
              </button>
            </nav>
          </div>

          {/* Col 3: Hỗ trợ & Pháp lý */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hỗ Trợ &amp; Pháp Lý
            </h3>
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
                  setInfoModal({
                    title: 'Chính Sách Bảo Mật Dữ Liệu',
                    content: 'Dữ liệu sổ sách và hóa đơn tài chính của hộ kinh doanh được mã hóa riêng biệt chuẩn SSL 256-bit trên hạ tầng MongoDB Atlas Cloud. VikeSo cam kết không chia sẻ dữ liệu kinh doanh của bạn cho bất kỳ bên thứ ba nào dưới mọi hình thức.',
                  });
                }}
                className="text-xs text-slate-600 hover:text-slate-950 transition-colors"
              >
                Chính sách bảo mật dữ liệu
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setInfoModal({
                    title: 'Điều Khoản Dịch Vụ',
                    content: 'VikeSo cam kết bảo vệ toàn vẹn quyền sở hữu dữ liệu 100% cho chủ kinh doanh. Bạn có thể xuất dữ liệu bảng kê Excel bất cứ lúc nào hoặc xóa tài khoản vĩnh viễn theo yêu cầu.',
                  });
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
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Kết Nối &amp; Tin Tức
            </h3>
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
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#ff4783] hover:bg-[#e0326e] text-slate-950 rounded-lg text-xs font-black transition-colors border border-[#ff4783] cursor-pointer shadow-xs"
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
            © 2024–2026 VikeSo. Mọi quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-1">
            <span>Thiết kế vì người buôn bán Việt Nam</span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#d0f81b] mx-1" />
            <span>Đơn giản • Tin cậy • Rõ ràng</span>
          </div>
        </div>
      </div>

      {/* Info Dialog Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-[#ff4783]">{infoModal.title}</h3>
              <button
                onClick={() => setInfoModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {infoModal.content}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setInfoModal(null)}
                className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
