import 'package:flutter/material.dart';
import 'widgets/thu_chi_list_item.dart';

class ThuChiScreen extends StatefulWidget {
  const ThuChiScreen({super.key});

  @override
  State<ThuChiScreen> createState() => _ThuChiScreenState();
}

class _ThuChiScreenState extends State<ThuChiScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.white),
          onPressed: () {},
        ),
        backgroundColor: Theme.of(context).colorScheme.primary, // Tiêu đề đỏ cherry
        title: const Text('Thu Chi',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/camera'),
            icon: const Icon(Icons.document_scanner, color: Colors.white),
          ),
        ],
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
                _buildTransactionList(context, 'all'),
                _buildTransactionList(context, 'thu'),
                _buildTransactionList(context, 'chi'),
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

  Widget _buildTransactionList(BuildContext context, String filter) {
    // Phiên bản demo các giao dịch có sẵn theo ảnh chụp màn hình

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        // Nhóm: Hôm nay
        if (filter == 'all' || filter == 'thu' || filter == 'chi')
          ..._buildGroupHeader('HÔM NAY, 12/06/2025'),
        _buildTransactionCard([
          if (filter == 'all' || filter == 'thu')
            const TransactionItemCard(
                title: 'Bán hàng', time: '10:30', value: 1500000, isThu: true),
          if (filter == 'all' || filter == 'chi')
            const TransactionItemCard(
                title: 'Tiền điện',
                time: '09:15',
                value: -500000,
                isThu: false),
          if (filter == 'all' || filter == 'chi')
            const TransactionItemCard(
                title: 'Nhập hàng',
                time: '08:45',
                value: -1200000,
                isThu: false),
          if (filter == 'all' || filter == 'thu')
            const TransactionItemCard(
                title: 'Bán hàng', time: '08:20', value: 800000, isThu: true),
        ]),

        const SizedBox(height: 16),

        // Nhóm: Hôm qua
        ..._buildGroupHeader('HÔM QUA, 11/06/2025'),
        _buildTransactionCard([
          if (filter == 'all' || filter == 'chi')
            const TransactionItemCard(
                title: 'Tiền nước',
                time: '17:30',
                value: -200000,
                isThu: false),
          if (filter == 'all' || filter == 'thu')
            const TransactionItemCard(
                title: 'Bán hàng', time: '16:10', value: 1100000, isThu: true),
        ]),
        const SizedBox(
            height: 80), // Chừa khoảng trống cho Floating Action Button
      ],
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
