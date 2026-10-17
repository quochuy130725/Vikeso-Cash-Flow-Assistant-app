# 🚀 Vikeso - Trợ Lý Quản Trị Dòng Tiền & Đối Soát Thông Minh Dành Cho Hộ Kinh Doanh (SME)

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![SePay](https://img.shields.io/badge/SePay_VietQR-0052CC?style=for-the-badge&logo=stripe&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram_Bot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Vikeso** (tiền thân là FinAuto - Dự án Startup EXE101) là giải pháp công nghệ tài chính tinh gọn đột phá, giúp các Hộ kinh doanh cá thể, cửa hàng tạp hóa, quán ăn, tiệm cafe, bán lẻ và chủ vựa nông sản tự động hóa hoàn toàn quy trình bóc tách hóa đơn, sổ nợ tay và đối soát dòng tiền hàng ngày mà không cần kiến thức kế toán phức tạp.

---

## 🌟 Điểm Nổi Bật & Tính Năng Cốt Lõi (Key Features)

### 1. 📷 Giao Diện 1-Chạm & AI OCR Bóc Tách Hóa Đơn (Google Gemini 1.5 Flash)
* Chụp ảnh hóa đơn bán lẻ quầy, biên lai in nhiệt mờ hoặc sổ tay viết tay chỉ với 1 nút bấm duy nhất.
* Trí tuệ nhân tạo (Gemini AI) tự động phân tích ngữ cảnh, **loại bỏ các khoản ghi nợ / nợ gối đầu chưa thu**, chỉ ghi nhận dòng tiền thực tế phát sinh.
* Giao diện đối chiếu trực quan (Split-Screen) viền theo mức độ tin cậy AI (Xanh: Cao, Vàng: Trung bình, Đỏ: Thấp) giúp người dùng kiểm tra nhanh và xác nhận.

### 2. 🛡️ Lưới Lọc Thông Minh 2 Chiều (Bidirectional Smart Filter)
* **Chiều 1:** Khi nộp báo cáo `POS Kết Ca`, hệ thống tự động tìm và gộp (`MERGED`) toàn bộ hóa đơn lẻ POS trong cùng ngày để triệt tiêu lỗi trùng lặp doanh thu.
* **Chiều 2:** Khi nộp hóa đơn lẻ POS sau thời điểm đã có kết ca, hệ thống tự động nhận diện và gán nhãn `MERGED` ngay khi tạo mới.
* *Giữ nguyên 100% các khoản CHI và hóa đơn viết tay độc lập.*

### 3. 💳 Gói VikeSo PRO & Thanh Toán VietQR Tự Động (SePay Gateway)
* Người dùng nâng cấp gói PRO (99.000đ/tháng) bằng cách quét mã VietQR tự động sinh theo đơn hàng.
* Webhook SePay xử lý thanh toán thời gian thực: Khi tiền vào tài khoản ngân hàng, hệ thống tự động kích hoạt tài khoản PRO và phát thông báo WebSocket đến thiết bị người dùng tức thì.

### 4. ⚡ Đồng Bộ Thời Gian Thực (Realtime WebSocket - Socket.IO)
* Kiến trúc Room-based WebSocket kết nối Backend, Mobile App và Web Dashboard.
* Khi phát sinh giao dịch mới, cập nhật hồ sơ hoặc thanh toán gói cước thành công, toàn bộ giao diện biểu đồ và danh sách tự động làm mới mà không cần F5.

### 5. 🌙 Báo Cáo Chốt Ca Cuối Ngày 22:00 (Dual-Channel Dispatch)
* Lên lịch tự động lúc **22:00 hàng ngày (UTC+7)** qua `node-cron`:
  * **Email HTML sang trọng:** Sử dụng Brevo HTTP API & Resend API (HTTPS Port 443 — khắc phục triệt để lỗi chặn SMTP trên hosting đám mây miễn phí như Render) kèm fallback Gmail SMTP.
  * **Telegram Bot:** Tự động gửi bảng kê Markdown và file chi tiết tới tài khoản Telegram của chủ quán.
  * **Liên kết Bot 1-chạm:** Deep link từ app (`/start <userId>`) hoặc chỉ cần nhắn trực tiếp địa chỉ email tài khoản vào Bot chat là hệ thống tự động nhận diện và kích hoạt.

### 6. 📊 Xuất Báo Cáo Tài Chính Excel Chuẩn Hóa
* Xuất file Excel định dạng chuyên nghiệp (`VikeSo_PhanTich_*.xlsx`, `VikeSo_ThuChi_*.xlsx`) với bảng màu hài hòa, phân loại rõ ràng Thu / Chi / Lợi Nhuận ròng để nộp thuế hoặc lưu trữ sổ sách kế toán.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```text
               ┌────────────────────────────────────────────────────────┐
               │                   NGƯỜI DÙNG & CHỦ QUÁN                │
               └───────────┬────────────────────────────────┬───────────┘
                           │                                │
            📱 Flutter Mobile App (Android/iOS)      💻 React Web Portal (Vercel)
                           │                                │
                           └───────────────┬────────────────┘
                                           │ HTTPS REST API + WebSocket
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │           🚀 VIKESO BACKEND GATEWAY (Render)            │
               │  Node.js (v18+) • Express 5 • Socket.IO • Swagger UI  │
               └───────┬──────────────┬──────────────┬─────────────┬────┘
                       │              │              │             │
        ┌──────────────┴─┐     ┌──────┴───────┐ ┌────┴───────┐ ┌───┴─────────────┐
        │  Gemini AI OCR │     │   MongoDB    │ │  SePay     │ │ Cron 22:00 Job  │
        │ 1.5 Flash API  │     │ Atlas Cloud  │ │  VietQR    │ ├─ Brevo / Resend │
        └────────────────┘     └──────────────┘ └────────────┘ └─ Telegram Bot   │
                                                               └─────────────────┘
```

---

## 📂 Cấu Trúc Thư Mục Toàn Dự Án

```text
finauto-Cash-Flow-Assistant-app/
├── README.md                      # [Tài liệu chính] Giới thiệu tổng thể dự án Vikeso
│
├── Back-end/                      # MÁY CHỦ API, AI OCR & WEBSOCKET
│   ├── server.js                  # Entry point máy chủ Express & Socket.IO
│   ├── package.json
│   ├── .env.example               # Mẫu cấu hình môi trường Backend
│   ├── README.md                  # Hướng dẫn chi tiết & tài liệu 26+ API endpoints
│   └── src/
│       ├── config/                # database.js, sepay.js, swagger.json
│       ├── controllers/           # aiReceipt, auth, billing, manualEntry, telegram, admin
│       ├── middlewares/           # upload (Multer), verifyToken (JWT), requireAdmin
│       ├── models/                # Receipt, User, SubscriptionOrder
│       ├── routes/                # apiRoutes, authRoutes, adminRoutes, billingRoutes
│       ├── services/              # geminiAI, mailService, billingService, cronService, sepayService
│       └── socket.js              # Quản lý WebSocket Server, User Rooms & Emitters
│
└── Front-end/
    ├── Mobile-App/                # ỨNG DỤNG DI ĐỘNG FLUTTER (ANDROID & IOS)
    │   ├── pubspec.yaml           # Cấu hình package Flutter & Assets
    │   ├── README.md              # Hướng dẫn build APK Release & kiến trúc Mobile
    │   ├── android/               # Cấu hình Android native (App label: Vikeso)
    │   ├── ios/                   # Cấu hình iOS native (Display Name: Vikeso)
    │   └── lib/
    │       ├── core/themes/       # Material 3 Theme (Sắc hồng thương hiệu Vikeso)
    │       ├── data/              # Repositories (Auth), Services (Socket, Excel, API)
    │       ├── views/             # splash, auth, dashboard, thu_chi, scan_receipt, billing, profile
    │       └── main.dart          # Khởi chạy Flutter App & kết nối Socket
    │
    └── Web/                       # TRANG WEB QUẢN TRỊ & LANDING PORTAL (REACT + VITE)
        ├── package.json
        ├── vite.config.ts         # Cấu hình Vite & Tailwind CSS
        ├── vercel.json            # Cấu hình định tuyến SPA chuẩn Vercel
        ├── README.md              # Hướng dẫn phát triển & Deploy Vercel
        └── src/
            ├── components/        # UI Components & PortalView
            ├── services/          # api.ts (VITE_API_URL), authApi.ts
            └── views/             # AdminOverview, AdminFinancial, OwnerCashflowLedger
```

---

## 🚀 Hướng Dẫn Cài Đặt & Triển Khai (Setup & Deployment)

### 1. Khởi Chạy Backend (Node.js)
```bash
cd Back-end
npm install
cp .env.example .env    # Điền MONGO_URI, GEMINI_API_KEY, JWT_SECRET, SEPAY_API_KEY,...
npm run dev
# Máy chủ chạy tại http://localhost:5000 (Xem tài liệu API tương tác tại: http://localhost:5000/api-docs)
```

### 2. Khởi Chạy & Build Ứng Dụng Mobile (Flutter)
```bash
cd Front-end/Mobile-App
flutter pub get

# Chạy thử trên máy ảo hoặc thiết bị thật:
flutter run

# Xuất bản file APK Release để gửi cài đặt:
flutter build apk --release
# File APK hoàn chỉnh xuất tại: build/app/outputs/flutter-apk/app-release.apk
```

### 3. Khởi Chạy & Triển Khai Web Dashboard (React + Vite)
```bash
cd Front-end/Web
npm install
npm run dev
# Web chạy tại http://localhost:5173

# Deploy lên Vercel:
# 1. Kết nối kho lưu trữ GitHub với Vercel.
# 2. Cài đặt Root Directory: Front-end/Web
# 3. Thêm biến môi trường: VITE_API_URL = https://vikeso-cash-flow-assistant-app.onrender.com/api
```

---

## 👥 Đội Ngũ Dự Án (EXE101 Team)
* **Dự án:** Vikeso - Trợ Lý Quản Trị Dòng Tiền & Đối Soát Hộ Kinh Doanh
* **Bản quyền:** © 2026 Vikeso Team. Mọi quyền được bảo lưu.
