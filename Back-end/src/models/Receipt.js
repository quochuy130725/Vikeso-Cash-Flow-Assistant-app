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

  // Mức độ tin cậy của AI khi đọc ảnh (tách ra khỏi aiRawData để dễ query/filter)
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