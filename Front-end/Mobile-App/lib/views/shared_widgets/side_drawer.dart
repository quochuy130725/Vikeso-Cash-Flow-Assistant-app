import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/repositories/auth_repository.dart';
import 'pro_badge.dart';

class CustomSideDrawer extends StatefulWidget {
  const CustomSideDrawer({super.key});

  @override
  State<CustomSideDrawer> createState() => _CustomSideDrawerState();
}

class _CustomSideDrawerState extends State<CustomSideDrawer> {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());
  String _shopName = 'Cửa hàng Vikeso';
  String _email = '';
  String _plan = 'FREE';
  String _role = 'OWNER';

  @override
  void initState() {
    super.initState();
    _loadUserHeader();
  }

  Future<void> _loadUserHeader() async {
    final shopName = await _storage.read(key: 'user_shopName');
    final email = await _storage.read(key: 'user_email');
    final role = await _storage.read(key: 'user_role') ?? 'OWNER';
    final plan = await AuthRepository().getSubscriptionPlan();

    if (mounted) {
      setState(() {
        if (shopName != null && shopName.isNotEmpty) _shopName = shopName;
        if (email != null && email.isNotEmpty) _email = email;
        _role = role.toUpperCase();
        _plan = plan;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPro = _plan.toUpperCase() == 'PRO';

    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header của Drawer chứa thông tin cá nhân/cửa hàng
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF0F5),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFFF4783),
                      width: 2.2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      _shopName.isNotEmpty ? _shopName[0].toUpperCase() : 'V',
                      style: const TextStyle(
                        color: Color(0xFFFF4783),
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
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
                        style: const TextStyle(
                          color: Color(0xFF0F172A),
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _email.isNotEmpty ? _email : 'Chủ cửa hàng',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isPro ? const Color(0xFFD0F81B) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: isPro ? const Color(0xFF0F172A) : const Color(0xFFCBD5E1),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (isPro)
                                  const Icon(Icons.verified, size: 12, color: Color(0xFF0F172A))
                                else
                                  const Icon(Icons.storefront, size: 12, color: Color(0xFF64748B)),
                                const SizedBox(width: 4),
                                Text(
                                  isPro ? 'GÓI PRO' : 'GÓI CƠ BẢN',
                                  style: TextStyle(
                                    color: isPro ? const Color(0xFF0F172A) : const Color(0xFF475569),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
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
                if (_role != 'STAFF') ...[
                  _buildDrawerItem(Icons.analytics_outlined, 'Báo cáo chi tiết', () {
                    Navigator.pop(context);
                    Navigator.of(context).pushReplacementNamed('/analytics');
                  }),
                  _buildDrawerItem(Icons.storefront_outlined, 'Quản lý cửa hàng', () {
                    Navigator.pop(context);
                    Navigator.of(context).pushReplacementNamed('/store');
                  }),
                  _buildDrawerItem(
                    Icons.workspace_premium_rounded,
                    isPro ? 'Gói VikeSo PRO (Đang bật)' : 'Nâng cấp gói VikeSo PRO',
                    () {
                      Navigator.pop(context);
                      Navigator.of(context).pushNamed('/upgrade-pro');
                    },
                    iconColor: isPro ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
                    trailing: isPro ? const ProBadge() : null,
                  ),
                  const Divider(),
                ],
                _buildDrawerItem(Icons.person_outline_rounded, 'Tài khoản cá nhân', () {
                  Navigator.pop(context);
                  Navigator.of(context).pushReplacementNamed('/personal');
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
              leading: const Icon(Icons.logout, color: Color(0xFFFF4783)),
              title: const Text(
                'Đăng xuất',
                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFF4783)),
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

  Widget _buildDrawerItem(
    IconData icon,
    String title,
    VoidCallback onTap, {
    Color? iconColor,
    Widget? trailing,
  }) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? Colors.grey[700]),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
      trailing: trailing,
      onTap: onTap,
    );
  }
}
