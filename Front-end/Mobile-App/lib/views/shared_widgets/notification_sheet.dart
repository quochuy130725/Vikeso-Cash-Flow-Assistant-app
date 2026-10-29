import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:intl/intl.dart';
import '../../data/services/api_service.dart';

class NotificationItemData {
  final String id;
  final String title;
  final String time;
  final String desc;
  final IconData icon;
  final Color iconColor;
  final Color iconBgColor;
  final bool unread;

  const NotificationItemData({
    required this.id,
    required this.title,
    required this.time,
    required this.desc,
    required this.icon,
    required this.iconColor,
    required this.iconBgColor,
    this.unread = false,
  });
}

class NotificationSheet extends StatefulWidget {
  const NotificationSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (ctx) => const NotificationSheet(),
    );
  }

  @override
  State<NotificationSheet> createState() => _NotificationSheetState();
}

class _NotificationSheetState extends State<NotificationSheet> {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());
  final ScrollController _scrollController = ScrollController();

  bool _isLoading = true;
  bool _allRead = false;
  List<NotificationItemData> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  DateTime? _parseDate(dynamic dateVal) {
    if (dateVal == null) return null;
    if (dateVal is DateTime) return dateVal;
    if (dateVal is Map && dateVal.containsKey('\$date')) {
      return DateTime.tryParse(dateVal['\$date'].toString());
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
      case 'Chuyen Khoan':
        return 'Chuyển khoản QR';
      case 'Khac':
        return 'Khác';
      default:
        return rawCategory;
    }
  }

  Future<void> _loadNotifications() async {
    try {
      final storedUserId = await _storage.read(key: 'user_id');
      final String userId = (storedUserId != null && storedUserId.isNotEmpty)
          ? storedUserId
          : (dotenv.env['USER_ID'] ?? '');
      final shopName = await _storage.read(key: 'user_shopName') ?? 'VikeSo';
      final plan = (await _storage.read(key: 'user_subscriptionPlan') ?? 'FREE').toUpperCase();
      final role = (await _storage.read(key: 'user_role') ?? 'OWNER').toUpperCase();

      final txs = userId.isNotEmpty ? await ApiService().getTransactions(userId) : <Map<String, dynamic>>[];
      final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

      final List<NotificationItemData> items = [];

      // Load up to 15 recent transactions so the user can scroll through their cashflow notifications
      for (int i = 0; i < txs.length && i < 15; i++) {
        final tx = txs[i];
        final isThu = tx['transactionType'] == 'THU';
        final double amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
        final rawCat = (tx['category'] ?? 'Khac').toString();
        final catTitle = _formatCategory(rawCat);
        final reason = (tx['reason'] ?? tx['description'] ?? catTitle).toString().trim();
        final dt = _parseDate(tx['transactionDate'])?.toLocal();
        final timeStr = dt != null ? DateFormat('HH:mm • dd/MM').format(dt) : 'Gần đây';

        items.add(
          NotificationItemData(
            id: 'tx-$i-${tx['_id'] ?? i}',
            title: 'Biến động dòng tiền: ${isThu ? 'Thu +' : 'Chi -'}${currencyFormat.format(amount)}',
            time: timeStr,
            desc: '$reason ($catTitle) - Đã ghi nhận vào sổ quỹ cửa hàng.',
            icon: isThu ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
            iconColor: isThu ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
            iconBgColor: isThu ? const Color(0xFFD0F81B).withValues(alpha: 0.45) : const Color(0xFFFFF0F5),
            unread: i < 2,
          ),
        );
      }

      if (role == 'ADMIN') {
        items.add(
          const NotificationItemData(
            id: 'sys-admin',
            title: 'Tài khoản Quản Trị Viên (ADMIN)',
            time: 'Hôm nay',
            desc: 'Bạn đang quản trị hệ thống VikeSo với toàn bộ đặc quyền giám sát và vận hành.',
            icon: Icons.verified_outlined,
            iconColor: Color(0xFF4F46E5),
            iconBgColor: Color(0xFFEEF2FF),
          ),
        );
      } else {
        items.add(
          NotificationItemData(
            id: 'sys-plan',
            title: 'Gói dịch vụ $plan đang hoạt động',
            time: 'Hôm nay',
            desc: 'Tài khoản cửa hàng $shopName được kết nối hệ thống đối soát thời gian thực.',
            icon: Icons.verified_outlined,
            iconColor: const Color(0xFF4F46E5),
            iconBgColor: const Color(0xFFEEF2FF),
          ),
        );
      }

      items.add(
        const NotificationItemData(
          id: 'sys-bot',
          title: 'Trợ lý Telegram chốt ca tự động 22:00',
          time: 'Hằng ngày',
          desc: 'Kênh Telegram đã đồng bộ WebHook nhận bảng kê tổng kết ca kinh doanh mỗi đêm.',
          icon: Icons.send_rounded,
          iconColor: Color(0xFFFF4783),
          iconBgColor: Color(0xFFFFF0F5),
        ),
      );

      if (mounted) {
        setState(() {
          _notifications = items;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440, maxHeight: 500),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF0F5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.notifications_none_rounded,
                      color: Color(0xFFFF4783),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Flexible(
                              child: Text(
                                'Thông Báo Hệ Thống',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ),
                            if (!_isLoading && _notifications.isNotEmpty) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${_notifications.length}',
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF475569),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Nhật ký biến động dòng tiền & sự kiện thời gian thực',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, size: 20, color: Color(0xFF94A3B8)),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(height: 1, color: Color(0xFFF1F5F9)),

              // Scrollable Notification List with visible Scrollbar
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 36),
                  child: Center(
                    child: CircularProgressIndicator(color: Color(0xFFFF4783)),
                  ),
                )
              else
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 290),
                  child: Scrollbar(
                    controller: _scrollController,
                    thumbVisibility: true,
                    thickness: 5,
                    radius: const Radius.circular(8),
                    child: ListView.separated(
                      controller: _scrollController,
                      shrinkWrap: true,
                      padding: const EdgeInsets.only(right: 8, top: 6, bottom: 6),
                      itemCount: _notifications.length,
                      separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      itemBuilder: (context, index) {
                        final item = _notifications[index];
                        final isUnread = item.unread && !_allRead;
                        return Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
                          decoration: BoxDecoration(
                            color: isUnread ? const Color(0xFFF8FAFC) : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: item.iconBgColor,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(item.icon, color: item.iconColor, size: 19),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            item.title,
                                            style: const TextStyle(
                                              fontSize: 13.5,
                                              fontWeight: FontWeight.w800,
                                              color: Color(0xFF0F172A),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          item.time,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: Color(0xFF94A3B8),
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.desc,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF475569),
                                        height: 1.35,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),

              const Divider(height: 1, color: Color(0xFFF1F5F9)),
              const SizedBox(height: 12),

              // Footer
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => setState(() => _allRead = true),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      _allRead ? '✓ Đã đánh dấu đọc tất cả' : 'Đánh dấu đã đọc',
                      style: const TextStyle(
                        color: Color(0xFFFF4783),
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF1F5F9),
                      foregroundColor: const Color(0xFF0F172A),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text(
                      'Đóng',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

