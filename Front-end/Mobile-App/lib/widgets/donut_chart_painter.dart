import 'package:flutter/material.dart';

// Custom Draw cho Donut Chart
class DonutChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final strokeWidth = radius * 0.35;
    
    final paint1 = Paint()
      ..color = const Color(0xFFFF5C8D)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    final paint2 = Paint()
      ..color = const Color(0xFFDCE944)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    final paint3 = Paint()
      ..color = Colors.grey[200]!
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    final paint4 = Paint()
      ..color = const Color(0xFFE2E2E2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    // Vẽ từng mảnh hình cung tròn
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - strokeWidth/2), -1.57, 2.51, false, paint1); // 40% (2.51 rad)
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - strokeWidth/2), 0.94, 2.19, false, paint2);  // 35% (2.19 rad)
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - strokeWidth/2), 3.13, 0.94, false, paint3);  // 15% (0.94 rad)
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - strokeWidth/2), 4.07, 0.64, false, paint4);  // 10% (0.64 rad)
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
