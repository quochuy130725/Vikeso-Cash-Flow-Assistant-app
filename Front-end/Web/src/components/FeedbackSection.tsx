import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Sparkles,
  CheckCircle2,
  Quote,
  MessageSquarePlus,
  X,
  Store,
  Award,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserFeedback } from '../types';
import { getStoredFeedbacks, saveNewFeedback } from '../data/mockFeedbacks';
import { UserAccount } from './AuthModal';

interface FeedbackSectionProps {
  currentUser?: UserAccount | null;
  onShowToast?: (msg: string) => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  currentUser,
  onShowToast,
}) => {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(() => getStoredFeedbacks());
  const [activeFilter, setActiveFilter] = useState<'all' | 'pro' | 'fnb' | 'retail' | '5star'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [storeName, setStoreName] = useState(currentUser?.shopName || currentUser?.storeName || '');
  const [businessType, setBusinessType] = useState('Dịch vụ ăn uống (F&B)');
  const [rating, setRating] = useState(5);
  const [tag, setTag] = useState('Bóc tách bill AI');
  const [highlight, setHighlight] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  // Counts for tabs
  const proCount = feedbacks.filter((f) => f.plan === 'pro').length;
  const fnbCount = feedbacks.filter((f) => f.businessType.includes('F&B') || f.businessType.includes('ăn uống')).length;
  const retailCount = feedbacks.filter((f) => f.businessType.includes('bán lẻ') || f.businessType.includes('tạp hóa') || f.businessType.includes('Bách hóa')).length;
  const fiveStarCount = feedbacks.filter((f) => f.rating === 5).length;

  const filteredFeedbacks = useMemo(() => {
    switch (activeFilter) {
      case 'pro':
        return feedbacks.filter((f) => f.plan === 'pro');
      case 'fnb':
        return feedbacks.filter((f) => f.businessType.includes('F&B') || f.businessType.includes('ăn uống'));
      case 'retail':
        return feedbacks.filter((f) => f.businessType.includes('bán lẻ') || f.businessType.includes('tạp hóa') || f.businessType.includes('Bách hóa'));
      case '5star':
        return feedbacks.filter((f) => f.rating === 5);
      case 'all':
      default:
        return feedbacks;
    }
  }, [feedbacks, activeFilter]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!storeName.trim()) {
      setFormError('Vui lòng nhập tên cửa hàng / quán của bạn.');
      return;
    }
    if (!content.trim() || content.trim().length < 15) {
      setFormError('Nội dung nhận xét tối thiểu 15 ký tự để đảm bảo tính hữu ích.');
      return;
    }

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const newFeedback: UserFeedback = {
      id: `fb-user-${Date.now()}`,
      authorName: authorName.trim(),
      storeName: storeName.trim(),
      businessType,
      plan: currentUser?.subscriptionPlan === 'PRO' ? 'pro' : 'free',
      rating,
      tag: tag || 'Trải nghiệm VikeSo',
      highlight: highlight.trim() || content.trim().slice(0, 60) + '...',
      content: content.trim(),
      date: dateStr,
      isVerified: true,
    };

    const updated = saveNewFeedback(newFeedback);
    setFeedbacks(updated);
    setModalOpen(false);

    // Reset form
    setHighlight('');
    setContent('');
    setFormError('');

    if (onShowToast) {
      onShowToast('Cảm ơn bạn! Đánh giá đã được ghi nhận và hiển thị lên đầu trang.');
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="danh-gia" className="scroll-mt-24 w-full py-16 sm:py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Anchor for hash routing */}
      <div id="feedback" className="absolute -top-24 pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#b01755] px-3.5 py-1.5 rounded-full bg-[#fff0f5] border border-[#ffd6e4] mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#ff4783]" />
          <span>Ý kiến từ các chủ hộ kinh doanh thực tế</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
          Hơn 100+ Chủ Quán &amp; Sạp Tin Dùng VikeSo
        </h2>
        <p className="text-sm sm:text-base text-slate-700 font-medium mt-3 max-w-2xl mx-auto leading-relaxed">
          Khám phá trải nghiệm thực tế từ các tiểu thương đã giải phóng bản thân khỏi nỗi lo tính sổ mỗi đêm, thanh thảnh ngủ ngon lúc 22h00.
        </p>
      </div>

      {/* Rating Summary Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Overall Rating */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight">
              4.9
            </span>
            <span className="text-slate-400 text-lg font-bold">/ 5.0</span>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              Dựa trên hơn <strong className="text-slate-900 font-bold">100+ đánh giá</strong> được xác thực từ chủ shop
            </p>
          </div>
        </div>

        {/* Center: Highlights Badges */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f7fee7] border border-[#d9f99d]">
            <CheckCircle2 className="w-4 h-4 text-[#65a30d]" />
            <span>100% Chủ Hộ Hài Lòng</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fff0f5] border border-[#ffd6e4] text-[#b01755]">
            <Award className="w-4 h-4 text-[#ff4783]" />
            <span>5 Đánh Giá Hội Viên PRO</span>
          </div>
        </div>

        {/* Right: CTA to Add Feedback */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#ff4783]/20 hover:shadow-xl transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Gửi Đánh Giá Của Bạn</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
          }`}
        >
          Tất cả ({feedbacks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('pro')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'pro'
              ? 'bg-[#d0f81b] text-slate-950 border border-[#bde412] shadow-xs font-black'
              : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80'
          }`}
        >
          <span>⭐ Hội viên PRO</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[#d0f81b] text-[10px]">
            {proCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('fnb')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'fnb'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
          }`}
        >
          Quán ăn &amp; F&amp;B ({fnbCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('retail')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'retail'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
          }`}
        >
          Tạp hóa &amp; Bán lẻ ({retailCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('5star')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === '5star'
              ? 'bg-amber-400 text-slate-950 shadow-xs font-extrabold'
              : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
          }`}
        >
          <span>5 Sao ★</span>
          <span>({fiveStarCount})</span>
        </button>
      </div>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeedbacks.map((fb) => {
          const isPro = fb.plan === 'pro';
          const initials = fb.authorName
            .split(' ')
            .map((w) => w[0])
            .filter(Boolean)
            .slice(-2)
            .join('')
            .toUpperCase() || 'KH';

          return (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 sm:p-7 rounded-3xl flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-gradient-to-br from-white via-white to-[#fbfde9] border-2 border-[#d0f81b] shadow-md shadow-[#d0f81b]/15 hover:shadow-xl hover:border-[#bde412]'
                  : 'bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Row: Plan Badge & Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#d0f81b] text-slate-950 font-black text-[11px] border border-[#bde412] shadow-2xs">
                      <span>★</span>
                      <span>HỘI VIÊN PRO</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px] border border-slate-200">
                      Gói Cơ Bản
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                    {fb.tag}
                  </span>
                </div>

                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {renderStars(fb.rating)}
                  <Quote className={`w-5 h-5 ${isPro ? 'text-[#ff4783]/40' : 'text-slate-300'}`} />
                </div>

                {/* Highlight Quote */}
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-snug mb-3">
                  “{fb.highlight}”
                </h3>

                {/* Full Content */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                  {fb.content}
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      isPro
                        ? 'bg-slate-950 text-[#d0f81b] border border-slate-900 shadow-xs'
                        : 'bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4]'
                    }`}
                  >
                    {initials}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {fb.authorName}
                      </span>
                      {fb.isVerified && (
                        <span title="Chủ hộ kinh doanh đã xác thực">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4783] shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium truncate">
                      {fb.storeName}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                  {fb.date}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal: Write Feedback */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 text-left">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f5] border border-[#ffd6e4] text-[#ff4783] flex items-center justify-center">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Chia Sẻ Trải Nghiệm Của Bạn</h3>
                  <p className="text-xs text-slate-500">Giúp cộng đồng tiểu thương có thêm góc nhìn thực tế</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mức độ hài lòng của bạn:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-slate-900 ml-2">
                    {rating === 5 ? 'Tuyệt vời (5/5 sao)' : rating === 4 ? 'Rất hài lòng (4/5 sao)' : `${rating}/5 sao`}
                  </span>
                </div>
              </div>

              {/* Author & Store Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên của bạn *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="VD: Chị Mai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ff4783]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên cửa hàng / Sạp hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="VD: Tiệm Tạp Hóa Cô Mai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ff4783]"
                  />
                </div>
              </div>

              {/* Business Type & Feature Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngành nghề kinh doanh
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ff4783] bg-white cursor-pointer"
                  >
                    <option value="Dịch vụ ăn uống (F&B)">Dịch vụ ăn uống (F&B)</option>
                    <option value="Hộ kinh doanh bán lẻ">Hộ kinh doanh bán lẻ / Tạp hóa</option>
                    <option value="Hộ kinh doanh thời trang">Thời trang & May mặc</option>
                    <option value="Dược phẩm & y tế tư nhân">Nhà thuốc / Y tế</option>
                    <option value="Chăm sóc sắc đẹp & Spa">Spa & Làm đẹp</option>
                    <option value="Nông sản & thực phẩm">Nông sản & Thực phẩm sạch</option>
                    <option value="Khác">Lĩnh vực khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tính năng bạn ưng ý nhất
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ff4783] bg-white cursor-pointer"
                  >
                    <option value="Bóc tách bill AI">Bóc tách bill AI (Chữ tay & giấy than)</option>
                    <option value="Chống trùng bill POS">Chống cộng trùng bill POS kết ca</option>
                    <option value="Báo cáo Telegram">Báo cáo tự động Telegram 22h</option>
                    <option value="Nhập lùi ngày">Nhập bù hóa đơn lùi ngày</option>
                    <option value="Dễ dùng như Zalo">Giao diện đơn giản, dễ thao tác</option>
                  </select>
                </div>
              </div>

              {/* Highlight Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đúc kết ngắn gọn (1 câu ấn tượng)
                </label>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  placeholder="VD: Quét bill giấy than mờ tịt vẫn đúng từng đồng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ff4783]"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chia sẻ chi tiết nhận xét của bạn *
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ cách VikeSo giúp cửa hàng của bạn tiết kiệm thời gian hoặc tránh thất thoát tiền bạc..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ff4783] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-extrabold shadow-md shadow-[#ff4783]/25 transition-all cursor-pointer"
                >
                  Đăng Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
