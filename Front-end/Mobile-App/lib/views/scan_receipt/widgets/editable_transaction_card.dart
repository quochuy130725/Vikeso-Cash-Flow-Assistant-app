import 'package:flutter/material.dart';

class EditableTransactionCard extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
            color: confidence != 'cao' ? borderColor : Colors.transparent,
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
                  height: 36, // Compact height
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
                    selected: {item['transactionType']},
                    onSelectionChanged: (Set<String> newSelection) {
                      onTypeChanged(newSelection.first);
                    },
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: onDelete,
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
                fontWeight: confidence == 'cao' ? FontWeight.normal : FontWeight.bold,
                color: confidence == 'cao' ? Colors.black : borderColor,
              ),
              decoration: InputDecoration(
                labelText: 'Số tiền (đ)',
                labelStyle: TextStyle(
                    color: confidence == 'cao' ? Colors.grey[700] : borderColor),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                      color: confidence == 'cao' ? colorScheme.primary : borderColor,
                      width: 2),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                      color: confidence == 'cao' ? Colors.grey : borderColor,
                      width: confidence == 'cao' ? 1.0 : 2.0),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              onChanged: onAmountChanged,
            ),
            const SizedBox(height: 12),

            // Hàng 3: Ô nhập lý do
            TextFormField(
              initialValue: item['reason'],
              decoration: const InputDecoration(
                labelText: 'Lý do / Nội dung',
                border: OutlineInputBorder(),
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              onChanged: onReasonChanged,
            ),
          ],
        ),
      ),
    );
  }
}
