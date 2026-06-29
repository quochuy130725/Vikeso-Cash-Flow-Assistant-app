import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:camera/camera.dart';
import '../../core/utils/ui_helpers.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isCameraInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _controller = CameraController(
          _cameras![0], // Thường là camera sau
          ResolutionPreset.high,
          enableAudio: false,
        );

        await _controller!.initialize();
        if (mounted) {
          setState(() {
            _isCameraInitialized = true;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        UIHelpers.showInfoDialog(context, 'Lỗi Camera', 'Không thể khởi tạo máy ảnh: $e');
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Live Camera Preview
            Positioned.fill(
              bottom: 120, // Chừa chỗ cho các nút điều khiển bên dưới
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[900],
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey[800]!, width: 2),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: _isCameraInitialized
                      ? CameraPreview(_controller!)
                      : const Center(
                          child: CircularProgressIndicator(color: Color(0xFFFF5C8D)),
                        ),
                ),
              ),
            ),
            
            // Hướng dẫn (Text Overlay)
            if (_isCameraInitialized)
              Positioned(
                top: 40,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Hướng khung hình vào hoá đơn/biên lai',
                      style: TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ),
                ),
              ),

            // Bottom control bar
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 120,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Gallery Input button on the bottom left
                    TextButton(
                      onPressed: () {
                        _processImageFromGallery();
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.white54,
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.photo_library_outlined, size: 24),
                          SizedBox(height: 4),
                          Text(
                            'Thư viện\n(Ảnh có sẵn)',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(width: 8),

                    // Large Capture Button in the center (Shutter)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          if (_isCameraInitialized) {
                            _takePicture();
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF5C8D),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                        ),
                        icon: const Icon(Icons.camera_alt_outlined, size: 28),
                        label: const Text(
                          'Quét tài liệu thông minh',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Back/Exit Button
            Positioned(
              top: 16,
              left: 16,
              child: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close, color: Colors.white, size: 28),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _takePicture() async {
    try {
      // Chụp ảnh bằng camera live
      final XFile image = await _controller!.takePicture();
      await _handleScannedImage(image);
    } catch (e) {
      if (mounted) {
        UIHelpers.showInfoDialog(context, 'Lỗi', 'Lỗi khi chụp ảnh: $e');
      }
    }
  }

  Future<void> _processImageFromGallery() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);

      if (image == null) return; // Người dùng hủy chọn ảnh
      await _handleScannedImage(image);
    } catch (e) {
      if (mounted) {
        UIHelpers.showInfoDialog(context, 'Lỗi', 'Không thể mở Thư viện: $e');
      }
    }
  }

  Future<void> _handleScannedImage(XFile image) async {
    if (!mounted) return;

    // Mock Loading (Giả lập gọi API AI)
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    Navigator.pop(context); // Tắt loading

    // TODO: Gửi file ảnh `image.path` lên Backend Mongoose.
    
    // Giả lập dữ liệu trả về từ AI
    final Map<String, dynamic> aiResponseData = {
      'items': [], // Mảng rỗng = không tìm thấy giao dịch
      'error_type': 'JUNK_IMAGE', 
    };

    final List items = aiResponseData['items'] as List;
    final String errorType = aiResponseData['error_type'] as String? ?? '';

    if (items.isEmpty) {
      String message = 'Không tìm thấy dữ liệu hóa đơn.';

      if (errorType == 'JUNK_IMAGE') {
        message = 'Ảnh không liên quan đến tài chính. Vui lòng chụp hóa đơn/sổ tay!';
      } else if (errorType == 'BLURRY_IMAGE') {
        message = 'Ảnh quá mờ! Vui lòng đặt lại camera và chụp rõ hơn.';
      }

      UIHelpers.showInfoDialog(context, 'Thông báo', message);
      return;
    }

    Navigator.pushNamed(context, '/split');
  }
}
