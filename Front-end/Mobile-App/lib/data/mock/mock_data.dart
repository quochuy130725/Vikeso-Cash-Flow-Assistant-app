import 'dart:math';
import '../services/billing_service.dart';

/// ============================================================================
/// 🟢 FINAUTO / VIKESO - BỘ MOCK DATA DÀNH CHO DEMO KHÁCH HÀNG
/// ============================================================================
/// - Cờ bật/tắt: [MockData.useMockDemo]
/// - Khi = true: App chạy hoàn toàn độc lập, mượt mà 100%, không cần backend.
/// - Khi = false: Tự động chuyển về gọi backend thật (API/MongoDB).
/// ============================================================================
class MockData {
  /// 🔘 CỜ BẬT/TẮT MOCK DATA (Thay đổi tại đây hoặc gọi MockData.useMockDemo = false)
  static bool useMockDemo = true;

  // 🏪 Thông tin Cửa hàng Demo
  static const String demoUserId = 'demo_user_bacuong';
  static const String demoShopName = 'Vựa Sầu Riêng Ba Cường';
  static const String demoEmail = 'bacuong.store@gmail.com';
  static const String demoPhone = '0908 123 456';
  static const String demoRole = 'ADMIN'; // ADMIN để demo được cả trang Quản trị hệ thống
  static const String demoPlan = 'PRO';   // PRO để mở khóa toàn bộ tính năng

  // ============================================================================
  // 1. DANH SÁCH GIAO DỊCH THU / CHI (TỰ ĐỘNG KHỚP VỚI NGÀY GIỜ HIỆN TẠI)
  // ============================================================================
  static List<Map<String, dynamic>>? _cachedTransactions;

  static List<Map<String, dynamic>> getTransactions() {
    if (_cachedTransactions != null) {
      return List<Map<String, dynamic>>.from(_cachedTransactions!);
    }
    _cachedTransactions = _generateInitialTransactions();
    return List<Map<String, dynamic>>.from(_cachedTransactions!);
  }

  /// Thêm giao dịch mới (khi người dùng quét hóa đơn và bấm Lưu trên SplitScreen)
  static void addTransaction(Map<String, dynamic> tx) {
    _cachedTransactions ??= _generateInitialTransactions();
    _cachedTransactions!.insert(0, tx);
  }

  /// Reset lại dữ liệu demo ban đầu
  static void resetData() {
    _cachedTransactions = _generateInitialTransactions();
  }

  static List<Map<String, dynamic>> _generateInitialTransactions() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    DateTime atTime(DateTime base, int hour, int minute) {
      return DateTime(base.year, base.month, base.day, hour, minute);
    }

    final List<Map<String, dynamic>> list = [];

    // --------------------------------------------------------------------------
    // 📅 HÔM NAY (Today)
    // --------------------------------------------------------------------------
    list.addAll([
      {
        '_id': 'tx_today_1',
        'id': 'tx_today_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 4850000,
        'reason': 'POS kết ca sáng - Quầy bán sỉ & lẻ quầy 1',
        'transactionDate': atTime(today, 11, 45).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_today_2',
        'id': 'tx_today_2',
        'transactionType': 'THU',
        'category': 'Hoa Don Le',
        'totalAmount': 1850000,
        'reason': 'Khách lẻ chị Mai - 2 thùng sầu riêng Ri6 (6kg x 95.000đ/kg)',
        'transactionDate': atTime(today, 10, 30).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
      {
        '_id': 'tx_today_3',
        'id': 'tx_today_3',
        'transactionType': 'CHI',
        'category': 'Nguyên liệu',
        'totalAmount': 380000,
        'reason': 'Mua 30 thùng xốp cỡ đại & băng dính đóng hàng',
        'transactionDate': atTime(today, 9, 50).toIso8601String(),
        'status': 'VALID',
        'source': 'MANUAL',
      },
      {
        '_id': 'tx_today_4',
        'id': 'tx_today_4',
        'transactionType': 'THU',
        'category': 'Hoa Don Le',
        'totalAmount': 2400000,
        'reason': 'Khách sỉ đặt cọc đơn Musang King giao chiều',
        'transactionDate': atTime(today, 9, 15).toIso8601String(),
        'status': 'VALID',
        'source': 'TELEGRAM',
      },
      {
        '_id': 'tx_today_5',
        'id': 'tx_today_5',
        'transactionType': 'CHI',
        'category': 'Nhân công',
        'totalAmount': 250000,
        'reason': 'Phụ cấp tiền cơm trưa 2 nhân viên ca sáng',
        'transactionDate': atTime(today, 8, 40).toIso8601String(),
        'status': 'VALID',
        'source': 'MANUAL',
      },
      {
        '_id': 'tx_today_6',
        'id': 'tx_today_6',
        'transactionType': 'CHI',
        'category': 'Khác',
        'totalAmount': 160000,
        'reason': 'Cước xe ba gác chuyển hàng ra bến xe Miền Tây',
        'transactionDate': atTime(today, 7, 20).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 HÔM QUA (Yesterday)
    // --------------------------------------------------------------------------
    final yest = today.subtract(const Duration(days: 1));
    list.addAll([
      {
        '_id': 'tx_yest_1',
        'id': 'tx_yest_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 6200000,
        'reason': 'POS kết ca tối tổng kết cả ngày',
        'transactionDate': atTime(yest, 21, 15).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_yest_2',
        'id': 'tx_yest_2',
        'transactionType': 'THU',
        'category': 'Hoa Don Le',
        'totalAmount': 3200000,
        'reason': 'Đơn sỉ 50kg sầu Dona giao Nhà hàng Hải Yến',
        'transactionDate': atTime(yest, 16, 40).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
      {
        '_id': 'tx_yest_3',
        'id': 'tx_yest_3',
        'transactionType': 'CHI',
        'category': 'Điện nước',
        'totalAmount': 1850000,
        'reason': 'Tiền điện kho lạnh bảo quản sầu riêng tháng 10',
        'transactionDate': atTime(yest, 14, 10).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
      {
        '_id': 'tx_yest_4',
        'id': 'tx_yest_4',
        'transactionType': 'CHI',
        'category': 'Nhân công',
        'totalAmount': 1200000,
        'reason': 'Trả lương theo tuần phụ kho bốc vác',
        'transactionDate': atTime(yest, 10, 0).toIso8601String(),
        'status': 'VALID',
        'source': 'MANUAL',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 2 NGÀY TRƯỚC (2 days ago)
    // --------------------------------------------------------------------------
    final d2 = today.subtract(const Duration(days: 2));
    list.addAll([
      {
        '_id': 'tx_d2_1',
        'id': 'tx_d2_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 5400000,
        'reason': 'POS kết ca chiều quầy 1',
        'transactionDate': atTime(d2, 18, 30).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_d2_2',
        'id': 'tx_d2_2',
        'transactionType': 'THU',
        'category': 'So Tay',
        'totalAmount': 2850000,
        'reason': 'Sổ tay - Chú Năm mua sỉ 40kg cơm sầu chuồng bò',
        'transactionDate': atTime(d2, 15, 20).toIso8601String(),
        'status': 'VALID',
        'source': 'MANUAL',
      },
      {
        '_id': 'tx_d2_3',
        'id': 'tx_d2_3',
        'transactionType': 'CHI',
        'category': 'Nguyên liệu',
        'totalAmount': 520000,
        'reason': 'Nhập bao bì túi hút chân không & tem truy xuất',
        'transactionDate': atTime(d2, 11, 45).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 3 NGÀY TRƯỚC (3 days ago)
    // --------------------------------------------------------------------------
    final d3 = today.subtract(const Duration(days: 3));
    list.addAll([
      {
        '_id': 'tx_d3_1',
        'id': 'tx_d3_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 7100000,
        'reason': 'POS kết ca tối ngày cuối tuần',
        'transactionDate': atTime(d3, 21, 0).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_d3_2',
        'id': 'tx_d3_2',
        'transactionType': 'THU',
        'category': 'Hoa Don Le',
        'totalAmount': 1950000,
        'reason': 'Khách lẻ ghé vựa mua sỉ mang biếu',
        'transactionDate': atTime(d3, 14, 15).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
      {
        '_id': 'tx_d3_3',
        'id': 'tx_d3_3',
        'transactionType': 'CHI',
        'category': 'Điện nước',
        'totalAmount': 420000,
        'reason': 'Tiền nước sinh hoạt & vệ sinh sân bãi vựa',
        'transactionDate': atTime(d3, 10, 30).toIso8601String(),
        'status': 'VALID',
        'source': 'MANUAL',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 4 NGÀY TRƯỚC (4 days ago)
    // --------------------------------------------------------------------------
    final d4 = today.subtract(const Duration(days: 4));
    list.addAll([
      {
        '_id': 'tx_d4_1',
        'id': 'tx_d4_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 4600000,
        'reason': 'POS kết ca',
        'transactionDate': atTime(d4, 20, 30).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_d4_2',
        'id': 'tx_d4_2',
        'transactionType': 'CHI',
        'category': 'Khác',
        'totalAmount': 1500000,
        'reason': 'Xe tải chở sầu từ Cai Lậy lên bến',
        'transactionDate': atTime(d4, 13, 0).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
      {
        '_id': 'tx_d4_3',
        'id': 'tx_d4_3',
        'transactionType': 'THU',
        'category': 'Hoa Don Le',
        'totalAmount': 1650000,
        'reason': 'Khách quen đặt 20kg cơm đông lạnh',
        'transactionDate': atTime(d4, 9, 45).toIso8601String(),
        'status': 'VALID',
        'source': 'TELEGRAM',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 5 NGÀY TRƯỚC (5 days ago)
    // --------------------------------------------------------------------------
    final d5 = today.subtract(const Duration(days: 5));
    list.addAll([
      {
        '_id': 'tx_d5_1',
        'id': 'tx_d5_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 5100000,
        'reason': 'POS kết ca tối',
        'transactionDate': atTime(d5, 21, 10).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_d5_2',
        'id': 'tx_d5_2',
        'transactionType': 'CHI',
        'category': 'Nguyên liệu',
        'totalAmount': 450000,
        'reason': 'Mua dao gọt chuyên dụng & bao tay bảo hộ',
        'transactionDate': atTime(d5, 15, 30).toIso8601String(),
        'status': 'VALID',
        'source': 'SCAN',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 6 NGÀY TRƯỚC (6 days ago)
    // --------------------------------------------------------------------------
    final d6 = today.subtract(const Duration(days: 6));
    list.addAll([
      {
        '_id': 'tx_d6_1',
        'id': 'tx_d6_1',
        'transactionType': 'THU',
        'category': 'POS Ket Ca',
        'totalAmount': 5900000,
        'reason': 'POS kết ca chiều thứ 7',
        'transactionDate': atTime(d6, 19, 45).toIso8601String(),
        'status': 'VALID',
        'source': 'POS',
      },
      {
        '_id': 'tx_d6_2',
        'id': 'tx_d6_2',
        'transactionType': 'CHI',
        'category': 'Khác',
        'totalAmount': 650000,
        'reason': 'Bảo trì máy in bill & sửa mạng wifi quầy thu ngân',
        'transactionDate': atTime(d6, 11, 15).toIso8601String(),
        'status': 'VALID',
        'source': 'MANUAL',
      },
    ]);

    // --------------------------------------------------------------------------
    // 📅 CÁC GIAO DỊCH KHÁC TRONG THÁNG NÀY (Đảm bảo số liệu tháng đẹp mắt)
    // --------------------------------------------------------------------------
    for (int dayOffset = 7; dayOffset <= 18; dayOffset++) {
      final prevDate = today.subtract(Duration(days: dayOffset));
      if (prevDate.month == today.month) {
        list.add({
          '_id': 'tx_month_thu_$dayOffset',
          'id': 'tx_month_thu_$dayOffset',
          'transactionType': 'THU',
          'category': (dayOffset % 2 == 0) ? 'POS Ket Ca' : 'Hoa Don Le',
          'totalAmount': 3200000 + (dayOffset * 150000),
          'reason': 'Doanh thu bán hàng ngày ${prevDate.day}/${prevDate.month}',
          'transactionDate': atTime(prevDate, 17, 30).toIso8601String(),
          'status': 'VALID',
          'source': 'POS',
        });
        if (dayOffset % 3 == 0) {
          list.add({
            '_id': 'tx_month_chi_$dayOffset',
            'id': 'tx_month_chi_$dayOffset',
            'transactionType': 'CHI',
            'category': (dayOffset % 6 == 0) ? 'Nhân công' : 'Nguyên liệu',
            'totalAmount': 750000 + (dayOffset * 50000),
            'reason': 'Chi phí vận hành & vật tư ngày ${prevDate.day}/${prevDate.month}',
            'transactionDate': atTime(prevDate, 10, 0).toIso8601String(),
            'status': 'VALID',
            'source': 'MANUAL',
          });
        }
      }
    }

    return list;
  }

  // ============================================================================
  // 2. MOCK OCR KHI QUÉT ẢNH HÓA ĐƠN (POST /api/scan-receipt)
  // ============================================================================
  static Map<String, dynamic> getScanReceiptMockResult() {
    final now = DateTime.now();
    return {
      'success': true,
      'items': [
        {
          'transactionType': 'CHI',
          'category': 'Nguyên liệu',
          'reason': 'Nhập 50 thùng xốp cỡ lớn loại dày & 5 cuộn băng keo',
          'aiRawData': {
            'MucDoTinCay': '99.4%',
            'CacKhoanTien': [750000, 150000],
            'NhaCungCap': 'Đại lý Bao Bì Thuận Phát',
            'NgayGiaoDich': now.toIso8601String(),
            'GhiChu': 'Đã nhận đủ hàng tại cửa hàng',
          },
        },
        {
          'transactionType': 'CHI',
          'category': 'Khác',
          'reason': 'Cước xe ba gác chở bao bì từ kho Thuận Phát về vựa',
          'aiRawData': {
            'MucDoTinCay': '98.6%',
            'CacKhoanTien': [150000],
            'NhaCungCap': 'Bác Tư xe ba gác',
            'NgayGiaoDich': now.toIso8601String(),
          },
        },
      ],
    };
  }

  // ============================================================================
  // 3. MOCK QUẢN TRỊ HỆ THỐNG (ADMIN DASHBOARD)
  // ============================================================================
  static Map<String, dynamic> getAdminOverview() {
    return {
      'totalUsers': 142,
      'proUsers': 48,
      'totalRevenue': 4752000, // Doanh thu nạp PRO qua VietQR
      'totalIncome': 185600000, // Doanh thu các cửa hàng cộng dồn
      'totalExpense': 62400000, // Chi phí các cửa hàng cộng dồn
      'systemHealth': 'Hoạt động 100% bình thường',
      'activeToday': 68,
    };
  }

  static Map<String, dynamic> getAdminUsers({String? search}) {
    final List<Map<String, dynamic>> allUsers = [
      {
        '_id': 'user_demo_1',
        'id': 'user_demo_1',
        'email': 'bacuong.store@gmail.com',
        'shopName': 'Vựa Sầu Riêng Ba Cường',
        'role': 'ADMIN',
        'subscriptionPlan': 'PRO',
        'phone': '0908 123 456',
        'createdAt': '2026-03-01T08:00:00.000Z',
      },
      {
        '_id': 'user_demo_2',
        'id': 'user_demo_2',
        'email': 'tiemtra.anmoc@gmail.com',
        'shopName': 'Tiệm Trà & Cafe An Mộc',
        'role': 'OWNER',
        'subscriptionPlan': 'PRO',
        'phone': '0912 345 678',
        'createdAt': '2026-03-05T09:30:00.000Z',
      },
      {
        '_id': 'user_demo_3',
        'id': 'user_demo_3',
        'email': 'taphoa.cobe@gmail.com',
        'shopName': 'Tạp Hóa Cô Bé (Chợ Bến Thành)',
        'role': 'OWNER',
        'subscriptionPlan': 'FREE',
        'phone': '0988 765 432',
        'createdAt': '2026-03-10T14:15:00.000Z',
      },
      {
        '_id': 'user_demo_4',
        'id': 'user_demo_4',
        'email': 'phuocloc.bakery@gmail.com',
        'shopName': 'Lò Bánh Mì Phước Lộc',
        'role': 'OWNER',
        'subscriptionPlan': 'PRO',
        'phone': '0903 888 999',
        'createdAt': '2026-03-12T11:20:00.000Z',
      },
      {
        '_id': 'user_demo_5',
        'id': 'user_demo_5',
        'email': 'tiemnail.quynhanh@gmail.com',
        'shopName': 'Quỳnh Anh Beauty & Nail',
        'role': 'OWNER',
        'subscriptionPlan': 'FREE',
        'phone': '0933 222 111',
        'createdAt': '2026-03-18T16:00:00.000Z',
      },
      {
        '_id': 'user_demo_6',
        'id': 'user_demo_6',
        'email': 'comtam.baquyen@gmail.com',
        'shopName': 'Cơm Tấm Bà Quyên',
        'role': 'OWNER',
        'subscriptionPlan': 'PRO',
        'phone': '0909 333 444',
        'createdAt': '2026-03-22T07:45:00.000Z',
      },
    ];

    List<Map<String, dynamic>> filtered = allUsers;
    if (search != null && search.trim().isNotEmpty) {
      final q = search.toLowerCase().trim();
      filtered = allUsers.where((u) {
        final email = (u['email'] ?? '').toString().toLowerCase();
        final name = (u['shopName'] ?? '').toString().toLowerCase();
        return email.contains(q) || name.contains(q);
      }).toList();
    }

    return {
      'success': true,
      'users': filtered,
      'total': filtered.length,
    };
  }

  // ============================================================================
  // 4. MOCK THANH TOÁN VIETQR NÂNG CẤP PRO
  // ============================================================================
  static BillingOrder getMockBillingOrder() {
    final now = DateTime.now();
    final code = 'VK${Random().nextInt(90000) + 10000}';
    return BillingOrder(
      orderCode: code,
      plan: 'PRO',
      amount: 99000,
      status: 'PENDING',
      transferContent: code,
      qrUrl: 'https://img.vietqr.io/image/MB-0908123456-compact2.png?amount=99000&addInfo=$code&accountName=VIKESO%20FINTECH',
      expiresAt: now.add(const Duration(minutes: 15)),
      createdAt: now,
    );
  }
}
