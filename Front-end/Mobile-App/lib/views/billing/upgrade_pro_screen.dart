import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/billing_service.dart';

class UpgradeProScreen extends StatefulWidget {
  const UpgradeProScreen({super.key});

  @override
  State<UpgradeProScreen> createState() => _UpgradeProScreenState();
}

class _UpgradeProScreenState extends State<UpgradeProScreen> {
  final _billingService = BillingService();
  final _authRepo = AuthRepository();

  bool _isLoading = false;
  BillingOrder? _currentOrder;
  Timer? _pollingTimer;
  Timer? _countdownTimer;
  int _remainingSeconds = 15 * 60; // 15 phút
  bool _isPaid = false;

  static const Map<String, dynamic> _proPlan = {
    'key': 'PRO',
    'title': 'Gói VikeSo PRO (1 Tháng)',
    'duration': '30 ngày',
    'price': 99000,
    'priceText': '99.000 đ',
  };

  String _resolvedQrUrl() {
    final amount = _proPlan['price'] as int;
    final code = (_currentOrder?.transferContent.isNotEmpty ?? false)
        ? _currentOrder!.transferContent
        : 'VIKESO PRO';
    if (_currentOrder != null && _currentOrder!.qrUrl.trim().startsWith('http')) {
      return _currentOrder!.qrUrl;
    }
    final bankCode = _currentOrder?.bankCode ?? 'MB';
    final bankAccount = _currentOrder?.bankAccount ?? '0829100286';
    final accountName = Uri.encodeComponent(_currentOrder?.accountName ?? 'PHAM HUYNH QUOC HUY');
    return 'https://img.vietqr.io/image/$bankCode-$bankAccount-compact2.png?amount=$amount&addInfo=${Uri.encodeComponent(code)}&accountName=$accountName';
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _handleCreateOrder() async {
    setState(() => _isLoading = true);
    final userId = await _authRepo.getUserId();
    if (userId == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập lại để tiếp tục.')),
        );
        setState(() => _isLoading = false);
      }
      return;
    }

    final order = await _billingService.createOrder(userId: userId);
    if (!mounted) return;
    final fallbackCode = 'VKS${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final effectiveOrder = order ??
        BillingOrder(
          orderCode: fallbackCode,
          plan: 'PRO',
          amount: _proPlan['price'] as int,
          transferContent: 'VIKESO $fallbackCode',
          bankCode: 'MB',
          bankAccount: '0829100286',
          accountName: 'PHAM HUYNH QUOC HUY',
          qrUrl:
              'https://img.vietqr.io/image/MB-0829100286-compact2.png?amount=${_proPlan['price']}&addInfo=${Uri.encodeComponent('VIKESO $fallbackCode')}&accountName=PHAM%20HUYNH%20QUOC%20HUY',
          status: 'PENDING',
          expiresAt: DateTime.now().add(const Duration(minutes: 15)),
        );

    setState(() {
      _isLoading = false;
      _currentOrder = effectiveOrder;
      if (effectiveOrder.expiresAt != null) {
        final diff = effectiveOrder.expiresAt!.difference(DateTime.now()).inSeconds;
        _remainingSeconds = diff > 0 ? diff : 15 * 60;
      } else {
        _remainingSeconds = 15 * 60;
      }
    });

    if (effectiveOrder.status == 'PAID') {
      _onPaymentSuccess();
    } else {
      _startTimers(effectiveOrder.orderCode);
    }
  }

  void _startTimers(String orderCode) {
    _pollingTimer?.cancel();
    _countdownTimer?.cancel();

    // Polling kiểm tra trạng thái mỗi 3 giây
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      final statusOrder = await _billingService.getOrderStatus(orderCode);
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (statusOrder != null && statusOrder.status == 'PAID') {
        timer.cancel();
        _countdownTimer?.cancel();
        _onPaymentSuccess();
      } else if (statusOrder != null && statusOrder.status == 'EXPIRED') {
        timer.cancel();
        _countdownTimer?.cancel();
        setState(() {
          _currentOrder = statusOrder;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mã thanh toán đã hết hạn. Vui lòng tạo mã mới.')),
        );
      }
    });

    // Đếm ngược 15 phút
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _checkPaymentNow() async {
    if (_currentOrder == null) return;
    setState(() => _isLoading = true);
    final statusOrder = await _billingService.getOrderStatus(_currentOrder!.orderCode);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (statusOrder != null && statusOrder.status == 'PAID') {
      _pollingTimer?.cancel();
      _countdownTimer?.cancel();
      _onPaymentSuccess();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Hệ thống chưa nhận được tiền chuyển khoản. Vui lòng kiểm tra lại sau giây lát!'),
        ),
      );
    }
  }

  Future<void> _onPaymentSuccess() async {
    setState(() => _isPaid = true);
    await _authRepo.fetchUserProfile();
    if (!mounted) return;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Color(0xFFFF4783), size: 28),
            SizedBox(width: 8),
            Text('Nâng cấp thành công!'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Chúc mừng bạn đã nâng cấp thành công gói VIKESO PRO!',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text('Tài khoản của bạn đã được mở khóa toàn bộ tính năng cao cấp không giới hạn trong 30 ngày.'),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF4783),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context, true);
            },
            child: const Text('Bắt đầu sử dụng', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã sao chép $label!'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  String _formatTimer(int totalSeconds) {
    final m = totalSeconds ~/ 60;
    final s = totalSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    const primaryPink = Color(0xFFFF4783);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Nâng Cấp Gói VikeSo PRO',
          style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF0F172A), fontSize: 18, letterSpacing: -0.3),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Card - Luxury Pure White
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF0F5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFF4783), width: 1.2),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.workspace_premium, color: Color(0xFFFF4783), size: 18),
                        SizedBox(width: 6),
                        Text(
                          'GÓI VIKESO PRO',
                          style: TextStyle(
                            color: Color(0xFFFF4783),
                            fontWeight: FontWeight.w800,
                            fontSize: 12,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Trợ lý Quản lý Dòng tiền Toàn diện',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF0F172A),
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        _proPlan['priceText'] as String,
                        style: const TextStyle(
                          color: Color(0xFF0F172A),
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '/ 1 tháng (${_proPlan['duration']})',
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD0F81B),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF0F172A), width: 1),
                    ),
                    child: const Text(
                      'Tiết kiệm 80% thời gian chốt sổ hàng ngày',
                      style: TextStyle(
                        color: Color(0xFF0F172A),
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Danh sách đặc quyền
            const Text(
              'Đặc quyền gói PRO:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            _buildBenefitItem(Icons.layers_rounded, 'Quét gộp tối đa 3 ảnh hóa đơn / lần (Batch OCR) • Không giới hạn lượt'),
            _buildBenefitItem(Icons.send_rounded, 'Báo cáo chốt ca tự động qua Telegram Bot & Email 22:00'),
            _buildBenefitItem(Icons.insights, 'Biểu đồ phân tích tài chính & So sánh cùng kỳ chuyên sâu'),
            _buildBenefitItem(Icons.filter_alt, 'Lưới lọc thông minh 2 chiều chống trùng lặp hóa đơn POS'),
            _buildBenefitItem(Icons.table_chart, 'Xuất báo cáo doanh thu & hình thức thanh toán ra Excel'),

            const SizedBox(height: 28),

            // Khu vực thanh toán VietQR nếu đã tạo đơn
            if (_currentOrder != null && !_isPaid) ...[
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header: Tiêu đề + Thời gian hiệu lực
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Quét mã VietQR thanh toán',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.3,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.timer_outlined, size: 14, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(
                                _formatTimer(_remainingSeconds),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // QR Code Frame
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            _resolvedQrUrl(),
                            width: 220,
                            height: 220,
                            fit: BoxFit.contain,
                            loadingBuilder: (ctx, child, progress) {
                              if (progress == null) return child;
                              return const SizedBox(
                                width: 220,
                                height: 220,
                                child: Center(
                                  child: CircularProgressIndicator(color: Color(0xFFFF4783), strokeWidth: 2.5),
                                ),
                              );
                            },
                            errorBuilder: (ctx, _, __) => const SizedBox(
                              width: 220,
                              height: 220,
                              child: Center(
                                child: Text('Không tải được mã QR', style: TextStyle(color: Colors.grey)),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Center(
                      child: Text(
                        'Mở ứng dụng ngân hàng bất kỳ để quét mã',
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Bảng chi tiết chuyển khoản thủ công (Unified Invoice Sheet)
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow(
                            label: 'Số tiền thanh toán',
                            value: _proPlan['priceText'] as String,
                            isAmount: true,
                            onCopy: () => _copyToClipboard('${_proPlan['price']}', 'Số tiền'),
                          ),
                          const Divider(height: 1, color: Color(0xFFE2E8F0)),
                          _buildDetailRow(
                            label: 'Nội dung chuyển khoản',
                            value: _currentOrder!.transferContent,
                            isMemo: true,
                            helperText: 'Vui lòng giữ đúng nội dung để hệ thống tự động ghi nhận',
                            onCopy: () => _copyToClipboard(_currentOrder!.transferContent, 'Nội dung chuyển khoản'),
                          ),
                          const Divider(height: 1, color: Color(0xFFE2E8F0)),
                          _buildDetailRow(
                            label: 'Ngân hàng thụ hưởng',
                            value: (_currentOrder?.bankCode == 'MB' || _currentOrder?.bankCode == null)
                                ? 'MB Bank (Quân Đội)'
                                : '${_currentOrder!.bankCode} Bank',
                          ),
                          const Divider(height: 1, color: Color(0xFFE2E8F0)),
                          _buildDetailRow(
                            label: 'Số tài khoản',
                            value: _currentOrder?.bankAccount ?? '0829100286',
                            onCopy: () => _copyToClipboard(_currentOrder?.bankAccount ?? '0829100286', 'Số tài khoản'),
                          ),
                          const Divider(height: 1, color: Color(0xFFE2E8F0)),
                          _buildDetailRow(
                            label: 'Tên chủ tài khoản',
                            value: _currentOrder?.accountName ?? 'PHAM HUYNH QUOC HUY',
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Dòng trạng thái đối soát (Trang nhã, không AI slop)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_outlined, size: 16, color: Color(0xFF475569)),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Gói PRO sẽ tự động kích hoạt sau 3 - 10 giây khi nhận được thanh toán.',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF475569),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Primary Action Button
                    SizedBox(
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: _isLoading ? null : _checkPaymentNow,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF4783),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: _isLoading
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Icon(Icons.refresh_rounded, size: 20),
                        label: const Text(
                          'Tôi đã chuyển khoản - Kiểm tra ngay',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),
                    Center(
                      child: TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Hotline / Zalo hỗ trợ: 0908 123 456 (24/7)'),
                              backgroundColor: Color(0xFF0F172A),
                            ),
                          );
                        },
                        child: const Text(
                          'Cần hỗ trợ chuyển khoản? Nhấn để liên hệ',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (!_isPaid) ...[
              // Nút Tạo đơn thanh toán
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _handleCreateOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryPink,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                icon: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.qr_code_2, color: Colors.white, size: 24),
                label: Text(
                  _isLoading
                      ? 'Đang tạo mã VietQR...'
                      : 'Tạo mã VietQR thanh toán (${_proPlan['priceText']} / 1 tháng)',
                  style: const TextStyle(color: Colors.white, fontSize: 15.5, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBenefitItem(IconData icon, String text) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(5),
            decoration: const BoxDecoration(
              color: Color(0xFFD0F81B),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check, color: Color(0xFF0F172A), size: 14),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow({
    required String label,
    required String value,
    bool isAmount = false,
    bool isMemo = false,
    String? helperText,
    VoidCallback? onCopy,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                flex: 5,
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                flex: 7,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Flexible(
                      child: Text(
                        value,
                        textAlign: TextAlign.end,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: isAmount ? 15.5 : 13.5,
                          fontWeight: (isAmount || isMemo) ? FontWeight.w800 : FontWeight.w600,
                          color: isAmount ? const Color(0xFFFF4783) : const Color(0xFF0F172A),
                          letterSpacing: isMemo ? 0.8 : 0,
                        ),
                      ),
                    ),
                    if (onCopy != null) ...[
                      const SizedBox(width: 6),
                      InkWell(
                        onTap: onCopy,
                        borderRadius: BorderRadius.circular(6),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.copy_rounded, size: 11, color: Color(0xFF475569)),
                              SizedBox(width: 3),
                              Text(
                                'Sao chép',
                                style: TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF475569),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (helperText != null) ...[
            const SizedBox(height: 4),
            Text(
              helperText,
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFF94A3B8),
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

