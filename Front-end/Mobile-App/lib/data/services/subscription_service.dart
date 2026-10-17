import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../repositories/auth_repository.dart';

class SubscriptionService {
  static final SubscriptionService _instance = SubscriptionService._internal();
  factory SubscriptionService() => _instance;
  SubscriptionService._internal();

  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());
  static const int maxFreeScansPerMonth = 30;

  /// Kiểm tra tài khoản hiện tại có phải gói PRO không
  Future<bool> isPro() async {
    final plan = await AuthRepository().getSubscriptionPlan();
    return plan.toUpperCase() == 'PRO';
  }

  /// Lấy mã định danh đếm lượt quét trong tháng cho user
  String _getMonthKey(String userId) {
    final now = DateTime.now();
    return 'ai_scan_count_${userId}_${now.year}_${now.month.toString().padLeft(2, '0')}';
  }

  /// Lấy số lượng hóa đơn đã quét trong tháng hiện tại
  Future<int> getMonthlyScanCount() async {
    final userId = await AuthRepository().getUserId() ?? 'unknown_user';
    final key = _getMonthKey(userId);
    final val = await _storage.read(key: key);
    return int.tryParse(val ?? '0') ?? 0;
  }

  /// Lấy số lượt quét miễn phí còn lại
  Future<int> getRemainingFreeScans() async {
    if (await isPro()) return 999999;
    final used = await getMonthlyScanCount();
    final remaining = maxFreeScansPerMonth - used;
    return remaining > 0 ? remaining : 0;
  }

  /// Kiểm tra có thể tiếp tục quét không
  Future<bool> canScan() async {
    if (await isPro()) return true;
    final used = await getMonthlyScanCount();
    return used < maxFreeScansPerMonth;
  }

  /// Ghi nhận 1 lượt quét AI thành công (chỉ đếm với tài khoản Free)
  Future<void> recordScan() async {
    if (await isPro()) return;
    final userId = await AuthRepository().getUserId() ?? 'unknown_user';
    final key = _getMonthKey(userId);
    final current = await getMonthlyScanCount();
    await _storage.write(key: key, value: (current + 1).toString());
  }
}
