import 'package:flutter/material.dart';
import '../billing/upgrade_pro_screen.dart';

class ProPaywallSheet extends StatelessWidget {
  final String featureTitle;
  final String featureDescription;

  const ProPaywallSheet({
    super.key,
    required this.featureTitle,
    required this.featureDescription,
  });

  /// Hàm tiện ích mở BottomSheet nhanh
  static Future<bool?> show(
    BuildContext context, {
    required String featureTitle,
    required String featureDescription,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ProPaywallSheet(
        featureTitle: featureTitle,
        featureDescription: featureDescription,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        14,
        24,
        MediaQuery.of(context).padding.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle bar
          Center(
            child: Container(
              width: 44,
              height: 4.5,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
          const SizedBox(height: 22),

          // Header Icon & Title
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF0F5),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: const Color(0xFFFFD6E4),
                    width: 1.5,
                  ),
                ),
                child: const Icon(
                  Icons.workspace_premium_rounded,
                  color: Color(0xFFFF4783),
                  size: 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Tính Năng Gói PRO',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFFF4783),
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD0F81B),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF0F172A), width: 0.8),
                          ),
                          child: const Text(
                            '99K/THÁNG',
                            style: TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      featureTitle,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Description Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Text(
              featureDescription,
              style: const TextStyle(
                fontSize: 13.5,
                color: Color(0xFF475569),
                height: 1.45,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

          const SizedBox(height: 18),

          // Special Pro Benefits Checklist
          const Text(
            'Đặc quyền khi nâng cấp VikeSo PRO:',
            style: TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 10),
          _buildBenefitItem('Quét hóa đơn AI không giới hạn (Gemini Vision OCR)'),
          _buildBenefitItem('Tự động chốt sổ gửi Telegram/Email mỗi đêm 22:00'),
          _buildBenefitItem('Xuất toàn bộ dữ liệu ra Excel chuẩn kế toán thuế'),
          _buildBenefitItem('Lưới lọc 2 chiều chống trùng tiền hóa đơn máy POS'),

          const SizedBox(height: 24),

          // Primary CTA Button
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const UpgradeProScreen()),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF4783),
              foregroundColor: Colors.white,
              elevation: 4,
              shadowColor: const Color(0xFFFF4783).withValues(alpha: 0.35),
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.flash_on_rounded, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Text(
                  'Nâng Cấp PRO Ngay (99.000 đ/tháng)',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Secondary Action
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Để sau',
              style: TextStyle(
                color: Color(0xFF64748B),
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 2),
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              color: Color(0xFFD0F81B),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Color(0xFF0F172A),
              size: 13,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF334155),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
