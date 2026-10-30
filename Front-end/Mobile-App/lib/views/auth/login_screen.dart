import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../data/repositories/auth_repository.dart';
import 'forgot_password_screen.dart';

/// LoginScreen - Dang nhap bang Email/Password hoac Google Sign-In.
/// Su dung AuthRepository de goi API backend va luu JWT vao SecureStorage.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey        = GlobalKey<FormState>();
  final _emailController    = TextEditingController();
  final _passwordController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _otpController      = TextEditingController();
  final _shopNameController = TextEditingController();
  final _shopAddressController = TextEditingController();
  final _authRepo = AuthRepository();

  bool _obscurePassword = true;
  bool _isLoading       = false;
  bool _isRegisterMode  = false; // Toggle giua Dang nhap / Dang ky
  int _registerStep     = 1; // 1: Thông tin cá nhân, 2: OTP 6 số, 3: Onboarding cửa hàng đầu tiên
  String _selectedBusinessType = 'Bán lẻ / Tạp hóa';
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _fullNameController.dispose();
    _otpController.dispose();
    _shopNameController.dispose();
    _shopAddressController.dispose();
    super.dispose();
  }

  // =========================================================
  // DANG NHAP EMAIL/PASSWORD
  // =========================================================
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMessage = null; });

    final result = await _authRepo.loginWithEmail(
      email: _emailController.text,
      password: _passwordController.text,
    );

    if (!mounted) return;
    setState(() { _isLoading = false; });

    if (result.isSuccess) {
      _navigateToDashboard(result.userInfo!);
    } else {
      setState(() { _errorMessage = result.errorMessage; });
    }
  }

  // =========================================================
  // DANG KY 3 BUOC (THONG TIN CA NHAN -> OTP -> ONBOARDING CUA HANG)
  // =========================================================
  Future<void> _handleRegister() async {
    // BƯỚC 1: Đăng ký tài khoản cá nhân & Gửi OTP qua Brevo Email
    if (_registerStep == 1) {
      if (!_formKey.currentState!.validate()) return;
      setState(() { _isLoading = true; _errorMessage = null; });

      final result = await _authRepo.registerStep1SendOtp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _fullNameController.text.trim(),
      );

      if (!mounted) return;
      setState(() { _isLoading = false; });

      if (result['success'] == true) {
        setState(() {
          _errorMessage = null;
          _registerStep = 2;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Mã OTP đã được gửi về email của bạn!'),
            backgroundColor: const Color(0xFF0F172A),
          ),
        );
      } else {
        setState(() { _errorMessage = result['message']; });
      }
      return;
    }

    // BƯỚC 2: Xác thực mã OTP 6 số từ Email
    if (_registerStep == 2) {
      final otp = _otpController.text.trim();
      if (otp.length != 6) {
        setState(() {
          _errorMessage = 'Vui lòng nhập đủ mã OTP 6 chữ số';
        });
        return;
      }
      setState(() { _isLoading = true; _errorMessage = null; });

      final result = await _authRepo.verifyRegisterOtp(
        email: _emailController.text.trim(),
        otpCode: otp,
      );

      if (!mounted) return;
      setState(() { _isLoading = false; });

      if (result.isSuccess) {
        setState(() {
          _errorMessage = null;
          _registerStep = 3;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Xác thực OTP thành công! Vui lòng khởi tạo cửa hàng đầu tiên.'),
            backgroundColor: Color(0xFF0F172A),
          ),
        );
      } else {
        setState(() { _errorMessage = result.errorMessage; });
      }
      return;
    }

    // BƯỚC 3: Onboarding cửa hàng đầu tiên (POST /api/shops/onboarding)
    if (_shopNameController.text.trim().isEmpty) {
      setState(() {
        _errorMessage = 'Vui lòng nhập tên cửa hàng đầu tiên của bạn';
      });
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    final result = await _authRepo.completeOnboardingShop(
      shopName: _shopNameController.text.trim(),
      businessType: _selectedBusinessType,
      address: _shopAddressController.text.trim(),
    );

    if (!mounted) return;
    setState(() { _isLoading = false; });

    if (result.isSuccess) {
      _navigateToDashboard(result.userInfo!);
    } else {
      setState(() { _errorMessage = result.errorMessage; });
    }
  }

  Future<void> _handleResendOtp() async {
    setState(() { _isLoading = true; _errorMessage = null; });
    final res = await _authRepo.resendRegisterOtp(email: _emailController.text.trim());
    if (!mounted) return;
    setState(() { _isLoading = false; });
    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Đã gửi lại mã OTP mới về email!'),
          backgroundColor: const Color(0xFF0F172A),
        ),
      );
    } else {
      setState(() { _errorMessage = res['message']; });
    }
  }

  // =========================================================
  // GOOGLE SIGN-IN
  // =========================================================
  Future<void> _handleGoogleSignIn() async {
    setState(() { _isLoading = true; _errorMessage = null; });

    final result = await _authRepo.loginWithGoogle();

    if (!mounted) return;
    setState(() { _isLoading = false; });

    if (result.isSuccess) {
      _navigateToDashboard(result.userInfo!);
    } else {
      setState(() { _errorMessage = result.errorMessage; });
    }
  }

  // =========================================================
  // CHUYEN MAN HINH DASHBOARD (luu userId vao dotenv runtime)
  // =========================================================
  // =========================================================
  // QUEN MAT KHAU
  // =========================================================
  Future<void> _openForgotPassword() async {
    final email = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (_) => ForgotPasswordScreen(initialIdentifier: _emailController.text),
      ),
    );
    if (!mounted || email == null) return;
    setState(() {
      _emailController.text = email;
      _passwordController.clear();
      _errorMessage = null;
    });
  }

  void _navigateToDashboard(UserInfo user) {
    // Cap nhat USER_ID trong dotenv runtime de cac screen khac dung duoc
    dotenv.env['USER_ID'] = user.id;
    Navigator.of(context).pushReplacementNamed('/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Image.asset(
                        'assets/images/logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Vikeso',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _isRegisterMode ? 'Đăng ký tài khoản quản lý dòng tiền' : 'Đăng nhập vào sổ quỹ cửa hàng',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 32),

                  // Hien thi loi
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF4783).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFFF4783).withValues(alpha: 0.25)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline_rounded, color: Color(0xFFFF4783), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Color(0xFFFF4783), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Stepper 3 bước khi ở chế độ Đăng ký
                  if (_isRegisterMode) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 18),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStepBadge(1, 'Tài khoản'),
                          const Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFF94A3B8)),
                          _buildStepBadge(2, 'OTP Email'),
                          const Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFF94A3B8)),
                          _buildStepBadge(3, 'Mở cửa hàng'),
                        ],
                      ),
                    ),
                  ],

                  if (_isRegisterMode && _registerStep == 2) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF0F5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFFD6E4)),
                      ),
                      child: Text(
                        'Mã xác thực OTP 6 chữ số đã được gửi tới ${_emailController.text.trim()}.\n(Mã Demo trải nghiệm: 123456)',
                        style: const TextStyle(fontSize: 12.5, color: Color(0xFF0F172A), fontWeight: FontWeight.w600, height: 1.4),
                      ),
                    ),
                    TextFormField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 8, color: Color(0xFF0F172A)),
                      decoration: _inputDecoration(
                        label: 'Nhập mã OTP 6 chữ số',
                        hint: '123456',
                        icon: Icons.verified_user_outlined,
                        colorScheme: colorScheme,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton.icon(
                          onPressed: () => setState(() => _registerStep = 1),
                          icon: const Icon(Icons.arrow_back_rounded, size: 16),
                          label: const Text('Đổi Email'),
                        ),
                        TextButton.icon(
                          onPressed: _isLoading ? null : _handleResendOtp,
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Gửi lại mã OTP'),
                        ),
                      ],
                    ),
                  ] else if (_isRegisterMode && _registerStep == 3) ...[
                    TextFormField(
                      controller: _shopNameController,
                      decoration: _inputDecoration(
                        label: 'Tên cửa hàng / Hộ kinh doanh đầu tiên',
                        hint: 'VD: Tạp hóa Cô Ba',
                        icon: Icons.storefront_outlined,
                        colorScheme: colorScheme,
                      ),
                    ),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedBusinessType,
                      decoration: _inputDecoration(
                        label: 'Loại hình kinh doanh',
                        icon: Icons.category_outlined,
                        colorScheme: colorScheme,
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Bán lẻ / Tạp hóa', child: Text('Bán lẻ / Tạp hóa')),
                        DropdownMenuItem(value: 'F&B / Quán ăn / Cà phê', child: Text('F&B / Quán ăn / Cà phê')),
                        DropdownMenuItem(value: 'Thời trang / Phụ kiện', child: Text('Thời trang / Phụ kiện')),
                        DropdownMenuItem(value: 'Dịch vụ / Spa / Tiệm tóc', child: Text('Dịch vụ / Spa / Tiệm tóc')),
                      ],
                      onChanged: (v) {
                        if (v != null) setState(() => _selectedBusinessType = v);
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _shopAddressController,
                      decoration: _inputDecoration(
                        label: 'Địa chỉ cửa hàng (Tùy chọn)',
                        hint: 'VD: 123 Nguyễn Trãi, Quận 1',
                        icon: Icons.location_on_outlined,
                        colorScheme: colorScheme,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ] else ...[
                    if (_isRegisterMode) ...[
                      TextFormField(
                        controller: _fullNameController,
                        decoration: _inputDecoration(
                          label: 'Họ và tên chủ hộ kinh doanh',
                          hint: 'VD: Nguyễn Văn A',
                          icon: Icons.badge_outlined,
                          colorScheme: colorScheme,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Email hoặc SĐT
                    TextFormField(
                      controller: _emailController,
                      keyboardType: _isRegisterMode ? TextInputType.emailAddress : TextInputType.text,
                      decoration: _inputDecoration(
                        label: _isRegisterMode ? 'Email đăng nhập (Nhận OTP)' : 'Email hoặc Số điện thoại',
                        hint: _isRegisterMode ? 'VD: cuahang@vikeso.vn' : 'VD: cuahang@vikeso.vn hoặc 0987654321',
                        icon: _isRegisterMode ? Icons.email_outlined : Icons.person_outline,
                        colorScheme: colorScheme,
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return _isRegisterMode ? 'Vui lòng nhập email' : 'Vui lòng nhập email hoặc số điện thoại';
                        }
                        if (_isRegisterMode) {
                          if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                            return 'Email không đúng định dạng';
                          }
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: _inputDecoration(
                        label: 'Mật khẩu',
                        icon: Icons.lock_outline,
                        colorScheme: colorScheme,
                      ).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: const Color(0xFF64748B),
                          ),
                          onPressed: () => setState(() { _obscurePassword = !_obscurePassword; }),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) return 'Vui lòng nhập mật khẩu';
                        if (_isRegisterMode && value.length < 6) return 'Mật khẩu ít nhất 6 ký tự';
                        return null;
                      },
                    ),
                  ],
                  if (!_isRegisterMode) ...[
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: _isLoading ? null : _openForgotPassword,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                        ),
                        child: const Text(
                          'Quên mật khẩu?',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                  ] else ...[
                    const SizedBox(height: 20),
                  ],

                  // Nut Dang nhap / Dang ky
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isLoading
                          ? null
                          : (_isRegisterMode ? _handleRegister : _handleLogin),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF4783),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20, width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(
                              _isRegisterMode
                                  ? (_registerStep == 1
                                      ? 'Tiếp Tục & Nhận Mã OTP'
                                      : (_registerStep == 2
                                          ? 'Xác Thực OTP'
                                          : 'Hoàn Tất & Mở Cửa Hàng'))
                                  : 'Đăng Nhập',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, letterSpacing: -0.2),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Duong chia HOAC
                  const Row(
                    children: [
                      Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text('HOẶC', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                      ),
                      Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Google Sign-In Button
                  SizedBox(
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: _isLoading ? null : _handleGoogleSignIn,
                      icon: Image.network(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png',
                        height: 20, width: 20,
                        errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 24, color: Color(0xFFFF4783)),
                      ),
                      label: const Text(
                        'Đăng nhập với Google',
                        style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        backgroundColor: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Toggle Dang nhap / Dang ky
                  Center(
                    child: TextButton(
                      onPressed: () => setState(() {
                        _isRegisterMode = !_isRegisterMode;
                        _registerStep = 1;
                        _errorMessage = null;
                        _formKey.currentState?.reset();
                      }),
                      child: RichText(
                        text: TextSpan(
                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
                          children: [
                            TextSpan(text: _isRegisterMode ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '),
                            TextSpan(
                              text: _isRegisterMode ? 'Đăng nhập' : 'Đăng ký ngay',
                              style: const TextStyle(color: Color(0xFFFF4783), fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepBadge(int step, String title) {
    final active = _registerStep == step;
    final done = _registerStep > step;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done
                ? const Color(0xFFD0F81B)
                : (active ? const Color(0xFFFF4783) : const Color(0xFFE2E8F0)),
          ),
          alignment: Alignment.center,
          child: Text(
            done ? '✓' : '$step',
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w900,
              color: done
                  ? const Color(0xFF0F172A)
                  : (active ? Colors.white : const Color(0xFF64748B)),
            ),
          ),
        ),
        const SizedBox(width: 5),
        Text(
          title,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: active ? FontWeight.w800 : FontWeight.w600,
            color: active ? const Color(0xFF0F172A) : const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration({
    required String label,
    String? hint,
    required IconData icon,
    required ColorScheme colorScheme,
  }) {
    return InputDecoration(
      prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 20),
      labelText: label,
      labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFFF4783), width: 1.8)),
      filled: true,
      fillColor: Colors.white,
    );
  }
}
