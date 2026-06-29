import 'package:flutter/material.dart';
import '../../core/utils/ui_helpers.dart';
import 'widgets/editable_transaction_card.dart';

class SplitScreen extends StatefulWidget {
  const SplitScreen({super.key});

  @override
  State<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends State<SplitScreen> {
  // Mock data for AI response
  String _selectedCategory = 'Hoa Don Le';

  final List<Map<String, dynamic>> _transactionItems = [
    {
      'transactionType': 'CHI',
      'amount': '1550000',
      'reason': 'Nhập Phân lân',
      'confidence': 'Cao',
    },
    {
      'transactionType': 'CHI',
      'amount': '2300000',
      'reason': 'Nhập Lân dập',
      'confidence': 'trung binh',
    },
    {
      'transactionType': 'CHI',
      'amount': '850000',
      'reason': 'Phân Urê (chữ mờ)',
      'confidence': 'thap',
    },
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showTrafficLightAlert();
    });
  }

  void _showTrafficLightAlert() {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();



    bool hasThap = _transactionItems
        .any((item) => item['confidence'].toString().toLowerCase() == 'thap');
    bool hasTrungBinh = _transactionItems.any(
        (item) => item['confidence'].toString().toLowerCase() == 'trung binh');

    if (hasThap) {
      UIHelpers.showInfoDialog(context, 'Cảnh báo mờ/khó đọc',
          '🚨 Ảnh mờ hoặc chữ khó đọc! Anh/chị vui lòng đối chiếu lại thật kỹ các ô bị viền đỏ.');
    } else if (hasTrungBinh) {
      UIHelpers.showWarningToast(context, '⚠️ Chữ viết có vẻ hơi dính nét, anh/chị lướt qua xem AI có tính nhầm không nhé.');
    } else {
      UIHelpers.showSuccessToast(context, '✨ AI đã quét thành công độ chính xác cao.');
    }
  }

  Color _getTrafficColor(String confidence) {
    final conf = confidence.toLowerCase();
    if (conf == 'thap') return Colors.red;
    if (conf == 'trung binh') return Colors.orange;
    return Colors.grey;
  }

  void _removeItem(int index) {
    setState(() {
      _transactionItems.removeAt(index);
    });
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
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline, color: Colors.white),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Thông tin biên lai'),
                  content:
                      const Text('Thông tin biên lai được chụp từ camera.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Nửa trên (Expanded flex 4): Placeholder ảnh hóa đơn đã Crop
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
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.receipt_long,
                        size: 64,
                        color: Colors.grey[500],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'ẢNH SỔ TAY ĐÃ CROP (MOCK)',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                  // Small chip indicating OCR status
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.check_circle,
                              color: Colors.green, size: 14),
                          SizedBox(width: 4),
                          Text(
                            'Đã quét OCR',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),

          // Nửa dưới (Expanded flex 6): Danh sách các Card (ListView)
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
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        fillColor: Colors.white,
                        filled: true,
                      ),
                      items: const [
                        DropdownMenuItem(
                            value: 'Hoa Don Le', child: Text('Hoá đơn lẻ')),
                        DropdownMenuItem(
                            value: 'POS Ket Ca', child: Text('POS kết ca')),
                        DropdownMenuItem(
                            value: 'So Tay', child: Text('Sổ tay')),
                        DropdownMenuItem(value: 'Khac', child: Text('Khác')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedCategory = val;
                          });
                        }
                      },
                    ),
                  ),

                  // Danh sách các Card cuộn được
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 12.0),
                      itemCount: _transactionItems.length,
                      itemBuilder: (context, index) {
                        final item = _transactionItems[index];
                        final confidence =
                            item['confidence'].toString().toLowerCase();
                        final borderColor = _getTrafficColor(confidence);

                        return EditableTransactionCard(
                          item: item,
                          borderColor: borderColor,
                          confidence: confidence,
                          onDelete: () => _removeItem(index),
                          onTypeChanged: (newType) {
                            setState(() {
                              item['transactionType'] = newType;
                            });
                          },
                          onAmountChanged: (val) {
                            item['amount'] = val;
                          },
                          onReasonChanged: (val) {
                            item['reason'] = val;
                          },
                        );
                      },
                    ),
                  ),

                  // Nút chốt lưu dữ liệu gửi xuống Backend
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor:
                              colorScheme.primary, // Theme màu của FinAuto
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        onPressed: () {
                          // Gom cục transactionItems đẩy qua POST API
                          
                          UIHelpers.showSuccessToast(context, '🎉 Lưu giao dịch thành công!');

                          // Điều hướng về màn Thu/Chi và xóa sạch các màn hình phụ (camera, split) khỏi stack
                          Navigator.pushNamedAndRemoveUntil(
                            context,
                            '/thu_chi',
                            (route) => false,
                          );
                        },
                        child: const Text(
                          'XÁC NHẬN VÀ LƯU',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
