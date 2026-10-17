# 📱 Vikeso Mobile App (Flutter)

Ứng dụng di động chính thức của **Vikeso** (Trợ lý Quản trị Dòng tiền & Đối soát Thông minh cho Hộ kinh doanh SME). Xây dựng trên nền tảng **Flutter & Dart**, hỗ trợ đa nền tảng (Android APK, iOS, Web).

---

## 🌟 Tính Năng Nổi Bật Trên Ứng Dụng Di Động

1. **Quét Hóa Đơn & Sổ Nợ Bằng Camera (AI OCR):**
   * Chụp ảnh hóa đơn hoặc chọn từ thư viện ảnh máy.
   * Gửi tới Google Gemini AI xử lý ngầm, loại bỏ nợ gối đầu và hiển thị màn hình đối soát SplitScreen trực quan.
2. **Nhập Liệu Thủ Công Nhanh (Smart Filter):**
   * Nhập nhanh các khoản Thu / Chi trong ngày. Tự động liên kết và gộp vào ca POS nếu có.
3. **Sổ Quỹ Thu Chi & Biểu Đồ Trực Quan:**
   * Thống kê dòng tiền vào, dòng tiền ra, lợi nhuận ròng.
   * Phân loại theo Hóa đơn lẻ, POS kết ca, Sổ tay, Chuyển khoản VietQR.
   * Biểu đồ trực quan xây dựng bằng `fl_chart`.
4. **Đồng Bộ Realtime Qua WebSocket (`socket_io_client`):**
   * Tự động nhận sự kiện cập nhật giao dịch, hồ sơ, nâng cấp gói PRO ngay lập tức.
5. **Cài Đặt Thông Báo & Liên Kết Telegram:**
   * Cần gạt bật/tắt Email, Telegram, Thông báo đẩy.
   * Tự động đồng bộ trạng thái khi người dùng vừa liên kết xong bên Telegram quay lại app (`WidgetsBindingObserver`).
   * Hỗ trợ kéo xuống để làm mới (`Pull to Refresh`).
6. **Nâng Cấp Gói VikeSo PRO (VietQR SePay):**
   * Quét mã QR thanh toán tức thì với ngân hàng.
   * Tự động mở khóa tính năng PRO khi thanh toán thành công.
7. **Xuất Báo Cáo Excel Chuyên Nghiệp:**
   * Xuất file Excel định dạng chuẩn `VikeSo_PhanTich_*.xlsx` và `VikeSo_ThuChi_*.xlsx` có bảng màu, phân dòng thu/chi và tổng kết lợi nhuận.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Framework:** Flutter (3.24+) & Dart (3.5+)
* **Thiết kế giao diện:** Material 3 (Tông màu hồng thương hiệu Vikeso: `#FF5C8D`)
* **Realtime:** `socket_io_client: ^3.1.4`
* **Bảo mật & Lưu trữ:** `flutter_secure_storage: ^10.0.0`
* **Biểu đồ:** `fl_chart: ^1.2.0`
* **Xuất Excel & Chia sẻ:** `excel: ^4.0.6`, `share_plus: ^12.0.1`
* **Liên kết Deep Link:** `url_launcher: ^6.3.2`

---

## 📂 Cấu Trúc Thư Mục Mobile App

```text
lib/
├── main.dart                      # Khởi chạy Flutter, nạp dotenv, kết nối Socket
├── core/
│   └── themes/                    # AppTheme & ColorScheme (Material 3)
├── data/
│   ├── models/                    # Data models: Transaction, User
│   ├── repositories/              # auth_repository.dart (JWT, Secure Storage)
│   └── services/                  # api_service.dart, socket_service.dart, excel_export_service.dart
└── views/
    ├── splash/                    # Màn hình Splash kiểm tra phiên đăng nhập
    ├── auth/                      # login_screen, register, forgot_password
    ├── dashboard/                 # Trang chủ, tổng quan tài chính, điều hướng
    ├── thu_chi/                   # Sổ tay thu chi, danh sách giao dịch, lọc & tìm kiếm
    ├── scan_receipt/              # CameraScreen, SplitScreenReview (AI OCR)
    ├── billing/                   # upgrade_pro_screen (VietQR SePay)
    ├── analytics/                 # Biểu đồ phân tích doanh thu & xuất Excel
    └── profile/                   # Trang cá nhân, cài đặt thông báo, đổi mật khẩu
```

---

## ⚙️ Cấu Hình Môi Trường (.env)

Tạo file `.env` tại thư mục gốc `Front-end/Mobile-App/`:
```env
# URL Backend Production trên Render (hoặc http://10.0.2.2:5000 khi chạy máy ảo Android Local)
API_BASE_URL=https://vikeso-cash-flow-assistant-app.onrender.com/api
```

---

## 🚀 Hướng Dẫn Build & Xuất Bản APK

### 1. Cài Đặt Thư Viện
```bash
flutter clean
flutter pub get
```

### 2. Chạy Thử Nghiệm (Debug Mode)
```bash
flutter run
```

### 3. Xuất Bản File APK Release (Fat APK cho mọi dòng máy Android)
```bash
flutter build apk --release
```
* File APK thành phẩm sẽ được tạo tại:
  `build/app/outputs/flutter-apk/app-release.apk`
* **Mẹo:** Đổi tên file thành `ViKeSo_UI_v1.apk` (hoặc `ViKeSo_v2.apk`) trước khi gửi qua Zalo/Drive cho nhóm và khách hàng cài đặt.
