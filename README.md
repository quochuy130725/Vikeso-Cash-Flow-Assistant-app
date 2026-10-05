# 🚀 Vikeso - Trợ Lý Quản Trị Dòng Tiền & Đối Soát Thông Minh Dành Cho SME

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram_Bot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)

**Vikeso** (tiền thân là FinAuto) là giải pháp công nghệ tài chính tinh gọn đột phá, giúp các Hộ kinh doanh vừa và nhỏ (SME), tạp hóa, tiệm cafe, cửa hàng bán lẻ và **đặc biệt là các thương lái/chủ vựa nông sản đầu mối** tự động hóa hoàn toàn quy trình bóc tách hóa đơn, sổ nợ tay và đối soát dòng tiền hàng ngày mà không cần kiến thức kế toán phức tạp.

---

## ✨ Tính Năng Cốt Lõi (Core Features)

1. **Giao Diện 1-Chạm (Zero-Friction UX):**
   * Người dùng chỉ cần chụp hóa đơn/sổ tay qua 1 nút bấm duy nhất, hệ thống tự động nhận diện và xử lý ngầm.
   * Chuyển đổi toàn bộ thuật ngữ chuyên ngành thành ngôn ngữ đời thường ("Tiền vào" / "Tiền ra").

2. **AI OCR Xử Lý Chữ Viết Tay & Lọc Nợ Gối Đầu (Google Gemini AI):**
   * Bóc tách nét chữ viết tay lộn xộn, hóa đơn in nhiệt mờ, phiếu giao hàng.
   * AI tự động phân tích ngữ cảnh để **loại bỏ các khoản ghi nợ, nợ gối đầu chưa trả**, chỉ ghi nhận dòng tiền thực tế phát sinh.

3. **Lưới Lọc Thông Minh 2 Chiều (Bidirectional Smart Filter):**
   * **Chiều xuôi:** Khi quét báo cáo `POS Kết Ca`, hệ thống tự động tìm và gộp (`MERGED`) toàn bộ hóa đơn bán lẻ máy POS phát sinh trong ngày để tránh trùng lặp doanh thu.
   * **Chiều ngược:** Nếu hóa đơn lẻ máy POS được nộp sau khi đã có báo cáo kết ca, hệ thống tự động phát hiện và chuyển trạng thái sang `MERGED` ngay khi tạo mới.
   * *Hệ thống giữ nguyên 100% các khoản CHI và hóa đơn viết tay độc lập.*

4. **Đèn Giao Thông UX (Traffic Light Control):**
   * Màn hình đối chiếu trực quan (Split-Screen) viền sắc màu theo mức độ tin cậy của AI (Xanh: Cao, Vàng: Trung bình, Đỏ: Thấp) giúp người dùng dễ dàng kiểm soát và chỉnh sửa trước khi xác nhận.

5. **Cập Nhật Realtime Qua WebSocket (Socket.IO):**
   * Tích hợp máy chủ WebSocket trực tiếp trong backend.
   * Khi giao dịch được xác nhận, hệ thống tự động broadcast sự kiện `new_transaction` tới tất cả client đang kết nối (Mobile App & Web Admin), cập nhật biểu đồ tức thì mà không cần tải lại trang.

6. **Báo Cáo Tự Động Cuối Ngày 22:00 (Dual-Channel Nightly Report):**
   * Lên lịch tự động lúc 22:00 hàng ngày (giờ Việt Nam, UTC+7).
   * **Qua Email:** Gửi thư HTML sang trọng, trực quan tổng hợp Tổng Thu, Tổng Chi, Lợi Nhuận Gộp.
   * **Qua Telegram Bot:** Gửi tin nhắn Markdown chốt ca chi tiết đến Telegram của chủ quán.
   * Tự động điều chỉnh nội dung thông minh ngay cả khi trong ngày chưa phát sinh giao dịch nào.

7. **Telegram Bot Thông Minh & Liên Kết Linh Hoạt:**
   * Bot **@FinautoDemo_bot** hỗ trợ liên kết tài khoản đa phương thức: Deep link từ App (`/start <userId>`), hoặc người dùng chỉ cần **nhắn tin địa chỉ Email tài khoản vào bot** là bot tự động nhận diện và liên kết.

8. **Tài Liệu Swagger UI Tương Tác Trực Quan:**
   * Tích hợp OpenAPI 3.0 với đầy đủ 14 API endpoints tại `/api-docs`.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```
[ Khách hàng / Chủ quán ]
       │
       ├──► 📱 Mobile App (Flutter) ──────────────┐
       │                                           │ REST API + Socket.IO
       └──► 💻 Web Dashboard (React / Vite) ──────┼──► 🚀 Node.js / Express Gateway
                                                   │    ├── Gemini AI OCR
                                                   │    ├── Smart Filter (2 Chiều)
                                                   │    ├── Auth (JWT + Google OAuth)
                                                   │    └── Realtime Socket.IO Server
                                                   │
                                                   ├──► 🗄️ MongoDB Atlas (Cluster)
                                                   │
                                                   └──► ⏰ Nightly Cron Job (22:00)
                                                        ├── ✉️ Gmail SMTP (Nodemailer HTML)
                                                        └── 🤖 Telegram Bot Webhook
```

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
finauto-Cash-Flow-Assistant-app/
│
├── README.md                      # Tài liệu tổng quan toàn bộ dự án
├── agent.md                       # Master Context dành cho AI Assistant / Developers
│
├── Back-end/                      # MÁY CHỦ NODE.JS & DATABASE
│   ├── server.js                  # Entrypoint: Express + HTTP + Socket.IO Server
│   ├── package.json
│   ├── .env.example
│   ├── README.md                  # Tài liệu chi tiết Backend & API Reference
│   └── src/
│       ├── config/                # database.js, swagger.json (14 endpoints)
│       ├── controllers/           # aiReceiptController, authController, manualEntryController, telegramController
│       ├── middlewares/           # upload.js (Multer), verifyToken.js (JWT)
│       ├── models/                # Receipt.js, User.js
│       ├── routes/                # apiRoutes.js, authRoutes.js
│       ├── services/              # cronService.js, geminiAI.js
│       └── socket/                # index.js (Socket.IO event emitters)
│
└── Front-end/
    ├── Mobile-App/                # ỨNG DỤNG DI ĐỘNG (FLUTTER)
    │   ├── pubspec.yaml
    │   └── lib/
    │       ├── data/              # models, repositories (Auth, Transactions), services
    │       ├── views/             # dashboard, scan_receipt, manual_entry, profile
    │       └── main.dart          # Entrypoint ứng dụng di động
    │
    └── Web/                       # TRANG QUẢN TRỊ DOANH THU WEB
        ├── package.json
        ├── index.html
        └── src/                   # Dashboard quản trị, biểu đồ & đối soát nâng cao
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi Chạy Backend
```bash
cd Back-end
npm install
cp .env.example .env    # Điền MONGO_URI, GEMINI_API_KEY, JWT_SECRET, MAIL_PASS,...
npm run dev
# Máy chủ khởi chạy tại http://localhost:5000 (Swagger: /api-docs)
```

### 2. Khởi Chạy Flutter Mobile App
```bash
cd Front-end/Mobile-App
flutter pub get
flutter run
```

### 3. Khởi Chạy Web Dashboard
```bash
cd Front-end/Web
npm install
npm run dev
```

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phát triển bởi đội ngũ **Vikeso (EXE101)**. Bảo lưu mọi quyền.
