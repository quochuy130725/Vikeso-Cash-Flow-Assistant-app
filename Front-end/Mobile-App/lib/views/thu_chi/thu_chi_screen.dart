import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../shared_widgets/side_drawer.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';
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
  StreamSubscription? _txSub;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _fetchTransactions();
    _txSub = SocketService.instance.onTransactionChanged.listen((_) {
      _fetchTransactions(silent: true);
    });
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) return;
    _applyFilter();
  }

  Future<void> _fetchTransactions({bool silent = false}) async {
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
      if (dateVal.containsKey(r'$date')) {
        return DateTime.tryParse(dateVal[r'$date'].toString());
      }
    }
    return DateTime.tryParse(dateVal.toString());
  }

  String _formatCategoryName(String raw) {
    switch (raw) {
      case 'Hoa Don Le':
        return 'Hóa đơn lẻ';
      case 'POS Ket Ca':
        return 'POS kết ca';
      case 'So Tay':
        return 'Sổ tay';
      case 'Chuyen Khoan':
        return 'Chuyển khoản';
      case 'Khac':
      default:
        return raw.isNotEmpty ? raw : 'Khác';
    }
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

  void _showTransactionDetail(BuildContext context, Map<String, dynamic> tx) {
    final type = tx['transactionType'] ?? 'THU';
    final isChi = type == 'CHI';
    final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
    final reason = (tx['reason'] as String?)?.trim() ?? '';
    final rawCategory = tx['category'] as String? ?? 'Khac';
    final categoryName = _formatCategoryName(rawCategory);
    final tDate = _parseDate(tx['transactionDate'])?.toLocal() ?? DateTime.now();
    final dateStr = DateFormat('dd/MM/yyyy HH:mm').format(tDate);
    final receiptUrl = (tx['receiptUrl'] as String?)?.trim() ?? '';

    // Hình thức ghi nhận
    String method = 'Nhập thủ công';
    if (receiptUrl.isNotEmpty) {
      method = 'AI Quét hóa đơn';
    } else if (rawCategory == 'POS Ket Ca') {
      method = 'Máy tính tiền kết ca';
    } else if (rawCategory == 'Chuyen Khoan') {
      method = 'Quét mã VietQR';
    } else if (rawCategory == 'So Tay') {
      method = 'Sổ tay thu chi';
    }

    final formattedAmount =
        '${isChi ? '-' : '+'}${NumberFormat.decimalPattern('vi').format(amount)} đ';

    List<dynamic> products = [];
    if (tx['aiRawData'] is Map) {
      final aiMap = tx['aiRawData'] as Map;
      if (aiMap['ChiTietSanPham'] is List) {
        products = aiMap['ChiTietSanPham'] as List;
      }
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 12,
            bottom: MediaQuery.of(ctx).padding.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Chi tiết giao dịch',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Hiển thị số tiền to rõ
              Center(
                child: Text(
                  formattedAmount,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: isChi ? const Color(0xFFE11D48) : const Color(0xFF16A34A),
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: isChi ? const Color(0xFFFFE4E6) : const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    isChi ? 'Khoản Chi Tiền' : 'Khoản Thu Tiền',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isChi ? const Color(0xFFBE123C) : const Color(0xFF15803D),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 18),
              const Divider(height: 1),
              const SizedBox(height: 12),

              _buildDetailRow('Lý do / Nội dung:',
                  reason.isNotEmpty ? reason : 'Giao dịch không có ghi chú'),
              _buildDetailRow('Danh mục:', categoryName),
              _buildDetailRow('Loại giao dịch:', isChi ? 'Khoản Chi' : 'Khoản Thu'),
              _buildDetailRow('Hình thức ghi nhận:', method),
              _buildDetailRow('Thời gian ghi nhận:', dateStr),
              _buildDetailRow(
                'Trạng thái đối soát:',
                tx['status'] == 'MERGED'
                    ? 'Đã tự động gộp (MERGED)'
                    : 'Đã đối soát hợp lệ (VALID)',
              ),

              if (products.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Text(
                  'Chi tiết sản phẩm / Mặt hàng:',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    children: products.map((prod) {
                      final pName = prod['Ten'] ?? prod['name'] ?? 'Mặt hàng';
                      final pPrice = (prod['Gia'] ?? prod['price'] ?? 0);
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 3.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '• $pName',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF334155),
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              '${NumberFormat.decimalPattern('vi').format(pPrice)} đ',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],

              if (receiptUrl.isNotEmpty) ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      side: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    onPressed: () {
                      _showReceiptImageDialog(context, receiptUrl);
                    },
                    icon: const Icon(Icons.image, size: 18),
                    label: const Text('Xem ảnh hóa đơn gốc'),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 13.5),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13.5,
                color: Color(0xFF0F172A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showReceiptImageDialog(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AppBar(
                title: const Text('Hóa đơn quét AI', style: TextStyle(fontSize: 16)),
                leading: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ),
              InteractiveViewer(
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Padding(
                    padding: EdgeInsets.all(32),
                    child: Text('Không thể tải ảnh hóa đơn'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _txSub?.cancel();
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
            final reason = (tx['reason'] as String?)?.trim() ?? '';
            final rawCategory = tx['category'] as String? ?? (isThu ? 'Bán hàng' : 'Chi phí khác');
            final categoryName = _formatCategoryName(rawCategory);
            final tDate = _parseDate(tx['transactionDate'])?.toLocal() ?? DateTime.now();
            final timeStr = DateFormat('HH:mm').format(tDate);
            final note = tx['description'] ?? tx['shopName'] ?? '';
            final displayTitle = reason.isNotEmpty ? reason : (note.isNotEmpty ? note : categoryName);
            final subtitle = '$categoryName • $timeStr';

            return TransactionItemCard(
              title: displayTitle.toString(),
              subtitle: subtitle,
              time: '$timeStr • $categoryName',
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
}
