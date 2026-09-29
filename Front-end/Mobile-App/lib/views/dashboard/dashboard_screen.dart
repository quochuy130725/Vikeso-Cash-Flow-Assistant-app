import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart' as flutter_secure_storage;
import '../shared_widgets/side_drawer.dart';
import 'widgets/dashboard_action_buttons.dart';
import 'widgets/revenue_chart.dart';
import 'widgets/donut_chart_painter.dart';
import '../../data/services/api_service.dart';
import '../../core/utils/ui_helpers.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String _displayName = 'NgÆ°á»i dĂ¹ng';
  List<Map<String, dynamic>> _transactions = [];

  // Thá»‘ng kĂª Ä‘á»™ng
  double _todayThu = 0;
  double _yesterdayThu = 0;
  double _thisWeekThu = 0;
  int _thisWeekOrderCount = 0;
  double _thisMonthChi = 0;
  double _thisMonthThu = 0;
  Map<String, double> _categoryChiSums = {};

  List<double> _weeklyRevenue = List.filled(7, 0.0);

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
      const storage =  flutter_secure_storage.FlutterSecureStorage();
      final shopName = await storage.read(key: 'user_shopName');
      final userName = await storage.read(key: 'user_name');
      final email = await storage.read(key: 'user_email');
      if (mounted) {
        setState(() {
          if (shopName != null && shopName.trim() != '') _displayName = shopName;
          else if (userName != null && userName.trim() != '') _displayName = userName;
          else if (email != null && email.trim() != '') _displayName = email.split('@')[0];
          else _displayName = 'NgÆ°á»i dĂ¹ng';
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
        return 'HĂ³a Ä‘Æ¡n láº»';
      case 'POS Ket Ca':
        return 'POS káº¿t ca';
      case 'So Tay':
        return 'Sá»• tay';
      case 'Khac':
        return 'KhĂ¡c';
      default:
        return rawCategory; // Giá»¯ nguyĂªn cĂ¡c category tiáº¿ng Viá»‡t cĂ³ sáºµn (NguyĂªn liá»‡u, NhĂ¢n cĂ´ng, Äiá»‡n nÆ°á»›c, BĂ¡n hĂ ng...)
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
      'NguyĂªn liá»‡u': 0.0,
      'NhĂ¢n cĂ´ng': 0.0,
      'Äiá»‡n nÆ°á»›c': 0.0,
      'KhĂ¡c': 0.0,
    };
    _weeklyRevenue = List.filled(7, 0.0);

    for (var tx in _transactions) {
      final type = tx['transactionType'] ?? '';
      final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
      final tDate = _parseDate(tx['transactionDate'])?.toLocal();

      if (tDate == null) continue;

      final tDateStart = DateTime(tDate.year, tDate.month, tDate.day);

      // Doanh thu hĂ´m nay vs HĂ´m qua
      if (tDateStart == todayStart) {
        if (type == 'THU') _todayThu += amount;
      } else if (tDateStart == yesterdayStart) {
        if (type == 'THU') _yesterdayThu += amount;
      }

      // Doanh thu 7 ngĂ y gáº§n nháº¥t (tá»« 6 ngĂ y trÆ°á»›c Ä‘áº¿n hĂ´m nay)
      final diffDays = tDateStart.difference(sixDaysAgo).inDays;
      if (diffDays >= 0 && diffDays < 7) {
        if (type == 'THU') {
          _thisWeekThu += amount;
          _thisWeekOrderCount++;
          _weeklyRevenue[diffDays] += amount / 1000000.0; // Triá»‡u Ä‘á»“ng
        }
      }

      // Doanh thu & Chi phĂ­ thĂ¡ng
      if (tDate.month == now.month && tDate.year == now.year) {
        if (type == 'CHI') {
          _thisMonthChi += amount;
          String category = _formatCategory(tx['category'] ?? 'Khac');
          // Ănh xáº¡ vá» 4 nhĂ³m hiá»ƒn thá»‹ trĂªn biá»ƒu Ä‘á»“ trĂ²n cá»§a Dashboard
          if (category != 'NguyĂªn liá»‡u' &&
              category != 'NhĂ¢n cĂ´ng' &&
              category != 'Äiá»‡n nÆ°á»›c') {
            category = 'KhĂ¡c';
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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'Ä‘');

    final growthPercent = _calculateGrowthPercentage();
    final isGrowthPositive = growthPercent >= 0;

    final double totalChiSum = _categoryChiSums.values.fold(0.0, (sum, val) => sum + val);
    final double totalThuChiSum = _thisMonthThu + _thisMonthChi;
    final List<double> piePercentages = [
      _thisMonthThu,
      _thisMonthChi,
    ];
    final List<Color> pieColors = [
      const Color(0xFF198754), // Thu nháº­p (Xanh lĂ¡)
      const Color(0xFFDC3545), // Chi phĂ­ (Äá»)
    ];

    final categories = ['Doanh thu', 'Chi phĂ­'];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFF5C8D), // MĂ u há»“ng Primary Container
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/camera');
        },
        backgroundColor: const Color(
            0xFFFF5C8D), // MĂ u há»“ng trĂ¹ng vá»›i nĂºt 'Xem bĂ¡o cĂ¡o' vĂ  thÆ°Æ¡ng hiá»‡u
        shape: const CircleBorder(),
        child: const Icon(Icons.add, size: 28, color: Colors.white),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF5C8D)),
            )
          : RefreshIndicator(
              color: const Color(0xFFFF5C8D),
              onRefresh: _loadData,
              child: SafeArea(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Lá»i chĂ o chá»§ quĂ¡n
                      Row(
                        children: [
                          Text(
                            'Xin chĂ o, $_displayName',
                            style: theme.textTheme.headlineLarge?.copyWith(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'đŸ‘‹',
                            style: TextStyle(fontSize: 28),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // --- 1. QUICK ACTION BUTTONS (MĂ u thÆ°Æ¡ng hiá»‡u cá»§a dá»± Ă¡n) ---
                      const DashboardActionButtons(),
                      const SizedBox(height: 24),

                      // --- 2. SUMMARY NUMERICAL STATS TABLE (Báº£ng sá»‘ liá»‡u tĂ³m gá»n biá»ƒu Ä‘á»“) ---
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: colorScheme.surfaceContainerHighest),
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
                              'TĂ³m táº¯t thá»‘ng kĂª sá»‘ liá»‡u',
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
                                      padding:
                                          EdgeInsets.symmetric(vertical: 8.0),
                                      child: Text('Doanh thu tuáº§n:',
                                          style: TextStyle(
                                              color: Colors.grey,
                                              fontSize: 13)),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8.0),
                                      child: RichText(
                                        text: TextSpan(
                                          children: [
                                            TextSpan(
                                                text:
                                                    '${currencyFormat.format(_thisWeekThu)}\n',
                                                style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18,
                                                    color: Color(0xFF198754),
                                                    height: 1.2)),
                                            TextSpan(
                                                text:
                                                    '($_thisWeekOrderCount Ä‘Æ¡n hĂ ng)',
                                                style: const TextStyle(
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
                                      padding:
                                          EdgeInsets.symmetric(vertical: 8.0),
                                      child: Text('Tá»•ng chi phĂ­ thĂ¡ng:',
                                          style: TextStyle(
                                              color: Colors.grey,
                                              fontSize: 13)),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8.0),
                                      child: RichText(
                                        text: TextSpan(
                                          children: [
                                            TextSpan(
                                                text:
                                                    '${currencyFormat.format(_thisMonthChi)}\n',
                                                style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18,
                                                    color: Color(0xFFDC3545),
                                                    height: 1.2)),
                                            TextSpan(
                                                text: totalChiSum > 0
                                                    ? '(NguyĂªn liá»‡u chiáº¿m ${((_categoryChiSums['NguyĂªn liá»‡u'] ?? 0.0) / totalChiSum * 100).toStringAsFixed(0)}%)'
                                                    : '(ChÆ°a chi tiĂªu)',
                                                style: const TextStyle(
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
                                      padding:
                                          EdgeInsets.symmetric(vertical: 8.0),
                                      child: Text('Doanh thu táº¡m tĂ­nh:',
                                          style: TextStyle(
                                              color: Colors.grey,
                                              fontSize: 13)),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8.0),
                                      child: RichText(
                                        text: TextSpan(
                                          children: [
                                            TextSpan(
                                                text:
                                                    '${currencyFormat.format(_todayThu)}\n',
                                                style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18,
                                                    color: Color(0xFF0D6EFD),
                                                    height: 1.2)),
                                            const TextSpan(
                                                text: '(HĂ´m nay)',
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
                      // Tháº» hiá»ƒn thá»‹ doanh thu hĂ´m nay
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: colorScheme.surfaceContainerHighest),
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
                              'Doanh thu hĂ´m nay',
                              style:
                                  TextStyle(color: Colors.grey, fontSize: 14),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              currencyFormat.format(_todayThu),
                              style: TextStyle(
                                color: colorScheme.primary,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  isGrowthPositive
                                      ? Icons.arrow_drop_up
                                      : Icons.arrow_drop_down,
                                  color: colorScheme.primary,
                                  size: 18,
                                ),
                                Text(
                                  '${isGrowthPositive ? '+' : ''}${growthPercent.toStringAsFixed(0)}% so vá»›i hĂ´m qua',
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

                      // Biá»ƒu Ä‘á»“ doanh thu 7 ngĂ y gáº§n nháº¥t
                      RevenueChart(weeklyRevenue: _weeklyRevenue),
                      const SizedBox(height: 16),

                      // Tháº» hiá»ƒn thá»‹ cÆ¡ cáº¥u chi phĂ­ (Pie chart)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: colorScheme.surfaceContainerHighest),
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
                              'CÆ¡ cáº¥u thu chi (thĂ¡ng nĂ y)',
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
                                    painter: DonutChartPainter(
                                      percentages: piePercentages,
                                      colors: pieColors,
                                    ),
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children:
                                      List.generate(categories.length, (index) {
                                    final cat = categories[index];
                                    final double val = index == 0 ? _thisMonthThu : _thisMonthChi;
                                    final double percent = totalThuChiSum > 0 ? (val / totalThuChiSum) : 0.0;
                                    return _buildLegendItem(
                                        cat,
                                        '${(percent * 100).toStringAsFixed(0)}%',
                                        pieColors[index]);
                                  }),
                                )
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- 4. WAREHOUSE MANAGEMENT (Quáº£n lĂ½ kho hĂ ng) ---
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFF8F9FA), Color(0xFFFCFDF2)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: colorScheme.surfaceContainerHighest),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            )
                          ],
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Quáº£n lĂ½ kho hĂ ng',
                                    style:
                                        theme.textTheme.titleMedium?.copyWith(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: colorScheme.onSurface,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Báº¡n cĂ³ 3 máº·t hĂ ng sáº¯p háº¿t. HĂ£y nháº­p thĂªm nguyĂªn liá»‡u Ä‘á»ƒ khĂ´ng bá»‹ giĂ¡n Ä‘oáº¡n.',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  ElevatedButton(
                                    onPressed: () {
                                      UIHelpers.showWarningToast(context,
                                          'Chá»©c nÄƒng nĂ y Ä‘ang Ä‘Æ°á»£c phĂ¡t triá»ƒn!');
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF191C1D),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16, vertical: 10),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Kiá»ƒm kho ngay',
                                          style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(width: 4),
                                        Icon(Icons.arrow_forward, size: 14),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: Colors.orange.withValues(alpha: 0.05),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.inventory_2_outlined,
                                size: 48,
                                color: Colors.orangeAccent,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
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

