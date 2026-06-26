import 'package:flutter/material.dart';

class ThuChiScreen extends StatefulWidget {
  const ThuChiScreen({super.key});

  @override
  State<ThuChiScreen> createState() => _ThuChiScreenState();
}

class _ThuChiScreenState extends State<ThuChiScreen> with SingleTickerProviderStateMixin {
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
        backgroundColor: const Color(0xFFB31F56), // Tiêu đề đỏ cherry
        title: const Text('Thu Chi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.add, color: Colors.white)),
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
        onPressed: () => _showAddTransactionBottomSheet(context),
        backgroundColor: colorScheme.primaryContainer,
        shape: const CircleBorder(),
        child: const Icon(Icons.add, size: 28, color: Colors.white),
      ),
    );
  }

  Widget _buildTransactionList(BuildContext context, String filter) {
    // Phiên bản demo các giao dịch có sẵn theo ảnh chụp màn hình

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        // Nhóm: Hôm nay
        if (filter == 'all' || filter == 'thu' || filter == 'chi') ..._buildGroupHeader('HÔM NAY, 12/06/2025'),
        _buildTransactionCard([
          if (filter == 'all' || filter == 'thu')
            _buildItem(context, 'Bán hàng', '10:30', 1500000, true),
          if (filter == 'all' || filter == 'chi')
            _buildItem(context, 'Tiền điện', '09:15', -500000, false),
          if (filter == 'all' || filter == 'chi')
            _buildItem(context, 'Nhập hàng', '08:45', -1200000, false),
          if (filter == 'all' || filter == 'thu')
            _buildItem(context, 'Bán hàng', '08:20', 800000, true),
        ]),

        const SizedBox(height: 16),

        // Nhóm: Hôm qua
        ..._buildGroupHeader('HÔM QUA, 11/06/2025'),
        _buildTransactionCard([
          if (filter == 'all' || filter == 'chi')
            _buildItem(context, 'Tiền nước', '17:30', -200000, false),
          if (filter == 'all' || filter == 'thu')
            _buildItem(context, 'Bán hàng', '16:10', 1100000, true),
        ]),
        const SizedBox(height: 80), // Chừa khoảng trống cho Floating Action Button
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

  Widget _buildItem(BuildContext context, String title, String time, double value, bool isThu) {
    final valueString = '${isThu ? '+' : ''}${value.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ';

    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[100]!)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isThu ? Colors.green[100] : Colors.red[100],
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isThu ? Icons.arrow_upward : Icons.arrow_downward,
                  color: isThu ? Colors.green[700] : Colors.red[700],
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text(time, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ],
          ),
          Text(
            valueString,
            style: TextStyle(
              color: isThu ? Colors.green[700] : Colors.red[700],
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          )
        ],
      ),
    );
  }

  // Bottom Sheet thêm giao dịch mới
  void _showAddTransactionBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            top: 16,
            left: 20,
            right: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Center(
                child: SizedBox(
                  width: 40,
                  height: 4,
                  child: DecoratedBox(decoration: BoxDecoration(color: Colors.grey, borderRadius: BorderRadius.all(Radius.circular(2)))),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Thêm giao dịch', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context); // Đóng bottom sheet
                  Navigator.pushNamed(context, '/camera'); // Mở AI camera
                },
                icon: const Icon(Icons.document_scanner, color: Colors.white),
                label: const Text(
                  'Chụp biên lai (AI quét tự động)',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB31F56),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 2,
                ),
              ),
              const SizedBox(height: 16),
              const Center(
                child: Text(
                  'HOẶC NHẬP THỦ CÔNG',
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Tên giao dịch (Ví dụ: Bán hàng, Tiền điện...)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              const TextField(
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Số tiền (VNĐ)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                      child: const Text('Khoản Thu (+)', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                      child: const Text('Khoản Chi (-)', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
