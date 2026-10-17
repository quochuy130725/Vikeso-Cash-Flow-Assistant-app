import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:async';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';
import '../../data/services/excel_export_service.dart';
import '../../data/services/subscription_service.dart';
import '../shared_widgets/pro_paywall_sheet.dart';
import '../shared_widgets/side_drawer.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  bool _isPro = false;
  List<Map<String, dynamic>> _transactions = [];
  
  // Stats
  double _totalThu = 0;
  double _totalChi = 0;
  Map<String, double> _categoryThuSums = {};
  Map<String, double> _categoryChiSums = {};
  bool _showThuPieChart = true;
  int _touchedPieIndex = -1;
  StreamSubscription? _txSub;

  @override
  void initState() {
    super.initState();
    _loadData();
    _txSub = SocketService.instance.onTransactionChanged.listen((_) {
      _loadData(silent: true);
    });
  }

  @override
  void dispose() {
    _txSub?.cancel();
    super.dispose();
  }

  Future<void> _loadData({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _isLoading = true;
      });
    }

    try {
      const storage = FlutterSecureStorage(aOptions: AndroidOptions());
      final storedUserId = await storage.read(key: 'user_id');
      final String userId = (storedUserId != null && storedUserId.isNotEmpty)
          ? storedUserId
          : (dotenv.env['USER_ID'] ?? '');
      if (userId.isNotEmpty) {
        dotenv.env['USER_ID'] = userId;
      }
      final data = await _apiService.getTransactions(userId);
      final isProUser = await SubscriptionService().isPro();
      _transactions = data;
      _isPro = isProUser;
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
      case 'Khac':
        return 'Khác';
      default:
        return rawCategory;
    }
  }

  Color _getCategoryColor(String category, [int fallbackIndex = 0]) {
    switch (category) {
      case 'Hóa đơn lẻ':
        return const Color(0xFFFF4783); // Hot Pink
      case 'POS kết ca':
        return const Color(0xFFD0F81B); // Cyber Lime
      case 'Sổ tay':
        return const Color(0xFFFF4783).withValues(alpha: 0.7);
      case 'Chuyển khoản':
        return const Color(0xFFD0F81B).withValues(alpha: 0.75);
      case 'Nguyên liệu':
        return const Color(0xFFD0F81B);
      case 'Nhân công':
        return const Color(0xFFFF4783);
      case 'Mặt bằng':
        return const Color(0xFFD0F81B).withValues(alpha: 0.6);
      case 'Điện nước':
        return const Color(0xFFFF4783).withValues(alpha: 0.6);
      default:
        final palette = [
          const Color(0xFFFF4783),
          const Color(0xFFD0F81B),
          const Color(0xFFFF4783).withValues(alpha: 0.5),
          const Color(0xFFD0F81B).withValues(alpha: 0.5),
          const Color(0xFF0F172A),
        ];
        return palette[fallbackIndex % palette.length];
    }
  }

  Color _getTextColorForSegment(Color sliceColor) {
    // Cyber Lime (and other high-luminance colors) must use dark slate for crisp contrast
    if (sliceColor.computeLuminance() > 0.45) {
      return const Color(0xFF0F172A);
    }
    return Colors.white;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final double netProfit = _totalThu - _totalChi;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: Icon(
                Navigator.canPop(context) ? Icons.arrow_back_rounded : Icons.menu_rounded,
                color: const Color(0xFF0F172A),
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
          'Báo Cáo Phân Tích',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
            fontSize: 19,
            letterSpacing: -0.4,
          ),
        ),
        actions: [
          Tooltip(
            message: _isPro ? 'Xuất Excel' : 'Xuất Excel (Gói PRO)',
            child: IconButton(
              onPressed: () {
                if (!_isPro) {
                  ProPaywallSheet.show(
                    context,
                    featureTitle: 'Xuất Báo Cáo Phân Tích',
                    featureDescription:
                        'Tính năng xuất toàn bộ bảng kê báo cáo thu - chi, tỷ trọng doanh thu ra file Excel (.xlsx) chuẩn kế toán nộp thuế chỉ dành riêng cho gói VikeSo PRO.',
                  );
                  return;
                }
                if (_transactions.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Không có giao dịch để xuất Excel!')),
                  );
                  return;
                }
                ExcelExportService.exportTransactions(
                  context,
                  _transactions,
                  fileName: 'Vikeso_BaoCao',
                );
              },
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.file_download_outlined, color: Color(0xFF0F172A), size: 22),
                  if (!_isPro)
                    Positioned(
                      right: -3,
                      bottom: -2,
                      child: Container(
                        padding: const EdgeInsets.all(1.5),
                        decoration: const BoxDecoration(
                          color: Color(0xFFD0F81B),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.lock_rounded, size: 9, color: Color(0xFF0F172A)),
                      ),
                    ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF0F172A)),
            onPressed: _loadData,
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: const CustomSideDrawer(),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF4783)),
            )
          : RefreshIndicator(
              color: const Color(0xFFFF4783),
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
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
                'LỢI NHUẬN RÒNG THỰC TẾ (P&L)',
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.6,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Kỳ này',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${isProfitable ? '+' : ''}${currencyFormat.format(netProfit)}',
            style: const TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 32,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.6,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: isProfitable ? const Color(0xFFD0F81B) : const Color(0xFFFFE4EE),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Icon(
                      isProfitable ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                      color: isProfitable ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
                      size: 15,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isProfitable
                        ? 'Cửa hàng vận hành hiệu quả • Biên lợi nhuận dương'
                        : 'Chi tiêu đang vượt quá mức thu trong kỳ!',
                    style: TextStyle(
                      color: isProfitable ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          // 2-metric summary strip inside card: Thu vs Chi
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF5F8),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFFD6E4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tổng doanh thu',
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        currencyFormat.format(_totalThu),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFFF4783)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tổng chi phí',
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        currencyFormat.format(_totalChi),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
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
                              color: value == 0 ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
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
                        color: const Color(0xFFFF4783),
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
                        color: const Color(0xFFD0F81B),
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
              _buildSimpleLegend('Thu vào', currencyFormat.format(_totalThu), const Color(0xFFFF4783)),
              _buildSimpleLegend('Chi ra', currencyFormat.format(_totalChi), const Color(0xFFD0F81B)),
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
    final List<MapEntry<String, double>> entries = targetMap.entries.toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 16,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Column(
        children: [
          // Nút chuyển đổi Tab Thu / Chi (Segmented Pill Toggle)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() {
                      _showThuPieChart = true;
                      _touchedPieIndex = -1;
                    }),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(
                        color: _showThuPieChart ? const Color(0xFFFF4783) : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: _showThuPieChart
                            ? [
                                BoxShadow(
                                  color: const Color(0xFFFF4783).withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Doanh thu (THU)',
                        style: TextStyle(
                          color: _showThuPieChart ? Colors.white : const Color(0xFF64748B),
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() {
                      _showThuPieChart = false;
                      _touchedPieIndex = -1;
                    }),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(
                        color: !_showThuPieChart ? const Color(0xFFD0F81B) : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: !_showThuPieChart
                            ? [
                                BoxShadow(
                                  color: const Color(0xFFD0F81B).withValues(alpha: 0.35),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Chi phí (CHI)',
                        style: TextStyle(
                          color: !_showThuPieChart ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          if (totalSum == 0)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: _buildEmptyState('Chưa phát sinh khoản ${_showThuPieChart ? "thu" : "chi"} nào để phân tích.'),
            )
          else ...[
            // Donut Chart to lớn, trực quan với hiệu ứng tương tác chạm
            SizedBox(
              height: 280,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  PieChart(
                    PieChartData(
                      pieTouchData: PieTouchData(
                        touchCallback: (FlTouchEvent event, pieTouchResponse) {
                          setState(() {
                            if (!event.isInterestedForInteractions ||
                                pieTouchResponse == null ||
                                pieTouchResponse.touchedSection == null) {
                              _touchedPieIndex = -1;
                              return;
                            }
                            _touchedPieIndex = pieTouchResponse.touchedSection!.touchedSectionIndex;
                          });
                        },
                      ),
                      borderData: FlBorderData(show: false),
                      sectionsSpace: 4,
                      centerSpaceRadius: 66,
                      sections: entries.asMap().entries.map((mapEntry) {
                        final int index = mapEntry.key;
                        final entry = mapEntry.value;
                        final bool isTouched = index == _touchedPieIndex;
                        final double radius = isTouched ? 58.0 : 48.0;
                        final double percentage = totalSum > 0 ? (entry.value / totalSum) * 100 : 0.0;
                        final Color catColor = _getCategoryColor(entry.key, index);
                        final Color textColor = _getTextColorForSegment(catColor);

                        return PieChartSectionData(
                          color: catColor,
                          value: entry.value,
                          title: percentage >= 4.0 ? '${percentage.toStringAsFixed(1)}%' : '',
                          radius: radius,
                          titlePositionPercentageOffset: 0.55,
                          titleStyle: TextStyle(
                            fontSize: isTouched ? 15.0 : 13.0,
                            fontWeight: FontWeight.w900,
                            color: textColor,
                            shadows: textColor == Colors.white
                                ? [
                                    Shadow(
                                      color: Colors.black.withValues(alpha: 0.3),
                                      blurRadius: 3,
                                    ),
                                  ]
                                : null,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  // Thẻ thông tin nổi bật giữa lòng biểu đồ
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _touchedPieIndex = -1;
                      });
                    },
                    child: Container(
                      width: 124,
                      height: 124,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.06),
                            blurRadius: 12,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (_touchedPieIndex >= 0 && _touchedPieIndex < entries.length) ...[
                            // Danh mục đang chạm vào
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                              decoration: BoxDecoration(
                                color: _getCategoryColor(entries[_touchedPieIndex].key, _touchedPieIndex).withValues(alpha: 0.16),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                entries[_touchedPieIndex].key,
                                style: TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
                                  color: _getCategoryColor(entries[_touchedPieIndex].key, _touchedPieIndex) == const Color(0xFFD0F81B)
                                      ? const Color(0xFF0F172A)
                                      : const Color(0xFFFF4783),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(height: 4),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                currencyFormat.format(entries[_touchedPieIndex].value),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF0F172A),
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${totalSum > 0 ? ((entries[_touchedPieIndex].value / totalSum) * 100).toStringAsFixed(1) : 0}% cơ cấu',
                                style: const TextStyle(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ] else ...[
                            // Tóm tắt tổng quan mặc định
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                              decoration: BoxDecoration(
                                color: _showThuPieChart
                                    ? const Color(0xFFFF4783).withValues(alpha: 0.12)
                                    : const Color(0xFFD0F81B).withValues(alpha: 0.28),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _showThuPieChart ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                                    size: 11,
                                    color: _showThuPieChart ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                                  ),
                                  const SizedBox(width: 3),
                                  Text(
                                    _showThuPieChart ? 'TỔNG THU' : 'TỔNG CHI',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: _showThuPieChart ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 5),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                currencyFormat.format(totalSum),
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w900,
                                  color: _showThuPieChart ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${targetMap.length} danh mục',
                              style: const TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Danh sách Legend cards tương tác thông minh
            Column(
              children: entries.asMap().entries.map((mapEntry) {
                final int idx = mapEntry.key;
                final entry = mapEntry.value;
                final bool isSelected = idx == _touchedPieIndex;
                final double percentage = totalSum > 0 ? (entry.value / totalSum) * 100 : 0.0;
                final Color catColor = _getCategoryColor(entry.key, idx);

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _touchedPieIndex = (_touchedPieIndex == idx ? -1 : idx);
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? catColor.withValues(alpha: 0.12) : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? catColor : const Color(0xFFE2E8F0),
                        width: isSelected ? 1.8 : 1.0,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: catColor.withValues(alpha: 0.22),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              )
                            ]
                          : [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              )
                            ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            color: catColor,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: catColor.withValues(alpha: 0.35),
                                blurRadius: 4,
                              )
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    entry.key,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w700,
                                      color: const Color(0xFF0F172A),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: catColor.withValues(alpha: 0.18),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '${percentage.toStringAsFixed(1)}%',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: catColor == const Color(0xFFD0F81B)
                                            ? const Color(0xFF0F172A)
                                            : (catColor.computeLuminance() > 0.45 ? const Color(0xFF0F172A) : catColor),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: percentage / 100,
                                  backgroundColor: const Color(0xFFF1F5F9),
                                  valueColor: AlwaysStoppedAnimation<Color>(catColor),
                                  minHeight: 6,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Text(
                          currencyFormat.format(entry.value),
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
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
