import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../shared_widgets/side_drawer.dart';
import 'package:intl/intl.dart';
import '../../data/services/api_service.dart';
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

    final String userId = dotenv.env['USER_ID'] ?? '60d5ecb8b392d70015340123';
    try {
      final txs = await ApiService().getTransactions(userId);
      setState(() {
        _allTransactions = txs;
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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
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
        backgroundColor: Theme.of(context).colorScheme.primary,
        title: const Text('Thu Chi',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/camera'),
            icon: const Icon(Icons.document_scanner, color: Colors.white),
          ),
        ],
      ),
      drawer: const Drawer(
        child: CustomSideDrawer(),
      ),
      body: Column(
        children: [
          // Navigation Tab Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(24),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(24),
                ),
                labelColor: Colors.white,
                unselectedLabelColor: Colors.grey[600],
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                tabs: const [
                  Tab(text: 'Tất cả'),
                  Tab(text: 'Thu'),
                  Tab(text: 'Chi'),
                ],
              ),
            ),
          ),

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
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/camera'),
        backgroundColor: colorScheme.primaryContainer,
        shape: const CircleBorder(),
        child:
            const Icon(Icons.document_scanner, size: 28, color: Colors.white),
      ),
    );
  }

  Widget _buildTransactionList(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_filteredTransactions.isEmpty) {
      return const Center(
        child: Text(
          'Chưa có giao dịch nào',
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      );
    }

    final grouped = _groupTransactionsByDate(_filteredTransactions);
    final sortedKeys = grouped.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return RefreshIndicator(
      onRefresh: _fetchTransactions,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
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
            final category = tx['category'] ?? 'Khác';
            final tDate = _parseDate(tx['transactionDate'])?.toLocal() ?? DateTime.now();
            final timeStr = DateFormat('HH:mm').format(tDate);

            return TransactionItemCard(
              title: category,
              time: timeStr,
              value: isThu ? amount : -amount,
              isThu: isThu,
            );
          }).toList();

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ..._buildGroupHeader(headerText),
              _buildTransactionCard(cardItems),
              const SizedBox(height: 16),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _buildGroupHeader(String text) {
    return [
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4),
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
            letterSpacing: 0.5,
          ),
        ),
      ),
    ];
  }

  Widget _buildTransactionCard(List<Widget> items) {
    if (items.isEmpty) return const SizedBox();
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: items,
      ),
    );
  }
}
