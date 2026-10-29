const mongoose = require('mongoose');
const { calculateAccountingDate, normalizePaymentMethod } = require('../utils/accountingDate');

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
  aiRawData: { type: Object, default: {} },

  // --- CÁC TRƯỜNG NÂNG CẤP & BỔ SUNG MỚI (v3.2) ---
  shopId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    default: null, 
    index: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null, 
    index: true 
  },
  createdByRole: { 
    type: String, 
    enum: ['OWNER', 'STAFF'], 
    default: 'OWNER' 
  },
  createdByName: { 
    type: String, 
    default: '' 
  },

  // Nguồn nhập và hình thức thanh toán
  entrySource: {
    type: String,
    enum: ['AI_SCAN', 'MANUAL', 'POS_SETTLEMENT'],
    default: 'AI_SCAN'
  },
  paymentMethod: {
    type: String,
    enum: ['TIEN_MAT', 'CHUYEN_KHOAN', 'THE_POS'],
    default: 'TIEN_MAT',
    index: true
  },

  // Cây danh mục (Cha - Con)
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null, 
    index: true 
  },
  parentCategoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null, 
    index: true 
  },
  categoryName: { type: String, default: '' },
  parentCategoryName: { type: String, default: '' },

  // Ngày hạch toán chốt sổ (Quy tắc 22:00)
  accountingDate: { 
    type: Date, 
    required: true, 
    default: function() {
      return calculateAccountingDate(this.transactionDate || Date.now());
    },
    index: true 
  }
}, { timestamps: true });

// Pre-validate hook để tự động điền accountingDate và normalize paymentMethod nếu chưa có
receiptSchema.pre('validate', function() {
  if (!this.accountingDate) {
    this.accountingDate = calculateAccountingDate(this.transactionDate || Date.now());
  }
  if (!this.paymentMethod) {
    this.paymentMethod = normalizePaymentMethod(
      this.paymentMethod,
      this.category,
      this.reason,
      Boolean(this.aiRawData?.isPosBill)
    );
  }
});

module.exports = mongoose.model('Receipt', receiptSchema);
