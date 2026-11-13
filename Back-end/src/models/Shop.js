const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shopName: { type: String, required: true, trim: true },
  businessType: { type: String, default: 'Hộ kinh doanh bán lẻ' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false }, // true đối với cửa hàng đầu tiên tạo lúc Onboarding
  verificationDocs: [{ type: String }], // Mảng URL/Base64 ảnh giấy phép kinh doanh, mặt bằng (bắt buộc với shop thứ 2+)
  approvalStatus: {
    type: String,
    enum: ['APPROVED', 'PENDING', 'REJECTED'],
    default: 'APPROVED',
    index: true
  },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);

