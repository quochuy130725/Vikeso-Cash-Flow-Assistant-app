import 'package:flutter/material.dart';
import 'side_drawer.dart';


class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFF5C8D), // Màu hồng Primary Container
        elevation: 0.5,
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            );
          }
        ),
        title: const Text(
          'Trang chủ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      drawer: const CustomSideDrawer(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Lời chào chủ quán
              Row(
                children: [
                  Text(
                    'Xin chào, Tiến',
                    style: theme.textTheme.headlineLarge?.copyWith(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    '👋',
                    style: TextStyle(fontSize: 28),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Thẻ hiển thị doanh thu hôm nay
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: colorScheme.surfaceContainerHighest),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    )
                  ],

                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Doanh thu hôm nay',
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '3.500.000đ',
                      style: TextStyle(
                        color: colorScheme.primary,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.arrow_drop_up, color: colorScheme.primary, size: 18),
                        Text(
                          '12% so với hôm qua',
                          style: TextStyle(
                            color: colorScheme.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Biểu đồ doanh thu 7 ngày gần nhất
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: colorScheme.surfaceContainerHighest),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Doanh thu theo ngày (7 ngày gần nhất)',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontSize: 16,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Vẽ các thanh biểu đồ custom bằng Widget Flutter
                    SizedBox(
                      height: 120,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          _buildBar('T2', 0.3, colorScheme.primaryContainer),
                          _buildBar('T3', 0.6, colorScheme.secondaryContainer),
                          _buildBar('T4', 0.4, colorScheme.primaryContainer),
                          _buildBar('T5', 0.8, colorScheme.secondaryContainer),
                          _buildBar('T6', 0.5, colorScheme.primaryContainer),
                          _buildBar('T7', 0.9, colorScheme.secondaryContainer),
                          _buildBar('CN', 0.7, colorScheme.primaryContainer),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Thẻ hiển thị cơ cấu chi phí (Pie chart biểu diễn theo conic-gradient)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: colorScheme.surfaceContainerHighest),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cơ cấu chi phí (tháng này)',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontSize: 16,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        // Đồ họa Donut Chart vẽ nhanh bằng CustomPaint
                        SizedBox(
                          width: 100,
                          height: 100,
                          child: CustomPaint(
                            painter: DonutChartPainter(),
                          ),
                        ),
                        
                        // Chú thích các thành phần chi phí
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLegendItem('Nguyên liệu', '40%', const Color(0xFFFF5C8D)),
                            _buildLegendItem('Nhân công', '35%', const Color(0xFFDCE944)),
                            _buildLegendItem('Điện nước', '15%', Colors.white, border: true),
                            _buildLegendItem('Khác', '10%', const Color(0xFFE2E2E2)),
                          ],
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBar(String label, double fillRate, Color barColor) {
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Container(
            height: 90 * fillRate,
            margin: const EdgeInsets.symmetric(horizontal: 6),
            decoration: BoxDecoration(
              color: barColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
            ),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, String percent, Color color, {bool border = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              border: border ? Border.all(color: Colors.grey[400]!) : null,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 80,
            child: Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ),
          Text(percent, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

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
