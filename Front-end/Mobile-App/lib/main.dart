import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'core/themes/app_theme.dart';
// Import các màn hình của ứng dụng
import 'views/splash/splash_screen.dart';
import 'views/auth/login_screen.dart';
import 'views/dashboard/dashboard_screen.dart';
import 'views/thu_chi/thu_chi_screen.dart';
import 'views/store/store_screen.dart';
import 'views/personal/personal_screen.dart';
import 'views/billing/upgrade_pro_screen.dart';
import 'views/scan_receipt/camera_screen.dart';
import 'views/analytics/analytics_screen.dart';
import 'data/services/socket_service.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  // Ensure widgets binding is initialized before async operations
  WidgetsFlutterBinding.ensureInitialized();
  // Load .env file
  await dotenv.load(fileName: ".env");
  // Initialize date formatting for Vietnamese locale
  await initializeDateFormatting('vi', null);
  
  runApp(const QuanLyCuaHangApp());
}

class QuanLyCuaHangApp extends StatelessWidget {
  const QuanLyCuaHangApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vikeso',
      debugShowCheckedModeBanner: false,

      // Sử dụng AppTheme từ thư mục core
      theme: AppTheme.getTheme(context),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const MainNavigationShell(initialIndex: 0),
        '/thu_chi': (context) => const MainNavigationShell(initialIndex: 1),
        '/analytics': (context) => const MainNavigationShell(initialIndex: 2),
        '/store': (context) => const MainNavigationShell(initialIndex: 3),
        '/profile': (context) => const MainNavigationShell(initialIndex: 4),
        '/personal': (context) => const MainNavigationShell(initialIndex: 4),
        '/camera': (context) => const CameraScreen(),
        '/upgrade-pro': (context) => const UpgradeProScreen(),
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
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());
  late int _currentIndex;
  String _role = 'OWNER';
  StreamSubscription? _forceLogoutSub;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _loadUserRole();
    SocketService.instance.connect();
    _forceLogoutSub = SocketService.instance.onForceLogout.listen((data) {
      if (!mounted) return;
      final reason = data['message']?.toString() ??
          'Tài khoản của bạn đã bị Chủ cửa hàng khóa quyền truy cập.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(reason),
          backgroundColor: const Color(0xFFFF4783),
          duration: const Duration(seconds: 5),
        ),
      );
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
    });
  }

  Future<void> _loadUserRole() async {
    final role = await _storage.read(key: 'user_role') ?? 'OWNER';
    if (!mounted) return;
    setState(() {
      _role = role.toUpperCase();
      if (_role == 'STAFF' && _currentIndex > 2) {
        _currentIndex = 2;
      }
    });
  }

  @override
  void dispose() {
    _forceLogoutSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isStaff = _role == 'STAFF';

    final screens = isStaff
        ? const <Widget>[
            DashboardScreen(),
            ThuChiScreen(),
            PersonalScreen(),
          ]
        : const <Widget>[
            DashboardScreen(),
            ThuChiScreen(),
            AnalyticsScreen(),
            StoreScreen(),
            PersonalScreen(),
          ];

    final destinations = isStaff
        ? const <NavigationDestination>[
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.dashboard_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Tổng quan',
            ),
            NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.receipt_long_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Thu Chi',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.person_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Cá nhân',
            ),
          ]
        : const <NavigationDestination>[
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.dashboard_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Tổng quan',
            ),
            NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.receipt_long_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Thu Chi',
            ),
            NavigationDestination(
              icon: Icon(Icons.bar_chart_outlined, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.bar_chart_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Báo cáo',
            ),
            NavigationDestination(
              icon: Icon(Icons.storefront_outlined, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.storefront_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Cửa hàng',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded, color: Color(0xFF64748B), size: 22),
              selectedIcon: Icon(Icons.person_rounded, color: Color(0xFFFF4783), size: 22),
              label: 'Cá nhân',
            ),
          ];

    final safeIndex = _currentIndex.clamp(0, screens.length - 1);

    return Scaffold(
      body: IndexedStack(
        index: safeIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(
              color: Theme.of(context)
                  .colorScheme
                  .outlineVariant
                  .withValues(alpha: 0.5),
              width: 1,
            ),
          ),
        ),
        child: SafeArea(
          top: false,
          child: NavigationBar(
            selectedIndex: safeIndex,
            backgroundColor: Colors.white,
            elevation: 0,
            indicatorColor: const Color(0xFFFFE4EE), // Soft Hot Pink pill
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            height: 64,
            onDestinationSelected: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            destinations: destinations,
          ),
        ),
      ),
    );
  }
}
