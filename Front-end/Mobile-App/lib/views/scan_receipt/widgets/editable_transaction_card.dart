import 'package:flutter/material.dart';

class EditableTransactionCard extends StatefulWidget {
  final Map<String, dynamic> item;
  final Color borderColor;
  final String confidence;
  final VoidCallback onDelete;
  final ValueChanged<String> onTypeChanged;
  final ValueChanged<String> onAmountChanged;
  final ValueChanged<String> onReasonChanged;

  const EditableTransactionCard({
    super.key,
    required this.item,
    required this.borderColor,
    required this.confidence,
    required this.onDelete,
    required this.onTypeChanged,
    required this.onAmountChanged,
    required this.onReasonChanged,
  });

  @override
  State<EditableTransactionCard> createState() => _EditableTransactionCardState();
}

class _EditableTransactionCardState extends State<EditableTransactionCard> {
  late TextEditingController _amountController;
  late TextEditingController _reasonController;
  final List<TextEditingController> _nameControllers = [];
  final List<TextEditingController> _priceControllers = [];

  @override
  void initState() {
    super.initState();
    _amountController = TextEditingController(text: widget.item['amount']);
    _reasonController = TextEditingController(text: widget.item['reason']);
    _initProductControllers();
  }

  void _initProductControllers() {
    for (var c in _nameControllers) {
      c.dispose();
    }
    for (var c in _priceControllers) {
      c.dispose();
    }
    _nameControllers.clear();
    _priceControllers.clear();

    final products = widget.item['rawData']?['ChiTietSanPham'] as List? ?? [];
    for (var prod in products) {
      _nameControllers.add(TextEditingController(text: prod['Ten'] ?? ''));
      _priceControllers.add(TextEditingController(text: prod['Gia']?.toString() ?? '0'));
    }
  }

  @override
  void didUpdateWidget(covariant EditableTransactionCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.item != widget.item) {
      _amountController.text = widget.item['amount'] ?? '';
      _reasonController.text = widget.item['reason'] ?? '';
      _initProductControllers();
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _reasonController.dispose();
    for (var c in _nameControllers) {
      c.dispose();
    }
    for (var c in _priceControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _recalculateTotal() {
    final products = widget.item['rawData']?['ChiTietSanPham'] as List? ?? [];
    double total = 0;
    for (var prod in products) {
      total += (prod['Gia'] as num? ?? 0).toDouble();
    }
    if (total > 0) {
      final totalStr = total.toInt().toString();
      _amountController.text = totalStr;
      widget.onAmountChanged(totalStr);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
            color: widget.confidence != 'cao' ? widget.borderColor : Colors.transparent,
            width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hàng 1: Nút Thu/Chi và Nút Xóa
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  height: 36,
                  child: SegmentedButton<String>(
                    style: SegmentedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      selectedBackgroundColor: colorScheme.primaryContainer,
                      selectedForegroundColor: Colors.white,
                    ),
                    segments: const [
                      ButtonSegment<String>(
                        value: 'THU',
                        label: Text('Tiền vào', style: TextStyle(fontSize: 12)),
                      ),
                      ButtonSegment<String>(
                        value: 'CHI',
                        label: Text('Tiền ra', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                    selected: {widget.item['transactionType']},
                    onSelectionChanged: (Set<String> newSelection) {
                      widget.onTypeChanged(newSelection.first);
                    },
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: widget.onDelete,
                  tooltip: 'Xóa giao dịch này',
                )
              ],
            ),
            const SizedBox(height: 12),

            // Hàng 2: Ô nhập số tiền (CÓ VIỀN MÀU THEO ĐỘ TIN CẬY)
            TextFormField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: TextStyle(
                fontWeight: widget.confidence == 'cao' ? FontWeight.normal : FontWeight.bold,
                color: widget.confidence == 'cao' ? Colors.black : widget.borderColor,
              ),
              decoration: InputDecoration(
                labelText: 'Số tiền (đ)',
                labelStyle: TextStyle(
                    color: widget.confidence == 'cao' ? Colors.grey[700] : widget.borderColor),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                      color: widget.confidence == 'cao' ? colorScheme.primary : widget.borderColor,
                      width: 2),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                      color: widget.confidence == 'cao' ? Colors.grey : widget.borderColor,
                      width: widget.confidence == 'cao' ? 1.0 : 2.0),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              onChanged: widget.onAmountChanged,
            ),
            const SizedBox(height: 12),

            // Hàng 3: Ô nhập lý do
            TextFormField(
              controller: _reasonController,
              decoration: const InputDecoration(
                labelText: 'Lý do / Nội dung',
                border: OutlineInputBorder(),
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              onChanged: widget.onReasonChanged,
            ),
            
            // Hàng 4: Xem chi tiết bóc tách (nếu có)
            if (widget.item['rawData'] != null && 
                widget.item['rawData']['ChiTietSanPham'] != null && 
                (widget.item['rawData']['ChiTietSanPham'] as List).isNotEmpty)
              Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  childrenPadding: const EdgeInsets.only(top: 4, bottom: 8),
                  title: Text(
                    'Xem chi tiết (${(widget.item['rawData']['ChiTietSanPham'] as List).length} mục)',
                    style: TextStyle(
                      fontSize: 14,
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  children: (widget.item['rawData']['ChiTietSanPham'] as List).asMap().entries.map((entry) {
                    final idx = entry.key;
                    final chiTiet = entry.value;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0, left: 4.0, right: 4.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const Text('📦 ', style: TextStyle(fontSize: 14)),
                          Expanded(
                            flex: 3,
                            child: TextFormField(
                              controller: _nameControllers[idx],
                              decoration: const InputDecoration(
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                                border: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Colors.grey, width: 0.5),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Color(0xFFFF5C8D), width: 1.0),
                                ),
                                hintText: 'Tên mặt hàng',
                              ),
                              style: const TextStyle(fontSize: 14, color: Colors.black87),
                              onChanged: (val) {
                                chiTiet['Ten'] = val;
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            flex: 2,
                            child: TextFormField(
                              controller: _priceControllers[idx],
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                                border: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Colors.grey, width: 0.5),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Color(0xFFFF5C8D), width: 1.0),
                                ),
                                suffixText: 'đ',
                              ),
                              style: const TextStyle(
                                fontSize: 14, 
                                fontWeight: FontWeight.bold, 
                                color: Colors.black54
                              ),
                              onChanged: (val) {
                                chiTiet['Gia'] = num.tryParse(val) ?? 0;
                                _recalculateTotal();
                              },
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
