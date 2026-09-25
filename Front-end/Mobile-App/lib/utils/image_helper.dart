import 'dart:io';

class ImageHelper {
  // Tiền xử lý ảnh gốc: Crop cắt viền thừa
  static Future<File> cropImage(File originalImage) async {
    // Giả lập xử lý cắt viền nhanh
    await Future.delayed(const Duration(milliseconds: 300));
    return originalImage;
  }

  // Bộ lọc tăng độ tương phản giúp AI nhận diện tốt hơn
  static Future<File> enhanceContrast(File image) async {
    // Giả lập tăng độ sáng/tương phản
    await Future.delayed(const Duration(milliseconds: 200));
    return image;
  }
}
