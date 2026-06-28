import 'package:flutter/material.dart';

class SplitScreen extends StatefulWidget {
  const SplitScreen({super.key});

  @override
  State<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends State<SplitScreen> {
  // Mock data for AI response
  String _selectedCategory = 'So Tay';

  final List<Map<String, dynamic>> _transactionItems = [
    {
      'transactionType': 'THU',
      'amount': '150000',
      'reason': 'Bán lẻ ca sáng',
      'confidence': 'Cao',
    },
    {
      'transactionType': 'CHI',
      'amount': '373000',
      'reason': 'Mua vít sắt que hàn',
      'confidence': 'trung binh',
    },
    {
      'transactionType': 'THU',
      'amount': '1500000',
      'reason': 'Anh Hoàng cọc sửa máy',
      'confidence': 'cao',
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
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          backgroundColor: Colors.red[50],
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
              SizedBox(width: 8),
              Text('Cảnh báo mờ/khó đọc',
                  style: TextStyle(
                      color: Colors.red,
                      fontSize: 18,
                      fontWeight: FontWeight.bold)),
            ],
          ),
          content: const Text(
            '🚨 Ảnh mờ hoặc chữ khó đọc! Anh/chị vui lòng đối chiếu lại thật kỹ các ô bị viền đỏ.',
            style: TextStyle(color: Colors.black87),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đã hiểu',
                  style: TextStyle(
                      color: Colors.red, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
    } else if (hasTrungBinh) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              '⚠️ Chữ viết có vẻ hơi dính nét, anh/chị lướt qua xem AI có tính nhầm không nhé.'),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✨ AI đã quét thành công độ chính xác cao.'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
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
        backgroundColor: const Color(0xFFB31F56),
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Rà soát chứng từ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
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
                      value: _selectedCategory,
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

                        return Card(
                          margin: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 6),
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                                color: confidence != 'cao'
                                    ? borderColor
                                    : Colors.transparent,
                                width: 1.5),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Hàng 1: Nút Thu/Chi và Nút Xóa
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    SizedBox(
                                      height: 36, // Compact height
                                      child: SegmentedButton<String>(
                                        style: SegmentedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8),
                                          selectedBackgroundColor:
                                              colorScheme.primaryContainer,
                                          selectedForegroundColor: Colors.white,
                                        ),
                                        segments: const [
                                          ButtonSegment<String>(
                                            value: 'THU',
                                            label: Text('Tiền vào',
                                                style: TextStyle(fontSize: 12)),
                                          ),
                                          ButtonSegment<String>(
                                            value: 'CHI',
                                            label: Text('Tiền ra',
                                                style: TextStyle(fontSize: 12)),
                                          ),
                                        ],
                                        selected: {item['transactionType']},
                                        onSelectionChanged:
                                            (Set<String> newSelection) {
                                          setState(() {
                                            item['transactionType'] =
                                                newSelection.first;
                                          });
                                        },
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline,
                                          color: Colors.red),
                                      onPressed: () => _removeItem(index),
                                      tooltip: 'Xóa giao dịch này',
                                    )
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Hàng 2: Ô nhập số tiền (CÓ VIỀN MÀU THEO ĐỘ TIN CẬY)
                                TextFormField(
                                  initialValue: item['amount'],
                                  keyboardType: TextInputType.number,
                                  style: TextStyle(
                                    fontWeight: confidence == 'cao'
                                        ? FontWeight.normal
                                        : FontWeight.bold,
                                    color: confidence == 'cao'
                                        ? Colors.black
                                        : borderColor,
                                  ),
                                  decoration: InputDecoration(
                                    labelText: 'Số tiền (đ)',
                                    labelStyle: TextStyle(
                                        color: confidence == 'cao'
                                            ? Colors.grey[700]
                                            : borderColor),
                                    focusedBorder: OutlineInputBorder(
                                      borderSide: BorderSide(
                                          color: confidence == 'cao'
                                              ? colorScheme.primary
                                              : borderColor,
                                          width: 2),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderSide: BorderSide(
                                          color: confidence == 'cao'
                                              ? Colors.grey
                                              : borderColor,
                                          width:
                                              confidence == 'cao' ? 1.0 : 2.0),
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 8),
                                  ),
                                  onChanged: (val) {
                                    item['amount'] = val;
                                  },
                                ),
                                const SizedBox(height: 12),

                                // Hàng 3: Ô nhập lý do
                                TextFormField(
                                  initialValue: item['reason'],
                                  decoration: const InputDecoration(
                                    labelText: 'Lý do / Nội dung',
                                    border: OutlineInputBorder(),
                                    contentPadding: EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 8),
                                  ),
                                  onChanged: (val) {
                                    item['reason'] = val;
                                  },
                                ),
                              ],
                            ),
                          ),
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
                          Navigator.popUntil(
                            context,
                            ModalRoute.withName('/thu_chi'),
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
