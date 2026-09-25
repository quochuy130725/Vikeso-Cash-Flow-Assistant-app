# 🚀 Vikeso - Hệ Thống Đối Soát Thông Minh Dành Cho SME

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Serverless-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**FinAuto** là giải pháp công nghệ tài chính tinh gọn đột phá, giúp các Hộ kinh doanh vừa và nhỏ (SME), tạp hóa, cửa hàng bán lẻ và **đặc biệt là các thương lái/chủ vựa nông sản đầu mối** tự động hóa hoàn toàn quy trình bóc tách hóa đơn, sổ nợ tay và đối soát dòng tiền hàng ngày mà không cần kiến thức kế toán.

---

## ✨ Tính Năng Cốt Lõi (Core Features)

1. **Giao diện 1-Chạm (Zero-Friction UX):** Loại bỏ hoàn toàn các thao tác nhập liệu gõ tay rườm rà. Người dùng chỉ cần chụp hóa đơn/sổ tay qua 1 nút bấm duy nhất, hệ thống tự động nhận diện và xử lý ngầm. Chuyển đổi toàn bộ thuật ngữ chuyên ngành thành ngôn ngữ bình dân ("Tiền vào" / "Tiền ra").
2. **AI OCR Xử Lý Chữ Viết Tay & Lọc Nợ Gối Đầu:** Ứng dụng mô hình ngôn ngữ lớn Google Gemini để bóc tách chính xác nét chữ viết tay lộn xộn của chủ quán hoặc thương lái. AI tự động phân tích ngữ cảnh để **loại bỏ các khoản ghi nợ, nợ gối đầu chưa trả**, chỉ giữ lại dòng tiền thực tế phát sinh nhằm bảo vệ tính chính xác của sổ sách.
3. **Lưới Lọc Thông Minh 2 Chiều (Bidirectional Smart Filter):** Cơ chế đối soát tự động độc quyền tại tầng Backend:
   * **Chiều xuôi:** Khi quét báo cáo `POS Kết Ca`, hệ thống tự động tìm và gộp (`MERGED`) toàn bộ hóa đơn bán lẻ của máy POS phát sinh trong ngày để tránh trùng lặp doanh thu.
   * **Chiều ngược:** Nếu hóa đơn lẻ máy POS được nộp muộn sau khi đã có báo cáo kết ca, hệ thống tự động bắt mạch bối cảnh để chuyển trạng thái sang `MERGED` ngay khi tạo mới.
   * *Hệ thống giữ nguyên 100% các khoản CHI và hóa đơn viết tay độc lập ngoài hệ thống POS.*
4. **Đèn Giao Thông UX (Traffic Light Control):** Giao diện đối chiếu trực quan (Split-Screen). Hệ thống tự động bao bọc viền sắc màu dựa trên mức độ tin cậy của dữ liệu AI trích xuất (Đỏ: Thấp, Vàng: Trung bình, Xanh: Cao) giúp người dùng dễ dàng kiểm soát, chỉnh sửa dữ liệu trước khi đồng bộ.
5. **Báo Cáo Tự Động Serverless (Nightly Auto-Report):** Hệ thống tự động kích hoạt thông qua Cron-job Cloud Functions vào 22h00 hằng ngày, tổng hợp luồng tiền trong ngày và bắn báo cáo trực quan dưới định dạng Markdown trực tiếp qua Telegram Bot cho chủ cửa hàng.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

Dự án được xây dựng theo mô hình **Dual-Track Agile** và chia thành phân hệ rõ ràng:
* **Frontend (Mobile App):** Xây dựng bằng Flutter theo kiến trúc Component-based (tuân thủ KISS & DRY). Tách nhỏ UI để tối ưu hiệu suất và dễ quản lý State.
* **Backend (API Gateway):** Node.js/Express đóng vai trò Proxy an toàn, xử lý logic Lưới lọc thông minh (Chỉ gộp doanh THU, giữ nguyên các khoản CHI phí ẩn) và đóng gói Payload giao tiếp với Gemini AI.
* **Automation (Cron-job):** Kiến trúc Serverless với Firebase Cloud Functions và Telegram Bot API giúp tự động bắn báo cáo thụ động mà không cần mở App.

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

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
│   │   └── apiRoutes.js           # Quản lý các cổng Endpoints (/manual-entry, /upload-receipt)
│   ├── middlewares/
│   │   └── upload.js              # Middleware Multer hứng tệp tin hình ảnh trực tiếp vào RAM
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
