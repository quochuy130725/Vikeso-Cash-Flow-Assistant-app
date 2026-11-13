const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null, index: true }, // null nếu là danh mục mặc định hệ thống
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true, trim: true },
  transactionType: { type: String, enum: ['THU', 'CHI'], required: true, index: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true }, // null = Cha; có giá trị = Con
  icon: { type: String, default: 'receipt_long' },
  color: { type: String, default: '#FF4783' },
  isSystemDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

