import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../shared_widgets/side_drawer.dart';
import '../shared_widgets/notification_sheet.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';

class PersonalScreen extends StatefulWidget {
  const PersonalScreen({super.key});

  @override
  State<PersonalScreen> createState() => _PersonalScreenState();
}

class _PersonalScreenState extends State<PersonalScreen> with WidgetsBindingObserver {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());

  String _name = '';
  String _shopName = '';
  String _email = '';
  String _phone = '';
  String _role = 'OWNER';
  String? _avatar;
  bool _isLoading = false;
  bool _receiveInApp = true;

  StreamSubscription? _profileSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadPersonalProfile();
    _profileSub = SocketService.instance.onProfileChanged.listen((_) {
      _loadPersonalProfile();
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
      _loadPersonalProfile();
    }
  }

  Future<void> _loadPersonalProfile() async {
    final profile = await AuthRepository().fetchUserProfile();
    final storedRole = await _storage.read(key: 'user_role') ?? 'OWNER';
    if (profile != null && mounted) {
      setState(() {
        _name = profile.name ?? '';
        _shopName = profile.shopName;
        _email = profile.email;
        _phone = profile.phone ?? '';
        _avatar = profile.avatar;
        _role = storedRole.toUpperCase();
      });
    } else {
      final name = await _storage.read(key: 'user_name') ?? '';
      final shopName = await _storage.read(key: 'user_shopName') ?? '';
      final email = await _storage.read(key: 'user_email') ?? '';
      final phone = await _storage.read(key: 'user_phone') ?? '';
      final avatar = await _storage.read(key: 'user_avatar');
      if (!mounted) return;
      setState(() {
        _name = name;
        _shopName = shopName;
        _email = email;
        _phone = phone;
        _avatar = avatar;
        _role = storedRole.toUpperCase();
      });
    }

    final settingsStr = await _storage.read(key: 'user_notificationSettings');
    if (settingsStr != null && mounted) {
      try {
        final Map<String, dynamic> settings = jsonDecode(settingsStr);
        setState(() {
          _receiveInApp = settings['receiveInApp'] ?? true;
        });
      } catch (_) {}
    }
  }

  Future<void> _openEditPersonalDialog() async {
    final nameCtrl = TextEditingController(text: _name);
    final phoneCtrl = TextEditingController(text: _phone);

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hồ sơ cá nhân', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
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
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Số điện thoại cá nhân',
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
              'name': nameCtrl.text.trim(),
              'phone': phoneCtrl.text.trim(),
            }),
            child: const Text('Lưu', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (result == null) return;
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
              'name': result['name'],
              'shopName': _shopName,
              'phone': result['phone'],
            }),
          )
          .timeout(const Duration(seconds: 30));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        await _storage.write(key: 'user_name', value: result['name']);
        await _storage.write(key: 'user_phone', value: result['phone']);
        if (mounted) {
          setState(() {
            _name = result['name']!;
            _phone = result['phone']!;
          });
          _showSnack('Đã cập nhật hồ sơ cá nhân!', isSuccess: true);
        }
      } else {
        _showSnack(body['message']?.toString() ?? 'Có lỗi xảy ra.');
      }
    } catch (_) {
      await _storage.write(key: 'user_name', value: result['name']);
      await _storage.write(key: 'user_phone', value: result['phone']);
      if (mounted) {
        setState(() {
          _name = result['name']!;
          _phone = result['phone']!;
        });
        _showSnack('Đã lưu hồ sơ cá nhân!', isSuccess: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
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
                child: const Text('Cập nhật', style: TextStyle(color: Colors.white)),
              ),
            ],
          );
        },
      ),
    );

    if (result == true) {
      setState(() => _isLoading = true);
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
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _updateInAppNotification(bool value) async {
    setState(() {
      _receiveInApp = value;
      _isLoading = true;
    });
    final userId = await AuthRepository().getUserId();
    if (userId != null) {
      await ApiService().updateNotificationSettings(userId: userId, receiveInApp: value);
      final settingsStr = await _storage.read(key: 'user_notificationSettings');
      Map<String, dynamic> settings = {};
      if (settingsStr != null) {
        try {
          settings = jsonDecode(settingsStr);
        } catch (_) {}
      }
      settings['receiveInApp'] = value;
      await _storage.write(key: 'user_notificationSettings', value: jsonEncode(settings));
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc muốn đăng xuất khỏi tài khoản này không?'),
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
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isSuccess ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isStaff = _role == 'STAFF';

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
          'Tài Khoản Cá Nhân',
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
              onRefresh: _loadPersonalProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                child: Column(
                  children: [
                    // Thông tin Cá nhân & Role Badge
                    Center(
                      child: Column(
                        children: [
                          Stack(
                            children: [
                              Container(
                                width: 88,
                                height: 88,
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
                                            fontSize: 32,
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
                                  onTap: _openEditPersonalDialog,
                                  child: Container(
                                    width: 30,
                                    height: 30,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                                    ),
                                    child: const Icon(Icons.edit_outlined, size: 15, color: Color(0xFF0F172A)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _name.isNotEmpty ? _name : 'Người dùng VikeSo',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _email,
                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                          if (_phone.isNotEmpty) ...[
                            const SizedBox(height: 3),
                            Text(
                              _phone,
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          ],
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: isStaff ? const Color(0xFFF1F5F9) : const Color(0xFFD0F81B),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF0F172A), width: 1),
                            ),
                            child: Text(
                              isStaff ? 'NHÂN VIÊN THU NGÂN (STAFF)' : 'CHỦ CỬA HÀNG (OWNER)',
                              style: const TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F172A),
                                letterSpacing: 0.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 22),

                    // Bảo mật & Cài đặt cá nhân
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _menuItem(
                            Icons.person_outline_rounded,
                            'Chỉnh sửa hồ sơ cá nhân',
                            onTap: _openEditPersonalDialog,
                          ),
                          _menuItem(
                            Icons.lock_outline_rounded,
                            'Đổi mật khẩu đăng nhập',
                            onTap: _openChangePasswordDialog,
                          ),
                          _menuItem(
                            Icons.help_outline_rounded,
                            'Hướng dẫn sử dụng & Quy chuẩn ảnh OCR',
                            onTap: () => _showSnack('Xem hướng dẫn chi tiết tại quầy hoặc trên Web Portal vikeso.vn', isSuccess: true),
                          ),
                          _menuItem(
                            Icons.support_agent_rounded,
                            'Liên hệ Hỗ trợ kỹ thuật VikeSo',
                            onTap: () => _showSnack('Hotline / Zalo hỗ trợ 24/7: 0909.123.456', isSuccess: true),
                            isLast: true,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Thông báo trên thiết bị này
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: SwitchListTile(
                        title: const Text(
                          'Thông báo ứng dụng trên thiết bị này',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
                        ),
                        subtitle: const Text(
                          'Cảnh báo biến động thu chi & nhắc đối soát ca',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        value: _receiveInApp,
                        activeThumbColor: const Color(0xFFFF4783),
                        onChanged: _updateInAppNotification,
                      ),
                    ),

                    const SizedBox(height: 24),

                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _handleLogout,
                        icon: const Icon(Icons.logout_rounded, color: Color(0xFFFF4783), size: 20),
                        label: const Text(
                          'Đăng xuất tài khoản',
                          style: TextStyle(color: Color(0xFFFF4783), fontSize: 15, fontWeight: FontWeight.w700),
                        ),
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
    IconData icon,
    String text, {
    VoidCallback? onTap,
    bool isLast = false,
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
        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
        onTap: onTap,
      ),
    );
  }
}

