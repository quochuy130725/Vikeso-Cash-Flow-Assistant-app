import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';
import '../../main.dart';

// =============================================================================
// NGHIỆP VỤ BƯỚC 1: BỘ KIỂM SOÁT ĐIỀU KIỆN CỬA HÀNG (STORE GUARD)
// - Dùng để: Kiểm tra và đảm bảo tài khoản Owner đã có cửa hàng hoạt động (APPROVED)
//   trước khi cho phép thực hiện các tác vụ kế toán cốt lõi (Quét hóa đơn, Nhập thu chi).
// - Nếu chưa có cửa hàng (NO_STORE) hoặc đang chờ duyệt (PENDING):
//   Khóa tác vụ và hiển thị BottomSheet hướng dẫn thân thiện, dẫn người dùng tới Tab Cửa Hàng.
// =============================================================================

enum StoreStatus {
  active,
  pending,
  noStore,
}

class StoreGuardResult {
  final bool isAllowed;
  final StoreStatus status;
  final String? pendingShopName;
  final String? activeShopName;

  const StoreGuardResult({
    required this.isAllowed,
    required this.status,
    this.pendingShopName,
    this.activeShopName,
  });
}

class StoreGuard {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());

  /// Kiểm tra trạng thái cửa hàng của tài khoản hiện tại
  static Future<StoreGuardResult> checkStatus() async {
    final role = (await _storage.read(key: 'user_role'))?.toUpperCase() ?? 'OWNER';
    
    // Nếu là Nhân viên (STAFF), kế thừa trạng thái của chủ cơ sở
    if (role == 'STAFF') {
      return const StoreGuardResult(
        isAllowed: true,
        status: StoreStatus.active,
      );
    }

    String? statusStr = await _storage.read(key: 'user_shopStatus');
    String? shopName = await _storage.read(key: 'user_shopName');
    String? pendingName = await _storage.read(key: 'user_pendingShopName');

    // Nếu bộ nhớ đệm chưa có hoặc chưa rõ ràng, kiểm tra trực tiếp qua API
    if (statusStr == null || statusStr.isEmpty) {
      final token = await AuthRepository().getAccessToken();
      if (token != null && token.isNotEmpty) {
        try {
          final serverShops = await ApiService().getOwnerShops(token);
          if (serverShops.isNotEmpty) {
            final hasApproved = serverShops.any((s) => s['approvalStatus'] == 'APPROVED');
            final pendingShop = serverShops.firstWhere(
              (s) => s['approvalStatus'] == 'PENDING',
              orElse: () => <String, dynamic>{},
            );

            if (hasApproved) {
              statusStr = 'ACTIVE';
            } else if (pendingShop.isNotEmpty) {
              statusStr = 'PENDING';
              pendingName = pendingShop['shopName']?.toString() ?? '';
            } else {
              statusStr = 'NO_STORE';
            }
          } else {
            statusStr = 'NO_STORE';
          }
          await _storage.write(key: 'user_shopStatus', value: statusStr);
          if (pendingName != null && pendingName.isNotEmpty) {
            await _storage.write(key: 'user_pendingShopName', value: pendingName);
          }
        } catch (_) {}
      }
    }

    // Đánh giá trạng thái
    if (statusStr == 'ACTIVE' && shopName != null && shopName.isNotEmpty && shopName != 'Chưa thiết lập cửa hàng') {
      return StoreGuardResult(
        isAllowed: true,
        status: StoreStatus.active,
        activeShopName: shopName,
      );
    } else if (statusStr == 'PENDING' || (pendingName != null && pendingName.isNotEmpty)) {
      return StoreGuardResult(
        isAllowed: false,
        status: StoreStatus.pending,
        pendingShopName: (pendingName != null && pendingName.isNotEmpty) ? pendingName : shopName,
      );
    } else {
      return const StoreGuardResult(
        isAllowed: false,
        status: StoreStatus.noStore,
      );
    }
  }

  /// Kiểm tra và chặn hành động nếu chưa có cửa hàng hoạt động
  /// Trả về true nếu được phép tiếp tục, false nếu bị chặn
  static Future<bool> ensureStoreActive(
    BuildContext context, {
    String actionName = 'thực hiện thao tác này',
  }) async {
    final result = await checkStatus();
    if (result.isAllowed) {
      return true;
    }

    if (context.mounted) {
      await showStoreRequiredSheet(
        context,
        actionName: actionName,
        result: result,
      );
    }
    return false;
  }

  /// Hiển thị BottomSheet thông báo yêu cầu thiết lập cửa hàng
  static Future<void> showStoreRequiredSheet(
    BuildContext context, {
    required String actionName,
    StoreGuardResult? result,
  }) async {
    final guard = result ?? await checkStatus();
    final isPending = guard.status == StoreStatus.pending;

    if (!context.mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Thanh gạt modal
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 20),

            // Icon biểu trưng
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: isPending ? const Color(0xFFFFFBEB) : const Color(0xFFFFF0F5),
                shape: BoxShape.circle,
                border: Border.all(
                  color: isPending ? const Color(0xFFFDE68A) : const Color(0xFFFFD6E4),
                  width: 2,
                ),
              ),
              child: Icon(
                isPending ? Icons.pending_actions_rounded : Icons.storefront_rounded,
                size: 32,
                color: isPending ? const Color(0xFFD97706) : const Color(0xFFFF4783),
              ),
            ),
            const SizedBox(height: 16),

            // Tiêu đề
            Text(
              isPending ? 'Cửa Hàng Đang Chờ Duyệt' : 'Yêu Cầu Thiết Lập Cửa Hàng',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0F172A),
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 10),

            // Nội dung giải thích nghiệp vụ
            Text(
              isPending
                  ? 'Hồ sơ cửa hàng "${guard.pendingShopName ?? 'của bạn'}" đang được Ban Quản Trị (Admin) thẩm định chứng từ. Bạn sẽ có thể $actionName ngay khi cửa hàng được phê duyệt kích hoạt!'
                  : 'Bạn chưa có cơ sở kinh doanh nào đang hoạt động. Vui lòng tạo cửa hàng để hệ thống có thể $actionName, bóc tách doanh thu và phân loại chi phí cho cơ sở của bạn.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13.5,
                color: Color(0xFF475569),
                height: 1.45,
              ),
            ),
            const SizedBox(height: 24),

            // Nút hành động chính
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isPending ? const Color(0xFFD97706) : const Color(0xFFFF4783),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  // Chuyển sang Tab 3 (Quản lý cửa hàng)
                  MainNavigationShell.switchToTab(context, 3);
                },
                child: Text(
                  isPending ? 'Xem Trạng Thái Hồ Sơ' : 'Thiết Lập Cửa Hàng Ngay',
                  style: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Nút đóng
            SizedBox(
              width: double.infinity,
              height: 44,
              child: TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text(
                  'Để sau',
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

