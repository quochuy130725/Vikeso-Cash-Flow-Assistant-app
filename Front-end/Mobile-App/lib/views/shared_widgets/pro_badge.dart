import 'package:flutter/material.dart';

class ProBadge extends StatelessWidget {
  final double fontSize;
  final EdgeInsetsGeometry padding;
  final bool showIcon;

  const ProBadge({
    super.key,
    this.fontSize = 10,
    this.padding = const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: const Color(0xFFD0F81B),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: const Color(0xFF0F172A),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.08),
            blurRadius: 4,
            offset: const Offset(0, 1.5),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(
              Icons.workspace_premium_rounded,
              size: fontSize + 2,
              color: const Color(0xFF0F172A),
            ),
            const SizedBox(width: 3.5),
          ],
          Text(
            'PRO',
            style: TextStyle(
              color: const Color(0xFF0F172A),
              fontSize: fontSize,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }
}
