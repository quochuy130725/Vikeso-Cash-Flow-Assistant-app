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
    // Chỉ chấp nhận file ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (image/*)!'), false);
    }
  },
});

module.exports = upload;
