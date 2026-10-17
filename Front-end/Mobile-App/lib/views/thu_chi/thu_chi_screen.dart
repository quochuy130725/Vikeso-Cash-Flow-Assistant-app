import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../shared_widgets/side_drawer.dart';
import 'package:intl/intl.dart';
import '../../data/services/api_service.dart';
import '../../data/services/excel_export_service.dart';
import '../../data/services/subscription_service.dart';
import '../shared_widgets/pro_paywall_sheet.dart';
import 'widgets/thu_chi_list_item.dart';

class ThuChiScreen extends StatefulWidget {
  const ThuChiScreen({super.key});

  @override
  State<ThuChiScreen> createState() => _ThuChiScreenState();
}

class _ThuChiScreenState extends State<ThuChiScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  bool _isPro = false;
  List<Map<String, dynamic>> _allTransactions = [];
  List<Map<String, dynamic>> _filteredTransactions = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _fetchTransactions();
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) return;
    _applyFilter();
  }

  Future<void> _fetchTransactions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      const storage = FlutterSecureStorage(aOptions: AndroidOptions());
      final storedUserId = await storage.read(key: 'user_id');
      final String userId = (storedUserId != null && storedUserId.isNotEmpty)
          ? storedUserId
          : (dotenv.env['USER_ID'] ?? '');
      if (userId.isNotEmpty) {
        dotenv.env['USER_ID'] = userId;
      }
      final txs = await ApiService().getTransactions(userId);
      final isProUser = await SubscriptionService().isPro();
      setState(() {
        _allTransactions = txs;
        _isPro = isProUser;
        _isLoading = false;
      });
      _applyFilter();
    } catch (e) {
      debugPrint('Lỗi tải danh sách thu chi: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _applyFilter() {
    setState(() {
      if (_tabController.index == 0) {
        _filteredTransactions = List.from(_allTransactions);
      } else if (_tabController.index == 1) {
        _filteredTransactions = _allTransactions
            .where((tx) => tx['transactionType'] == 'THU')
            .toList();
      } else {
        _filteredTransactions = _allTransactions
            .where((tx) => tx['transactionType'] == 'CHI')
            .toList();
      }
    });
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

  String _getDateHeader(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final compareDate = DateTime(date.year, date.month, date.day);

    final formatter = DateFormat('dd/MM/yyyy');
    if (compareDate == today) {
      return 'HÔM NAY, ${formatter.format(date)}';
    } else if (compareDate == yesterday) {
      return 'HÔM QUA, ${formatter.format(date)}';
    } else {
      final weekdayNames = ['', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY', 'CHỦ NHẬT'];
      final weekdayStr = weekdayNames[date.weekday];
      return '$weekdayStr, ${formatter.format(date)}';
    }
  }

  Map<String, List<Map<String, dynamic>>> _groupTransactionsByDate(
      List<Map<String, dynamic>> transactions) {
    final Map<String, List<Map<String, dynamic>>> groups = {};

    for (var tx in transactions) {
      final tDate = _parseDate(tx['transactionDate'])?.toLocal();
      if (tDate == null) continue;

      final key = DateFormat('yyyy-MM-dd').format(tDate);
      if (!groups.containsKey(key)) {
        groups[key] = [];
      }
      groups[key]!.add(tx);
    }
    return groups;
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    double totalInFilter = 0;
    for (var tx in _filteredTransactions) {
      final double amt = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
      if (tx['transactionType'] == 'THU') {
        totalInFilter += amt;
      } else {
        totalInFilter -= amt;
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A), size: 24),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            );
          }
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Sổ Quỹ Thu Chi',
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
                    featureTitle: 'Xuất Dữ Liệu Excel',
                    featureDescription:
                        'Tính năng xuất toàn bộ bảng kê thu - chi, sổ quỹ dòng tiền ra file Excel (.xlsx) chuẩn kế toán nộp thuế chỉ dành riêng cho gói VikeSo PRO.',
                  );
                  return;
                }
                if (_filteredTransactions.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Không có giao dịch để xuất Excel!')),
                  );
                  return;
                }
                ExcelExportService.exportTransactions(
                  context,
                  _filteredTransactions,
                  fileName: 'Vikeso_SoQuy',
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
            onPressed: () => Navigator.pushNamed(context, '/camera'),
            icon: const Icon(Icons.qr_code_scanner_rounded, color: Color(0xFFFF4783), size: 22),
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: const Drawer(
        child: CustomSideDrawer(),
      ),
      body: Column(
        children: [
          // Navigation Tab Bar (Segmented Ledger Filter)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Container(
              height: 42,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: const Color(0xFFFF4783),
                  borderRadius: BorderRadius.circular(9),
                ),
                labelColor: Colors.white,
                unselectedLabelColor: const Color(0xFF64748B),
                labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                tabs: const [
                  Tab(text: 'Tất cả'),
                  Tab(text: 'Khoản Thu'),
                  Tab(text: 'Khoản Chi'),
                ],
              ),
            ),
          ),

          // Total Summary Strip
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_filteredTransactions.length} bản ghi',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                  ),
                ),
                Row(
                  children: [
                    const Text(
                      'Dòng tiền ròng: ',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                    ),
                    Text(
                      currencyFormat.format(totalInFilter),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: totalInFilter >= 0 ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 4),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildTransactionList(context),
                _buildTransactionList(context),
                _buildTransactionList(context),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTransactionList(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFFF4783)));
    }

    if (_filteredTransactions.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.receipt_long_outlined, size: 28, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 12),
            const Text(
              'Chưa có giao dịch nào phù hợp',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }

    final grouped = _groupTransactionsByDate(_filteredTransactions);
    final sortedKeys = grouped.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return RefreshIndicator(
      color: const Color(0xFFFF4783),
      onRefresh: _fetchTransactions,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
        itemCount: sortedKeys.length + 1, // Add space at bottom
        itemBuilder: (context, index) {
          if (index == sortedKeys.length) {
            return const SizedBox(height: 80);
          }

          final dateKey = sortedKeys[index];
          final txList = grouped[dateKey]!;
          final sampleDate = _parseDate(txList.first['transactionDate'])?.toLocal() ?? DateTime.now();
          final headerText = _getDateHeader(sampleDate);

          final cardItems = txList.map((tx) {
            final type = tx['transactionType'] ?? 'THU';
            final isThu = type == 'THU';
            final amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
            final category = tx['category'] ?? (isThu ? 'Bán hàng' : 'Chi phí khác');
            final tDate = _parseDate(tx['transactionDate'])?.toLocal() ?? DateTime.now();
            final timeStr = DateFormat('HH:mm').format(tDate);
            final note = tx['description'] ?? tx['shopName'] ?? category;

            return TransactionItemCard(
              title: note.toString(),
              time: '$timeStr • $category',
              value: amount.abs(),
              isThu: isThu,
              onTap: () => _showTransactionDetail(context, tx),
            );
          }).toList();

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 6),
                child: Text(
                  headerText,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF64748B),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              ...cardItems,
              const SizedBox(height: 8),
            ],
          );
        },
      ),
    );
  }

  void _showTransactionDetail(BuildContext context, Map<String, dynamic> tx) {
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final isThu = tx['transactionType'] == 'THU';
    final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
    final category = tx['category'] ?? 'Không phân loại';
    final tDate = _parseDate(tx['transactionDate'])?.toLocal();
    final dateStr = tDate != null ? DateFormat('HH:mm - dd/MM/yyyy').format(tDate) : 'Không rõ';
    final desc = tx['description'] ?? tx['shopName'] ?? 'Giao dịch thông thường';

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isThu ? 'Khoản Thu Nhập' : 'Khoản Chi Phí',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isThu
                          ? const Color(0xFFFF4783).withValues(alpha: 0.15)
                          : const Color(0xFFD0F81B),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isThu ? 'THU (+)' : 'CHI (-)',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: isThu ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  '${isThu ? '+' : '-'}${currencyFormat.format(amount)}',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: isThu ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Divider(color: Color(0xFFF1F5F9)),
              const SizedBox(height: 12),
              _buildDetailRow('Hạng mục', category),
              _buildDetailRow('Nội dung', desc.toString()),
              _buildDetailRow('Thời gian', dateStr),
              if (tx['paymentMethod'] != null)
                _buildDetailRow('Phương thức', tx['paymentMethod'].toString()),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text(
                    'Đóng chi tiết',
                    style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
            ),
          ),
        ],
      ),
    );
  }
}
