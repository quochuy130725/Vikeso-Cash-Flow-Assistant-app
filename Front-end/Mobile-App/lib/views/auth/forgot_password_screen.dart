import 'dart:async';
import 'package:flutter/material.dart';
import '../../data/repositories/auth_repository.dart';

/// ForgotPasswordScreen - Quên mật khẩu qua mã OTP gửi về email.
/// Bước 1: Nhập email/SĐT → gửi mã.
/// Bước 2: Nhập mã 6 số + mật khẩu mới → đặt lại mật khẩu.
class ForgotPasswordScreen extends StatefulWidget {
  final String? initialIdentifier;
  const ForgotPasswordScreen({super.key, this.initialIdentifier});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _requestFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _codeController = TextEditingController();
  final _newPassController = TextEditingController();
  final _confirmPassController = TextEditingController();
  final _authRepo = AuthRepository();

  bool _codeSent = false;
  bool _isLoading = false;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  String? _errorMessage;
  String? _infoMessage;
  String _targetEmail = '';
  int _resendSeconds = 0;
  Timer? _resendTimer;

  @override
  void initState() {
    super.initState();
    _identifierController.text = widget.initialIdentifier?.trim() ?? '';
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    _identifierController.dispose();
    _codeController.dispose();
    _newPassController.dispose();
    _confirmPassController.dispose();
    super.dispose();
  }

  void _startResendCountdown() {
    _resendTimer?.cancel();
    setState(() => _resendSeconds = 60);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      if (_resendSeconds <= 1) {
        t.cancel();
        setState(() => _resendSeconds = 0);
      } else {
        setState(() => _resendSeconds--);
      }
    });
  }

  Future<void> _sendCode() async {
    if (!_codeSent && !_requestFormKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMessage = null; _infoMessage = null; });

    final res = await _authRepo.forgotPassword(_identifierController.text.trim());

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      setState(() {
        _codeSent = true;
        _targetEmail = res['email']?.toString() ?? _identifierController.text.trim();
        _infoMessage = res['message']?.toString();
      });
      _startResendCountdown();
    } else {
      setState(() => _errorMessage = res['message']?.toString());
    }
  }

  Future<void> _resetPassword() async {
    if (!_resetFormKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMessage = null; _infoMessage = null; });

    final res = await _authRepo.resetPassword(
      identifier: _targetEmail,
      code: _codeController.text.trim(),
      newPassword: _newPassController.text,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(res['message']?.toString() ?? 'Đặt lại mật khẩu thành công!'),
        backgroundColor: Colors.green,
      ));
      Navigator.of(context).pop(_targetEmail);
    } else {
      setState(() => _errorMessage = res['message']?.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Quên mật khẩu', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _codeSent ? Icons.mark_email_read_outlined : Icons.lock_reset,
                    size: 42,
                    color: colorScheme.primaryContainer,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                _codeSent ? 'Nhập mã xác nhận' : 'Đặt lại mật khẩu',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _codeSent
                    ? 'Chúng tôi đã gửi mã 6 số tới email của bạn. Mã có hiệu lực trong 10 phút.'
                    : 'Nhập email hoặc số điện thoại đã đăng ký. Chúng tôi sẽ gửi mã xác nhận về email của bạn.',
                textAlign: TextAlign.center,
                style: TextStyle(color: colorScheme.onSurfaceVariant, fontSize: 14),
              ),
              const SizedBox(height: 24),

              if (_errorMessage != null) _banner(_errorMessage!, isError: true),
              if (_infoMessage != null && _errorMessage == null) _banner(_infoMessage!, isError: false),

              if (!_codeSent) _buildRequestForm(colorScheme) else _buildResetForm(colorScheme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRequestForm(ColorScheme colorScheme) {
    return Form(
      key: _requestFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _identifierController,
            keyboardType: TextInputType.emailAddress,
            decoration: _inputDecoration(
              label: 'Email hoặc Số điện thoại',
              hint: 'VD: email@example.com hoặc 0987654321',
              icon: Icons.person_outline,
              colorScheme: colorScheme,
            ),
            validator: (v) => (v == null || v.trim().isEmpty)
                ? 'Vui lòng nhập email hoặc số điện thoại'
                : null,
          ),
          const SizedBox(height: 24),
          _primaryButton(
            label: 'Gửi mã xác nhận',
            onPressed: _sendCode,
            colorScheme: colorScheme,
          ),
        ],
      ),
    );
  }

  Widget _buildResetForm(ColorScheme colorScheme) {
    return Form(
      key: _resetFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _codeController,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, letterSpacing: 10, fontWeight: FontWeight.bold),
            decoration: _inputDecoration(
              label: 'Mã xác nhận (6 số)',
              icon: Icons.pin_outlined,
              colorScheme: colorScheme,
            ).copyWith(counterText: ''),
            validator: (v) {
              if (v == null || v.trim().length != 6 || int.tryParse(v.trim()) == null) {
                return 'Mã xác nhận gồm 6 chữ số';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _newPassController,
            obscureText: _obscureNew,
            decoration: _inputDecoration(
              label: 'Mật khẩu mới',
              icon: Icons.lock_outline,
              colorScheme: colorScheme,
            ).copyWith(
              suffixIcon: IconButton(
                icon: Icon(_obscureNew ? Icons.visibility : Icons.visibility_off,
                    color: colorScheme.outlineVariant),
                onPressed: () => setState(() => _obscureNew = !_obscureNew),
              ),
            ),
            validator: (v) => (v == null || v.length < 6) ? 'Mật khẩu ít nhất 6 ký tự' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _confirmPassController,
            obscureText: _obscureConfirm,
            decoration: _inputDecoration(
              label: 'Xác nhận mật khẩu mới',
              icon: Icons.check_circle_outline,
              colorScheme: colorScheme,
            ).copyWith(
              suffixIcon: IconButton(
                icon: Icon(_obscureConfirm ? Icons.visibility : Icons.visibility_off,
                    color: colorScheme.outlineVariant),
                onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
              ),
            ),
            validator: (v) => v != _newPassController.text ? 'Mật khẩu xác nhận không khớp' : null,
          ),
          const SizedBox(height: 24),
          _primaryButton(
            label: 'Đặt lại mật khẩu',
            onPressed: _resetPassword,
            colorScheme: colorScheme,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Chưa nhận được mã? ', style: TextStyle(color: colorScheme.onSurfaceVariant)),
              TextButton(
                onPressed: (_resendSeconds > 0 || _isLoading) ? null : _sendCode,
                child: Text(_resendSeconds > 0 ? 'Gửi lại sau ${_resendSeconds}s' : 'Gửi lại mã'),
              ),
            ],
          ),
          TextButton(
            onPressed: _isLoading
                ? null
                : () => setState(() {
                      _codeSent = false;
                      _errorMessage = null;
                      _infoMessage = null;
                      _codeController.clear();
                    }),
            child: const Text('Đổi email / số điện thoại'),
          ),
        ],
      ),
    );
  }

  Widget _banner(String msg, {required bool isError}) {
    final color = isError ? Colors.red : Colors.green;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(isError ? Icons.error_outline : Icons.check_circle_outline, color: color, size: 20),
          const SizedBox(width: 8),
          Expanded(child: Text(msg, style: TextStyle(color: color.shade700, fontSize: 13))),
        ],
      ),
    );
  }

  Widget _primaryButton({
    required String label,
    required VoidCallback onPressed,
    required ColorScheme colorScheme,
  }) {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
        onPressed: _isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: colorScheme.primaryContainer,
          foregroundColor: colorScheme.onPrimaryContainer,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        child: _isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
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
      border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.outlineVariant)),
      enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.outlineVariant.withValues(alpha: 0.5))),
      focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.primary, width: 2)),
    );
  }
}
