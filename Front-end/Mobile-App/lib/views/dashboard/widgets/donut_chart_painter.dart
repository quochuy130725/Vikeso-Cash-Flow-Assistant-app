import 'package:flutter/material.dart';

// Custom Draw cho Donut Chart
class DonutChartPainter extends CustomPainter {
  final List<double> percentages;
  final List<Color> colors;

  DonutChartPainter({
    required this.percentages,
    required this.colors,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final strokeWidth = radius * 0.35;
    
    double startAngle = -1.57; // Bắt đầu từ đỉnh (-90 độ)
    final double total = percentages.isEmpty ? 0 : percentages.fold(0, (sum, val) => sum + val);

    if (total == 0) {
      // Vẽ vòng tròn xám mặc định nếu không có dữ liệu chi phí
      final paint = Paint()
        ..color = Colors.grey[200]!
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - strokeWidth/2),
        0,
        2 * 3.1415926535,
        false,
        paint,
      );
      return;
    }

    for (int i = 0; i < percentages.length; i++) {
      final double val = percentages[i];
      if (val <= 0) continue;
      final sweepAngle = (val / total) * 2 * 3.1415926535;
      final color = i < colors.length ? colors[i] : Colors.grey;

      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - strokeWidth/2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
      
      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant DonutChartPainter oldDelegate) {
    return oldDelegate.percentages != percentages || oldDelegate.colors != colors;
  }
}
