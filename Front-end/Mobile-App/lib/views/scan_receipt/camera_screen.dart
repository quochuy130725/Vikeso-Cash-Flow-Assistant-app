import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:camera/camera.dart';
import '../../core/utils/ui_helpers.dart';
import '../../data/services/api_service.dart';
import 'split_screen.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isCameraInitialized = false;
  bool _isLoading = false;

  final _apiService = ApiService();
  // TODO: Sau khi có login, lấy userId từ Session/SecureStorage
  static const String _userId = '60d5ecb8b392d70015340123';

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
          _cameras![0],
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
              bottom: 120,
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

            // Loading Overlay
            if (_isLoading)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withValues(alpha: 0.7),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: Color(0xFFFF5C8D)),
                        SizedBox(height: 16),
                        Text(
                          '🤖 AI đang phân tích hóa đơn...',
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // Hướng dẫn (Text Overlay)
            if (_isCameraInitialized && !_isLoading)
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
                    // Gallery Input button
                    TextButton(
                      onPressed: _isLoading ? null : _processImageFromGallery,
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
                    // Capture Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: (_isCameraInitialized && !_isLoading) ? _takePicture : null,
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
                onPressed: _isLoading ? null : () => Navigator.pop(context),
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
      final XFile image = await _controller!.takePicture();
      await _handleScannedImage(File(image.path));
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
      if (image == null) return;
      await _handleScannedImage(File(image.path));
    } catch (e) {
      if (mounted) {
        UIHelpers.showInfoDialog(context, 'Lỗi', 'Không thể mở Thư viện: $e');
      }
    }
  }

  Future<void> _handleScannedImage(File imageFile) async {
    if (!mounted) return;

    setState(() => _isLoading = true);

    // 🚀 GỌI API THẬT - Gửi ảnh lên Gemini AI
    final result = await _apiService.uploadReceipt(
      imageFile: imageFile,
      userId: _userId,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    final List items = (result['items'] as List?) ?? [];
    final String errorType = result['error_type'] as String? ?? '';

    // Xử lý lỗi ảnh (Chặn rác + Ảnh mờ)
    if (items.isEmpty) {
      String title = 'Không tìm thấy hóa đơn';
      String message = 'Không nhận diện được dữ liệu tài chính trong ảnh này.';

      if (errorType == 'JUNK_IMAGE') {
        title = '📷 Ảnh không hợp lệ';
        message = 'Ảnh này không liên quan đến tài chính. Vui lòng chụp hóa đơn hoặc sổ tay!';
      } else if (errorType == 'BLURRY_IMAGE') {
        title = '🌫️ Ảnh quá mờ';
        message = 'Ảnh quá mờ hoặc lóa sáng! Vui lòng đặt lại camera và chụp rõ hơn.';
      } else if (errorType == 'NETWORK_ERROR') {
        title = '📡 Lỗi kết nối';
        message = result['message'] ?? 'Không thể kết nối đến máy chủ!';
      } else if (errorType == 'SERVER_ERROR') {
        title = '⚠️ Lỗi máy chủ';
        message = result['message'] ?? 'Máy chủ đang gặp sự cố, vui lòng thử lại.';
      }

      UIHelpers.showInfoDialog(context, title, message);
      return;
    }

    // Thành công: Chuyển sang SplitScreen và truyền dữ liệu
    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SplitScreen(
          items: items.cast<Map<String, dynamic>>(),
          userId: _userId,
          imageFile: imageFile,
        ),
      ),
    );
  }
}
