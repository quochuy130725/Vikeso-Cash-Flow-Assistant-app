# 🚀 Vikeso Backend - Core API & Realtime Services

Hệ thống máy chủ Backend của **Vikeso** (Trợ lý Kế toán & Quản trị Dòng tiền Thông minh cho Hộ kinh doanh SME). Xây dựng trên nền tảng **Node.js, Express, MongoDB Atlas, Socket.IO, Google Gemini AI, Nodemailer và Telegram Bot API**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js (v5)
* **Cơ sở dữ liệu:** MongoDB Atlas & Mongoose ODM
* **Realtime Communication:** Socket.IO (WebSocket)
* **Trí tuệ nhân tạo (AI OCR):** Google Gemini 1.5 Flash (`@google/genai`)
* **Xác thực:** JWT (JSON Web Tokens), `bcryptjs`, Google OAuth 2.0 (`google-auth-library`)
* **Tự động hóa & Thông báo:** `node-cron`, `nodemailer` (Gmail SMTP), Telegram Bot Webhook API
* **API Documentation:** Swagger UI (`swagger-ui-express`)

---

## 📂 Cấu Trúc Thư Mục Backend

```text
Back-end/
├── server.js                      # Entry point: HTTP Server, Socket.IO & Route Mounting
├── package.json                   # Dependencies & Scripts
├── .env.example                   # Mẫu cấu hình biến môi trường
├── README.md                      # Tài liệu kỹ thuật Backend
└── src/
    ├── config/
    │   ├── database.js            # Kết nối MongoDB Atlas
    │   └── swagger.json           # Đặc tả OpenAPI 3.0 (14 Endpoints)
    ├── controllers/
    │   ├── aiReceiptController.js # Gemini OCR scan bill & confirm transactions
    │   ├── authController.js      # Register, Login, Google Sign-In, Profile
    │   ├── manualEntryController.js # Nhập tay + Lưới lọc 2 chiều (Bidirectional Smart Filter)
    │   └── telegramController.js  # Webhook Telegram Bot (Tự động liên kết qua email)
    ├── middlewares/
    │   ├── upload.js              # Multer memory storage (hứng ảnh vào RAM)
    │   └── verifyToken.js         # Xác thực JWT Bearer Token
    ├── models/
    │   ├── Receipt.js             # Mongoose schema: Hóa đơn & Giao dịch
    │   └── User.js                # Mongoose schema: Người dùng, Role & Notification Settings
    ├── routes/
    │   ├── apiRoutes.js           # Routes giao dịch, profile, telegram, báo cáo
    │   └── authRoutes.js          # Routes xác thực người dùng
    ├── services/
    │   ├── cronService.js         # Báo cáo tự động chốt ca 22:00 (Email + Telegram)
    │   └── geminiAI.js            # Cấu hình SDK Gemini
    └── socket/
        └── index.js               # Quản lý WebSocket Server & Broadcast events
```

---

## 🔑 Biến Môi Trường (.env)

Tạo file `.env` tại thư mục gốc của `Back-end/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/FinAuto_MVP?retryWrites=true&w=majority

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Authentication
JWT_SECRET=your_jwt_super_secret_key_2026
JWT_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Email Notification (Gmail App Password)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_16_character_app_password

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
SERVER_URL=https://vikeso-cash-flow-assistant-app.onrender.com
```

---

## 🌟 Các Tính Năng & Cơ Chế Cốt Lõi

### 1. Lưới Lọc Thông Minh 2 Chiều (Bidirectional Smart Filter)
Xử lý tại `manualEntryController.js` nhằm triệt tiêu lỗi trùng lặp doanh thu giữa hóa đơn lẻ và báo cáo tổng kết ca máy POS:
* **Chiều 1 (Nộp POS Kết Ca):** Tự động tìm và cập nhật `status: "MERGED"` cho toàn bộ hóa đơn lẻ POS (`Hoa Don Le`, `THU`, `isPosBill: true`) phát sinh trong cùng ngày kinh doanh.
* **Chiều 2 (Nộp Hóa đơn lẻ POS sau):** Tự động kiểm tra trong ngày đã có `POS Kết Ca` chưa. Nếu đã có, hóa đơn lẻ được đánh dấu `status: "MERGED"` ngay khi lưu.
* *Tuyệt đối giữ nguyên 100% các khoản CHI và hóa đơn viết tay độc lập.*

### 2. Realtime WebSocket Broadcast
* Khi người dùng xác nhận lưu giao dịch (`POST /api/confirm-receipt`), máy chủ tự động phát sự kiện WebSocket:
  ```javascript
  io.emit('new_transaction', { userId, transactions: savedDocs });
  ```
* Ứng dụng di động (Flutter) và Web Dashboard tự động cập nhật biểu đồ và bảng thu chi tức thì mà không cần reload trang.

### 3. Báo Cáo Chốt Ca Cuối Ngày 22:00 (Dual-Channel)
* Được điều phối bởi `cronService.js` chạy định kỳ lúc **22:00 hàng ngày (giờ Việt Nam, UTC+7)**.
* **Kênh Email:** Sử dụng `nodemailer` gửi email HTML thương hiệu Vikeso tổng hợp Tổng Thu, Tổng Chi, Lợi Nhuận Gộp và số hóa đơn trong ngày.
* **Kênh Telegram:** Tự động gửi tin nhắn Markdown chốt ca đến Telegram cá nhân của chủ quán.
* **Cơ chế thông minh:**
  * Nếu hôm nay không phát sinh giao dịch, hệ thống thông báo nhẹ nhàng: *"Hôm nay chưa phát sinh giao dịch nào"*.
  * Hỗ trợ kích hoạt test báo cáo ngay lập tức thông qua `POST /api/test-report` với tùy chọn `{ sendZeroReports: true }`.

### 4. Telegram Bot Webhook Đa Năng
* Webhook tại `POST /api/telegram/webhook`.
* **Cơ chế liên kết tài khoản:**
  1. Deep link từ Mobile App: `/start <userId>`
  2. Deep link qua Email: `/start <email>`
  3. **Nhắn tin Email trực tiếp:** Người dùng chỉ cần gửi địa chỉ email của mình vào bot chat (ví dụ `user@gmail.com`), bot sẽ tự động tra cứu MongoDB, lưu `telegramChatId` và kích hoạt nhận thông báo.

---

## 📡 Danh Sách API (25 Endpoints)

Tài liệu Swagger tương tác trực quan xem tại: **`/api-docs`**

### 1. Nhóm Xác Thực (Auth)
| Method | Endpoint | Mô tả | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Đăng ký tài khoản Email/Mật khẩu | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống | ❌ |
| `POST` | `/api/auth/google` | Đăng nhập nhanh bằng Google (idToken) | ❌ |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ Bearer |
| `PUT` | `/api/auth/profile` | Cập nhật tên cửa hàng, SĐT, avatar | ✅ Bearer |

### 2. Nhóm Giao Dịch & AI (Transactions)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/scan-receipt` | Upload ảnh hóa đơn để Gemini OCR bóc tách |
| `POST` | `/api/confirm-receipt` | Lưu hóa đơn sau khi review SplitScreen & broadcast WebSocket |
| `POST` | `/api/manual-entry` | Nhập giao dịch thủ công qua Lưới lọc 2 chiều |
| `GET` | `/api/transactions?userId=...` | Lấy danh sách lịch sử thu chi theo người dùng |

### 3. Nhóm Cài Đặt Người Dùng (User)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/user/:id/profile` | Lấy trạng thái Telegram (`hasTelegram`) và cài đặt nhận tin |
| `PUT` | `/api/user/:id/notification-settings` | Bật/tắt nhận thông báo (Email, Telegram, In-App) |

### 4. Nhóm Telegram & Báo Cáo (Telegram & Reports)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/telegram/webhook` | Webhook tiếp nhận tin nhắn từ Telegram Bot |
| `GET` | `/api/telegram/set-webhook` | Đăng ký Webhook URL với Telegram API (gọi 1 lần) |
| `POST` | `/api/test-report` | Kích hoạt gửi báo cáo chốt ca kiểm tra ngay lập tức |

### 5. Nhóm Thanh Toán SePay VietQR (Billing)
| Method | Endpoint | Mô tả | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/billing/create-order` | Tạo đơn hàng nâng cấp PRO và sinh mã VietQR | ❌ |
| `GET` | `/api/billing/status/:orderCode` | Kiểm tra trạng thái đơn hàng (PENDING / PAID / EXPIRED) | ❌ |
| `GET` | `/api/billing/history?userId=...` | Lịch sử các giao dịch nâng cấp gói của user | ❌ |
| `POST` | `/api/billing/sepay/webhook` | Webhook tiếp nhận thanh toán từ SePay Gateway (xác thực API Key) | 🔑 SePay Key |

### 6. Nhóm Quản Trị Hệ Thống (Admin - Yêu cầu Role ADMIN)
| Method | Endpoint | Mô tả | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/overview` | Thống kê tổng quan: Users, Giao dịch, Doanh thu SePay | 🛡️ Admin Token |
| `GET` | `/api/admin/users` | Danh sách người dùng hệ thống (kèm phân trang, tìm kiếm) | 🛡️ Admin Token |
| `GET` | `/api/admin/users/:id` | Xem chi tiết 1 người dùng | 🛡️ Admin Token |
| `PUT` | `/api/admin/users/:id/role` | Cập nhật quyền hạn (OWNER / ADMIN) | 🛡️ Admin Token |
| `PUT` | `/api/admin/users/:id/plan` | Cập nhật gói cước thủ công (FREE / PRO) | 🛡️ Admin Token |
| `GET` | `/api/admin/transactions` | Danh sách toàn bộ hóa đơn/giao dịch trong hệ thống | 🛡️ Admin Token |
| `GET` | `/api/admin/payments` | Danh sách lịch sử đơn hàng thanh toán SePay | 🛡️ Admin Token |

---

## 🚀 Hướng Dẫn Khởi Chạy Local

```bash
# 1. Di chuyển vào thư mục Back-end
cd Back-end

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Tạo file cấu hình môi trường
cp .env.example .env
# (Điền các khóa kết nối MONGO_URI, GEMINI_API_KEY,...)

# 4. Khởi chạy máy chủ ở chế độ phát triển
npm run dev

# 5. Mở tài liệu API trên trình duyệt
# http://localhost:5000/api-docs
```
