const multer = require('multer');

/**
 * Middleware Multer - Hứng file ảnh trực tiếp vào RAM (MemoryStorage).
 * Không ghi file tạm ra ổ đĩa, phù hợp để gửi thẳng buffer sang Gemini API.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  },
  fileFilter: (req, file, cb) => {
    // Flutter khi gửi file qua multipart/form-data thường để mimetype là 'application/octet-stream'
    const allowedMimes = ['application/octet-stream', 'binary/octet-stream'];
    if (file.mimetype && (file.mimetype.startsWith('image/') || allowedMimes.includes(file.mimetype))) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (image/* hoặc binary stream)!'), false);
    }
  },
});

module.exports = upload;
