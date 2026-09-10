import { FadeIn } from "./animations/FadeIn";
import { Check, X } from "lucide-react";
import "./Pricing.css";

const Pricing = () => {
  return (
    <section className="pricing-section section">
      <div className="container">
        <FadeIn direction="up">
          <div className="section-header">
            <h2 className="section-title">Bảng Giá <span className="text-gradient">Linh Hoạt</span></h2>
            <p className="section-subtitle">Bắt đầu miễn phí và nâng cấp khi cửa hàng của bạn phát triển.</p>
          </div>
        </FadeIn>

        <div className="pricing-grid">
          <FadeIn delay={0.1} direction="up" className="pricing-card-wrapper">
            <div className="pricing-card glass-panel">
              <div className="pricing-header">
                <h3 className="pricing-tier">Cơ Bản</h3>
                <div className="pricing-price">
                  <span className="currency">₫</span>0<span className="period">/tháng</span>
                </div>
                <p className="pricing-desc">Phù hợp cho cá nhân kinh doanh nhỏ, tạp hóa gia đình.</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} className="text-primary" /> Quét tối đa 50 hóa đơn/tháng</li>
                <li><Check size={18} className="text-primary" /> Nhập liệu thủ công không giới hạn</li>
                <li><Check size={18} className="text-primary" /> Báo cáo tổng hợp cuối ngày</li>
                <li className="disabled"><X size={18} /> Phân tích đa chiều nâng cao</li>
                <li className="disabled"><X size={18} /> Kết nối Zalo OA</li>
              </ul>
              <button className="btn btn-outline w-full mt-auto">Bắt đầu Miễn Phí</button>
            </div>
          </FadeIn>

          <FadeIn delay={0.3} direction="up" className="pricing-card-wrapper">
            <div className="pricing-card glass-panel popular">
              <div className="popular-badge">Khuyên Dùng</div>
              <div className="pricing-header">
                <h3 className="pricing-tier">Chuyên Nghiệp</h3>
                <div className="pricing-price">
                  <span className="currency">₫</span>99k<span className="period">/tháng</span>
                </div>
                <p className="pricing-desc">Đầy đủ sức mạnh AI bóc tách dành cho SME & chuỗi cửa hàng.</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} className="text-primary" /> <strong>Không giới hạn</strong> hóa đơn quét AI</li>
                <li><Check size={18} className="text-primary" /> Nhập liệu thủ công không giới hạn</li>
                <li><Check size={18} className="text-primary" /> Báo cáo chi tiết & Cảnh báo dòng tiền</li>
                <li><Check size={18} className="text-primary" /> Phân tích đa chiều nâng cao</li>
                <li><Check size={18} className="text-primary" /> Tự động gửi báo cáo qua Zalo OA/Telegram</li>
              </ul>
              <button className="btn btn-primary w-full mt-auto">Nâng Cấp Pro</button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
