# 🚀 FinAuto - Hệ Thống Đối Soát Thông Minh & Quản Lý Dòng Tiền Cho SME

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

Dự án triển khai theo mô hình **Dual-Track Agile** với kiến trúc phân tầng chịu tải cao:
* **Frontend (Mobile App):** Xây dựng bằng Flutter theo kiến trúc Component-based (tuân thủ nghiêm ngặt nguyên lý KISS & DRY). Tách nhỏ toàn bộ UI Widget để tối ưu hóa render và quản lý trạng thái bằng `setState` tinh gọn.
* **Backend (API Gateway):** Node.js/Express đóng vai trò kiến trúc Proxy an toàn. Xử lý logic trích xuất luồng tiền 2 chiều, quản lý session tệp tin qua bộ nhớ đệm RAM (`Multer MemoryStorage`) và đóng gói payload cấu hình API tối ưu (`thinkingBudget: 0`) dưới thời gian phản hồi dưới 3 giây.
* **Database tầng dữ liệu:** MongoDB Atlas tận dụng tối đa tính chất linh hoạt cấu trúc (Schemaless) của NoSQL. Mọi dữ liệu trích xuất động của AI được gom gọn trong trường `aiRawData` sử dụng Dot Notation để truy vấn sâu mà không làm biến dạng Schema cốt lõi.

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
finauto-Cash-Flow-Assistant-app/
│
├── Back-end/                      # MÁY CHỦ NODE.JS & DATABASE (SERVER)
│   ├── package.json
│   ├── .env.example               # Cấu hình môi trường bảo mật (API keys, DB URIs)
│   ├── server.js                  # Điểm khởi chạy API Gateway kết nối ứng dụng
│   ├── test_telegram.js           # Kịch bản chạy độc lập kiểm thử tính năng bot Telegram
│   ├── config/
│   │   └── database.js            # Cấu hình driver kết nối cơ sở dữ liệu MongoDB Atlas
│   ├── models/                    # TẦNG DỮ LIỆU (Mongoose Schemas)
│   │   ├── Receipt.js             # Lưu giao dịch (Lọc trạng thái VALID/MERGED, tích hợp thuộc tính isPosBill)
│   │   └── User.js                # Quản lý tài khoản, phân tầng gói cước (FREE/PRO) và telegramChatId
│   ├── routes/
│   │   └── apiRoutes.js           # Quản lý các cổng Endpoints (/manual-entry, /upload-receipt)
│   ├── middlewares/
│   │   └── upload.js              # Middleware Multer hứng tệp tin hình ảnh trực tiếp vào RAM
│   ├── controllers/
│   │   ├── manualEntryController.js # Lưới lọc thông minh 2 chiều kiểm soát dòng tiền đối soát
│   │   └── aiReceiptController.js   # Bộ điều phối AI: Xử lý Prompt Engine V1.1 trích xuất dữ liệu JSON
│   └── functions/                 # MÃ NGUỒN AUTOMATION (Serverless Architecture)
│       └── index.js               # Firebase Cloud Functions (Cron-job Trigger 22h00 bắn báo cáo)
│
├── Front-end/
│   ├── Mobile-App/                # ỨNG DỤNG DI ĐỘNG FLUTTER (KISS & DRY)
│   │   ├── pubspec.yaml           # Quản lý dependencies hệ thống (fl_chart, dio)
│   │   └── lib/
│   │       ├── core/utils/
│   │       │   └── ui_helpers.dart      # Tiện ích chuẩn hóa hiển thị nhanh (Toast, Dialog, Đèn tín hiệu)
│   │       ├── models/            
│   │       │   └── thu_chi_model.dart   # Định kiểu đối tượng ánh xạ dữ liệu JSON
│   │       ├── services/          
│   │       │   └── api_service.dart     # Quản lý các tầng kết nối HTTP Client, Fetching Data
│   │       └── views/                   # Tầng hiển thị giao diện người dùng
│   │           ├── dashboard/
│   │           │   ├── dashboard_screen.dart # Dashboard trang chủ trực quan hóa luồng tiền
│   │           │   └── widgets/
│   │           │       ├── revenue_chart.dart # Biểu đồ fl_chart xử lý chống chồng lấp nhãn đồ thị
│   │           │       └── action_buttons.dart # Cụm phím chức năng tương tác nhanh 1-chạm
│   │           └── scan_receipt/
│   │               ├── camera_screen.dart    # Giao diện camera xử lý chặn luồng tệp tin lỗi
│   │               ├── split_screen.dart     # Giao diện đối chiếu dữ liệu thô và kết quả AI
│   │               └── widgets/
│   │                   └── editable_transaction_card.dart # Khối thông tin tích hợp sửa đổi nhanh
│   │
│   └── Web/                       # HỆ THỐNG TRANG WEB QUẢN TRỊ 
Tiêu chí,🆓 Gói FREE,💎 Gói PRO/VIP,🏢 Gói ENTERPRISE (B2B)
Đối tượng,Hộ kinh doanh nhỏ lẻ,"Thương lái, chủ vựa, quán F&B lớn","Chuỗi cửa hàng lớn, đại lý phân phối"
Giá thành,Miễn phí trọn đời,99.000đ / tháng,Từ 500.000đ - 1.000.000đ / tháng
Mô hình AI,Gemini 2.5 Flash / Lite,Gemini Pro,Hạ tầng Fine-tuned Model chuyên dụng
Năng lực cốt lõi,Quét hóa đơn in máy chuẩn(Giới hạn 30-50 hóa đơn/tháng),"Quét sổ tay viết tay, bill in nhiệt mờ(Không giới hạn số lượng quét)","Xử lý đa phân hệ chứng từ, hóa đơn VAT phức tạp"
Tính năng cao cấp,Ghi chép thu chi cơ bản,Kích hoạt Lưới lọc 2 chiềuTự động chia danh mục chi phí,Quản lý đa chi nhánhPhân quyền nhân viên/kế toán
Kết nối hệ thống,Không hỗ trợ,Nhận diện ảnh chụp màn hình ngân hàng,Kết nối thẳng Open API hệ thống Ngân hàng

💰 Mô Hình Doanh Thu & Chiến Lược Định Giá (Business Model)FinAuto ứng dụng mô hình kinh doanh Freemium kết hợp Value-based Pricing nhằm tối ưu hóa chi phí tài 
