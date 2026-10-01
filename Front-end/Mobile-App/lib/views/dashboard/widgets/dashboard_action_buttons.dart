import 'package:flutter/material.dart';
import '../../manual_entry/manual_entry_screen.dart';

class DashboardActionButtons extends StatelessWidget {
  final VoidCallback? onTransactionAdded;

  const DashboardActionButtons({super.key, this.onTransactionAdded});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Nút Quét Tài Liệu Thông Minh (Primary Action)
        InkWell(
          onTap: () {
            Navigator.pushNamed(context, '/camera');
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFB31F56), Color(0xFFFF5C8D)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(
                  color: Colors.white.withValues(alpha: 0.2), width: 1.5),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFB31F56).withValues(alpha: 0.25),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.document_scanner_outlined,
                    color: Colors.white, size: 32),
                SizedBox(width: 12),
                Text(
                  'Quét Tài Liệu Thông Minh',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    shadows: [
                      Shadow(
                        color: Colors.black26,
                        offset: Offset(0, 1),
                        blurRadius: 2,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Nút Nhập Thủ Công (Secondary Action)
        OutlinedButton.icon(
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ManualEntryScreen(),
              ),
            );
            if (result == true && onTransactionAdded != null) {
              onTransactionAdded!();
            }
          },
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Color(0xFF198754), width: 1.5),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          icon: const Icon(Icons.keyboard_alt_outlined,
              color: Color(0xFF198754), size: 24),
          label: const Text(
            'Nhập Thủ Công',
            style: TextStyle(
              color: Color(0xFF198754),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}
