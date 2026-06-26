import 'package:flutter/material.dart';

class CustomSideDrawer extends StatelessWidget {
  const CustomSideDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header của Drawer chứa thông tin cá nhân/cửa hàng
          DrawerHeader(
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      'C',
                      style: TextStyle(
                        color: colorScheme.onPrimaryContainer,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Cafe ABC',
                        style: TextStyle(
                          color: colorScheme.primary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        'Nguyễn Văn Tiến',
                        style: TextStyle(
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'Chủ cửa hàng',
                        style: TextStyle(
                          color: colorScheme.secondary,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Danh sách các danh mục lựa chọn rộng rãi hơn
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildDrawerItem(Icons.analytics_outlined, 'Báo cáo chi tiết', () {}),
                _buildDrawerItem(Icons.settings_outlined, 'Cài đặt', () {}),
                _buildDrawerItem(Icons.help_outline, 'Hướng dẫn', () {}),
                _buildDrawerItem(Icons.contact_support_outlined, 'Hỗ trợ', () {}),
              ],
            ),
          ),
          
          const Divider(),
          
          // Thẻ Đăng xuất ở cuối
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Đăng xuất',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
              ),
              onTap: () {
                Navigator.of(context).pushReplacementNamed('/login');
              },
            ),
          )
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey[700]),
      title: Text(title, style: const TextStyle(fontSize: 14)),
      onTap: onTap,
    );
  }
}
