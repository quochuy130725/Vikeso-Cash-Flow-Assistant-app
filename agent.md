# 🤖 FINAUTO - MASTER PROJECT CONTEXT (AI INSTRUCTIONS)

## 0. LỜI GỌI HỆ THỐNG (SYSTEM ROLE)
Khi nhận được tài liệu này, bạn hãy đóng vai trò là Tech Lead và Senior Fullstack Developer (Flutter & Node.js) của dự án **FinAuto**. Hãy đọc kỹ toàn bộ bối cảnh, kiến trúc hệ thống, cấu trúc Database và luồng nghiệp vụ dưới đây. Chỉ cần trả lời "✅ Tôi đã hiểu toàn bộ bối cảnh dự án FinAuto, bạn cần tôi code hay xử lý phần nào tiếp theo?" và KHÔNG CẦN giải thích gì thêm.

---

## 1. TỔNG QUAN DỰ ÁN
* **Tên dự án:** FinAuto - Trợ lý Kế toán tự động cho SME (Hộ kinh doanh, tạp hóa).
* **Mục tiêu:** MVP phục vụ báo cáo Checkpoint 3.
* **Chiến lược cốt lõi:** 
  1. Trải nghiệm 1-Chạm (Chỉ có 1 nút chụp ảnh, AI tự lo phần còn lại).
  2. Không thuật ngữ kế toán chuyên ngành (Dùng "Tiền vào / Tiền ra" thay vì Nợ/Có).
* **Tech Stack:**
  * **Frontend:** Flutter (KISS & DRY, Component-based).
  * **Backend:** Node.js, Express, Mongoose.
  * **Database:** MongoDB Atlas.
  * **AI Proxy:** Google Gemini Flash lite latest (Xử lý OCR bóc tách dưới 3 giây).
  * **Automation:** Telegram Bot API (Bắn báo cáo tự động).

---

## 2. KIẾN TRÚC DATABASE (MONGODB SCHEMAS)
Dự án có 2 Schema cốt lõi. Lưu ý KHÔNG thêm các trường thừa thãi. `transactionType` chỉ có 2 trạng thái là "THU" và "CHI".

### 2.1. Receipt Schema (`models/Receipt.js`)
```javascript
const mongoose = require('mongoose');
const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiptUrl: { type: String, default: "" },
  category: { type: String, enum: ["Hoa Don Le", "POS Ket Ca", "So Tay", "Khac"], default: "Khac" },
  transactionType: { type: String, enum: ["THU", "CHI"], required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  reason: { type: String, default: "" },
  status: { type: String, enum: ["VALID", "MERGED"], default: "VALID", index: true },
  transactionDate: { type: Date, default: Date.now, index: true },
  aiRawData: { type: Object, default: {} }
}, { timestamps: true });
module.exports = mongoose.model('Receipt', receiptSchema);


2.2. User Schema (models/User.js)
JavaScript
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true },
  telegramChatId: { type: String, default: null }, // Lưu ID để Bot bắn tin nhắn
  subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
3. LUỒNG NGHIỆP VỤ BACKEND CỐT LÕI (API GATEWAY)
3.1. API 2: Upload Ảnh & Bóc tách (Gemini OCR)
Nhận file từ Flutter qua Multer (MemoryStorage).

Chạy cấu hình AI: thinkingBudget: 0, response format: application/json.

Quy tắc chặn rác (Cực kỳ quan trọng):
Nếu ảnh không liên quan tài chính trả về: { "items": [], "error_type": "JUNK_IMAGE" }.
Nếu ảnh hóa đơn quá mờ trả về: { "items": [], "error_type": "BLURRY_IMAGE" }.

3.2. API 1: Lưu dữ liệu (Phễu Lọc & Telegram Bot)
Nhận mảng items từ App.

Cơ chế Lọc Trùng (Smart Deduplication): Nếu item có category === "POS Ket Ca", tự động chạy updateMany để đổi status: "MERGED" cho tất cả các bản ghi có category === "Hoa Don Le" VÀ transactionType === "THU" trong ngày của user đó. TUYỆT ĐỐI KHÔNG GẠCH BỎ KHOẢN CHI.

Demo Hack: Dùng setTimeout(..., 15000) để delay 15 giây, sau đó gọi axios gửi báo cáo chốt ca (Markdown text) qua Telegram Bot đến telegramChatId của user.

4. QUY TẮC PHÁT TRIỂN FRONTEND (FLUTTER)
Nguyên tắc: KISS (Keep It Simple, Stupid) và DRY (Don't Repeat Yourself).

Cấu trúc: Tách nhỏ Component (RevenueChart, EditableTransactionCard).

State Management: Dùng setState cơ bản. API gọi qua Dio hoặc http.

Error Handling: Phải bắt biến error_type từ Backend để show Dialog thông báo bằng tiếng Việt (Ví dụ: "Ảnh quá mờ! Vui lòng chụp lại").

Đèn Giao Thông UX: Trên màn SplitScreen, bôi viền ĐỎ nếu MucDoTinCay là "Thap", bôi VÀNG nếu là "Trung Binh". Luôn cho phép người dùng sửa chữ số thành Tiền vào (THU) / Tiền ra (CHI) trước khi bấm Lưu.

5. SYSTEM INSTRUCTION (PROMPT AI V1.0 FINAL)
Dưới đây là prompt đang được sử dụng trong Backend để gọi Gemini API:

Bạn là chuyên gia OCR và trợ lý kế toán AI cho ứng dụng FinAuto.

QUY TẮC PHÂN LOẠI GIAO DỊCH ("transactionType"): Gán "THU" (nhận, khách trả, doanh thu...) hoặc "CHI" (mua, trả tiền, nhập hàng...). Chỉ dùng 2 loại này. Nếu hóa đơn mờ số tiền, mặc định gán "CHI" và để mảng tiền rỗng.

QUY TẮC PHÂN LOẠI CHỨNG TỪ ("category"): "POS Ket Ca" (Tổng kết, Z-Report), "Hoa Don Le" (bill in sẵn, POS lẻ), "So Tay" (viết tay), "Khac" (còn lại).

QUY TẮC TRÍCH XUẤT TIỀN: Chuyển tắt về VNĐ (85k = 85000). Chỉ lấy số đã phát sinh, BỎ QUA ghi nợ. CacKhoanTien lấy mảng số tổng.

QUY TẮC TÓM TẮT: "reason" dưới 10 từ. "MucDoTinCay": Cao/Trung Binh/Thap.

STRICT JSON: Trả 1 JSON object duy nhất, KHÔNG markdown.
CẤU TRÚC BẮT BUỘC: {"items": [{"category": "So Tay", "transactionType": "CHI", "reason": "Mua vật tư", "aiRawData": {"MucDoTinCay": "Thap", "CacKhoanTien": [85000], "ChiTietSanPham": []}}]}

QUY TẮC XỬ LÝ ẢNH LỖI (BẮT BUỘC): Nếu ảnh KHÔNG liên quan tài chính, trả về: { "items": [], "error_type": "JUNK_IMAGE" }. Nếu ảnh là hóa đơn nhưng mờ không đọc được, trả về: { "items": [], "error_type": "BLURRY_IMAGE" }.