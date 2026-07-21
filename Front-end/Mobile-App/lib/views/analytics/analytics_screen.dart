import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../data/services/api_service.dart';
import '../../data/services/excel_export_service.dart';
import '../shared_widgets/side_drawer.dart';

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
  Map<String, double> _categoryThuSums = {};
  Map<String, double> _categoryChiSums = {};
  bool _showThuPieChart = true;

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
      final String userId = dotenv.env['USER_ID'] ?? '';
      final data = await _apiService.getTransactions(userId);
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
    _categoryThuSums = {};
    _categoryChiSums = {};

    for (var tx in _transactions) {
      final type = tx['transactionType'] ?? '';
      final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
      final rawCategory = tx['category'] ?? 'Khac';
      
      // Translate category to human readable
      String category = _formatCategory(rawCategory);

      if (type == 'THU') {
        _totalThu += amount;
        _categoryThuSums[category] = (_categoryThuSums[category] ?? 0.0) + amount;
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
      case 'Chuyen Khoan':
        return 'Chuyển khoản';
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
      case 'Chuyển khoản':
        return const Color(0xFF9B51E0);
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
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: Icon(
                Navigator.canPop(context) ? Icons.arrow_back : Icons.menu,
                color: Colors.white,
              ),
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  Scaffold.of(context).openDrawer();
                }
              },
            );
          },
        ),
        title: const Text(
          'Phân tích chi tiết',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            tooltip: 'Xuất Excel',
            icon: const Icon(Icons.file_download_outlined, color: Colors.white),
            onPressed: _transactions.isEmpty
                ? null
                : () => ExcelExportService.exportTransactions(
                      context,
                      _transactions,
                      fileName: 'FinAuto_PhanTich',
                    ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
          ),
        ],
      ),
      drawer: const CustomSideDrawer(),
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

                    // Biểu đồ: Phân tích cơ cấu dòng tiền (Unified Toggle Pie Chart)
                    Text(
                      'Phân tích cơ cấu nguồn tiền',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildUnifiedPieChartSection(),
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

  Widget _buildUnifiedPieChartSection() {
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final Map<String, double> targetMap = _showThuPieChart ? _categoryThuSums : _categoryChiSums;
    final double totalSum = _showThuPieChart ? _totalThu : _totalChi;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        children: [
          // Nút chuyển đổi Tab Thu / Chi (Segmented Pill Toggle)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _showThuPieChart = true),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _showThuPieChart ? const Color(0xFF198754) : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: _showThuPieChart
                            ? [
                                BoxShadow(
                                  color: const Color(0xFF198754).withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '🟢 Doanh thu (THU)',
                        style: TextStyle(
                          color: _showThuPieChart ? Colors.white : Colors.grey.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _showThuPieChart = false),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: !_showThuPieChart ? const Color(0xFFDC3545) : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: !_showThuPieChart
                            ? [
                                BoxShadow(
                                  color: const Color(0xFFDC3545).withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '🔴 Chi phí (CHI)',
                        style: TextStyle(
                          color: !_showThuPieChart ? Colors.white : Colors.grey.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          if (totalSum == 0)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 30),
              child: _buildEmptyState('Chưa phát sinh khoản ${_showThuPieChart ? "thu" : "chi"} nào để phân tích.'),
            )
          else ...[
            // Donut Chart lớn, giữa lòng hiển thị Tổng tiền
            SizedBox(
              height: 200,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  PieChart(
                    PieChartData(
                      sectionsSpace: 3,
                      centerSpaceRadius: 50,
                      sections: targetMap.entries.map((entry) {
                        final double percentage = totalSum > 0 ? (entry.value / totalSum) * 100 : 0.0;
                        return PieChartSectionData(
                          color: _getCategoryColor(entry.key),
                          value: entry.value,
                          title: percentage >= 5.0 ? '${percentage.toStringAsFixed(1)}%' : '',
                          radius: percentage >= 15.0 ? 42 : 38,
                          titleStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _showThuPieChart ? 'TỔNG THU' : 'TỔNG CHI',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey.shade600,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currencyFormat.format(totalSum),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: _showThuPieChart ? const Color(0xFF198754) : const Color(0xFFDC3545),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Danh sách Legend cards dưới biểu đồ
            Column(
              children: targetMap.entries.map((entry) {
                final double percentage = totalSum > 0 ? (entry.value / totalSum) * 100 : 0.0;
                final Color catColor = _getCategoryColor(entry.key);
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: catColor.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: catColor.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: catColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.key,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(3),
                              child: LinearProgressIndicator(
                                value: percentage / 100,
                                backgroundColor: Colors.grey.shade200,
                                valueColor: AlwaysStoppedAnimation<Color>(catColor),
                                minHeight: 5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            currencyFormat.format(entry.value),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${percentage.toStringAsFixed(1)}%',
                            style: TextStyle(
                              fontSize: 12,
                              color: catColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
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
