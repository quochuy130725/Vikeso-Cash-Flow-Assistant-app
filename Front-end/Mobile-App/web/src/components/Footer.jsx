import { FadeIn } from "./animations/FadeIn";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <FadeIn direction="up">
          <div className="footer-content">
            <div className="footer-brand">
              <h2 className="footer-logo">
                Vike<span className="text-gradient">so</span>
              </h2>
              <p className="footer-desc">
                Giải pháp công nghệ tài chính tinh gọn giúp các Hộ kinh doanh vừa và nhỏ tự động hóa đối soát dòng tiền.
              </p>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-title">Sản Phẩm</h4>
              <ul className="footer-links">
                <li><a href="#">Mobile App</a></li>
                <li><a href="#">Tính năng</a></li>
                <li><a href="#">Bảng giá</a></li>
              </ul>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-title">Hỗ Trợ</h4>
              <ul className="footer-links">
                <li><a href="#">Tài liệu</a></li>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Vikeso. All rights reserved.</p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
};

export default Footer;
