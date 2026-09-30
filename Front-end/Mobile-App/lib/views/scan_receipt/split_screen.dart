import 'dart:io';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/utils/ui_helpers.dart';
import '../../data/services/api_service.dart';
import 'widgets/editable_transaction_card.dart';

class SplitScreen extends StatefulWidget {
  final List<Map<String, dynamic>> items;
  final String userId;
  final File? imageFile;

  const SplitScreen({
    super.key,
    required this.items,
    required this.userId,
    this.imageFile,
  });

  @override
  State<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends State<SplitScreen> {
  String _selectedCategory = 'Hoa Don Le';
  late List<Map<String, dynamic>> _transactionItems;
  bool _isSaving = false;

  final _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    // Map dữ liệu từ raw Gemini items (scan-receipt chỉ phân tích, chưa lưu)
    // Schema Gemini: { category, transactionType, reason, aiRawData: { MucDoTinCay, CacKhoanTien } }
    _transactionItems = widget.items.map((item) {
      final rawData = item['aiRawData'] as Map<String, dynamic>? ?? {};
      final List amounts = rawData['CacKhoanTien'] as List? ?? [];

      // Tính tổng từ mảng CacKhoanTien (Gemini trả về)
      final double totalAmount = amounts.fold(0.0, (sum, val) => sum + (val as num).toDouble());

      // Tìm khóa MucDoTinCay một cách linh hoạt (không phân biệt hoa thường)
      String confidenceVal = 'Cao';
      rawData.forEach((k, v) {
        if (k.toLowerCase().replaceAll(' ', '') == 'mucdotincay') {
          confidenceVal = v.toString();
        }
      });

      return {
        'transactionType': item['transactionType'] ?? 'CHI',
        'amount': totalAmount.toInt().toString(),
        'reason': item['reason'] ?? '',
        'confidence': confidenceVal,
        'category': item['category'] ?? _selectedCategory,
        'rawData': rawData,
      };
    }).toList();

    // Lấy category từ item đầu tiên nếu có
    if (_transactionItems.isNotEmpty && _transactionItems.first['category'] != null) {
      _selectedCategory = _transactionItems.first['category'];
    }

    // Hiện đèn giao thông sau khi màn hình load xong
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showTrafficLightAlert();
    });
  }

  bool _isThap(String conf) {
    final c = conf.toLowerCase();
    return c.contains('thap') || c.contains('thấp');
  }

  bool _isTrungBinh(String conf) {
    final c = conf.toLowerCase();
    return c.contains('trung') || c.contains('binh') || c.contains('bình');
  }

  void _showTrafficLightAlert() {
    bool hasThap = _transactionItems.any((item) => _isThap(item['confidence'] as String));
    bool hasTrungBinh = _transactionItems.any((item) => _isTrungBinh(item['confidence'] as String));

    if (hasThap) {
      UIHelpers.showInfoDialog(
        context,
        '🚨 Cảnh báo mờ/khó đọc',
        'Một số khoản mục AI đọc chưa chắc chắn (viền đỏ). Anh/chị vui lòng đối chiếu lại thật kỹ trước khi lưu nhé!',
      );
    } else if (hasTrungBinh) {
      UIHelpers.showWarningToast(
        context,
        '⚠️ Chữ viết hơi dính nét, anh/chị lướt qua xem AI có tính nhầm không nhé.',
      );
    } else {
      UIHelpers.showSuccessToast(context, '✨ AI đã quét thành công với độ chính xác cao!');
    }
  }

  Color _getTrafficColor(String confidence) {
    if (_isThap(confidence)) return Colors.red;
    if (_isTrungBinh(confidence)) return Colors.orange;
    return Colors.grey;
  }

  void _removeItem(int index) {
    setState(() {
      _transactionItems.removeAt(index);
    });
  }

  Future<void> _onSave() async {
    if (_transactionItems.isEmpty) {
      UIHelpers.showWarningToast(context, 'Danh sách trống, không có gì để lưu!');
      return;
    }

    setState(() => _isSaving = true);

    // Chuẩn bị danh sách items gửi lên Backend
    final itemsToSave = _transactionItems.map((item) {
      return {
        'category': _selectedCategory,
        'transactionType': item['transactionType'],
        'reason': item['reason'],
        'aiRawData': {
          ...item['rawData'] as Map<String, dynamic>? ?? {},
          'CacKhoanTien': [int.tryParse(item['amount'].toString()) ?? 0],
        },
      };
    }).toList();

    // 🚀 GỌI API THẬT - Lưu giao dịch vào MongoDB
    final success = await _apiService.saveTransactions(
      userId: widget.userId,
      items: itemsToSave,
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      _showSuccessDialog();
    } else {
      UIHelpers.showInfoDialog(
        context,
        '❌ Lưu thất bại',
        'Không thể kết nối đến máy chủ. Kiểm tra lại Wifi và đảm bảo Backend đang chạy!',
      );
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Text('🎉 ', style: TextStyle(fontSize: 24)),
            Text('Lưu thành công!', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'Giao dịch đã được AI đối soát và lưu vào hệ thống. Báo cáo tổng kết sẽ được gửi tự động lúc 22:00 tối nay.',
          style: TextStyle(height: 1.5),
        ),
        actions: [
          // Nút Mở Telegram
          ElevatedButton.icon(
            onPressed: () async {
              final link = ApiService.getTelegramDeepLink(widget.userId);
              final uri = Uri.parse(link);
              try {
                final ok = await launchUrl(
                  uri,
                  mode: LaunchMode.externalApplication,
                );
                if (!ok) {
                  await launchUrl(uri, mode: LaunchMode.platformDefault);
                }
              } catch (_) {
                try {
                  await launchUrl(uri, mode: LaunchMode.platformDefault);
                } catch (e) {
                  if (context.mounted) {
                    UIHelpers.showSnackBar(
                        context, 'Không thể mở Telegram: $e', backgroundColor: Colors.red);
                  }
                }
              }
            },
            icon: const Icon(Icons.send, size: 18),
            label: const Text('Nhận báo cáo Telegram'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0088CC), // Màu Telegram
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              // Về Dashboard - xóa sạch stack navigation
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/dashboard',
                (route) => false,
              );
            },
            child: const Text('Về trang chủ'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: theme.colorScheme.primary,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Rà soát ảnh',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // Nửa trên: Ảnh hóa đơn đã chụp
          Expanded(
            flex: 4,
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[350]!),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Hiển thị ảnh thật nếu có, ngược lại dùng placeholder
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: widget.imageFile != null
                        ? Image.file(
                            widget.imageFile!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: double.infinity,
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.receipt_long, size: 64, color: Colors.grey[500]),
                              const SizedBox(height: 8),
                              Text(
                                'ẢNH ĐÃ QUÉT OCR',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                  ),
                  // Badge "Đã quét OCR"
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle, 
                            color: _transactionItems.any((i) => _isThap(i['confidence']?.toString() ?? '')) 
                                ? Colors.red 
                                : _transactionItems.any((i) => _isTrungBinh(i['confidence']?.toString() ?? '')) 
                                    ? Colors.orange 
                                    : Colors.green, 
                            size: 14
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'Đã quét OCR',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Nửa dưới: Danh sách các Card
          Expanded(
            flex: 6,
            child: Container(
              color: Colors.grey[50],
              child: Column(
                children: [
                  // Dropdown chọn phân loại nguồn chung
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    child: DropdownButtonFormField<String>(
                      initialValue: _selectedCategory,
                      decoration: const InputDecoration(
                        labelText: 'Phân loại nguồn',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        fillColor: Colors.white,
                        filled: true,
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Hoa Don Le', child: Text('Hoá đơn lẻ')),
                        DropdownMenuItem(value: 'POS Ket Ca', child: Text('POS kết ca')),
                        DropdownMenuItem(value: 'So Tay', child: Text('Sổ tay')),
                        DropdownMenuItem(value: 'Khac', child: Text('Khác')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedCategory = val);
                      },
                    ),
                  ),

                  // Danh sách Card cuộn được
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 12.0),
                      itemCount: _transactionItems.length,
                      itemBuilder: (context, index) {
                        final item = _transactionItems[index];
                        final confidence = (item['confidence'] as String).toLowerCase();
                        final borderColor = _getTrafficColor(confidence);

                        return EditableTransactionCard(
                          key: ValueKey(item),
                          item: item,
                          borderColor: borderColor,
                          confidence: confidence,
                          onDelete: () => _removeItem(index),
                          onTypeChanged: (newType) {
                            setState(() => item['transactionType'] = newType);
                          },
                          onAmountChanged: (val) {
                            setState(() => item['amount'] = val);
                          },
                          onReasonChanged: (val) {
                            setState(() => item['reason'] = val);
                          },
                        );
                      },
                    ),
                  ),

                  // Nút Lưu
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: colorScheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        onPressed: _isSaving ? null : _onSave,
                        child: _isSaving
                            ? const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Text('Đang lưu...', style: TextStyle(fontSize: 16)),
                                ],
                              )
                            : const Text(
                                'XÁC NHẬN VÀ LƯU',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
