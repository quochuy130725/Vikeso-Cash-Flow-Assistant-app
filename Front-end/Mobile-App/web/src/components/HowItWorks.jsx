import { FadeIn } from "./animations/FadeIn";
import { StaggerContainer, StaggerItem } from "./animations/StaggerAnimation";
import { Camera, BrainCircuit, CheckSquare } from "lucide-react";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Chụp ảnh hóa đơn",
    desc: "Mở app và chụp lại hóa đơn bán hàng hoặc sổ nợ tay. Không cần quan tâm tới định dạng hay độ mờ.",
    icon: <Camera size={28} />
  },
  {
    number: "02",
    title: "AI Bóc Tách ngầm",
    desc: "Google Gemini AI sẽ xử lý hình ảnh, nhận diện nét chữ và tự động điền các trường dữ liệu như Số tiền, Ngày tháng, Phân loại.",
    icon: <BrainCircuit size={28} />
  },
  {
    number: "03",
    title: "Xác nhận & Lưu",
    desc: "Kiểm tra lại những mục AI đánh dấu nghi ngờ (nếu có). Sau đó bấm Lưu để cập nhật báo cáo dòng tiền.",
    icon: <CheckSquare size={28} />
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works section">
      <div className="container">
        <FadeIn direction="up">
          <div className="section-header">
            <h2 className="section-title">3 Bước <span className="text-gradient">Đơn Giản</span></h2>
            <p className="section-subtitle">Chưa bao giờ việc quản lý đối soát lại dễ dàng đến thế.</p>
          </div>
        </FadeIn>

        <StaggerContainer className="steps-container">
          {steps.map((step, index) => (
            <StaggerItem key={index} className="step-wrapper">
              <div className="step-card glass-panel">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  {step.icon}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <div className="connector-line"></div>
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default HowItWorks;
