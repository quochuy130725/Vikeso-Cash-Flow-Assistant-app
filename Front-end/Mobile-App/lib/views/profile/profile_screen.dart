import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';
import '../shared_widgets/side_drawer.dart';
import '../shared_widgets/notification_sheet.dart';
import '../shared_widgets/pro_badge.dart';
import '../shared_widgets/pro_paywall_sheet.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';
import '../billing/upgrade_pro_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with WidgetsBindingObserver {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(),
  );

  String _shopName  = '';
  String _name      = '';
  String _email     = '';
  String _phone     = '';
  String? _avatar;
  String _subscriptionPlan = 'FREE';
  bool _isLoading   = false;

  bool _receiveEmail = true;
  bool _receiveTelegram = false;
  bool _receiveInApp = true;
  bool _hasTelegram = false;
  StreamSubscription? _profileSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadProfile();
    _profileSub = SocketService.instance.onProfileChanged.listen((_) {
      _loadProfile();
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
      _loadProfile();
    }
  }

  Future<void> _loadProfile() async {
    // 1. Tự động đồng bộ thông tin mới nhất từ server
    final profile = await AuthRepository().fetchUserProfile();
    if (profile != null && mounted) {
      setState(() {
        _name = profile.name ?? '';
        _shopName = profile.shopName;
        _email = profile.email;
        _phone = profile.phone ?? '';
        _avatar = profile.avatar;
        _subscriptionPlan = profile.subscriptionPlan;
      });
    } else {
      final name     = await _storage.read(key: 'user_name')     ?? '';
      final shopName = await _storage.read(key: 'user_shopName') ?? '';
      final email    = await _storage.read(key: 'user_email')    ?? '';
      final phone    = await _storage.read(key: 'user_phone')    ?? '';
      final avatar   = await _storage.read(key: 'user_avatar');
      final plan     = await _storage.read(key: 'user_subscriptionPlan') ?? 'FREE';
      if (!mounted) return;
      setState(() {
        _name     = name;
        _shopName = shopName;
        _email    = email;
        _phone    = phone;
        _avatar   = avatar;
        _subscriptionPlan = plan;
      });
    }

    // 2. Đồng bộ Telegram và Cài đặt thông báo trực tiếp từ Server
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
              _receiveInApp = st['receiveInApp'] ?? true;
            });
            await _storage.write(key: 'user_telegramChatId', value: hasTg ? 'linked' : '');
            await _storage.write(key: 'user_notificationSettings', value: jsonEncode(st));
            return;
          }
        }
      } catch (_) {}
    }

    // 3. Fallback đọc từ local storage nếu mất kết nối
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
          _receiveInApp = settings['receiveInApp'] ?? true;
        });
      } catch (_) {}
    }
  }

  Future<void> _openEditDialog() async {
    final nameCtrl  = TextEditingController(text: _name);
    final shopCtrl  = TextEditingController(text: _shopName);
    final phoneCtrl = TextEditingController(text: _phone);

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sửa thông tin', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Họ và tên',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: shopCtrl,
                decoration: const InputDecoration(
                  labelText: 'Tên cửa hàng',
                  prefixIcon: Icon(Icons.storefront_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Số điện thoại',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, {
              'name': nameCtrl.text.trim(),
              'shopName': shopCtrl.text.trim(),
              'phone': phoneCtrl.text.trim(),
            }),
            child: const Text('Lưu'),
          ),
        ],
      ),
    );

    if (result == null) return;
    await _updateProfile(result['name']!, result['shopName']!, result['phone']!);
  }

  Future<void> _updateProfile(String name, String shopName, String phone) async {
    setState(() { _isLoading = true; });
    try {
      final token   = await _storage.read(key: 'access_token') ?? '';
      final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
      final uri     = Uri.parse('$baseUrl/auth/profile');

      final response = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'name': name,
          'shopName': shopName,
          'phone': phone,
        }),
      ).timeout(const Duration(seconds: 30));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        final info = body['userInfo'] as Map<String, dynamic>;
        
        await _storage.write(key: 'user_name', value: info['name']?.toString() ?? name);
        await _storage.write(key: 'user_shopName', value: info['shopName']?.toString() ?? shopName);
        await _storage.write(key: 'user_phone', value: info['phone']?.toString() ?? phone);
        
        if (!mounted) return;
        setState(() {
          _name     = info['name']?.toString() ?? name;
          _shopName = info['shopName']?.toString() ?? shopName;
          _phone    = info['phone']?.toString() ?? phone;
        });
        _showSnack('Cập nhật thành công!', isSuccess: true);
      } else {
        _showSnack(body['message']?.toString() ?? 'Có lỗi xảy ra.');
      }
    } catch (e) {
      _showSnack('Lỗi kết nối: $e');
    } finally {
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  Future<void> _openChangePasswordDialog() async {
    final currentPassCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();
    final confirmPassCtrl = TextEditingController();
    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Đổi mật khẩu', style: TextStyle(fontWeight: FontWeight.bold)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: currentPassCtrl,
                    obscureText: obscureCurrent,
                    decoration: InputDecoration(
                      labelText: 'Mật khẩu hiện tại',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(obscureCurrent ? Icons.visibility_off : Icons.visibility),
                        onPressed: () => setDialogState(() => obscureCurrent = !obscureCurrent),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: newPassCtrl,
                    obscureText: obscureNew,
                    decoration: InputDecoration(
                      labelText: 'Mật khẩu mới',
                      prefixIcon: const Icon(Icons.lock_reset),
                      suffixIcon: IconButton(
                        icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility),
                        onPressed: () => setDialogState(() => obscureNew = !obscureNew),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: confirmPassCtrl,
                    obscureText: obscureConfirm,
                    decoration: InputDecoration(
                      labelText: 'Xác nhận mật khẩu mới',
                      prefixIcon: const Icon(Icons.check_circle_outline),
                      suffixIcon: IconButton(
                        icon: Icon(obscureConfirm ? Icons.visibility_off : Icons.visibility),
                        onPressed: () => setDialogState(() => obscureConfirm = !obscureConfirm),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Hủy'),
              ),
              ElevatedButton(
                onPressed: () {
                  final cur = currentPassCtrl.text.trim();
                  final newP = newPassCtrl.text.trim();
                  final conf = confirmPassCtrl.text.trim();
                  if (cur.isEmpty) {
                    _showSnack('Vui lòng nhập mật khẩu hiện tại');
                    return;
                  }
                  if (newP.length < 6) {
                    _showSnack('Mật khẩu mới phải có ít nhất 6 ký tự');
                    return;
                  }
                  if (newP != conf) {
                    _showSnack('Mật khẩu xác nhận không khớp');
                    return;
                  }
                  Navigator.pop(ctx, true);
                },
                child: const Text('Cập nhật'),
              ),
            ],
          );
        },
      ),
    );

    if (result == true) {
      setState(() { _isLoading = true; });
      try {
        final res = await AuthRepository().changePassword(
          currentPassword: currentPassCtrl.text.trim(),
          newPassword: newPassCtrl.text.trim(),
        );
        if (res['success'] == true) {
          _showSnack(res['message'] ?? 'Đổi mật khẩu thành công!', isSuccess: true);
        } else {
          _showSnack(res['message'] ?? 'Đổi mật khẩu thất bại!');
        }
      } catch (e) {
        _showSnack('Lỗi: $e');
      } finally {
        if (mounted) setState(() { _isLoading = false; });
      }
    }
  }

  Future<void> _updateSetting(String key, bool value) async {
    setState(() {
      if (key == 'receiveEmail') _receiveEmail = value;
      if (key == 'receiveTelegram') _receiveTelegram = value;
      if (key == 'receiveInApp') _receiveInApp = value;
      _isLoading = true;
    });

    final userId = await AuthRepository().getUserId();
    if (userId != null) {
      await ApiService().updateNotificationSettings(
        userId: userId,
        receiveEmail: key == 'receiveEmail' ? value : null,
        receiveTelegram: key == 'receiveTelegram' ? value : null,
        receiveInApp: key == 'receiveInApp' ? value : null,
      );
      
      // Update local storage
      final settingsStr = await _storage.read(key: 'user_notificationSettings');
      Map<String, dynamic> settings = {};
      if (settingsStr != null) {
        try { settings = jsonDecode(settingsStr); } catch (_) {}
      }
      settings[key] = value;
      await _storage.write(key: 'user_notificationSettings', value: jsonEncode(settings));
    }
    
    setState(() { _isLoading = false; });
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc muốn đăng xuất không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Đăng xuất', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await AuthRepository().logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed('/login');
  }

  void _showSnack(String msg, {bool isSuccess = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isSuccess ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
    ));
  }

  Future<void> _navigateToUpgradePro() async {
    final upgraded = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (context) => const UpgradeProScreen()),
    );
    if (upgraded == true) {
      _loadProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPro = _subscriptionPlan.toUpperCase() == 'PRO';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: Builder(builder: (ctx) => IconButton(
          onPressed: () => Scaffold.of(ctx).openDrawer(),
          icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A), size: 24),
        )),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Cửa Hàng & Cá Nhân',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
            fontSize: 19,
            letterSpacing: -0.4,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () => NotificationSheet.show(context),
            icon: const Icon(Icons.notifications_none_rounded, color: Color(0xFF0F172A), size: 24),
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: const CustomSideDrawer(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: Column(
                children: [
                  Center(
                    child: Column(
                      children: [
                        Stack(
                          children: [
                            Container(
                              width: 92,
                              height: 92,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFFFFF0F5),
                                border: Border.all(color: const Color(0xFFFF4783), width: 2.5),
                              ),
                              child: CircleAvatar(
                                backgroundImage: _avatar != null && _avatar!.startsWith('http')
                                    ? NetworkImage(_avatar!)
                                    : null,
                                backgroundColor: const Color(0xFFFFF0F5),
                                child: _avatar == null || !_avatar!.startsWith('http')
                                    ? Text(
                                        _name.isNotEmpty
                                            ? _name[0].toUpperCase()
                                            : (_shopName.isNotEmpty ? _shopName[0].toUpperCase() : 'V'),
                                        style: const TextStyle(
                                          fontSize: 34,
                                          color: Color(0xFFFF4783),
                                          fontWeight: FontWeight.w900,
                                        ),
                                      )
                                    : null,
                              ),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: _openEditDialog,
                                child: Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF0F172A).withValues(alpha: 0.1),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(
                                    Icons.camera_alt_outlined,
                                    size: 16,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          _name.isNotEmpty ? _name : (_shopName.isNotEmpty ? _shopName : 'Cửa hàng Vikeso'),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 19,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.3,
                          ),
                        ),
                        if (_shopName.isNotEmpty && _name.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            _shopName,
                            style: const TextStyle(
                              color: Color(0xFF334155),
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                        const SizedBox(height: 3),
                        Text(
                          _email,
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (_phone.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.phone_outlined, size: 13, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(_phone, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ],
                        Container(
                          margin: const EdgeInsets.only(top: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified_rounded, size: 14, color: Color(0xFFFF4783)),
                              SizedBox(width: 5),
                              Text(
                                'Hộ kinh doanh đã kích hoạt',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Card Gói Tài Khoản (Subscription Plan)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: const Color(0xFFE2E8F0),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                          blurRadius: 12,
                          offset: const Offset(0, 3),
                        ),
                      ],
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
                            isPro ? Icons.workspace_premium_rounded : Icons.person_outline_rounded,
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
                                  letterSpacing: -0.2,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isPro
                                    ? 'Đang kích hoạt toàn bộ tính năng đối soát'
                                    : 'Nâng cấp để quét hóa đơn không giới hạn',
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
                            child: const Text('Nâng cấp', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
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
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Menu quản trị tinh gọn
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        _menuItem(context, Icons.storefront_rounded, 'Cập nhật thông tin cửa hàng', onTap: _openEditDialog),
                        _menuItem(context, Icons.workspace_premium_rounded, 'Gói dịch vụ PRO & Hóa đơn thanh toán', onTap: _navigateToUpgradePro),
                        _menuItem(context, Icons.lock_outline_rounded, 'Đổi mật khẩu', onTap: _openChangePasswordDialog),
                        _menuItem(
                          context,
                          Icons.send_rounded,
                          'Liên kết Bot Telegram nhận báo cáo 22:00',
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

                  const SizedBox(height: 22),

                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Cài đặt nhận thông báo',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
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
                              const Text('Email báo cáo', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A))),
                              if (!isPro) ...[
                                const SizedBox(width: 8),
                                const ProBadge(fontSize: 9),
                              ],
                            ],
                          ),
                          subtitle: const Text('Bảng sao kê chốt sổ hàng ngày (22:00)', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
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
                              const Text('Telegram Bot', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A))),
                              if (!isPro) ...[
                                const SizedBox(width: 8),
                                const ProBadge(fontSize: 9),
                              ],
                            ],
                          ),
                          subtitle: const Text('Tin nhắn tóm tắt dòng tiền vào/ra tức thì', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
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
                        const Divider(height: 1, color: Color(0xFFF1F5F9)),
                        SwitchListTile(
                          title: const Text('Thông báo ứng dụng', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A))),
                          subtitle: const Text('Cảnh báo nợ gối đầu & nhắc đối soát', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                          value: _receiveInApp,
                          activeThumbColor: const Color(0xFFFF4783),
                          onChanged: (val) => _updateSetting('receiveInApp', val),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _handleLogout,
                      icon: const Icon(Icons.logout_rounded, color: Color(0xFFFF4783), size: 20),
                      label: const Text('Đăng xuất tài khoản', style: TextStyle(color: Color(0xFFFF4783), fontSize: 15, fontWeight: FontWeight.w700)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: Color(0xFFE2E8F0)),
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Widget _menuItem(
    BuildContext context,
    IconData icon,
    String text, {
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
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF0F172A), size: 19),
        ),
        title: Text(
          text,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
        ),
        trailing: trailing ?? const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
        onTap: onTap,
      ),
    );
  }

  Future<void> _promptConnectTelegram() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Liên kết Telegram'),
        content: const Text('Bạn chưa kết nối với Bot Telegram của ViKeSo. Bạn có muốn chuyển hướng đến Telegram để kết nối ngay bây giờ không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Kết nối', style: TextStyle(color: Colors.white)),
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
        } catch (_) {
          try {
            await launchUrl(uri, mode: LaunchMode.platformDefault);
          } catch (e) {
            _showSnack('Không thể mở Telegram: $e', isSuccess: false);
          }
        }
        // Tự động tải lại profile để cập nhật trạng thái cần gạt Telegram
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) {
          await _loadProfile();
        }
      }
    }
  }
}
