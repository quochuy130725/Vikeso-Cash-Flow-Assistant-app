import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../shared_widgets/side_drawer.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  String _shopName  = '';
  String _email     = '';
  String _phone     = '';
  String? _avatar;
  bool _isLoading   = false;

  bool _receiveEmail = true;
  bool _receiveTelegram = true;
  bool _receiveInApp = true;
  bool _hasTelegram = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final shopName = await _storage.read(key: 'user_shopName') ?? '';
    final email    = await _storage.read(key: 'user_email')    ?? '';
    final phone    = await _storage.read(key: 'user_phone')    ?? '';
    final avatar   = await _storage.read(key: 'user_avatar');
    if (!mounted) return;
    final settingsStr = await _storage.read(key: 'user_notificationSettings');
    if (settingsStr != null) {
      try {
        final Map<String, dynamic> settings = jsonDecode(settingsStr);
        _receiveEmail = settings['receiveEmail'] ?? true;
        _receiveTelegram = settings['receiveTelegram'] ?? true;
        _receiveInApp = settings['receiveInApp'] ?? true;
      } catch (_) {}
    }
    // Wait, we don't have user.telegramChatId in storage. Actually, we do! Let's check apiRoutes.js... yes we return it but AuthRepository doesn't save it. Let's assume we fetch it via Profile API.
    setState(() {
      _shopName = shopName;
      _email    = email;
      _phone    = phone;
      _avatar   = avatar;
    });
  }

  Future<void> _openEditDialog() async {
    final shopCtrl  = TextEditingController(text: _shopName);

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sửa thông tin', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: shopCtrl,
              decoration: const InputDecoration(
                labelText: 'Tên cửa hàng',
                prefixIcon: Icon(Icons.storefront_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, {
              'shopName': shopCtrl.text.trim(),
            }),
            child: const Text('Lưu'),
          ),
        ],
      ),
    );

    if (result == null) return;
    await _updateProfile(result['shopName']!);
  }

  Future<void> _updateProfile(String shopName) async {
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
        body: jsonEncode({'shopName': shopName}),
      ).timeout(const Duration(seconds: 30));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        final info = body['userInfo'] as Map<String, dynamic>;
        
        await _storage.write(key: 'user_shopName', value: info['shopName']?.toString() ?? '');
        
        dotenv.env['USER_ID'] = info['id']?.toString() ?? dotenv.env['USER_ID'] ?? '';
        
        if (!mounted) return;
        setState(() {
          _shopName = info['shopName']?.toString() ?? '';
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
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
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
      backgroundColor: isSuccess ? Colors.green : Colors.red,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final primaryPink = const Color(0xFFFF5C8D);

    return Scaffold(
      appBar: AppBar(
        leading: Builder(builder: (ctx) => IconButton(
          onPressed: () => Scaffold.of(ctx).openDrawer(),
          icon: const Icon(Icons.menu, color: Colors.white),
        )),
        backgroundColor: primaryPink,
        title: const Text('Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications, color: Colors.white)),
        ],
      ),
      drawer: const CustomSideDrawer(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: Column(
                children: [
                  Center(
                    child: Column(
                      children: [
                        Stack(
                          children: [
                            Container(
                              width: 96, height: 96,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: colorScheme.primaryContainer, width: 2.5),
                              ),
                              child: CircleAvatar(
                                backgroundImage: _avatar != null && _avatar!.startsWith('http')
                                    ? NetworkImage(_avatar!)
                                    : null,
                                backgroundColor: primaryPink.withValues(alpha: 0.15),
                                child: _avatar == null || !_avatar!.startsWith('http')
                                    ? Text(
                                        _shopName.isNotEmpty ? _shopName[0].toUpperCase() : 'V',
                                        style: TextStyle(fontSize: 32, color: primaryPink, fontWeight: FontWeight.bold),
                                      )
                                    : null,
                              ),
                            ),
                            Positioned(
                              bottom: 0, right: 0,
                              child: GestureDetector(
                                onTap: _openEditDialog,
                                child: Container(
                                  width: 32, height: 32,
                                  decoration: BoxDecoration(
                                    color: colorScheme.primaryContainer,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                  child: const Icon(Icons.edit, size: 14, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _shopName.isNotEmpty ? _shopName : 'Cửa hàng Vikeso',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                        const SizedBox(height: 4),
                        Text(_email, style: const TextStyle(color: Colors.grey, fontSize: 14)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  Material(
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      side: BorderSide(color: Colors.grey[200]!),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _menuItem(context, Icons.storefront, 'Thông tin cửa hàng', onTap: _openEditDialog),
                        _menuItem(context, Icons.edit, 'Sửa thông tin', onTap: _openEditDialog),
                        _menuItem(context, Icons.lock_outline, 'Đổi mật khẩu', onTap: () {}),
                        _menuItem(context, Icons.settings_outlined, 'Cài đặt', onTap: () {}),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text('Cài đặt thông báo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 12),
                  Material(
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      side: BorderSide(color: Colors.grey[200]!),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        SwitchListTile(
                          title: const Text('Email', style: TextStyle(fontWeight: FontWeight.w500)),
                          subtitle: const Text('Nhận báo cáo chốt ca (22:00)'),
                          value: _receiveEmail,
                          activeColor: primaryPink,
                          onChanged: (val) => _updateSetting('receiveEmail', val),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Telegram', style: TextStyle(fontWeight: FontWeight.w500)),
                          subtitle: const Text('Thông báo qua bot Telegram'),
                          value: _receiveTelegram,
                          activeColor: primaryPink,
                          onChanged: (val) => _updateSetting('receiveTelegram', val),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Thông báo ứng dụng', style: TextStyle(fontWeight: FontWeight.w500)),
                          subtitle: const Text('Thông báo đẩy trên thiết bị'),
                          value: _receiveInApp,
                          activeColor: primaryPink,
                          onChanged: (val) => _updateSetting('receiveInApp', val),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _handleLogout,
                      icon: const Icon(Icons.logout, color: Colors.red),
                      label: const Text('Đăng xuất', style: TextStyle(color: Colors.red, fontSize: 16)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: BorderSide(color: Colors.red.withValues(alpha: 0.3)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _menuItem(BuildContext context, IconData icon, String text, {VoidCallback? onTap}) {
    return Container(
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey[100]!))),
      child: ListTile(
        leading: Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle),
          child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 18),
        ),
        title: Text(text, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
        onTap: onTap,
      ),
    );
  }
}
