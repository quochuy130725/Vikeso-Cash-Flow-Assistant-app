import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../shared_widgets/side_drawer.dart';
import '../shared_widgets/pro_badge.dart';
import '../shared_widgets/pro_paywall_sheet.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';
import '../billing/upgrade_pro_screen.dart';

class StoreScreen extends StatefulWidget {
  const StoreScreen({super.key});

  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> with WidgetsBindingObserver {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());

  String _shopName = '';
  String _name = '';
  String _phone = '';
  String _businessType = 'Bán lẻ / Tạp hóa';
  String _subscriptionPlan = 'FREE';
  bool _isLoading = false;

  bool _receiveEmail = true;
  bool _receiveTelegram = false;
  bool _hasTelegram = false;
  StreamSubscription? _profileSub;

  final List<Map<String, String>> _branches = [
    {'name': 'Chi nhánh chính', 'status': 'ACTIVE', 'address': 'Cơ sở đang hoạt động'},
  ];
  int _selectedBranchIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadStoreProfile();
    _profileSub = SocketService.instance.onProfileChanged.listen((_) {
      _loadStoreProfile();
    });
  }

  @override
  void dispose() {
    _profileSub?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadStoreProfile();
    }
  }

  Future<void> _loadStoreProfile() async {
    final profile = await AuthRepository().fetchUserProfile();
    if (profile != null && mounted) {
      setState(() {
        _name = profile.name ?? '';
        _shopName = profile.shopName;
        _phone = profile.phone ?? '';
        _subscriptionPlan = profile.subscriptionPlan;
        if (_branches.isNotEmpty) {
          _branches[0]['name'] = _shopName.isNotEmpty ? _shopName : 'Chi nhánh chính';
        }
      });
    } else {
      final name = await _storage.read(key: 'user_name') ?? '';
      final shopName = await _storage.read(key: 'user_shopName') ?? '';
      final phone = await _storage.read(key: 'user_phone') ?? '';
      final plan = await _storage.read(key: 'user_subscriptionPlan') ?? 'FREE';
      final businessType = await _storage.read(key: 'user_businessType') ?? 'Bán lẻ / Tạp hóa';
      if (!mounted) return;
      setState(() {
        _name = name;
        _shopName = shopName;
        _phone = phone;
        _subscriptionPlan = plan;
        _businessType = businessType;
        if (_branches.isNotEmpty) {
          _branches[0]['name'] = _shopName.isNotEmpty ? _shopName : 'Chi nhánh chính';
        }
      });
    }

    final userId = await AuthRepository().getUserId();
    if (userId != null && userId.isNotEmpty) {
      try {
        final serverProfile = await ApiService().getUserProfile(userId);
        if (serverProfile['success'] == true && mounted) {
          final bool hasTg = serverProfile['hasTelegram'] == true;
          final Map<String, dynamic>? st = serverProfile['settings'] as Map<String, dynamic>?;
          if (st != null) {
            setState(() {
              _hasTelegram = hasTg;
              _receiveEmail = st['receiveEmail'] ?? true;
              _receiveTelegram = hasTg && (st['receiveTelegram'] == true);
            });
            await _storage.write(key: 'user_telegramChatId', value: hasTg ? 'linked' : '');
            await _storage.write(key: 'user_notificationSettings', value: jsonEncode(st));
            return;
          }
        }
      } catch (_) {}
    }

    final settingsStr = await _storage.read(key: 'user_notificationSettings');
    if (settingsStr != null && mounted) {
      try {
        final Map<String, dynamic> settings = jsonDecode(settingsStr);
        final hasTg = await _storage.read(key: 'user_telegramChatId');
        final hasTelegram = hasTg != null && hasTg.isNotEmpty;
        setState(() {
          _receiveEmail = settings['receiveEmail'] ?? true;
          _hasTelegram = hasTelegram;
          _receiveTelegram = hasTelegram && (settings['receiveTelegram'] == true);
        });
      } catch (_) {}
    }
  }

  Future<void> _openEditShopDialog() async {
    final shopCtrl = TextEditingController(text: _shopName);
    final phoneCtrl = TextEditingController(text: _phone);
    String selectedType = _businessType;
    final types = [
      'Bán lẻ / Tạp hóa',
      'F&B / Quán cà phê / Ăn uống',
      'Thời trang / Phụ kiện',
      'Dịch vụ / Spa / Tiệm tóc',
      'Hộ kinh doanh khác',
    ];

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Cập nhật thông tin cửa hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: shopCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Tên cửa hàng / Hộ kinh doanh',
                    prefixIcon: Icon(Icons.storefront_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: types.contains(selectedType) ? selectedType : types.first,
                  decoration: const InputDecoration(
                    labelText: 'Loại hình kinh doanh',
                    prefixIcon: Icon(Icons.category_outlined),
                  ),
                  items: types.map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13.5)))).toList(),
                  onChanged: (v) {
                    if (v != null) setDialogState(() => selectedType = v);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Hotline cửa hàng',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
              onPressed: () => Navigator.pop(ctx, {
                'shopName': shopCtrl.text.trim(),
                'phone': phoneCtrl.text.trim(),
                'businessType': selectedType,
              }),
              child: const Text('Lưu thay đổi', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );

    if (result == null) return;
    await _storage.write(key: 'user_businessType', value: result['businessType']);
    setState(() => _businessType = result['businessType'] ?? _businessType);
    await _updateShopProfile(result['shopName']!, result['phone']!);
  }

  Future<void> _updateShopProfile(String shopName, String phone) async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'access_token') ?? '';
      final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
      final uri = Uri.parse('$baseUrl/auth/profile');

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({
              'name': _name,
              'shopName': shopName,
              'phone': phone,
            }),
          )
          .timeout(const Duration(seconds: 30));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        final info = body['userInfo'] as Map<String, dynamic>;
        await _storage.write(key: 'user_shopName', value: info['shopName']?.toString() ?? shopName);
        await _storage.write(key: 'user_phone', value: info['phone']?.toString() ?? phone);
        if (!mounted) return;
        setState(() {
          _shopName = info['shopName']?.toString() ?? shopName;
          _phone = info['phone']?.toString() ?? phone;
          if (_branches.isNotEmpty) {
            _branches[0]['name'] = _shopName;
          }
        });
        _showSnack('Đã cập nhật thông tin cửa hàng!', isSuccess: true);
      } else {
        _showSnack(body['message']?.toString() ?? 'Không thể cập nhật thông tin cửa hàng.');
      }
    } catch (e) {
      await _storage.write(key: 'user_shopName', value: shopName);
      await _storage.write(key: 'user_phone', value: phone);
      if (mounted) {
        setState(() {
          _shopName = shopName;
          _phone = phone;
        });
        _showSnack('Đã lưu thông tin cửa hàng cục bộ!', isSuccess: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _updateSetting(String key, bool value) async {
    setState(() {
      if (key == 'receiveEmail') _receiveEmail = value;
      if (key == 'receiveTelegram') _receiveTelegram = value;
      _isLoading = true;
    });

    final userId = await AuthRepository().getUserId();
    if (userId != null) {
      await ApiService().updateNotificationSettings(
        userId: userId,
        receiveEmail: key == 'receiveEmail' ? value : null,
        receiveTelegram: key == 'receiveTelegram' ? value : null,
      );
      final settingsStr = await _storage.read(key: 'user_notificationSettings');
      Map<String, dynamic> settings = {};
      if (settingsStr != null) {
        try {
          settings = jsonDecode(settingsStr);
        } catch (_) {}
      }
      settings[key] = value;
      await _storage.write(key: 'user_notificationSettings', value: jsonEncode(settings));
    }

    if (mounted) setState(() => _isLoading = false);
  }

  void _showBranchSwitcherSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(4)),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Chuyển đổi Chi nhánh / Cửa hàng',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            const Text(
              'Để đăng ký thêm chi nhánh mới kèm tải ảnh chứng từ xác minh hoặc quản lý nhân viên & danh mục, vui lòng truy cập Web Portal VikeSo trên máy tính.',
              style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 16),
            ...List.generate(_branches.length, (i) {
              final b = _branches[i];
              final isSelected = i == _selectedBranchIndex;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFFFF0F5) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? const Color(0xFFFF4783) : const Color(0xFFE2E8F0),
                    width: 1.4,
                  ),
                ),
                child: ListTile(
                  leading: const Icon(Icons.storefront_rounded, color: Color(0xFFFF4783)),
                  title: Text(
                    b['name'] ?? 'Chi nhánh chính',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF0F172A)),
                  ),
                  subtitle: Text(
                    b['address'] ?? 'Đang hoạt động',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD0F81B),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF0F172A)),
                    ),
                    child: const Text(
                      'ĐANG CHỌN',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                    ),
                  ),
                  onTap: () {
                    setState(() => _selectedBranchIndex = i);
                    Navigator.pop(ctx);
                  },
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Future<void> _navigateToUpgradePro() async {
    final upgraded = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (context) => const UpgradeProScreen()),
    );
    if (upgraded == true) {
      _loadStoreProfile();
    }
  }

  Future<void> _promptConnectTelegram() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Liên kết Telegram 22:00'),
        content: const Text(
          'Bạn muốn mở ứng dụng Telegram và kết nối với Bot chốt sổ tự động 22:00 của VikeSo ngay bây giờ?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Kết nối ngay', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      final userId = await AuthRepository().getUserId();
      if (userId != null) {
        final link = ApiService.getTelegramDeepLink(userId);
        final uri = Uri.parse(link);
        try {
          final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
          if (!ok) await launchUrl(uri, mode: LaunchMode.platformDefault);
        } catch (e) {
          _showSnack('Không thể mở Telegram: $e');
        }
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) await _loadStoreProfile();
      }
    }
  }

  void _showSnack(String msg, {bool isSuccess = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isSuccess ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isPro = _subscriptionPlan.toUpperCase() == 'PRO';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: Builder(
          builder: (ctx) => IconButton(
            onPressed: () => Scaffold.of(ctx).openDrawer(),
            icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A), size: 24),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Quản Lý Cửa Hàng',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
            fontSize: 19,
            letterSpacing: -0.4,
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: _showBranchSwitcherSheet,
            icon: const Icon(Icons.swap_horiz_rounded, size: 18, color: Color(0xFFFF4783)),
            label: const Text(
              'Đổi chi nhánh',
              style: TextStyle(color: Color(0xFFFF4783), fontWeight: FontWeight.w700, fontSize: 12.5),
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: const CustomSideDrawer(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStoreProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Cửa hàng
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 58,
                            height: 58,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF0F5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFFF4783), width: 1.8),
                            ),
                            child: const Icon(Icons.storefront_rounded, color: Color(0xFFFF4783), size: 30),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _shopName.isNotEmpty ? _shopName : 'Cửa hàng Vikeso',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 17,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  _businessType,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    color: Color(0xFF64748B),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.verified_rounded, size: 13, color: Color(0xFFFF4783)),
                                      SizedBox(width: 4),
                                      Text(
                                        'Hộ kinh doanh đã kích hoạt',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: _openEditShopDialog,
                            icon: const Icon(Icons.edit_outlined, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Card Gói Dịch Vụ Cửa Hàng (FREE / PRO)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF0F5),
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFFFFD6E4)),
                            ),
                            child: Icon(
                              isPro ? Icons.workspace_premium_rounded : Icons.storefront_outlined,
                              color: const Color(0xFFFF4783),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isPro ? 'Gói VikeSo PRO' : 'Gói Cơ Bản (FREE)',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  isPro
                                      ? 'Quét gộp 3 ảnh/lần & Báo cáo tự động 22:00'
                                      : 'Giới hạn 1 ảnh/lần • Nâng cấp PRO quét gộp 3 ảnh',
                                  style: const TextStyle(
                                    fontSize: 11.5,
                                    color: Color(0xFF64748B),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isPro)
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFF4783),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: _navigateToUpgradePro,
                              child: const Text(
                                'Nâng cấp',
                                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD0F81B),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF0F172A), width: 1),
                              ),
                              child: const Text(
                                'ĐANG BẬT',
                                style: TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    const Text(
                      'Thiết lập & Vận hành cửa hàng',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 10),

                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _menuItem(
                            Icons.storefront_rounded,
                            'Cập nhật thông tin cửa hàng',
                            subtitle: 'Tên hộ kinh doanh, loại hình, hotline',
                            onTap: _openEditShopDialog,
                          ),
                          _menuItem(
                            Icons.workspace_premium_rounded,
                            'Gói dịch vụ PRO & Hóa đơn thanh toán',
                            subtitle: 'Nâng cấp gói VikeSo PRO (99.000đ / 1 tháng) qua VietQR',
                            onTap: _navigateToUpgradePro,
                          ),
                          _menuItem(
                            Icons.send_rounded,
                            'Liên kết Bot Telegram nhận báo cáo 22:00',
                            subtitle: _hasTelegram ? 'Đã kết nối Bot Telegram chốt sổ' : 'Tự động gửi báo cáo dòng tiền lúc 22:00',
                            trailing: !isPro
                                ? const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      ProBadge(),
                                      SizedBox(width: 6),
                                      Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                                    ],
                                  )
                                : null,
                            onTap: () {
                              if (!isPro) {
                                ProPaywallSheet.show(
                                  context,
                                  featureTitle: 'Báo Cáo Tự Động Telegram 22:00',
                                  featureDescription:
                                      'Tính năng tự động tổng kết sổ sách, chốt doanh thu - chi phí và gửi báo cáo trực tiếp qua Bot Telegram hàng đêm lúc 22h00 chỉ dành riêng cho gói VikeSo PRO.',
                                );
                                return;
                              }
                              _promptConnectTelegram();
                            },
                            isLast: true,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    const Text(
                      'Tự động hóa Báo cáo Chốt sổ 22:00',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 10),

                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          SwitchListTile(
                            title: Row(
                              children: [
                                const Text(
                                  'Email báo cáo',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
                                ),
                                if (!isPro) ...[
                                  const SizedBox(width: 8),
                                  const ProBadge(fontSize: 9),
                                ],
                              ],
                            ),
                            subtitle: const Text(
                              'Bảng sao kê chốt sổ hàng ngày (22:00)',
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                            value: isPro ? _receiveEmail : false,
                            activeThumbColor: const Color(0xFFFF4783),
                            onChanged: (val) {
                              if (!isPro) {
                                ProPaywallSheet.show(
                                  context,
                                  featureTitle: 'Email Báo Cáo 22:00',
                                  featureDescription:
                                      'Tự động gửi email sao kê chốt sổ doanh thu - chi phí cuối ngày lúc 22:00 là tính năng độc quyền của gói VikeSo PRO.',
                                );
                                return;
                              }
                              _updateSetting('receiveEmail', val);
                            },
                          ),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          SwitchListTile(
                            title: Row(
                              children: [
                                const Text(
                                  'Telegram Bot',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
                                ),
                                if (!isPro) ...[
                                  const SizedBox(width: 8),
                                  const ProBadge(fontSize: 9),
                                ],
                              ],
                            ),
                            subtitle: const Text(
                              'Tin nhắn tóm tắt dòng tiền vào/ra tức thì',
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                            value: isPro ? _receiveTelegram : false,
                            activeThumbColor: const Color(0xFFFF4783),
                            onChanged: (val) {
                              if (!isPro) {
                                ProPaywallSheet.show(
                                  context,
                                  featureTitle: 'Báo Cáo Telegram Bot',
                                  featureDescription:
                                      'Nhận tin nhắn thông báo dòng tiền tức thì và báo cáo chốt sổ lúc 22:00 qua Telegram Bot là tính năng độc quyền của gói VikeSo PRO.',
                                );
                                return;
                              }
                              if (val && !_hasTelegram) {
                                _promptConnectTelegram();
                                return;
                              }
                              _updateSetting('receiveTelegram', val);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _menuItem(
    IconData icon,
    String text, {
    String? subtitle,
    VoidCallback? onTap,
    bool isLast = false,
    Widget? trailing,
  }) {
    return Container(
      decoration: BoxDecoration(
        border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: ListTile(
        leading: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF0F172A), size: 20),
        ),
        title: Text(
          text,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
        ),
        subtitle: subtitle != null
            ? Text(subtitle, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)))
            : null,
        trailing: trailing ?? const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
        onTap: onTap,
      ),
    );
  }
}

