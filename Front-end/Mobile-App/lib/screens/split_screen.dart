import 'package:flutter/material.dart';
import '../widgets/traffic_light.dart';

class SplitScreen extends StatefulWidget {
  const SplitScreen({super.key});

  @override
  State<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends State<SplitScreen> {
  // Mock form state values
  String _selectedClassification = 'Hoa Don Le';
  String _transactionType = 'CHI';
  final TextEditingController _amountController = TextEditingController(text: '150000');
  final TextEditingController _reasonController = TextEditingController(text: 'Tiền điện');
  
  // Default mock confidence level (can be "Cao", "Trung Binh", "Thap")
  String _confidenceLevel = 'Trung Binh';

  @override
  void dispose() {
    _amountController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFB31F56), // Red cherry matching main.dart theme
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Rà soát biên lai',
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
                        'ẢNH HÓA ĐƠN ĐÃ CROP (MOCK)',
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
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green, size: 14),
                          SizedBox(width: 4),
                          Text(
                            'Đã quét OCR',
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
          
          // Nửa dưới (Expanded flex 6): Form rà soát bọc trong TrafficLightWrapper
          Expanded(
            flex: 6,
            child: Padding(
              padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Title and mock confidence toggler for testing
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Dữ liệu nhận diện từ AI',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        // Small toggle buttons to switch confidence levels and test colors
                        Row(
                          children: [
                            const Text('Mức tin cậy: ', style: TextStyle(fontSize: 11, color: Colors.grey)),
                            DropdownButton<String>(
                              value: _confidenceLevel,
                              underline: const SizedBox(),
                              style: TextStyle(
                                fontSize: 12, 
                                fontWeight: FontWeight.bold,
                                color: _confidenceLevel == 'Cao'
                                    ? Colors.green
                                    : _confidenceLevel == 'Trung Binh'
                                        ? Colors.orange
                                        : Colors.red
                              ),
                              items: const [
                                DropdownMenuItem(value: 'Cao', child: Text('Cao')),
                                DropdownMenuItem(value: 'Trung Binh', child: Text('Trung bình')),
                                DropdownMenuItem(value: 'Thap', child: Text('Thấp')),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() {
                                    _confidenceLevel = val;
                                  });
                                }
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Form wrapped in TrafficLightWrapper
                  Expanded(
                    child: TrafficLightWrapper(
                      mucDoTinCay: _confidenceLevel,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // 1. Phân loại Dropdown
                            const Text(
                              'Phân loại nguồn',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                            ),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: _selectedClassification,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              items: const [
                                DropdownMenuItem(
                                  value: 'Hoa Don Le',
                                  child: Text('Hoá đơn lẻ'),
                                ),
                                DropdownMenuItem(
                                  value: 'POS Ket Ca',
                                  child: Text('POS kết ca'),
                                ),
                              ],
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    _selectedClassification = value;
                                  });
                                }
                              },
                            ),
                            const SizedBox(height: 16),

                            // 2. Loại giao dịch (SegmentedButton)
                            const Text(
                              'Loại giao dịch',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                            ),
                            const SizedBox(height: 6),
                            SizedBox(
                              width: double.infinity,
                              child: SegmentedButton<String>(
                                style: SegmentedButton.styleFrom(
                                  selectedBackgroundColor: colorScheme.primaryContainer,
                                  selectedForegroundColor: Colors.white,
                                ),
                                segments: const [
                                  ButtonSegment<String>(
                                    value: 'THU',
                                    label: Text('THU (Thu nhập)'),
                                    icon: Icon(Icons.arrow_upward),
                                  ),
                                  ButtonSegment<String>(
                                    value: 'CHI',
                                    label: Text('CHI (Chi phí)'),
                                    icon: Icon(Icons.arrow_downward),
                                  ),
                                ],
                                selected: {_transactionType},
                                onSelectionChanged: (Set<String> newSelection) {
                                  setState(() {
                                    _transactionType = newSelection.first;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(height: 16),

                            // 3. Tổng tiền TextField
                            const Text(
                              'Số tiền (đ)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _amountController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // 4. Lý do TextField
                            const Text(
                              'Lý do / Nội dung',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _reasonController,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                            ),
                            const SizedBox(height: 20),

                            // 5. Nút lưu giao dịch nổi bật
                            ElevatedButton(
                              onPressed: () {
                                Navigator.popUntil(
                                  context,
                                  ModalRoute.withName('/thu_chi'),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: colorScheme.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 2,
                              ),
                              child: const Text(
                                'Lưu giao dịch',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
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
