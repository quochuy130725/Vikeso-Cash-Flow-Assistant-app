import 'package:flutter/material.dart';
import '../shared_widgets/side_drawer.dart';
import 'widgets/dashboard_action_buttons.dart';
import 'widgets/revenue_chart.dart';
import 'widgets/donut_chart_painter.dart';

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
        leading: Builder(builder: (context) {
          return IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () {
              Scaffold.of(context).openDrawer();
            },
          );
        }),
        title: const Row(
          children: [
            Icon(Icons.rocket_launch, color: Colors.white, size: 20),
            SizedBox(width: 8),
            Text(
              'FinAuto',
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ],
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
                    'Xin chào, User',
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

              // --- 1. QUICK ACTION BUTTONS (Màu thương hiệu của dự án) ---
              const DashboardActionButtons(),
              const SizedBox(height: 24),

              // --- 2. SUMMARY NUMERICAL STATS TABLE (Bảng số liệu tóm gọn biểu đồ) ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: colorScheme.surfaceContainerHighest),
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
                      'Tóm tắt thống kê số liệu',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontSize: 15,
                        color: colorScheme.onSurface,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Table(
                      columnWidths: const {
                        0: FlexColumnWidth(3),
                        1: FlexColumnWidth(4),
                      },
                      children: [
                        TableRow(
                          children: [
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.0),
                              child: Text('Doanh thu tuần:',
                                  style: TextStyle(
                                      color: Colors.grey, fontSize: 13)),
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 8.0),
                              child: RichText(
                                text: const TextSpan(
                                  children: [
                                    TextSpan(
                                        text: '16,850,000đ\n',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 18,
                                            color: Color(0xFF198754),
                                            height: 1.2)),
                                    TextSpan(
                                        text: '(193 đơn hàng)',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                            height: 1.5)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        TableRow(
                          children: [
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.0),
                              child: Text('Tổng chi phí tháng:',
                                  style: TextStyle(
                                      color: Colors.grey, fontSize: 13)),
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 8.0),
                              child: RichText(
                                text: const TextSpan(
                                  children: [
                                    TextSpan(
                                        text: '10,000,000đ\n',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 18,
                                            color: Color(0xFFDC3545),
                                            height: 1.2)),
                                    TextSpan(
                                        text: '(Nguyên liệu chiếm 40%)',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                            height: 1.5)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        TableRow(
                          children: [
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.0),
                              child: Text('Doanh thu tạm tính:',
                                  style: TextStyle(
                                      color: Colors.grey, fontSize: 13)),
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 8.0),
                              child: RichText(
                                text: const TextSpan(
                                  children: [
                                    TextSpan(
                                        text: '3,500,000đ\n',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 18,
                                            color: Color(0xFF0D6EFD),
                                            height: 1.2)),
                                    TextSpan(
                                        text: '(Hôm nay)',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                            height: 1.5)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // --- 3. CHARTS ---
              // Thẻ hiển thị doanh thu hôm nay
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: colorScheme.surfaceContainerHighest),
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
                        Icon(Icons.arrow_drop_up,
                            color: colorScheme.primary, size: 18),
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
              const RevenueChart(),
              const SizedBox(height: 16),

              // Thẻ hiển thị cơ cấu chi phí (Pie chart)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: colorScheme.surfaceContainerHighest),
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
                        SizedBox(
                          width: 100,
                          height: 100,
                          child: CustomPaint(
                            painter: DonutChartPainter(),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLegendItem(
                                'Nguyên liệu', '40%', const Color(0xFFFF5C8D)),
                            _buildLegendItem(
                                'Nhân công', '35%', const Color(0xFFDCE944)),
                            _buildLegendItem('Điện nước', '15%', Colors.white,
                                border: true),
                            _buildLegendItem(
                                'Khác', '10%', const Color(0xFFE2E2E2)),
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

  Widget _buildLegendItem(String label, String percent, Color color,
      {bool border = false}) {
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
            child: Text(label,
                style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ),
          Text(percent,
              style:
                  const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
