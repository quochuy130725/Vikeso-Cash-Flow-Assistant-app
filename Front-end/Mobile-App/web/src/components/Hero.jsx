import { FadeIn } from "./animations/FadeIn";
import { ShinyText } from "./animations/ShinyText";
import { ArrowRight, Smartphone, CheckCircle2 } from "lucide-react";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero-section section">
      <div className="container">
        <div className="hero-content-wrapper">
          <div className="hero-text">
            <FadeIn delay={0.1} direction="up">
              <div className="badge-pill glass-panel">
                <span className="indicator-green traffic-light-indicator" style={{ marginRight: '8px' }}></span>
                Ra mắt phiên bản Mobile App 1.0
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="up">
              <div style={{ marginBottom: '24px' }}>
                <h1 className="hero-title" style={{ marginBottom: 0 }}>
                  Kiểm Soát Dòng Tiền <br />
                  <ShinyText text="Chỉ Bằng Một Chạm" speed={3} />
                </h1>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3} direction="up">
              <p className="hero-subtitle">
                Vikeso tự động hóa hoàn toàn quy trình bóc tách hóa đơn, sổ nợ tay và đối soát mỗi ngày. Tiết kiệm 2 giờ làm việc cho chủ cửa hàng vừa và nhỏ.
              </p>
            </FadeIn>

            <FadeIn delay={0.4} direction="up">
              <div className="hero-actions">
                <button className="btn btn-primary">
                  Tải Ứng Dụng Ngay <ArrowRight size={20} />
                </button>
                <button className="btn btn-neon">
                  Xem Hướng Dẫn
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.6} direction="up">
              <div className="hero-features">
                <div className="feature-tick"><CheckCircle2 size={18} className="tick-icon" /> Trí tuệ nhân tạo Gemini</div>
                <div className="feature-tick"><CheckCircle2 size={18} className="tick-icon" /> Không cần kiến thức kế toán</div>
                <div className="feature-tick"><CheckCircle2 size={18} className="tick-icon" /> An toàn dữ liệu tuyệt đối</div>
              </div>
            </FadeIn>
          </div>
          
          <div className="hero-image-wrapper">
            <FadeIn delay={0.4} direction="left">
              <div className="hero-mockup glass-panel">
                <Smartphone size={80} className="mockup-icon" />
                <div className="mockup-float-card card-1 glass-panel">
                  <CheckCircle2 size={24} className="tick-icon" /> Đã quét hóa đơn
                </div>
                <div className="mockup-float-card card-2 glass-panel">
                  <div className="traffic-light-indicator indicator-green"></div> Bóc tách thành công
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
