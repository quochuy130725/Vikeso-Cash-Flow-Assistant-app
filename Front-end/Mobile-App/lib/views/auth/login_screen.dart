import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../data/repositories/auth_repository.dart';

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
  final _shopNameController = TextEditingController();
  final _authRepo = AuthRepository();

  bool _obscurePassword = true;
  bool _isLoading       = false;
  bool _isRegisterMode  = false; // Toggle giua Dang nhap / Dang ky
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _shopNameController.dispose();
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
  // DANG KY EMAIL MOI
  // =========================================================
  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMessage = null; });

    final result = await _authRepo.register(
      email: _emailController.text,
      password: _passwordController.text,
      shopName: _shopNameController.text,
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
                  Icon(Icons.storefront_rounded, size: 72, color: colorScheme.primary),
                  const SizedBox(height: 12),
                  Text(
                    'FinAuto',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: colorScheme.primary),
                  ),
                  Text(
                    _isRegisterMode ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: colorScheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 32),

                  // Hien thi loi
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.red, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Ten cua hang (chi hien khi dang ky)
                  if (_isRegisterMode) ...[
                    TextFormField(
                      controller: _shopNameController,
                      decoration: _inputDecoration(
                        label: 'Tên cửa hàng (tùy chọn)',
                        icon: Icons.storefront_outlined,
                        colorScheme: colorScheme,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Email
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: _inputDecoration(
                      label: 'Email đăng nhập',
                      hint: 'VD: test@example.com',
                      icon: Icons.email_outlined,
                      colorScheme: colorScheme,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Vui lòng nhập email';
                      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                        return 'Email không đúng định dạng';
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
                          _obscurePassword ? Icons.visibility : Icons.visibility_off,
                          color: colorScheme.outlineVariant,
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
                  const SizedBox(height: 24),

                  // Nut Dang nhap / Dang ky
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isLoading
                          ? null
                          : (_isRegisterMode ? _handleRegister : _handleLogin),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: colorScheme.primaryContainer,
                        foregroundColor: colorScheme.onPrimaryContainer,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20, width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(
                              _isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Duong chia HOAC
                  Row(
                    children: [
                      Expanded(child: Divider(color: colorScheme.surfaceContainerHighest, thickness: 1)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text('HOẶC', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: colorScheme.outlineVariant)),
                      ),
                      Expanded(child: Divider(color: colorScheme.surfaceContainerHighest, thickness: 1)),
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
                        errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 24, color: Colors.red),
                      ),
                      label: const Text('Đăng nhập với Google'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: colorScheme.onSurface,
                        side: BorderSide(color: colorScheme.outlineVariant),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Toggle Dang nhap / Dang ky
                  Center(
                    child: TextButton(
                      onPressed: () => setState(() {
                        _isRegisterMode = !_isRegisterMode;
                        _errorMessage = null;
                        _formKey.currentState?.reset();
                      }),
                      child: RichText(
                        text: TextSpan(
                          style: TextStyle(color: colorScheme.onSurfaceVariant, fontSize: 14),
                          children: [
                            TextSpan(text: _isRegisterMode ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '),
                            TextSpan(
                              text: _isRegisterMode ? 'Đăng nhập' : 'Đăng ký ngay',
                              style: TextStyle(color: colorScheme.primary, fontWeight: FontWeight.bold),
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

  InputDecoration _inputDecoration({
    required String label,
    String? hint,
    required IconData icon,
    required ColorScheme colorScheme,
  }) {
    return InputDecoration(
      prefixIcon: Icon(icon, color: colorScheme.outline),
      labelText: label,
      hintText: hint,
      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colorScheme.outlineVariant)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colorScheme.outlineVariant.withValues(alpha: 0.5))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colorScheme.primary, width: 2)),
    );
  }
}
