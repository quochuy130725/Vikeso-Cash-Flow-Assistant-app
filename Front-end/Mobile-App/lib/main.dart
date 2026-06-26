import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
// Import các màn hình của ứng dụng
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/thu_chi_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/camera_screen.dart';
import 'screens/split_screen.dart';

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
      
      // Khởi tạo Theme theo bảng màu Vivid Kinetic
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8F9FA), // background
        colorScheme: const ColorScheme.light(
          primary: Color(0xFFB31F56), // primary
          onPrimary: Colors.white,
          primaryContainer: Color(0xFFFF5C8D), // primary-container
          onPrimaryContainer: Color(0xFF64002A),
          secondary: Color(0xFF5C6300),
          onSecondary: Colors.white,
          secondaryContainer: Color(0xFFDCE944), // secondary-container
          onSecondaryContainer: Color(0xFF606800),
          surface: Color(0xFFF8F9FA),
          onSurface: Color(0xFF191C1D),
          surfaceContainerHighest: Color(0xFFE1E3E4),
          onSurfaceVariant: Color(0xFF584045),
          outline: Color(0xFF8C7075),
          outlineVariant: Color(0xFFDFBEC4),
          error: Color(0xFFBA1A1A),
          errorContainer: Color(0xFFFFDAD6),
        ),
        
        // Sử dụng font chữ Roboto Flex làm mặc định giống thiết kế
        textTheme: GoogleFonts.robotoFlexTextTheme(
          Theme.of(context).textTheme,
        ).copyWith(
          displayLarge: GoogleFonts.robotoFlex(
            fontSize: 56,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.02,
            height: 1.14,
          ),
          headlineLarge: GoogleFonts.robotoFlex(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            height: 1.25,
          ),
          titleMedium: GoogleFonts.robotoFlex(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            height: 1.33,
          ),
          bodyLarge: GoogleFonts.robotoFlex(
            fontSize: 16,
            fontWeight: FontWeight.normal,
            height: 1.5,
          ),
          bodySmall: GoogleFonts.robotoFlex(
            fontSize: 14,
            fontWeight: FontWeight.normal,
            height: 1.43,
          ),
          labelMedium: GoogleFonts.robotoFlex(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.05,
            height: 1.33,
          ),
        ),
      ),
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
                color: _currentIndex == 0 ? const Color(0xFFB31F56) : Colors.grey[600]
              ),
              selectedIcon: const Icon(Icons.home, color: Color(0xFFB31F56)),
              label: 'Trang chủ',
            ),
            NavigationDestination(
              icon: Icon(
                Icons.add_box_outlined, 
                color: _currentIndex == 1 ? const Color(0xFFB31F56) : Colors.grey[600]
              ),
              selectedIcon: const Icon(Icons.add_box, color: Color(0xFFB31F56)),
              label: 'Thu Chi',
            ),
            NavigationDestination(
              icon: Icon(
                Icons.person_outline, 
                color: _currentIndex == 2 ? const Color(0xFFB31F56) : Colors.grey[600]
              ),
              selectedIcon: const Icon(Icons.person, color: Color(0xFFB31F56)),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
