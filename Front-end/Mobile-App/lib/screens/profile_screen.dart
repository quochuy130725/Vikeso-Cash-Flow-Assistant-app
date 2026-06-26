import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () {},
          icon: const Icon(Icons.menu, color: Colors.white),
        ),
        backgroundColor: const Color(0xFFFF5C8D), // Hồng Pinkish-orange của topbar profile
        title: const Text('Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications, color: Colors.white)),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Column(
          children: [
            // Phần hiển thị thông tin Avatar & Store của chủ của hàng
            Center(
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: colorScheme.primaryContainer, width: 2.5),
                        ),
                        child: const CircleAvatar(
                          backgroundImage: NetworkImage(
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuAdR5QHBVCzGPAVNnpkZCebmZV1Ae2gp89kjrKO5LlkQdXCpobBgZHsxBhWQllTh4CxNxn_cRvKzY9YqY7U6vzNBxyhAEJmrX8uMkR_OdDy3Fo-0osCad8VtmXjiokJzpGihstgd0qBkYc2q9bgsDtPamp12sZ3PWEZ0GLSey-IDS8UdTbVKFz6-K-uI-Z6P8sKeaCWEgVzNO7hScVaIUDbvmpkD6WoopqITwS5uZ9PXwoLskiUFBfogsE4VVpz5cPoqbHsyneBlJ8',
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: colorScheme.primaryContainer,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.edit, size: 14, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Cafe ABC',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Nguyễn Văn Tiến',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.call, size: 14, color: Colors.grey),
                      SizedBox(width: 4),
                      Text('0123 456 789', style: TextStyle(color: Colors.grey, fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),

            // Nhóm menu thông tin & tác vụ
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                children: [
                  _buildProfileMenuItem(context, Icons.storefront, 'Thông tin cửa hàng'),
                  _buildProfileMenuItem(context, Icons.edit, 'Sửa thông tin'),
                  _buildProfileMenuItem(context, Icons.lock_outline, 'Đổi mật khẩu'),
                  _buildProfileMenuItem(context, Icons.settings_outlined, 'Cài đặt'),
                ],
              ),
            ),
            
            const SizedBox(height: 24),

            // Nút đăng xuất chuyên nghiệp
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).pushReplacementNamed('/login');
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text('Đăng xuất', style: TextStyle(color: Colors.red, fontSize: 16)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: Colors.red.withValues(alpha: 0.3)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileMenuItem(BuildContext context, IconData icon, String text) {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[100]!)),
      ),
      child: ListTile(
        leading: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 18),
        ),
        title: Text(text, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
        onTap: () {
          // Thao tác sự kiện ListTile tại đây
        },
      ),
    );
  }
}
