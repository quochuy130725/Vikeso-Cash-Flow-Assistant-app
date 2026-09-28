import 'package:flutter/material.dart';
import 'core/themes/app_theme.dart';
// Import cĂ¡c mĂ n hĂ¬nh cá»§a á»©ng dá»¥ng
import 'views/splash/splash_screen.dart';
import 'views/auth/login_screen.dart';
import 'views/dashboard/dashboard_screen.dart';
import 'views/thu_chi/thu_chi_screen.dart';
import 'views/profile/profile_screen.dart';
import 'views/scan_receipt/camera_screen.dart';
import 'views/analytics/analytics_screen.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  // Ensure widgets binding is initialized before async operations
  WidgetsFlutterBinding.ensureInitialized();
  // Load .env file
  await dotenv.load(fileName: ".env");
  
  runApp(const QuanLyCuaHangApp());
}

class QuanLyCuaHangApp extends StatelessWidget {
  const QuanLyCuaHangApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quáº£n lĂ½ cá»­a hĂ ng',
      debugShowCheckedModeBanner: false,

      // Sá»­ dá»¥ng AppTheme tá»« thÆ° má»¥c core
      theme: AppTheme.getTheme(context),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const MainNavigationShell(initialIndex: 0),
        '/thu_chi': (context) => const MainNavigationShell(initialIndex: 1),
        '/analytics': (context) => const MainNavigationShell(initialIndex: 2),
        '/profile': (context) => const MainNavigationShell(initialIndex: 3),
        '/camera': (context) => const CameraScreen(),
        // NOTE: '/split' khĂ´ng cĂ²n lĂ  route tÄ©nh ná»¯a.
        // SplitScreen Ä‘Æ°á»£c má»Ÿ báº±ng Navigator.push tá»« CameraScreen
        // Ä‘á»ƒ truyá»n dá»¯ liá»‡u Ä‘á»™ng (items, userId, imageFile) tá»« API.
      },  
    );
  }
}

// Shell Ä‘iá»u hÆ°á»›ng chĂ­nh tĂ­ch há»£p Bottom Navigation Bar
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
    const AnalyticsScreen(),
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
            selectedIndex: _currentIndex,
            backgroundColor: Colors.white,
            indicatorColor: Theme.of(context)
                .colorScheme
                .primaryContainer
                .withValues(alpha: 0.2),
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            height: 64,
            onDestinationSelected: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            destinations: [
              NavigationDestination(
                icon: Icon(Icons.home_outlined,
                    color: _currentIndex == 0
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600]),
                selectedIcon: Icon(Icons.home,
                    color: Theme.of(context).colorScheme.primary),
                label: 'Trang chá»§',
              ),
              NavigationDestination(
                icon: Icon(Icons.receipt_long_outlined,
                    color: _currentIndex == 1
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600]),
                selectedIcon: Icon(Icons.receipt_long,
                    color: Theme.of(context).colorScheme.primary),
                label: 'Thu Chi',
              ),
              NavigationDestination(
                icon: Icon(Icons.analytics_outlined,
                    color: _currentIndex == 2
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600]),
                selectedIcon: Icon(Icons.analytics,
                    color: Theme.of(context).colorScheme.primary),
                label: 'BĂ¡o cĂ¡o',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline,
                    color: _currentIndex == 3
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600]),
                selectedIcon: Icon(Icons.person,
                    color: Theme.of(context).colorScheme.primary),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
