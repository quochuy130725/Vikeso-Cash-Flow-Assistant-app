import 'package:flutter/material.dart';
import '../../../core/guards/store_guard.dart';
import '../../manual_entry/manual_entry_screen.dart';

class DashboardActionButtons extends StatelessWidget {
  final VoidCallback? onTransactionAdded;

  const DashboardActionButtons({super.key, this.onTransactionAdded});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // =============================================================================
        // NGHIỆP VỤ BƯỚC 2: KHÓA TÁC VỤ QUÉT HÓA ĐƠN NẾU CHƯA CÓ CỬA HÀNG HOẠT ĐỘNG
        // - Yêu cầu: Bắt buộc Owner phải có cơ sở kinh doanh ACTIVE mới được quét hóa đơn
        // =============================================================================
        Expanded(
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () async {
                final isAllowed = await StoreGuard.ensureStoreActive(
                  context,
                  actionName: 'quét hóa đơn bóc tách tự động',
                );
                if (!isAllowed) return;
                if (context.mounted) {
                  Navigator.pushNamed(context, '/camera');
                }
              },
              borderRadius: BorderRadius.circular(14),
              child: Ink(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF4783),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF4783).withValues(alpha: 0.28),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Quét Hóa Đơn',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),

        // =============================================================================
        // NGHIỆP VỤ BƯỚC 2: KHÓA TÁC VỤ NHẬP THU/CHI NẾU CHƯA CÓ CỬA HÀNG HOẠT ĐỘNG
        // - Yêu cầu: Giao dịch phải gắn vào 1 cửa hàng, không cho ghi sổ khi chưa có cơ sở
        // =============================================================================
        Expanded(
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () async {
                final isAllowed = await StoreGuard.ensureStoreActive(
                  context,
                  actionName: 'nhập thu chi và ghi sổ dòng tiền',
                );
                if (!isAllowed) return;
                if (!context.mounted) return;

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
              borderRadius: BorderRadius.circular(14),
              child: Ink(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.edit_note_rounded, color: Color(0xFF0F172A), size: 20),
                    SizedBox(width: 6),
                    Text(
                      'Ghi Thu / Chi',
                      style: TextStyle(
                        color: Color(0xFF0F172A),
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

