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
    setState(() {
      _isLoading = false;
      _currentOrder = order;
      if (order != null && order.expiresAt != null) {
        final diff = order.expiresAt!.difference(DateTime.now()).inSeconds;
        _remainingSeconds = diff > 0 ? diff : 15 * 60;
      } else {
        _remainingSeconds = 15 * 60;
      }
    });

    if (order != null) {
      if (order.status == 'PAID') {
        _onPaymentSuccess();
      } else {
        _startTimers(order.orderCode);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không thể tạo đơn hàng thanh toán. Thử lại sau!')),
      );
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
            Icon(Icons.check_circle, color: Colors.green, size: 28),
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
              backgroundColor: const Color(0xFFFF5C8D),
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
    const primaryPink = Color(0xFFFF5C8D);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nâng cấp gói VikeSo PRO', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: primaryPink,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2C1654), Color(0xFFFF5C8D)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: primaryPink.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFD700).withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFFD700), width: 1.5),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.workspace_premium, color: Color(0xFFFFD700), size: 20),
                        SizedBox(width: 6),
                        Text(
                          'VIKESO PRO MEMBER',
                          style: TextStyle(
                            color: Color(0xFFFFD700),
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Trợ lý Tài chính & Thu chi Toàn diện',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '99.000 đ / 30 ngày',
                    style: TextStyle(color: Color(0xFFFFE082), fontSize: 26, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Danh sách đặc quyền
            const Text(
              'Đặc quyền gói PRO:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildBenefitItem(Icons.document_scanner, 'Quét hóa đơn AI (Gemini OCR) không giới hạn'),
            _buildBenefitItem(Icons.send_rounded, 'Báo cáo chốt ca tự động qua Telegram Bot & Email 22:00'),
            _buildBenefitItem(Icons.insights, 'Biểu đồ phân tích tài chính dòng tiền chuyên sâu'),
            _buildBenefitItem(Icons.filter_alt, 'Lưới lọc thông minh chống trùng lặp hóa đơn POS'),
            _buildBenefitItem(Icons.table_chart, 'Xuất báo cáo doanh thu & thu chi ra Excel'),

            const SizedBox(height: 28),

            // Khu vực thanh toán VietQR nếu đã tạo đơn
            if (_currentOrder != null && !_isPaid) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey[300]!),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Quét mã VietQR chuyển khoản',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.timer_outlined, color: Colors.red, size: 16),
                              const SizedBox(width: 4),
                              Text(
                                _formatTimer(_remainingSeconds),
                                style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),

                    // Ảnh QR
                    if (_currentOrder!.qrUrl.isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          _currentOrder!.qrUrl,
                          width: 240,
                          height: 240,
                          fit: BoxFit.contain,
                          loadingBuilder: (ctx, child, progress) {
                            if (progress == null) return child;
                            return const SizedBox(
                              width: 240,
                              height: 240,
                              child: Center(child: CircularProgressIndicator()),
                            );
                          },
                          errorBuilder: (ctx, _, __) => const SizedBox(
                            width: 240,
                            height: 240,
                            child: Center(child: Text('Không tải được mã QR')),
                          ),
                        ),
                      ),

                    const SizedBox(height: 16),

                    // Chi tiết tài khoản
                    _buildCopyableRow('Ngân hàng', 'Vietcombank (VCB)', null),
                    _buildCopyableRow('Số tài khoản', '1026466727', () => _copyToClipboard('1026466727', 'Số tài khoản')),
                    _buildCopyableRow('Tên chủ tài khoản', 'VIKESO', null),
                    _buildCopyableRow('Số tiền', '99.000 VNĐ', () => _copyToClipboard('99000', 'Số tiền')),
                    _buildCopyableRow('Nội dung chuyển khoản', _currentOrder!.transferContent, () => _copyToClipboard(_currentOrder!.transferContent, 'Nội dung chuyển khoản')),

                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.blue, size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Hệ thống tự động kích hoạt gói PRO ngay sau khi nhận được tiền (thường từ 3 - 10 giây).',
                              style: TextStyle(fontSize: 12, color: Colors.black87),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      onPressed: _isLoading ? null : _checkPaymentNow,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Tôi đã chuyển khoản - Kiểm tra ngay'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(color: primaryPink.withValues(alpha: 0.5)),
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
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.qr_code_2, color: Colors.white, size: 24),
                label: Text(
                  _isLoading ? 'Đang tạo đơn...' : 'Thanh toán VietQR ngay (99.000 đ)',
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBenefitItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check, color: Colors.green, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCopyableRow(String label, String value, VoidCallback? onCopy) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Row(
            children: [
              Text(
                value,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              if (onCopy != null) ...[
                const SizedBox(width: 4),
                IconButton(
                  onPressed: onCopy,
                  icon: const Icon(Icons.copy, size: 16, color: Color(0xFFFF5C8D)),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  splashRadius: 16,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
