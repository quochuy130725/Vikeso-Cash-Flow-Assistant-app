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
* **Frontend (Mobile App):** Xây dựng bằng Flutter theo kiến trúc Component-based (tuân thủ KISS & DRY). Tách nhỏ UI để tối ưu hiệu suất và dễ quản lý State.
* **Backend (API Gateway):** Node.js/Express đóng vai trò Proxy an toàn, xử lý logic Lưới lọc thông minh (Chỉ gộp doanh THU, giữ nguyên các khoản CHI phí ẩn) và đóng gói Payload giao tiếp với Gemini AI.
* **Automation (Cron-job):** Kiến trúc Serverless với Firebase Cloud Functions và Telegram Bot API giúp tự động bắn báo cáo thụ động mà không cần mở App.

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

Dự án được cấu trúc theo dạng Monorepo, phân tách rõ ràng giữa máy chủ xử lý (Back-end) và giao diện người dùng (Front-end).

```text
finauto-Cash-Flow-Assistant-app/
│
├── Back-end/                      # MÁY CHỦ NODE.JS & DATABASE
│   ├── package.json
│   ├── .env.example               # Mẫu cấu hình (Giấu GEMINI_API_KEY, MONGO_URI, TELEGRAM_BOT_TOKEN)
│   ├── server.js                  # Điểm khởi chạy API Gateway
│   ├── test_telegram.js           # [NEW] File chạy độc lập test Bot Telegram bắn báo cáo
│   ├── config/
│   │   └── database.js            # Cấu hình kết nối MongoDB Atlas (Whitelist 0.0.0.0/0)
│   ├── models/                    # TẦNG DATABASE (Mongoose Schemas)
│   │   ├── Receipt.js             # [UPDATED] Lưu giao dịch (category, transactionType, status: VALID/MERGED)
│   │   └── User.js                # [NEW] Phân quyền Freemium (FREE/PRO) và lưu telegramChatId
│   ├── routes/
│   │   └── apiRoutes.js           # Khai báo Endpoint (/manual-entry, /upload-receipt)
│   ├── middlewares/
│   │   └── upload.js              # Cấu hình Multer hứng file ảnh đưa trực tiếp vào RAM
│   ├── controllers/
│   │   ├── manualEntryController.js  # Lưới lọc thông minh: Gạch bỏ hóa đơn lẻ THU, giữ nguyên CHI + Mock Telegram
│   │   └── aiReceiptController.js    # Cổng AI: Gửi ảnh + System Instruction 6 Rule (thinkingBudget: 0)
│   └── functions/                 # MÃ NGUỒN AUTOMATION (Kiến trúc Serverless)
│       └── index.js               # Firebase Cloud Functions (Cron-job Trigger 22h00 bắn Telegram)
│
├── Front-end/
│   ├── Mobile-App/                # ỨNG DỤNG FLUTTER (REFACTORED - KISS & DRY)
│   │   ├── pubspec.yaml           # Quản lý thư viện (fl_chart, flutter_secure_storage)
│   │   └── lib/
│   │       ├── core/utils/
│   │       │   └── ui_helpers.dart         # [NEW] Chuẩn hóa Toast/SnackBar/Dialog (Tái sử dụng code)
│   │       ├── models/            
│   │       │   └── thu_chi_model.dart      # Định kiểu JSON Mapping
│   │       ├── services/          
│   │       │   └── api_service.dart        # Gọi HTTP Axios, quản lý Data Fetching
│   │       └── views/                      # Tầng UI (Đã chia nhỏ Widget)
│   │           ├── dashboard/
│   │           │   ├── dashboard_screen.dart         # Trang chủ tổng quan (Clean code)
│   │           │   └── widgets/
│   │           │       ├── revenue_chart.dart        # [NEW] Biểu đồ fl_chart đã fix lỗi overlap
│   │           │       └── action_buttons.dart       # [NEW] Cụm nút Quét AI & Nhập thủ công layout dọc
│   │           └── scan_receipt/
│   │               ├── camera_screen.dart            # Giao diện 1-Chạm (Chặn luồng nếu AI trả items rỗng)
│   │               ├── split_screen.dart             # Màn hình đối chiếu Split-Screen
│   │               └── widgets/
│   │                   └── editable_transaction_card.dart # [NEW] Card giao dịch tích hợp Đèn giao thông UX
│   │
│   └── Web/                       # ỨNG DỤNG WEB BẢN QUẢN TRỊ 
│       └── ...                    # (Tạm đóng băng ở CP3 để dồn toàn lực cho Mobile App)
│
└── README.md                      # Tài liệu đặc tả kỹ thuật và phân công nhiệm vụ
