import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../data/repositories/auth_repository.dart';
import 'forgot_password_screen.dart';

/// LoginScreen - Đăng nhập bằng Email/Mật khẩu hoặc Google Sign-In.
/// Luồng Đăng ký chuẩn hóa 2 bước: Điền thông tin cá nhân -> Xác thực OTP Brevo.
/// Sau khi xác thực OTP thành công, chuyển về Form Đăng Nhập để đăng nhập.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _authRepo = AuthRepository();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  bool _isRegisterMode = false; // Toggle giữa Đăng nhập / Đăng ký
  int _registerStep = 1; // 1: Thông tin cá nhân, 2: OTP 6 số
  String? _errorMessage;
  final Map<String, String?> _fieldErrors = {};

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _fullNameController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  // =============================================================================
  // NGHIỆP VỤ 1: ĐĂNG NHẬP VỚI INLINE VALIDATION TRỰC TIẾP
  // - Dùng để: Đăng nhập tài khoản vào hệ thống VikeSo
  // - Phục vụ: Kiểm tra rỗng, sai mật khẩu và hiển thị lỗi trực tiếp dưới từng ô
  // =============================================================================
  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    final errors = <String, String?>{};
    if (email.isEmpty) {
      errors['loginEmail'] = 'Vui lòng nhập email đăng nhập';
    } else if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email) &&
        !RegExp(r'^[0-9]{9,11}$').hasMatch(email)) {
      errors['loginEmail'] = 'Email hoặc số điện thoại không hợp lệ';
    }

    if (password.isEmpty) {
      errors['loginPassword'] = 'Vui lòng nhập mật khẩu';
    }

    if (errors.isNotEmpty) {
      setState(() {
        _fieldErrors.clear();
        _fieldErrors.addAll(errors);
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _fieldErrors.clear();
    });

    final result = await _authRepo.loginWithEmail(
      email: email,
      password: password,
    );

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });

    if (result.isSuccess) {
      _navigateToDashboard(result.userInfo!);
    } else {
      final msg = result.errorMessage ?? 'Đăng nhập không thành công';
      setState(() {
        if (msg.toLowerCase().contains('mật khẩu') || msg.toLowerCase().contains('password')) {
          _fieldErrors['loginPassword'] = msg;
        } else if (msg.toLowerCase().contains('email') || msg.toLowerCase().contains('tài khoản')) {
          _fieldErrors['loginEmail'] = msg;
        } else {
          _errorMessage = msg;
        }
      });
    }
  }

  // =============================================================================
  // NGHIỆP VỤ 2: ĐĂNG KÝ 2 BƯỚC CHUẨN ĐỒNG BỘ VỚI WEB & INLINE VALIDATION
  // - Bước 1: Nhập Họ tên, Email, Số điện thoại, Mật khẩu, Nhập lại mật khẩu.
  //           Validate trực tiếp dưới chân từng ô, tự động xóa lỗi khi gõ lại.
  // - Bước 2: Xác thực mã OTP 6 số từ Email.
  // - Sau khi xác thực OTP thành công: Chuyển về Form Đăng Nhập để đăng nhập.
  //   Tuyệt đối KHÔNG bắt buộc Onboarding tạo cửa hàng tại đây, KHÔNG vào thẳng Dashboard.
  // =============================================================================
  Future<void> _handleRegister() async {
    // BƯỚC 1: Đăng ký thông tin tài khoản cá nhân & Gửi OTP qua Email
    if (_registerStep == 1) {
      final name = _fullNameController.text.trim();
      final email = _emailController.text.trim();
      final phone = _phoneController.text.trim();
      final password = _passwordController.text;
      final confirmPassword = _confirmPasswordController.text;

      final errors = <String, String?>{};
      if (name.isEmpty) {
        errors['fullName'] = 'Vui lòng nhập họ và tên của bạn';
      } else if (name.length < 2) {
        errors['fullName'] = 'Họ và tên tối thiểu 2 ký tự';
      }

      if (email.isEmpty) {
        errors['email'] = 'Vui lòng nhập email nhận mã OTP';
      } else if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
        errors['email'] = 'Địa chỉ email không đúng định dạng';
      }

      if (phone.isNotEmpty && (phone.length < 10 || phone.length > 11)) {
        errors['phone'] = 'Số điện thoại không hợp lệ (10 - 11 chữ số)';
      }

      if (password.isEmpty) {
        errors['password'] = 'Vui lòng nhập mật khẩu khởi tạo';
      } else if (password.length < 6) {
        errors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (confirmPassword.isEmpty) {
        errors['confirmPassword'] = 'Vui lòng xác nhận lại mật khẩu';
      } else if (confirmPassword != password) {
        errors['confirmPassword'] = 'Mật khẩu xác nhận không khớp';
      }

      if (errors.isNotEmpty) {
        setState(() {
          _fieldErrors.clear();
          _fieldErrors.addAll(errors);
        });
        return;
      }

      setState(() {
        _isLoading = true;
        _errorMessage = null;
        _fieldErrors.clear();
      });

      final result = await _authRepo.registerStep1SendOtp(
        email: email,
        password: password,
        name: name,
        phone: phone,
      );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      if (result['success'] == true) {
        setState(() {
          _errorMessage = null;
          _fieldErrors.clear();
          _registerStep = 2;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Mã xác thực OTP đã được gửi về email của bạn!'),
            backgroundColor: const Color(0xFF0F172A),
          ),
        );
      } else {
        final msg = result['message']?.toString() ?? 'Đăng ký thất bại.';
        setState(() {
          if (msg.toLowerCase().contains('email')) {
            _fieldErrors['email'] = msg;
          } else {
            _errorMessage = msg;
          }
        });
      }
      return;
    }

    // BƯỚC 2: Xác thực mã OTP 6 số từ Email
    if (_registerStep == 2) {
      final otp = _otpController.text.trim();
      if (otp.isEmpty) {
        setState(() {
          _fieldErrors['otp'] = 'Vui lòng nhập mã OTP 6 chữ số';
        });
        return;
      }
      if (otp.length != 6) {
        setState(() {
          _fieldErrors['otp'] = 'Mã OTP phải có đúng 6 chữ số';
        });
        return;
      }

      setState(() {
        _isLoading = true;
        _errorMessage = null;
        _fieldErrors.clear();
      });

      final result = await _authRepo.verifyRegisterOtp(
        email: _emailController.text.trim(),
        otpCode: otp,
      );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      if (result.isSuccess) {
        // =============================================================================
        // ĐỒNG BỘ CHUẨN WEB: QUAY VỀ FORM ĐĂNG NHẬP SAU KHI XÁC THỰC OTP THÀNH CÔNG
        // =============================================================================
        setState(() {
          _errorMessage = null;
          _fieldErrors.clear();
          _isRegisterMode = false;
          _registerStep = 1;
          _passwordController.clear();
          _confirmPasswordController.clear();
          _otpController.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Xác thực tài khoản thành công! Vui lòng đăng nhập để bắt đầu.'),
            backgroundColor: Color(0xFF10B981),
            duration: Duration(seconds: 4),
          ),
        );
      } else {
        setState(() {
          _fieldErrors['otp'] = result.errorMessage ?? 'Mã OTP không chính xác hoặc đã hết hạn';
        });
      }
      return;
    }
  }

  Future<void> _handleResendOtp() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _fieldErrors.clear();
    });
    final res = await _authRepo.resendRegisterOtp(email: _emailController.text.trim());
    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });
    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Đã gửi lại mã OTP mới về email!'),
          backgroundColor: const Color(0xFF0F172A),
        ),
      );
    } else {
      setState(() {
        _fieldErrors['otp'] = res['message'];
      });
    }
  }

  // =========================================================
  // GOOGLE SIGN-IN
  // =========================================================
  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _fieldErrors.clear();
    });

    final result = await _authRepo.loginWithGoogle();

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });

    if (result.isSuccess) {
      _navigateToDashboard(result.userInfo!);
    } else {
      setState(() {
        _errorMessage = result.errorMessage;
      });
    }
  }

  // =========================================================
  // QUÊN MẬT KHẨU
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
      _confirmPasswordController.clear();
      _errorMessage = null;
      _fieldErrors.clear();
    });
  }

  void _navigateToDashboard(UserInfo user) {
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
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Center(
                    child: Container(
                      width: 68,
                      height: 68,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(18),
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
                  const SizedBox(height: 14),
                  const Text(
                    'Vikeso',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _isRegisterMode
                        ? 'Đăng ký tài khoản Quản lý Dòng tiền (Chủ hộ)'
                        : 'Đăng nhập vào sổ quỹ cửa hàng',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 13.5,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Hiển thị lỗi chung (nếu có lỗi hệ thống ngoài các ô nhập)
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
                              style: const TextStyle(
                                color: Color(0xFFFF4783),
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Stepper 2 bước khi ở chế độ Đăng ký (Đồng bộ chuẩn Web)
                  if (_isRegisterMode) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildStepBadge(1, 'Thông tin'),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 12),
                            child: Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8)),
                          ),
                          _buildStepBadge(2, 'OTP Email'),
                        ],
                      ),
                    ),
                  ],

                  // NỘI DUNG FORM THEO TRẠNG THÁI
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
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: Color(0xFF0F172A),
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                    ),
                    TextFormField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 8,
                        color: Color(0xFF0F172A),
                      ),
                      decoration: _inputDecoration(
                        label: 'Nhập mã OTP 6 chữ số',
                        hint: '123456',
                        icon: Icons.verified_user_outlined,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['otp'],
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['otp'] != null) {
                          setState(() => _fieldErrors['otp'] = null);
                        }
                      },
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton.icon(
                          onPressed: () => setState(() {
                            _registerStep = 1;
                            _fieldErrors.clear();
                          }),
                          icon: const Icon(Icons.arrow_back_rounded, size: 16),
                          label: const Text('Đổi thông tin'),
                        ),
                        TextButton.icon(
                          onPressed: _isLoading ? null : _handleResendOtp,
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Gửi lại mã OTP'),
                        ),
                      ],
                    ),
                  ] else if (_isRegisterMode && _registerStep == 1) ...[
                    // Họ và tên
                    TextFormField(
                      controller: _fullNameController,
                      decoration: _inputDecoration(
                        label: 'Họ và tên của bạn *',
                        hint: 'VD: Nguyễn Bá Minh Tiến',
                        icon: Icons.person_outline,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['fullName'],
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['fullName'] != null) {
                          setState(() => _fieldErrors['fullName'] = null);
                        }
                      },
                    ),
                    const SizedBox(height: 14),

                    // Email nhận OTP
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: _inputDecoration(
                        label: 'Email nhận mã OTP *',
                        hint: 'VD: name@domain.com',
                        icon: Icons.email_outlined,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['email'],
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['email'] != null) {
                          setState(() => _fieldErrors['email'] = null);
                        }
                      },
                    ),
                    const SizedBox(height: 14),

                    // SĐT liên hệ
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: _inputDecoration(
                        label: 'Số điện thoại Zalo / Liên hệ',
                        hint: 'VD: 0327778888',
                        icon: Icons.phone_outlined,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['phone'],
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['phone'] != null) {
                          setState(() => _fieldErrors['phone'] = null);
                        }
                      },
                    ),
                    const SizedBox(height: 14),

                    // Mật khẩu
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: _inputDecoration(
                        label: 'Mật khẩu *',
                        hint: 'Tối thiểu 6 ký tự',
                        icon: Icons.lock_outline,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['password'],
                      ).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: const Color(0xFF64748B),
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['password'] != null) {
                          setState(() => _fieldErrors['password'] = null);
                        }
                      },
                    ),
                    const SizedBox(height: 14),

                    // Xác nhận mật khẩu
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      decoration: _inputDecoration(
                        label: 'Xác nhận lại mật khẩu *',
                        hint: 'Nhập lại mật khẩu trên',
                        icon: Icons.lock_reset_outlined,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['confirmPassword'],
                      ).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: const Color(0xFF64748B),
                          ),
                          onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                        ),
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['confirmPassword'] != null) {
                          setState(() => _fieldErrors['confirmPassword'] = null);
                        }
                      },
                    ),
                  ] else ...[
                    // FORM ĐĂNG NHẬP
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: _inputDecoration(
                        label: 'Email hoặc Số điện thoại',
                        hint: 'VD: name@domain.com hoặc 0987654321',
                        icon: Icons.person_outline,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['loginEmail'],
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['loginEmail'] != null) {
                          setState(() => _fieldErrors['loginEmail'] = null);
                        }
                      },
                    ),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: _inputDecoration(
                        label: 'Mật khẩu',
                        hint: 'Nhập mật khẩu',
                        icon: Icons.lock_outline,
                        colorScheme: colorScheme,
                        errorText: _fieldErrors['loginPassword'],
                      ).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: const Color(0xFF64748B),
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      onChanged: (v) {
                        if (_fieldErrors['loginPassword'] != null) {
                          setState(() => _fieldErrors['loginPassword'] = null);
                        }
                      },
                    ),
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
                  ],

                  const SizedBox(height: 18),

                  // Nút Đăng nhập / Đăng ký
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
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                            )
                          : Text(
                              _isRegisterMode
                                  ? (_registerStep == 1 ? 'Tiếp Tục: Gửi Mã OTP Xác Thực →' : 'Xác Thực & Hoàn Tất')
                                  : 'Đăng Nhập',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                            ),
                    ),
                  ),

                  if (!_isRegisterMode) ...[
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'Hoặc đăng nhập với',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 12.5),
                          ),
                        ),
                        const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                      ],
                    ),
                    const SizedBox(height: 16),

                    SizedBox(
                      height: 50,
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : _handleGoogleSignIn,
                        icon: Image.asset(
                          'assets/images/google_logo.png',
                          width: 20,
                          height: 20,
                          errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 24, color: Colors.red),
                        ),
                        label: const Text(
                          'Tiếp tục với Google',
                          style: TextStyle(color: Color(0xFF0F172A), fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          backgroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Toggle Đăng nhập / Đăng ký
                  Center(
                    child: TextButton(
                      onPressed: () => setState(() {
                        _isRegisterMode = !_isRegisterMode;
                        _registerStep = 1;
                        _errorMessage = null;
                        _fieldErrors.clear();
                        _passwordController.clear();
                        _confirmPasswordController.clear();
                        _otpController.clear();
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
          width: 22,
          height: 22,
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
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: done
                  ? const Color(0xFF0F172A)
                  : (active ? Colors.white : const Color(0xFF64748B)),
            ),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          title,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: active ? FontWeight.w800 : FontWeight.w600,
            color: active ? const Color(0xFF0F172A) : const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }

  // =============================================================================
  // NGHIỆP VỤ: ĐỊNH DẠNG Ô NHẬP KÈM INLINE VALIDATION VÀ VIỀN ĐỎ CHUẨN XÁC
  // - Hiển thị chữ lỗi màu đỏ trực tiếp ngay dưới chân ô nhập liệu (errorText)
  // - Khi có lỗi, đổi toàn bộ viền và icon sang màu đỏ cảnh báo (Color(0xFFEF4444))
  // =============================================================================
  InputDecoration _inputDecoration({
    required String label,
    String? hint,
    required IconData icon,
    required ColorScheme colorScheme,
    String? errorText,
  }) {
    final hasError = errorText != null && errorText.isNotEmpty;
    return InputDecoration(
      prefixIcon: Icon(
        icon,
        color: hasError ? const Color(0xFFEF4444) : const Color(0xFF64748B),
        size: 20,
      ),
      labelText: label,
      labelStyle: TextStyle(
        color: hasError ? const Color(0xFFEF4444) : const Color(0xFF64748B),
        fontSize: 14,
        fontWeight: hasError ? FontWeight.w600 : FontWeight.w500,
      ),
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
      errorText: errorText,
      errorStyle: const TextStyle(
        color: Color(0xFFEF4444),
        fontSize: 12,
        fontWeight: FontWeight.w600,
      ),
      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(
          color: hasError ? const Color(0xFFEF4444) : const Color(0xFFE2E8F0),
          width: hasError ? 1.5 : 1.2,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(
          color: hasError ? const Color(0xFFEF4444) : const Color(0xFFFF4783),
          width: 1.8,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.8),
      ),
      filled: true,
      fillColor: Colors.white,
    );
  }
}
