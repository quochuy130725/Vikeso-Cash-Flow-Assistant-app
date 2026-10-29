import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:camera/camera.dart';
import '../../core/utils/ui_helpers.dart';
import '../../data/services/api_service.dart';
import '../../data/services/subscription_service.dart';
import '../../data/repositories/auth_repository.dart';
import '../shared_widgets/pro_paywall_sheet.dart';
import 'split_screen.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

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
  bool _isPro = false;
  int _monthlyScans = 0;
  final List<File> _batchFiles = [];

  final _apiService = ApiService();
  // TODO: Sau khi có login, lấy userId từ Session/SecureStorage
  String get _userId => dotenv.env['USER_ID'] ?? 'demo_user_bacuong';

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _loadSubscriptionInfo();
  }

  Future<void> _loadSubscriptionInfo() async {
    final isPro = await SubscriptionService().isPro();
    final count = await SubscriptionService().getMonthlyScanCount();
    if (mounted) {
      setState(() {
        _isPro = isPro;
        _monthlyScans = count;
      });
    }
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
        UIHelpers.showInfoDialog(
            context, 'Lỗi Camera', 'Không thể khởi tạo máy ảnh: $e');
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
                      : Center(
                          child: CircularProgressIndicator(
                              color: Theme.of(context).colorScheme.primary),
                        ),
                ),
              ),
            ),

            // Loading Overlay
            if (_isLoading)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withValues(alpha: 0.8),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: Color(0xFFFF4783)),
                        SizedBox(height: 18),
                        Text(
                          'Đang đối soát chứng từ...',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // Hướng dẫn & Hạn mức (Text & Quota Overlay)
            if (_isCameraInitialized && !_isLoading)
              Positioned(
                top: 24,
                left: 16,
                right: 16,
                child: Column(
                  children: [
                    // Quota Chip
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.88),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _isPro ? const Color(0xFFD0F81B) : Colors.white24,
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _isPro ? Icons.workspace_premium_rounded : Icons.qr_code_scanner_rounded,
                            size: 15,
                            color: _isPro ? const Color(0xFFD0F81B) : const Color(0xFFFF4783),
                          ),
                          const SizedBox(width: 7),
                          Text(
                            _isPro
                                ? 'PRO • Quét gộp tối đa 3 ảnh/lần (${_batchFiles.length}/3)'
                                : 'FREE • 1 ảnh/lần (Lượt: $_monthlyScans/30)',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: _isPro ? FontWeight.w800 : FontWeight.w600,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: _showReceiptGuideDialog,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.black54,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFFD0F81B)),
                                SizedBox(width: 5),
                                Text(
                                  'Quy chuẩn ảnh hợp lệ',
                                  style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (!_isPro) ...[
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () {
                              ProPaywallSheet.show(
                                context,
                                featureTitle: 'Quét Gộp 3 Ảnh Hóa Đơn / Lần (Batch OCR)',
                                featureDescription:
                                    'Gói FREE giới hạn tải/chụp 1 ảnh hóa đơn mỗi lần. Nâng cấp VikeSo PRO để chọn hoặc chụp gộp tối đa 3 ảnh hóa đơn cùng lúc, AI sẽ bóc tách toàn bộ trong 1 lần duy nhất!',
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD0F81B),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.layers_rounded, size: 13, color: Color(0xFF0F172A)),
                                  SizedBox(width: 4),
                                  Text(
                                    'Gộp 3 ảnh (PRO)',
                                    style: TextStyle(color: Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.w900),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (_batchFiles.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFD0F81B)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ...List.generate(_batchFiles.length, (i) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 6),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.file(
                                        _batchFiles[i],
                                        width: 42,
                                        height: 42,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    Positioned(
                                      top: -2,
                                      right: -2,
                                      child: GestureDetector(
                                        onTap: () => setState(() => _batchFiles.removeAt(i)),
                                        child: Container(
                                          padding: const EdgeInsets.all(2),
                                          decoration: const BoxDecoration(
                                            color: Color(0xFFFF4783),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.close, size: 11, color: Colors.white),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(width: 6),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFD0F81B),
                                foregroundColor: const Color(0xFF0F172A),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                minimumSize: Size.zero,
                              ),
                              onPressed: () => _handleScannedBatch(List<File>.from(_batchFiles)),
                              child: Text(
                                'Phân tích ${_batchFiles.length} ảnh',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
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
                        foregroundColor: Colors.white70,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.photo_library_outlined, size: 24),
                          const SizedBox(height: 4),
                          Text(
                            _isPro ? 'Thư viện\n(Tối đa 3 ảnh)' : 'Thư viện\n(1 ảnh/lần)',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Capture Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: (_isCameraInitialized && !_isLoading)
                            ? _takePicture
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                        ),
                        icon: const Icon(Icons.camera_alt_outlined, size: 26),
                        label: Text(
                          _isPro
                              ? (_batchFiles.isEmpty
                                  ? 'Chụp Hóa Đơn (1–3 ảnh)'
                                  : 'Chụp thêm (${_batchFiles.length}/3)')
                              : 'Chụp & Quét (1 ảnh)',
                          style: const TextStyle(
                            fontSize: 15,
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

  Future<bool> _checkScanPermission() async {
    final canScan = await SubscriptionService().canScan();
    if (!canScan) {
      if (mounted) {
        ProPaywallSheet.show(
          context,
          featureTitle: 'Đã Hết Lượt Quét AI Tháng Này',
          featureDescription:
              'Bạn đã sử dụng hết 30 lượt quét hóa đơn AI miễn phí trong tháng này. Hãy nâng cấp gói VikeSo PRO để quét chứng từ không giới hạn, hoặc sử dụng tính năng Ghi chép thủ công (0đ không giới hạn).',
        );
      }
      return false;
    }
    return true;
  }

  void _showReceiptGuideDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Quy chuẩn ảnh hóa đơn AI OCR', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('✓ HỢP LỆ (AI nhận diện chính xác):', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF0F172A), fontSize: 13)),
            SizedBox(height: 4),
            Text('• Hóa đơn in nhiệt máy POS, phiếu tính tiền siêu thị/quán ăn.\n• Sổ tay ghi chép thu chi rõ chữ số.\n• Ảnh chụp màn hình biên lai chuyển khoản ngân hàng (UNC).', style: TextStyle(fontSize: 12.5, height: 1.4)),
            SizedBox(height: 12),
            Text('✕ TỪ CHỐI (Hệ thống tự động chặn):', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFFF4783), fontSize: 13)),
            SizedBox(height: 4),
            Text('• Ảnh chân dung, phong cảnh, đồ vật không chứa số liệu thu chi.\n• Ảnh bị mờ nhòe, lóa sáng mất chữ số tổng tiền.', style: TextStyle(fontSize: 12.5, height: 1.4)),
            SizedBox(height: 12),
            Text('💡 Gói FREE: Tối đa 1 ảnh/lần.\n⚡ Gói PRO: Quét gộp tối đa 3 ảnh hóa đơn/lần (Batch OCR).', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Đã hiểu', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _takePicture() async {
    final allowed = await _checkScanPermission();
    if (!allowed) return;

    try {
      final XFile image = await _controller!.takePicture();
      if (!mounted) return;
      final file = File(image.path);
      if (_isPro) {
        if (_batchFiles.length >= 3) {
          UIHelpers.showWarningToast(context, 'Gói PRO quét gộp tối đa 3 ảnh/lần!');
          return;
        }
        setState(() {
          _batchFiles.add(file);
        });
        if (_batchFiles.length == 3) {
          await _handleScannedBatch(List<File>.from(_batchFiles));
        }
      } else {
        await _handleScannedBatch([file]);
      }
    } catch (e) {
      if (mounted) {
        UIHelpers.showInfoDialog(context, 'Lỗi', 'Lỗi khi chụp ảnh: $e');
      }
    }
  }

  Future<void> _processImageFromGallery() async {
    final allowed = await _checkScanPermission();
    if (!allowed) return;

    try {
      final ImagePicker picker = ImagePicker();
      if (_isPro) {
        final List<XFile> picked = await picker.pickMultiImage();
        if (picked.isEmpty) return;
        if (picked.length > 3) {
          if (mounted) {
            UIHelpers.showWarningToast(
              context,
              'Gói PRO hỗ trợ quét gộp tối đa 3 ảnh/lần. Đã lấy 3 ảnh đầu tiên!',
            );
          }
        }
        final files = picked.take(3).map((x) => File(x.path)).toList();
        await _handleScannedBatch(files);
      } else {
        final XFile? image = await picker.pickImage(source: ImageSource.gallery);
        if (image == null) return;
        await _handleScannedBatch([File(image.path)]);
      }
    } catch (e) {
      if (mounted) {
        UIHelpers.showInfoDialog(context, 'Lỗi', 'Không thể mở Thư viện: $e');
      }
    }
  }

  Future<void> _handleScannedBatch(List<File> files) async {
    if (!mounted || files.isEmpty) return;

    setState(() => _isLoading = true);

    final resolvedUserId = await AuthRepository().getUserId() ?? _userId;
    final List<Map<String, dynamic>> aggregatedItems = [];
    String lastErrorType = '';
    String lastErrorMessage = '';

    for (final imageFile in files) {
      final result = await _apiService.uploadReceipt(
        imageFile: imageFile,
        userId: resolvedUserId,
      );
      final List items = (result['items'] as List?) ?? [];
      if (items.isNotEmpty) {
        aggregatedItems.addAll(items.cast<Map<String, dynamic>>());
      } else {
        lastErrorType = result['error_type'] as String? ?? '';
        lastErrorMessage = result['message'] as String? ?? '';
      }
    }

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _batchFiles.clear();
    });

    if (aggregatedItems.isEmpty) {
      String title = 'Không tìm thấy hóa đơn';
      String message = 'Không nhận diện được dữ liệu tài chính trong ảnh này.';

      if (lastErrorType == 'JUNK_IMAGE') {
        title = '📷 Ảnh không hợp lệ';
        message =
            'Ảnh này không liên quan đến tài chính. Vui lòng chụp hóa đơn hoặc sổ tay!';
      } else if (lastErrorType == 'BLURRY_IMAGE') {
        title = '🌫️ Ảnh quá mờ';
        message =
            'Ảnh quá mờ hoặc lóa sáng! Vui lòng đặt lại camera và chụp rõ hơn.';
      } else if (lastErrorType == 'NETWORK_ERROR') {
        title = '📡 Lỗi kết nối';
        message = lastErrorMessage.isNotEmpty ? lastErrorMessage : 'Không thể kết nối đến máy chủ!';
      } else if (lastErrorType == 'SERVER_ERROR') {
        title = '⚠️ Lỗi máy chủ';
        message = lastErrorMessage.isNotEmpty
            ? lastErrorMessage
            : 'Máy chủ đang gặp sự cố, vui lòng thử lại.';
      }

      UIHelpers.showInfoDialog(context, title, message);
      return;
    }

    await SubscriptionService().recordScan();
    _loadSubscriptionInfo();

    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SplitScreen(
          items: aggregatedItems,
          userId: resolvedUserId,
          imageFile: files.first,
        ),
      ),
    );
  }
}
