const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shopName: { type: String, required: true, trim: true },

  // 1. Pháp lý & Định danh doanh nghiệp/hộ kinh doanh
  businessType: {
    type: String,
    default: 'Hộ kinh doanh bán lẻ',
    trim: true,
  },
  taxCode: { type: String, default: '', trim: true, index: true }, // Mã số thuế (MST) hoặc Mã định danh HKD
  legalOwnerName: { type: String, default: '', trim: true },      // Họ tên người đại diện pháp luật
  ownerCccd: { type: String, default: '', trim: true, index: true }, // Số CCCD chủ tiệm (12 số)

  // 2. Phân tách 3 loại địa chỉ theo quy định
  address: { type: String, default: '', trim: true },            // Địa chỉ kinh doanh thực tế (quầy/sạp)
  registeredAddress: { type: String, default: '', trim: true },  // Địa chỉ ĐKKD / thường trú theo CCCD
  invoiceAddress: { type: String, default: '', trim: true },     // Địa chỉ xuất hóa đơn GTGT / Thuế

  phone: { type: String, default: '', trim: true },
  isPrimary: { type: Boolean, default: false },

  // 3. Ảnh chứng từ xác thực (KYC)
  licenseImageUrls: [{ type: String }],                          // Mảng URL ảnh Giấy phép kinh doanh
  cccdFrontUrl: { type: String, default: '' },                   // URL ảnh CCCD mặt trước
  cccdBackUrl: { type: String, default: '' },                    // URL ảnh CCCD mặt sau
  verificationDocs: [{ type: String }],                          // Giữ tương thích ngược

  // 4. Trạng thái kiểm duyệt
  approvalStatus: {
    type: String,
    enum: ['APPROVED', 'PENDING', 'REJECTED'],
    default: 'PENDING',
    index: true,
  },
  rejectionReason: { type: String, default: '' },                // Lý do từ chối nếu Admin reject
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

shopSchema.index({ ownerId: 1, isPrimary: 1 });
shopSchema.index({ taxCode: 1, approvalStatus: 1 });

module.exports = mongoose.model('Shop', shopSchema);
