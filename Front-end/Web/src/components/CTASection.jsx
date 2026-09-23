import { FadeIn } from "./animations/FadeIn";
import { Download } from "lucide-react";
import "./CTASection.css";

const CTASection = () => {
  return (
    <section className="cta-section section">
      <div className="container">
        <FadeIn direction="up">
          <div className="cta-box glass-panel">
            <div className="cta-content">
              <h2 className="cta-title">Sẵn sàng tối ưu hóa dòng tiền?</h2>
              <p className="cta-desc">
                Tải ngay Vikeso Mobile App. Trải nghiệm giải pháp đối soát thông minh, không lo thất thoát, tiết kiệm thời gian.
              </p>
              <div className="cta-actions">
                <button className="btn btn-primary cta-btn">
                  <Download size={20} />
                  Tải Ứng Dụng Miễn Phí
                </button>
              </div>
            </div>
            
            <div className="cta-blob cta-blob-1"></div>
            <div className="cta-blob cta-blob-2"></div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CTASection;
