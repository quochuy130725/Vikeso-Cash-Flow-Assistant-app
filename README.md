# 🚀 FinAuto - Hệ Thống Đối Soát Thông Minh Dành Cho SME

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Serverless-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**FinAuto** là giải pháp công nghệ tài chính tinh gọn giúp các Hộ kinh doanh vừa và nhỏ (SME), tạp hóa, cửa hàng bán lẻ tự động hóa hoàn toàn quy trình bóc tách hóa đơn, sổ nợ tay và đối soát dòng tiền hàng ngày mà không cần kiến thức kế toán.

---

## ✨ Tính Năng Cốt Lõi (Core Features)

1. **Giao diện 1-Chạm (Zero-Friction UX):** Loại bỏ thao tác nhập liệu rườm rà. Chụp hóa đơn/sổ tay chỉ với 1 nút bấm duy nhất. AI sẽ tự động phân loại ngầm chứng từ (Hóa đơn lẻ / POS kết ca).
2. **Bóc tách Dữ liệu Tốc độ cao:** Ứng dụng Google Gemini AI (với cấu hình `thinkingBudget: 0`) để bóc tách chính xác nét chữ viết tay và số liệu in mờ dưới 3 giây.
3. **Đèn giao thông UX (Traffic Light):** Cơ chế đối chiếu trực quan (Split-Screen). Hệ thống tự động cảnh báo mức độ tin cậy của nét chữ bằng màu sắc (Xanh/Vàng/Đỏ) để người dùng rà soát an toàn.
4. **Báo cáo Tự động Ngầm (Serverless Nightly Report):** Không cần mở App. Hệ thống tự động thức dậy vào 22h00 hằng ngày để truy xuất CSDL, đóng gói dữ liệu và bắn báo cáo trực tiếp qua Zalo ZNS / Telegram cho chủ cửa hàng.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

Dự án được xây dựng theo mô hình **Dual-Track Agile** và chia thành 3 phân hệ chính:
* **Frontend (Mobile App):** Xây dựng bằng Flutter, tập trung vào UX/UI và xử lý ảnh (Crop/Filter) trước khi gửi.
* **Backend (API Gateway):** Node.js/Express đóng vai trò Proxy an toàn, xử lý logic Lưới lọc chống trùng lặp và đóng gói Payload giao tiếp với Gemini AI.
* **Automation (Cron-job):** Kiến trúc Serverless với Firebase Cloud Functions và Google Cloud Scheduler giúp tối ưu chi phí vận hành (OpEx = 0đ).

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

Dự án được cấu trúc theo dạng Monorepo hoặc chia 2 thư mục rõ ràng giữa Frontend và Backend.

```text
FINAUTO-PROJECT/
│
├── 📱 mobile-app/                 # FRONTEND - FLUTTER APP
│   ├── android/
│   ├── ios/
│   ├── lib/
│   │   ├── core/                  # Các cấu hình dùng chung (Themes, Constants)
│   │   ├── models/                # Lớp dữ liệu (ThuChi Model)
│   │   ├── screens/               # Giao diện chính
│   │   │   ├── dashboard_screen.dart    # Biểu đồ dòng tiền (fl_chart)
│   │   │   ├── camera_screen.dart       # Giao diện 1-Chạm & Nút chim mồi
│   │   │   └── split_screen.dart        # Màn hình đối chiếu (Nửa ảnh, nửa Form)
│   │   ├── services/              # Kết nối HTTP & API Binding
│   │   │   └── api_service.dart         # Gọi /upload-receipt và /manual-entry
│   │   ├── utils/                 # Các tiện ích
│   │   │   └── image_helper.dart        # Chỉnh Crop, Filter trắng đen
│   │   └── widgets/               # Thành phần UI tái sử dụng
│   │       └── traffic_light.dart       # Đổi màu viền UI dựa theo độ tin cậy
│   ├── pubspec.yaml               # Quản lý thư viện (flutter_secure_storage,...)
│   └── README.md
│
├── ⚙️ backend-api/                # BACKEND - NODE.JS & EXPRESS
│   ├── package.json
│   ├── .env.example               # Template biến môi trường
│   ├── server.js                  # File khởi chạy API Gateway
│   ├── config/
│   │   └── database.js            # Chuỗi kết nối MongoDB Atlas
│   ├── models/
│   │   └── ThuChi.js              # Mongoose Schema (Shop_ID, PhanLoai, DoanhThu...)
│   ├── routes/
│   │   └── apiRoutes.js           # Khai báo các Endpoint (/manual-entry, /upload-receipt)
│   ├── middlewares/
│   │   └── upload.js              # Cấu hình Multer hứng file lưu vào RAM
│   └── controllers/
│       ├── manualEntryController.js  # Lưới lọc "POS Ket Ca" & Hàm .reduce()
│       └── aiReceiptController.js    # Đóng gói Payload AI, gọi Gemini API
│
└── 🌙 serverless-automation/      # HỆ THỐNG CHẠY NGẦM BAN ĐÊM (Firebase Cloud Functions)
    ├── package.json
    └── index.js                   # Trigger 22h00 -> Truy vấn Mongo -> Bắn Telegram/Zalo
