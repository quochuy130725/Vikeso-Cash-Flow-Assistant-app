import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart' as flutter_secure_storage;
import '../shared_widgets/side_drawer.dart';
import '../shared_widgets/notification_sheet.dart';
import 'widgets/dashboard_action_buttons.dart';
import 'widgets/revenue_chart.dart';
import 'widgets/donut_chart_painter.dart';
import 'dart:async';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String _displayName = 'Người dùng';
  List<Map<String, dynamic>> _transactions = [];

  // Thống kê động
  double _todayThu = 0;
  double _yesterdayThu = 0;
  double _thisWeekThu = 0;
  int _thisWeekOrderCount = 0;
  double _thisMonthChi = 0;
  double _thisMonthThu = 0;
  Map<String, double> _categoryChiSums = {};

  List<double> _weeklyRevenue = List.filled(7, 0.0);
  StreamSubscription? _txSub;
  StreamSubscription? _profileSub;

  @override
  void initState() {
    super.initState();
    _loadData();
    _txSub = SocketService.instance.onTransactionChanged.listen((_) {
      _loadData(silent: true);
    });
    _profileSub = SocketService.instance.onProfileChanged.listen((_) {
      _loadData(silent: true);
    });
  }

  @override
  void dispose() {
    _txSub?.cancel();
    _profileSub?.cancel();
    super.dispose();
  }

  Future<void> _loadData({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _isLoading = true;
      });
    }

    try {
      const storage = flutter_secure_storage.FlutterSecureStorage();
      final storedUserId = await storage.read(key: 'user_id');
      final String userId = (storedUserId != null && storedUserId.isNotEmpty)
          ? storedUserId
          : (dotenv.env['USER_ID'] ?? '');
      if (userId.isNotEmpty) {
        dotenv.env['USER_ID'] = userId;
      }
      final shopName = await storage.read(key: 'user_shopName');
      final userName = await storage.read(key: 'user_name');
      final email = await storage.read(key: 'user_email');
      if (mounted) {
        setState(() {
          if (shopName != null && shopName.trim() != '') {
            _displayName = shopName;
          } else if (userName != null && userName.trim() != '') {
            _displayName = userName;
          } else if (email != null && email.trim() != '') {
            _displayName = email.split('@')[0];
          } else {
            _displayName = 'Người dùng';
          }
        });
      }
      final data = await _apiService.getTransactions(userId);
      _transactions = data;
      _processData();
    } catch (e) {
      debugPrint('Error loading dashboard data: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  DateTime? _parseDate(dynamic dateVal) {
    if (dateVal == null) return null;
    if (dateVal is DateTime) return dateVal;
    if (dateVal is Map) {
      if (dateVal.containsKey('\$date')) {
        return DateTime.tryParse(dateVal['\$date'].toString());
      }
    }
    return DateTime.tryParse(dateVal.toString());
  }

  String _formatCategory(String rawCategory) {
    switch (rawCategory) {
      case 'Hoa Don Le':
        return 'Hóa đơn lẻ';
      case 'POS Ket Ca':
        return 'POS kết ca';
      case 'So Tay':
        return 'Sổ tay';
      case 'Khac':
        return 'Khác';
      default:
        return rawCategory; // Giữ nguyên các category tiếng Việt có sẵn (Nguyên liệu, Nhân công, Điện nước, Bán hàng...)
    }
  }

  void _processData() {
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    final yesterdayStart = todayStart.subtract(const Duration(days: 1));
    final sixDaysAgo = todayStart.subtract(const Duration(days: 6));

    // reset stats
    _todayThu = 0;
    _yesterdayThu = 0;
    _thisWeekThu = 0;
    _thisWeekOrderCount = 0;
    _thisMonthChi = 0;
    _thisMonthThu = 0;
    _categoryChiSums = {
      'Nguyên liệu': 0.0,
      'Nhân công': 0.0,
      'Điện nước': 0.0,
      'Khác': 0.0,
    };
    _weeklyRevenue = List.filled(7, 0.0);

    for (var tx in _transactions) {
      final type = tx['transactionType'] ?? '';
      final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
      final tDate = _parseDate(tx['transactionDate'])?.toLocal();

      if (tDate == null) continue;

      final tDateStart = DateTime(tDate.year, tDate.month, tDate.day);

      // Doanh thu hôm nay vs Hôm qua
      if (tDateStart == todayStart) {
        if (type == 'THU') _todayThu += amount;
      } else if (tDateStart == yesterdayStart) {
        if (type == 'THU') _yesterdayThu += amount;
      }

      // Doanh thu 7 ngày gần nhất (từ 6 ngày trước đến hôm nay)
      final diffDays = tDateStart.difference(sixDaysAgo).inDays;
      if (diffDays >= 0 && diffDays < 7) {
        if (type == 'THU') {
          _thisWeekThu += amount;
          _thisWeekOrderCount++;
          _weeklyRevenue[diffDays] += amount / 1000000.0; // Triệu đồng
        }
      }

      // Doanh thu & Chi phí tháng
      if (tDate.month == now.month && tDate.year == now.year) {
        if (type == 'CHI') {
          _thisMonthChi += amount;
          String category = _formatCategory(tx['category'] ?? 'Khac');
          // Ánh xạ về 4 nhóm hiển thị trên biểu đồ tròn của Dashboard
          if (category != 'Nguyên liệu' &&
              category != 'Nhân công' &&
              category != 'Điện nước') {
            category = 'Khác';
          }
          _categoryChiSums[category] = (_categoryChiSums[category] ?? 0.0) + amount;
        } else if (type == 'THU') {
          _thisMonthThu += amount;
        }
      }
    }
  }

  double _calculateGrowthPercentage() {
    if (_yesterdayThu == 0) {
      return _todayThu > 0 ? 100.0 : 0.0;
    }
    return ((_todayThu - _yesterdayThu) / _yesterdayThu) * 100.0;
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    final growthPercent = _calculateGrowthPercentage();
    final isGrowthPositive = growthPercent >= 0;

    final double totalThuChiSum = _thisMonthThu + _thisMonthChi;
    final List<double> piePercentages = [
      _thisMonthThu,
      _thisMonthChi,
    ];

    final double netCashflow = _thisMonthThu - _thisMonthChi;
    final recentTransactions = _transactions.take(4).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: Builder(builder: (context) {
          return IconButton(
            icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A), size: 24),
            onPressed: () => Scaffold.of(context).openDrawer(),
          );
        }),
        title: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFFF4783),
              ),
              padding: const EdgeInsets.all(3),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'Vikeso',
              style: TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.w800,
                fontSize: 19,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: Color(0xFF0F172A), size: 24),
            onPressed: () => NotificationSheet.show(context),
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
              child: SafeArea(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // --- 1. HUMAN-CRAFTED OWNER CASHBOOK CARD ---
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Top Row: Store Identity & Date
                            Padding(
                              padding: const EdgeInsets.fromLTRB(18, 18, 18, 14),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFFF0F5),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: const Color(0xFFFFD6E4)),
                                        ),
                                        child: const Center(
                                          child: Icon(Icons.storefront_rounded, color: Color(0xFFFF4783), size: 22),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            _displayName,
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w800,
                                              color: Color(0xFF0F172A),
                                              letterSpacing: -0.3,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 1),
                                          const Text(
                                            'Chủ cửa hàng • Sổ quỹ tiền mặt',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4.5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: const Color(0xFFE2E8F0)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF64748B)),
                                        const SizedBox(width: 5),
                                        Text(
                                          DateFormat('MM/yyyy').format(DateTime.now()),
                                          style: const TextStyle(
                                            color: Color(0xFF0F172A),
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const Divider(height: 1, color: Color(0xFFF1F5F9)),

                            // Central Net Cashflow Figure
                            Padding(
                              padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'SỐ DƯ DÒNG TIỀN RÒNG HIỆN TẠI',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF64748B),
                                      letterSpacing: 0.6,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.baseline,
                                    textBaseline: TextBaseline.alphabetic,
                                    children: [
                                      Text(
                                        currencyFormat.format(netCashflow),
                                        style: const TextStyle(
                                          fontSize: 32,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A),
                                          letterSpacing: -0.8,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      if (growthPercent != 0)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: isGrowthPositive
                                                ? const Color(0xFFD0F81B)
                                                : const Color(0xFFFFE4EE),
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(
                                              color: isGrowthPositive
                                                  ? const Color(0xFF0F172A)
                                                  : const Color(0xFFFF4783).withValues(alpha: 0.3),
                                              width: 0.8,
                                            ),
                                          ),
                                          child: Text(
                                            '${isGrowthPositive ? '▲ +' : '▼ '}${growthPercent.abs().toStringAsFixed(0)}%',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w800,
                                              color: isGrowthPositive
                                                  ? const Color(0xFF0F172A)
                                                  : const Color(0xFFFF4783),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            // Bottom Two-Way Flow Strip (Thu & Chi)
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                              child: Row(
                                children: [
                                  // Tiền vào (Thu)
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFFF5F8),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(color: const Color(0xFFFFD6E4)),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 32,
                                            height: 32,
                                            decoration: const BoxDecoration(
                                              color: Color(0xFFFF4783),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.arrow_downward_rounded, color: Colors.white, size: 16),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text('Tiền vào (Thu)', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                                                const SizedBox(height: 2),
                                                Text(
                                                  currencyFormat.format(_thisMonthThu),
                                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFFFF4783)),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  // Tiền ra (Chi)
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF8FAFC),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 32,
                                            height: 32,
                                            decoration: const BoxDecoration(
                                              color: Color(0xFF0F172A),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.arrow_upward_rounded, color: Color(0xFFD0F81B), size: 16),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text('Tiền ra (Chi)', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                                                const SizedBox(height: 2),
                                                Text(
                                                  currencyFormat.format(_thisMonthChi),
                                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- 2. ACTION HUB ---
                      const DashboardActionButtons(),
                      const SizedBox(height: 18),

                      // --- 3. FINANCIAL PULSE STRIP (3 METRIC SUMMARY) ---
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            // Hôm nay
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Hôm nay', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                                  const SizedBox(height: 3),
                                  Text(
                                    currencyFormat.format(_todayThu),
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFFFF4783)),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Container(width: 1, height: 28, color: const Color(0xFFF1F5F9)),
                            const SizedBox(width: 12),
                            // Tuần này
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Tuần này', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                                  const SizedBox(height: 3),
                                  Text(
                                    currencyFormat.format(_thisWeekThu),
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Container(width: 1, height: 28, color: const Color(0xFFF1F5F9)),
                            const SizedBox(width: 12),
                            // Đơn hàng tuần
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Số đơn tuần', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                                  const SizedBox(height: 3),
                                  Text(
                                    '$_thisWeekOrderCount giao dịch',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // --- 4. REVENUE TREND (7-DAY BARS) ---
                      RevenueChart(weeklyRevenue: _weeklyRevenue),
                      const SizedBox(height: 18),

                      // --- 5. DONUT STRUCTURE ---
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Cơ cấu Thu - Chi tháng này',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    totalThuChiSum > 0 ? '${((_thisMonthThu / totalThuChiSum) * 100).toStringAsFixed(0)}% Thu' : '0%',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                SizedBox(
                                  width: 104,
                                  height: 104,
                                  child: CustomPaint(
                                    painter: DonutChartPainter(
                                      percentages: piePercentages,
                                      colors: const [Color(0xFFFF4783), Color(0xFFD0F81B)],
                                    ),
                                  ),
                                ),
                                Flexible(
                                  child: Padding(
                                    padding: const EdgeInsets.only(left: 16.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        _buildLegendItem(
                                          'Tiền thu',
                                          totalThuChiSum > 0 ? '${(_thisMonthThu / totalThuChiSum * 100).toStringAsFixed(0)}%' : '0%',
                                          currencyFormat.format(_thisMonthThu),
                                          const Color(0xFFFF4783),
                                        ),
                                        const SizedBox(height: 10),
                                        _buildLegendItem(
                                          'Tiền chi',
                                          totalThuChiSum > 0 ? '${(_thisMonthChi / totalThuChiSum * 100).toStringAsFixed(0)}%' : '0%',
                                          currencyFormat.format(_thisMonthChi),
                                          const Color(0xFFD0F81B),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // --- 6. RECENT TRANSACTIONS STATEMENT ---
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Giao dịch gần đây',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.pushNamed(context, '/thu_chi');
                                  },
                                  style: TextButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  child: const Text(
                                    'Xem sổ quỹ →',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFFFF4783),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            if (recentTransactions.isEmpty)
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 20.0),
                                child: Center(
                                  child: Text(
                                    'Chưa có giao dịch nào được ghi nhận',
                                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                  ),
                                ),
                              )
                            else
                              ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: recentTransactions.length,
                                separatorBuilder: (_, __) => const Divider(height: 16, color: Color(0xFFF1F5F9)),
                                itemBuilder: (context, idx) {
                                  final tx = recentTransactions[idx];
                                  final isThu = tx['transactionType'] == 'THU';
                                  final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
                                  final rawCat = tx['category'] ?? 'Khac';
                                  final catTitle = _formatCategory(rawCat);
                                  final tDate = _parseDate(tx['transactionDate']);
                                  final dateStr = tDate != null ? DateFormat('HH:mm • dd/MM').format(tDate) : '';

                                  String mainTitle = (tx['description'] ?? tx['shopName'] ?? '').toString().trim();
                                  String subDetail = dateStr;
                                  if (mainTitle.isEmpty || mainTitle == catTitle || mainTitle.toLowerCase() == rawCat.toString().toLowerCase()) {
                                    if (rawCat == 'POS Ket Ca') {
                                      mainTitle = 'Phiếu tổng kết ca máy POS';
                                      subDetail = 'Đối soát máy cà thẻ • $dateStr';
                                    } else if (rawCat == 'Hoa Don Le') {
                                      mainTitle = 'Hóa đơn bán lẻ';
                                      subDetail = 'Khách thanh toán • $dateStr';
                                    } else if (rawCat == 'Nguyen Lieu') {
                                      mainTitle = 'Nhập sầu riêng / nguyên liệu';
                                      subDetail = 'Chứng từ nhập kho • $dateStr';
                                    } else {
                                      mainTitle = catTitle;
                                      subDetail = 'Khoản thu chi • $dateStr';
                                    }
                                  }

                                  return Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: isThu
                                              ? const Color(0xFFFF4783).withValues(alpha: 0.12)
                                              : const Color(0xFFD0F81B).withValues(alpha: 0.4),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Icon(
                                          isThu ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                                          color: isThu ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                                          size: 17,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              mainTitle,
                                              style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF0F172A),
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              subDetail,
                                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        '${isThu ? '+' : '-'}${currencyFormat.format(amount)}',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w800,
                                          color: isThu ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildLegendItem(String label, String percent, String amount, Color color) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                const SizedBox(width: 4),
                Text(percent, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
              ],
            ),
            Text(amount, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
          ],
        ),
      ],
    );
  }
}
