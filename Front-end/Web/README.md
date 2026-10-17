# 💻 Vikeso Web Portal & Admin Dashboard

Giao diện Web chính thức của **Vikeso** (Trợ lý Quản trị Dòng tiền & Bảng điều hành Founder / Admin). Được xây dựng với **React 19, Vite 6, Tailwind CSS** và kết nối trực tiếp với Backend API Render MongoDB.

---

## 🌟 Tính Năng Trên Nền Tảng Web

1. **Trang Chủ Giới Thiệu Giải Pháp (Landing Page):**
   * Trình bày giải pháp bóc tách hóa đơn, lọc nợ gối đầu và đối soát dòng tiền cho Hộ kinh doanh.
   * Bảng giá các gói cước (FREE & PRO).
2. **Xác Thực Người Dùng (Auth Modal):**
   * Đăng nhập / Đăng ký trực tiếp với tài khoản Backend MongoDB.
   * Hỗ trợ lưu Token JWT vào `localStorage` và tự động duy trì phiên đăng nhập.
3. **Sổ Quỹ Thu Chi Dành Cho Chủ Cửa Hàng (Owner Cashflow Ledger):**
   * Xem và lọc toàn bộ giao dịch theo ngày, hôm nay, hôm qua, 7 ngày, tháng.
   * Thẻ chẩn đoán dòng tiền và cảnh báo chi phí đột biến.
4. **Bảng Điều Hành Ban Lãnh Đạo (Admin Cockpit):**
   * **Admin Overview:** Thống kê tổng quan MRR, số hộ kinh doanh, tỷ lệ tăng trưởng, tình trạng kết nối Telegram.
   * **Quản Lý Hộ Kinh Doanh (Business Households):** Tra cứu danh sách cửa hàng, số điện thoại, gói cước cước (FREE / PRO).
   * **Quản Lý Đơn Hàng & Doanh Thu (Admin Financial):** Danh sách hóa đơn gia hạn gói PRO qua cổng VietQR SePay, biểu đồ Unit Economics.
   * **Nhật Ký Dispatch Telegram (Telegram Dispatch Logs):** Lịch sử các đợt phát báo cáo tự động lúc 22:00.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Framework:** React 19 & TypeScript
* **Build Tool:** Vite 6
* **Styling:** Tailwind CSS & Lucide React Icons
* **Kiến trúc Routing:** Single Page Application (SPA) hỗ trợ định tuyến qua `vercel.json`
* **API Service:** Centralized API service (`src/services/api.ts` & `src/services/authApi.ts`)

---

## ⚙️ Cấu Hình Môi Trường (.env)

Tạo file `.env` tại thư mục gốc `Front-end/Web/`:
```env
# URL API Backend
VITE_API_URL=https://vikeso-cash-flow-assistant-app.onrender.com/api
```

---

## 🚀 Hướng Dẫn Phát Triển & Deploy

### 1. Chạy Thử Local
```bash
cd Front-end/Web
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```

### 2. Kiểm Tra Lỗi & Build Production
```bash
npm run lint    # Kiểm tra TypeScript type-check
npm run build   # Đóng gói sản phẩm vào thư mục dist/
```

### 3. Deploy Lên Vercel
1. Đẩy mã nguồn lên GitHub.
2. Trên Vercel Dashboard, bấm **Add New Project** $\rightarrow$ Chọn repository.
3. Cấu hình triển khai:
   * **Root Directory:** `Front-end/Web`
   * **Application Preset:** `Vite`
   * **Environment Variables:**
     * Key: `VITE_API_URL`
     * Value: `https://vikeso-cash-flow-assistant-app.onrender.com/api`
4. Bấm **Deploy**. Vercel sẽ tự động đọc file `vercel.json` (định dạng UTF-8 No BOM) để định tuyến SPA chuẩn xác 100%.
