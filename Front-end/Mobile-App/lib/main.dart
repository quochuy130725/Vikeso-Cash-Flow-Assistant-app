import 'package:flutter/material.dart';
import 'core/themes/app_theme.dart';
// Import các màn hình của ứng dụng
import 'views/splash/splash_screen.dart';
import 'views/auth/login_screen.dart';
import 'views/dashboard/dashboard_screen.dart';
import 'views/thu_chi/thu_chi_screen.dart';
import 'views/profile/profile_screen.dart';
import 'views/scan_receipt/camera_screen.dart';
import 'views/scan_receipt/split_screen.dart';

void main() {
  runApp(const QuanLyCuaHangApp());
}

class QuanLyCuaHangApp extends StatelessWidget {
  const QuanLyCuaHangApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quản lý cửa hàng',
      debugShowCheckedModeBanner: false,
      
      // Sử dụng AppTheme từ thư mục core
      theme: AppTheme.getTheme(context),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const MainNavigationShell(initialIndex: 0),
        '/thu_chi': (context) => const MainNavigationShell(initialIndex: 1),
        '/profile': (context) => const MainNavigationShell(initialIndex: 2),
        '/camera': (context) => const CameraScreen(),
        '/split': (context) => const SplitScreen(),
      },
    );
  }
}

// Shell điều hướng chính tích hợp Bottom Navigation Bar
class MainNavigationShell extends StatefulWidget {
  final int initialIndex;
  const MainNavigationShell({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  late int _currentIndex;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ThuChiScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
              width: 1,
            ),
          ),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          backgroundColor: Colors.white,
          indicatorColor: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.2),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          height: 64,
          onDestinationSelected: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          destinations: [
            NavigationDestination(
              icon: Icon(
                Icons.home_outlined, 
                color: _currentIndex == 0 ? Theme.of(context).colorScheme.primary : Colors.grey[600]
              ),
              selectedIcon: Icon(Icons.home, color: Theme.of(context).colorScheme.primary),
              label: 'Trang chủ',
            ),
            NavigationDestination(
              icon: Icon(
                Icons.add_box_outlined, 
                color: _currentIndex == 1 ? Theme.of(context).colorScheme.primary : Colors.grey[600]
              ),
              selectedIcon: Icon(Icons.add_box, color: Theme.of(context).colorScheme.primary),
              label: 'Thu Chi',
            ),
            NavigationDestination(
              icon: Icon(
                Icons.person_outline, 
                color: _currentIndex == 2 ? Theme.of(context).colorScheme.primary : Colors.grey[600]
              ),
              selectedIcon: Icon(Icons.person, color: Theme.of(context).colorScheme.primary),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
