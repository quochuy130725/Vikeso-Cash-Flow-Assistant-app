import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/repositories/auth_repository.dart';

class CustomSideDrawer extends StatefulWidget {
  const CustomSideDrawer({super.key});

  @override
  State<CustomSideDrawer> createState() => _CustomSideDrawerState();
}

class _CustomSideDrawerState extends State<CustomSideDrawer> {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());
  String _shopName = 'Cửa hàng Vikeso';
  String _email = '';
  String _role = 'OWNER';
  String _plan = 'FREE';

  @override
  void initState() {
    super.initState();
    _loadUserHeader();
  }

  Future<void> _loadUserHeader() async {
    final shopName = await _storage.read(key: 'user_shopName');
    final email = await _storage.read(key: 'user_email');
    final role = await AuthRepository().getRole();
    final plan = await AuthRepository().getSubscriptionPlan();

    if (mounted) {
      setState(() {
        if (shopName != null && shopName.isNotEmpty) _shopName = shopName;
        if (email != null && email.isNotEmpty) _email = email;
        _role = role;
        _plan = plan;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isPro = _plan.toUpperCase() == 'PRO';
    final isAdmin = _role.toUpperCase() == 'ADMIN';

    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header của Drawer chứa thông tin cá nhân/cửa hàng
          DrawerHeader(
            decoration: BoxDecoration(
              gradient: isPro
                  ? const LinearGradient(
                      colors: [Color(0xFF2C1654), Color(0xFFFF5C8D)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
              color: isPro ? null : colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: isPro ? const Color(0xFFFFD700) : colorScheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      _shopName.isNotEmpty ? _shopName[0].toUpperCase() : 'V',
                      style: TextStyle(
                        color: isPro ? Colors.black87 : colorScheme.onPrimaryContainer,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _shopName,
                        style: TextStyle(
                          color: isPro ? Colors.white : colorScheme.primary,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        _email.isNotEmpty ? _email : 'Chủ cửa hàng',
                        style: TextStyle(
                          fontSize: 13,
                          color: isPro ? Colors.white70 : Colors.grey[700],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: isPro
                                  ? const Color(0xFFFFD700)
                                  : Colors.grey[300],
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              isPro ? 'PRO MEMBER' : 'FREE PLAN',
                              style: TextStyle(
                                color: isPro ? Colors.black87 : Colors.grey[800],
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          if (isAdmin) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.redAccent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text(
                                'ADMIN',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Danh sách menu
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildDrawerItem(Icons.analytics_outlined, 'Báo cáo chi tiết', () {
                  Navigator.pop(context);
                  Navigator.of(context).pushNamed('/analytics');
                }),
                _buildDrawerItem(Icons.workspace_premium, 'Nâng cấp gói VikeSo PRO', () {
                  Navigator.pop(context);
                  Navigator.of(context).pushNamed('/upgrade-pro');
                }, iconColor: const Color(0xFFFF5C8D)),

                // Mục dành riêng cho Admin nếu user có role ADMIN
                if (isAdmin)
                  _buildDrawerItem(Icons.admin_panel_settings_outlined, 'Quản trị hệ thống (Admin)', () {
                    Navigator.pop(context);
                    Navigator.of(context).pushNamed('/admin');
                  }, iconColor: Colors.deepPurple),

                const Divider(),
                _buildDrawerItem(Icons.settings_outlined, 'Cài đặt', () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng cài đặt đang cập nhật!')),
                  );
                }),
                _buildDrawerItem(Icons.help_outline, 'Hướng dẫn sử dụng', () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tài liệu hướng dẫn tại website vikeso.vn')),
                  );
                }),
                _buildDrawerItem(Icons.contact_support_outlined, 'Hỗ trợ khách hàng', () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Hotline / Zalo hỗ trợ: 0909.123.456')),
                  );
                }),
              ],
            ),
          ),
          
          const Divider(),
          
          // Nút Đăng xuất ở cuối
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Đăng xuất',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
              ),
              onTap: () async {
                await AuthRepository().logout();
                if (context.mounted) {
                  Navigator.of(context).pushReplacementNamed('/login');
                }
              },
            ),
          )
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap, {Color? iconColor}) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? Colors.grey[700]),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
      onTap: onTap,
    );
  }
}
