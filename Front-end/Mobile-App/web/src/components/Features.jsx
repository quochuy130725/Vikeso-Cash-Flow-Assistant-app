import { FadeIn } from "./animations/FadeIn";
import { StaggerContainer, StaggerItem } from "./animations/StaggerAnimation";
import { ScanLine, Bot, BellRing } from "lucide-react";
import "./Features.css";

const features = [
  {
    icon: <ScanLine size={32} className="feature-icon" style={{ color: "var(--primary)" }} />,
    title: "Giao diện 1-Chạm",
    description: "Loại bỏ hoàn toàn các thao tác nhập liệu rườm rà. Chụp hóa đơn hoặc sổ tay chỉ với 1 nút bấm duy nhất. Hệ thống tự động phân loại giao dịch.",
    color: "rgba(179, 31, 86, 0.1)" // Primary with opacity
  },
  {
    icon: <Bot size={32} className="feature-icon" style={{ color: "var(--primary)" }} />,
    title: "Bóc tách Gemini AI",
    description: "Xử lý chính xác nét chữ viết tay và số liệu in mờ dưới 3 giây bằng sức mạnh của Google Gemini AI (Thinking Budget: 0).",
    color: "rgba(179, 31, 86, 0.1)"
  },
  {
    icon: <BellRing size={32} className="feature-icon" style={{ color: "var(--primary)" }} />,
    title: "Báo Cáo Đêm Khuya",
    description: "Không cần mở app. Hệ thống tự động thức dậy lúc 22h00, đóng gói toàn bộ dữ liệu và gửi báo cáo trực tiếp qua Zalo/Telegram.",
    color: "rgba(179, 31, 86, 0.1)"
  }
];

const Features = () => {
  return (
    <section className="features-section section">
      <div className="container">
        <FadeIn direction="up">
          <div className="section-header">
            <h2 className="section-title">Giá Trị <span className="text-gradient">Khác Biệt</span></h2>
            <p className="section-subtitle">Được thiết kế riêng cho đặc thù kinh doanh của Hộ kinh doanh & Tạp hóa, giúp bạn tối ưu hóa dòng tiền và tiết kiệm thời gian.</p>
          </div>
        </FadeIn>

        <StaggerContainer className="features-grid">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <div className="feature-card glass-panel">
                <div className="feature-icon-wrapper" style={{ background: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-desc">{feature.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Features;
