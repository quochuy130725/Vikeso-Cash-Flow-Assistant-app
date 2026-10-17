import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

class RevenueChart extends StatelessWidget {
  final List<double> weeklyRevenue; // Giá trị tính bằng triệu (Tr)

  const RevenueChart({super.key, required this.weeklyRevenue});

  @override
  Widget build(BuildContext context) {
    final double maxVal = weeklyRevenue.isEmpty
        ? 0.0
        : weeklyRevenue.reduce((a, b) => a > b ? a : b);
    final double computedMaxY = maxVal > 8.0 ? maxVal * 1.25 : 10.0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Xu hướng doanh thu 7 ngày',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF4783).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Đơn vị: Triệu đ',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFFF4783),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 180,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: computedMaxY,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => Colors.transparent,
                    tooltipPadding: EdgeInsets.zero,
                    tooltipMargin: 4,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        rod.toY > 0 ? '${rod.toY.toStringAsFixed(1)}Tr' : '',
                        const TextStyle(
                          color: Color(0xFF0F172A),
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final int index = value.toInt();
                        if (index < 0 || index >= 7) return const SizedBox();
                        
                        final isToday = index == 6;
                        if (isToday) {
                          return SideTitleWidget(
                            meta: meta,
                            child: const Text(
                              'Hôm nay',
                              style: TextStyle(
                                color: Color(0xFFFF4783),
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          );
                        }

                        // Tính toán ngày cách đây (6 - index) ngày
                        final now = DateTime.now();
                        final targetDay = now.subtract(Duration(days: 6 - index));
                        final title = DateFormat('dd/MM').format(targetDay);

                        return SideTitleWidget(
                          meta: meta,
                          child: Text(
                            title,
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: computedMaxY / 2,
                  getDrawingHorizontalLine: (value) => const FlLine(
                    color: Color(0xFFE2E8F0),
                    strokeWidth: 1,
                    dashArray: [4, 4],
                  ),
                ),
                borderData: FlBorderData(show: false),
                barGroups: List.generate(7, (index) {
                  final val = index < weeklyRevenue.length ? weeklyRevenue[index] : 0.0;
                  return _buildFlBarGroup(index, val);
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  BarChartGroupData _buildFlBarGroup(int x, double y) {
    final isToday = x == 6;
    return BarChartGroupData(
      x: x,
      showingTooltipIndicators: const [0],
      barRods: [
        BarChartRodData(
          toY: y,
          width: 18,
          color: isToday ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        ),
      ],
    );
  }
}
