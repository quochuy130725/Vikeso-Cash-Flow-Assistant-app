# 🤖 VIKESO - MASTER PROJECT CONTEXT (AI & DEVELOPER INSTRUCTIONS)

## 0. LỜI GỌI HỆ THỐNG (SYSTEM ROLE)
Khi nhận được tài liệu này, bạn hãy đóng vai trò là **Tech Lead và Senior Fullstack Developer (Flutter & Node.js)** của dự án **Vikeso**. Hãy đọc kỹ toàn bộ bối cảnh, kiến trúc hệ thống, cấu trúc Database và luồng nghiệp vụ dưới đây để tiếp tục phát triển codebase một cách chuẩn xác, nhất quán và tuân thủ các nguyên tắc thiết kế.

---

## 1. TỔNG QUAN DỰ ÁN
* **Tên dự án:** Vikeso (Tiền thân: FinAuto) - Trợ lý Kế toán & Đối soát dòng tiền thông minh cho SME (Hộ kinh doanh cá thể, tạp hóa, tiệm cafe, quán ăn, thương lái nông sản đầu mối).
* **Mục tiêu:** Tự động hóa toàn bộ việc quản trị dòng tiền, bóc tách hóa đơn viết tay, hóa đơn in nhiệt, chống trùng lặp doanh thu và chốt sổ cuối ngày tự động.
* **Chiến lược cốt lõi:**
  * **Trải nghiệm 1-Chạm:** 1 nút bấm chụp ảnh hóa đơn duy nhất, AI tự động xử lý toàn bộ.
  * **Ngôn ngữ bình dân:** Chuyển hóa toàn bộ thuật ngữ kế toán (Nợ/Có) thành "Tiền vào (THU)" / "Tiền ra (CHI)".
  * **Chống trùng lặp tuyệt đối:** Lưới lọc thông minh 2 chiều giữa hóa đơn bán lẻ máy POS và báo cáo POS Kết Ca.
  * **Báo cáo thụ động:** Tự động bắn báo cáo chốt ca lúc 22:00 hàng ngày qua Email HTML và Telegram Bot.
* **Tech Stack:**
  * **Frontend Mobile:** Flutter (KISS & DRY, Component-based, `fl_chart`, `flutter_secure_storage`).
  * **Frontend Web:** React / Vite / TypeScript (Dashboard quản trị nâng cao).
  * **Backend:** Node.js, Express.js (v5), MongoDB Atlas (Mongoose ODM).
  * **Realtime:** Socket.IO WebSocket Server (tự động cập nhật chart khi có giao dịch mới).
  * **AI OCR Engine:** Google Gemini 1.5 Flash (`@google/genai`, xử lý dưới 3 giây).
  * **Thông báo & Tự động hóa:** `nodemailer` (Gmail SMTP), `node-cron`, Telegram Bot API Webhook.
  * **Tài liệu API:** Swagger UI / OpenAPI 3.0 (`/api-docs`).

---

## 2. KIẾN TRÚC DATABASE (MONGODB SCHEMAS)

### 2.1. Receipt Schema (`Back-end/src/models/Receipt.js`)
```javascript
const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  receiptUrl: { type: String, default: "" },
  category: { 
    type: String, 
    enum: ["Hoa Don Le", "POS Ket Ca", "So Tay", "Chuyen Khoan", "Khac"], 
    default: "Khac" 
  },
  transactionType: { 
    type: String, 
    enum: ["THU", "CHI"], 
    required: true  
  },
  totalAmount: { type: Number, required: true, default: 0 },
  reason: { type: String, default: "" },
  confidenceLevel: { 
    type: String, 
    enum: ["HIGH", "MEDIUM", "LOW"], 
    default: "HIGH" 
  },
  status: { 
    type: String, 
    enum: ["VALID", "MERGED"], 
    default: "VALID", 
    index: true 
  },
  transactionDate: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  aiRawData: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
```

### 2.2. User Schema (`Back-end/src/models/User.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, default: '', trim: true },
  password: { type: String, default: null }, // null đối với user đăng nhập bằng Google
  shopName: { type: String, default: '', trim: true },
  telegramChatId: { type: String, default: null },
  subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  phone: { type: String, default: null },
  role: { type: String, enum: ['OWNER', 'ADMIN'], default: 'OWNER', index: true },
  
  // Google OAuth
  googleId: { type: String, default: null, index: true },
  avatar: { type: String, default: null },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // Cài đặt nhận thông báo
  notificationSettings: {
    receiveEmail: { type: Boolean, default: true },
    receiveTelegram: { type: Boolean, default: false }, // Chỉ bật khi đã kết nối Telegram
    receiveInApp: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

---

## 3. LUỒNG NGHIỆP VỤ BACKEND CỐT LÕI (CORE BACKEND SERVICES)

### 3.1. API Scan Receipt & Gemini OCR (`POST /api/scan-receipt`)
* Nhận file ảnh từ client qua `multer` lưu trực tiếp trong RAM (memoryStorage).
* Gửi ảnh tới Google Gemini AI với System Instructions nghiêm ngặt (trích xuất `totalAmount`, `category`, `transactionType`, `confidenceLevel`, `isPosBill`).
* **Lưới chặn rác:**
  * Nếu ảnh không liên quan tài chính: trả về `{ "items": [], "error_type": "JUNK_IMAGE" }`.
  * Nếu ảnh hóa đơn quá mờ: trả về `{ "items": [], "error_type": "BLURRY_IMAGE" }`.

### 3.2. API Xác Nhận Giao Dịch & Realtime WebSocket (`POST /api/confirm-receipt`)
* Lưu danh sách giao dịch hợp lệ sau khi người dùng review từ Split-Screen.
* Kích hoạt broadcast WebSocket:
  ```javascript
  const io = getIO();
  io.emit('new_transaction', { userId, transactions: savedDocs });
  ```
  Giúp Mobile App và Web Admin tự động cập nhật số dư và biểu đồ mà không cần polling.

### 3.3. Lưới Lọc Thông Minh 2 Chiều (`POST /api/manual-entry`)
* **Chiều xuôi (Quét POS Kết Ca):** Khi nhận được chứng từ `category: "POS Ket Ca"`, hệ thống tự động `updateMany` đổi `status: "MERGED"` cho toàn bộ hóa đơn `Hoa Don Le`, `THU`, `aiRawData.isPosBill: true` trong cùng ngày.
* **Chiều ngược (Hóa đơn lẻ nộp sau):** Khi nộp hóa đơn lẻ POS mà trong ngày đã tồn tại `POS Kết Ca` (`VALID`), hệ thống tự động gán `status: "MERGED"` ngay khi khởi tạo.
* *Tuyệt đối giữ nguyên 100% các khoản CHI và hóa đơn viết tay độc lập.*

### 3.4. Báo Cáo Chốt Ca Tự Động 22:00 (`cronService.js`)
* Lên lịch tự động lúc 22:00 hàng ngày (giờ Việt Nam, UTC+7).
* Gửi đồng thời qua:
  * **Email:** Nodemailer gửi email HTML chuyên nghiệp báo cáo Doanh thu, Chi phí, Lợi nhuận gộp.
  * **Telegram Bot:** Gửi tin nhắn Markdown định dạng rõ ràng qua Bot `@FinautoDemo_bot`.
* **Cơ chế báo cáo thông minh:**
  * Có giao dịch: Gửi thống kê chi tiết theo số hóa đơn.
  * Chưa có giao dịch: Gửi thông báo nhẹ nhàng *"Hôm nay cửa hàng chưa phát sinh giao dịch nào"*.
  * Hỗ trợ test thủ công qua `POST /api/test-report` với cờ `sendZeroReports: true`.

### 3.5. Webhook Telegram Bot Đa Năng (`POST /api/telegram/webhook`)
* Xử lý webhook từ Telegram Bot `@FinautoDemo_bot`.
* **3 Cách liên kết tài khoản:**
  1. Lệnh deep link: `/start <userId>`
  2. Lệnh qua email: `/start <email>`
  3. **Nhắn tin email trực tiếp:** Người dùng chỉ cần gửi email tài khoản vào tin nhắn chat, bot tự tra cứu DB và liên kết ngay lập tức.

---

## 4. QUY TẮC PHÁT TRIỂN FRONTEND (FLUTTER)
* **KISS & DRY:** Component hóa giao diện (`RevenueChart`, `EditableTransactionCard`, `UiHelpers`).
* **Đèn Giao Thông UX:** Trên màn hình `SplitScreen`:
  * Xanh lá (`HIGH`): Dữ liệu rõ ràng, tin cậy.
  * Vàng (`MEDIUM`): Dữ liệu cần kiểm tra lại số tiền.
  * Đỏ (`LOW`): Dữ liệu mờ hoặc nghi vấn, yêu cầu người dùng xác nhận thủ công.
* **Xử lý lỗi AI:** Bắt `error_type` (`JUNK_IMAGE`, `BLURRY_IMAGE`) để hiển thị thông báo thân thiện bằng tiếng Việt.
* **Toggles Thông Báo:**
  * Email và In-App mặc định BẬT khi tạo tài khoản.
  * Telegram mặc định TẮT, chỉ mở khi người dùng đã liên kết thành công với Bot Telegram.

---

## 5. DANH SÁCH 14 API ENDPOINTS (SWAGGER)
* **Auth:**
  * `POST /api/auth/register`
  * `POST /api/auth/login`
  * `POST /api/auth/google`
  * `GET /api/auth/me`
  * `PUT /api/auth/profile`
* **Transactions:**
  * `POST /api/scan-receipt`
  * `POST /api/confirm-receipt`
  * `POST /api/manual-entry`
  * `GET /api/transactions`
* **User:**
  * `GET /api/user/:id/profile`
  * `PUT /api/user/:id/notification-settings`
* **Telegram & Reports:**
  * `POST /api/telegram/webhook`
  * `GET /api/telegram/set-webhook`
  * `POST /api/test-report`
