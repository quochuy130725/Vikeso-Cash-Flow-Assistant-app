const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: { 
    type: String, // Đổi từ ObjectId thành String để dễ test tay
    ref: 'User',
    required: true,
    index: true 
  },  
  receiptUrl: { type: String, default: "" },  
  category: { 
    type: String, 
    enum: ["Hoa Don Le", "POS Ket Ca", "So Tay", "Khac"],
    default: "Khac" 
  },
  transactionType: { 
    type: String, 
    enum: ["THU", "CHI"], // ĐÃ BỎ KHONG_XAC_DINH
    required: true  
  },
  totalAmount: { type: Number, required: true, default: 0 },  
  reason: { type: String, default: "" },  
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