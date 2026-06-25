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

Dự án được xây dựng theo mô hình **Dual-Track Agile** và chia thành phân hệ rõ ràng:
* **Frontend (Mobile App):** Xây dựng bằng Flutter, tập trung vào UX/UI và xử lý ảnh (Crop/Filter) trước khi gửi.
* **Backend (API Gateway):** Node.js/Express đóng vai trò Proxy an toàn, xử lý logic Lưới lọc chống trùng lặp và đóng gói Payload giao tiếp với Gemini AI.
* **Automation (Cron-job):** Kiến trúc Serverless với Firebase Cloud Functions và Google Cloud Scheduler giúp tối ưu chi phí vận hành (OpEx = 0đ).

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

Dự án được cấu trúc theo dạng Monorepo, phân tách rõ ràng giữa máy chủ xử lý (Back-end) và giao diện người dùng (Front-end).

```text
finauto-Cash-Flow-Assistant-app/
│
├── Back-end/                      # MÁY CHỦ NODE.JS & TỰ ĐỘNG HÓA NGẦM
│   ├── package.json
│   ├── .env.example               # Mẫu cấu hình biến môi trường (Giấu GEMINI_API_KEY)
│   ├── server.js                  # Điểm khởi chạy API Gateway
│   ├── config/
│   │   └── database.js            # Cấu hình kết nối MongoDB Atlas (Whitelist 0.0.0.0/0)
│   ├── models/
│   │   └── ThuChi.js              # Định nghĩa Mongoose Schema (Shop_ID, PhanLoai, DoanhThu...)
│   ├── routes/
│   │   └── apiRoutes.js           # Khai báo Endpoint (/manual-entry, /upload-receipt)
│   ├── middlewares/
│   │   └── upload.js              # Cấu hình Multer hứng file ảnh đưa trực tiếp vào RAM
│   ├── controllers/
│   │   ├── manualEntryController.js  # Phễu lưu trữ: Tính tổng .reduce() & Lưới lọc "POS Ket Ca"
│   │   └── aiReceiptController.js    # Cổng AI: Đóng gói Payload Base64 + Gọi Gemini (thinkingBudget: 0)
│   └── functions/                 # MÃ NGUỒN AUTOMATION (Kiến trúc Serverless)
│       ├── index.js               # Firebase Cloud Functions (Cron-job Trigger 22h00)
│       └── messageService.js      # Truy vấn DB, đóng gói và bắn báo cáo qua Zalo ZNS / Telegram
│
├── Front-end/
│   ├── Mobile-App/                # ỨNG DỤNG FLUTTER (CORE UX/UI DÀNH CHO KHÁCH HÀNG)
│   │   ├── android/
│   │   ├── ios/
│   │   ├── pubspec.yaml           # Quản lý thư viện (fl_chart, flutter_secure_storage)
│   │   └── lib/
│   │       ├── core/              # Cấu hình dùng chung (Themes, Constants)
│   │       ├── models/            # Lớp cấu trúc dữ liệu (ThuChi Model)
│   │       ├── screens/           # Tầng Giao diện hiển thị
│   │       │   ├── dashboard_screen.dart    # Biểu đồ dòng tiền thu/chi
│   │       │   ├── camera_screen.dart       # Giao diện 1-Chạm & Nút chim mồi (Nhập dự phòng)
│   │       │   └── split_screen.dart        # Màn hình đối chiếu (Nửa trên ảnh, nửa dưới Form JSON)
│   │       ├── services/          # Tầng Kết nối mạng (API Binding)
│   │       │   └── api_service.dart         # Gọi HTTP Request, quản lý State vòng xoay Loading chờ AI
│   │       ├── utils/             # Các tiện ích bổ trợ
│   │       │   └── image_helper.dart        # Tiền xử lý ảnh gốc: Crop cắt viền, Filter tăng tương phản
│   │       └── widgets/           # Tầng Thành phần UI tái sử dụng
│   │           └── traffic_light.dart       # Đèn giao thông UX (Đổi màu viền Xanh/Vàng/Đỏ theo độ tin cậy)
│   │
│   └── Web/                       # ỨNG DỤNG WEB BẢN QUẢN TRỊ 
│       └── ...                    # (Tạm đóng băng ở CP3 để dồn toàn lực cho Mobile App)
│
└── README.md                      # Tài liệu đặc tả kỹ thuật và phân công nhiệm vụ
