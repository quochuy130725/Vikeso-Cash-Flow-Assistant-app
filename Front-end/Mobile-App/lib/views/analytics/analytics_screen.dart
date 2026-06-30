import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../core/config/env_config.dart';
import '../../data/services/api_service.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _transactions = [];
  
  // Stats
  double _totalThu = 0;
  double _totalChi = 0;
  Map<String, double> _categoryChiSums = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final data = await _apiService.getTransactions(EnvConfig.userId);
      _transactions = data;
      _processData();
    } catch (e) {
      debugPrint('Error loading analytics data: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _processData() {
    _totalThu = 0;
    _totalChi = 0;
    _categoryChiSums = {};

    for (var tx in _transactions) {
      final type = tx['transactionType'] ?? '';
      final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
      final rawCategory = tx['category'] ?? 'Khac';
      
      // Translate category to human readable
      String category = _formatCategory(rawCategory);

      if (type == 'THU') {
        _totalThu += amount;
      } else if (type == 'CHI') {
        _totalChi += amount;
        _categoryChiSums[category] = (_categoryChiSums[category] ?? 0.0) + amount;
      }
    }
  }

  String _formatCategory(String rawCategory) {
    switch (rawCategory) {
      case 'Hoa Don Le':
        return 'Hóa đơn lẻ';
      case 'POS Ket Ca':
        return 'POS kết ca';
      case 'So Tay':
        return 'Sổ tay';
      default:
        return 'Khác';
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Hóa đơn lẻ':
        return const Color(0xFFFF5C8D);
      case 'POS kết ca':
        return const Color(0xFF4D96FF);
      case 'Sổ tay':
        return const Color(0xFF6BCB77);
      default:
        return const Color(0xFFFFD93D);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final double netProfit = _totalThu - _totalChi;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFF5C8D), // Màu hồng chủ đạo
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Phân tích chi tiết',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF5C8D)),
            )
          : RefreshIndicator(
              color: const Color(0xFFFF5C8D),
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Lời khuyên nhanh tài chính
                    _buildOverviewCard(netProfit, currencyFormat),
                    const SizedBox(height: 24),

                    // Biểu đồ 2: Cột so sánh Thu và Chi
                    Text(
                      'So sánh Thu - Chi',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildComparisonBarChart(currencyFormat),
                    const SizedBox(height: 24),

                    // Biểu đồ 1: Cơ cấu chi tiêu (Pie Chart)
                    Text(
                      'Cơ cấu chi phí theo nguồn',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildPieChartSection(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildOverviewCard(double netProfit, NumberFormat currencyFormat) {
    final isProfitable = netProfit >= 0;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isProfitable
              ? [const Color(0xFF198754), const Color(0xFF25AC6E)]
              : [const Color(0xFFDC3545), const Color(0xFFE35D6A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (isProfitable ? const Color(0xFF198754) : const Color(0xFFDC3545))
                .withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Lợi nhuận tạm tính',
            style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 4),
          Text(
            '${isProfitable ? '+' : ''}${currencyFormat.format(netProfit)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isProfitable ? Icons.trending_up : Icons.trending_down,
                  color: Colors.white,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  isProfitable ? 'Cửa hàng đang sinh lời tốt!' : 'Chi tiêu đang vượt quá thu nhập!',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildComparisonBarChart(NumberFormat currencyFormat) {
    if (_totalThu == 0 && _totalChi == 0) {
      return _buildEmptyState('Chưa có dữ liệu giao dịch để so sánh.');
    }

    final double maxVal = _totalThu > _totalChi ? _totalThu : _totalChi;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.01),
            blurRadius: 10,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        children: [
          SizedBox(
            height: 220,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: maxVal * 1.2,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => Colors.grey.shade900,
                    tooltipPadding: const EdgeInsets.all(8),
                    tooltipMargin: 4,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        currencyFormat.format(rod.toY),
                        const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
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
                        String text = '';
                        if (value == 0) text = 'THU VÀO';
                        if (value == 1) text = 'CHI RA';
                        return SideTitleWidget(
                          meta: meta,
                          child: Text(
                            text,
                            style: TextStyle(
                              color: value == 0 ? const Color(0xFF198754) : const Color(0xFFDC3545),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Colors.grey.withValues(alpha: 0.1),
                    strokeWidth: 1,
                  ),
                ),
                borderData: FlBorderData(show: false),
                barGroups: [
                  BarChartGroupData(
                    x: 0,
                    barRods: [
                      BarChartRodData(
                        toY: _totalThu,
                        width: 45,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF198754), Color(0xFF2ECA80)],
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                      ),
                    ],
                  ),
                  BarChartGroupData(
                    x: 1,
                    barRods: [
                      BarChartRodData(
                        toY: _totalChi,
                        width: 45,
                        gradient: const LinearGradient(
                          colors: [Color(0xFFDC3545), Color(0xFFF17C88)],
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Legend details below chart
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSimpleLegend('Thu vào', currencyFormat.format(_totalThu), const Color(0xFF198754)),
              _buildSimpleLegend('Chi ra', currencyFormat.format(_totalChi), const Color(0xFFDC3545)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildPieChartSection() {
    if (_totalChi == 0) {
      return _buildEmptyState('Chưa phát sinh khoản chi tiêu nào để phân tích.');
    }

    final double totalChiSum = _categoryChiSums.values.fold(0, (sum, val) => sum + val);

    final List<PieChartSectionData> sections = [];
    _categoryChiSums.forEach((category, sum) {
      final double percentage = totalChiSum > 0 ? (sum / totalChiSum) * 100 : 0.0;
      sections.add(
        PieChartSectionData(
          color: _getCategoryColor(category),
          value: sum,
          title: '${percentage.toStringAsFixed(1)}%',
          radius: 50,
          titleStyle: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      );
    });

    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.01),
            blurRadius: 10,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                flex: 4,
                child: SizedBox(
                  height: 140,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 35,
                      sections: sections,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 6,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: _categoryChiSums.entries.map((entry) {
                    final percentage = totalChiSum > 0 ? (entry.value / totalChiSum) * 100 : 0.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: _getCategoryColor(entry.key),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${entry.key} (${percentage.toStringAsFixed(1)}%)',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            currencyFormat.format(entry.value),
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSimpleLegend(String label, String value, Color color) {
    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Icon(Icons.query_stats, size: 48, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
