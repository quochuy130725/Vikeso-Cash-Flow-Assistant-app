const sharp = require('sharp');
const { analyzeReceiptImage } = require('../services/geminiAI');

/**
 * POST /api/scan-receipt
 * Bộ điều phối AI: nhận ảnh hóa đơn, nén ảnh bằng sharp,
 * gọi Gemini OCR (Prompt Engine V1.1) và trả về JSON items
 * để Flutter hiển thị trên SplitScreen. CHƯA LƯU DB ở bước này.
 */
exports.scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng upload ảnh hóa đơn (field name: image)',
      });
    }

    const { buffer } = req.file;
    console.log(`📸 Ảnh gốc nhận được: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Nén ảnh: Thu nhỏ 800px, trắng đen, tăng tương phản, nén JPEG 70%
    const compressedImageBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .jpeg({ quality: 70 })
      .toBuffer();

    console.log(`⚡ Ảnh sau nén: ${(compressedImageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📸 Đang gửi ảnh cho Gemini phân tích...`);

    // Gọi Gemini AI phân tích - CHỈ TRẢ KẾT QUẢ, CHƯA LƯU DB
    const geminiData = await analyzeReceiptImage('image/jpeg', compressedImageBuffer);
    console.log('✨ Kết quả Gemini:', JSON.stringify(geminiData, null, 2));

    // Bắt lỗi ảnh rác / ảnh mờ
    if (geminiData.error_type || !geminiData.items || geminiData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ảnh không hợp lệ hoặc quá mờ.',
        error_type: geminiData.error_type || 'UNKNOWN_ERROR',
      });
    }

    // ✅ Trả về items để Flutter hiển thị SplitScreen cho người dùng xem lại
    // Việc lưu DB sẽ xảy ra SAU KHI người dùng xác nhận qua /api/manual-entry
    return res.status(200).json({
      success: true,
      message: 'AI phân tích thành công! Vui lòng xem lại trước khi lưu.',
      items: geminiData.items,
    });

  } catch (error) {
    console.error('Lỗi scan-receipt:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
