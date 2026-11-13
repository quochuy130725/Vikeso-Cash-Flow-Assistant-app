import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../mock/mock_data.dart';

class ApiService {
  // ============================================================
  // 🔧 CẤU HÌNH - ĐỌC TỪ FILE .env (Khuyên dùng)
  // ============================================================
  static String get _baseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
  static const String _telegramBotUsername = 'FinautoDemo_bot';

  // ============================================================
  // 1. API QUÉT & LƯU ẢNH (POST /api/scan-receipt)
  // Backend tự lưu vào DB luôn, trả về danh sách receipts đã lưu
  // Response 200: { success: true, data: [...savedReceipts] }
  // Response 400: { success: false, error_type: "JUNK_IMAGE"|"BLURRY_IMAGE" }
  // ============================================================
  Future<Map<String, dynamic>> uploadReceipt({
    required File imageFile,
    required String userId,
  }) async {
    if (MockData.useMockDemo) {
      await Future.delayed(const Duration(milliseconds: 600));
      return MockData.getScanReceiptMockResult();
    }

    try {
      final uri = Uri.parse('$_baseUrl/scan-receipt');
      final request = http.MultipartRequest('POST', uri);

      request.fields['userId'] = userId;
      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );

      final streamedResponse = await request.send().timeout(
            const Duration(seconds: 60),
          );
      final response = await http.Response.fromStream(streamedResponse);
      final body = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && body['success'] == true) {
        // Thành công: trả về raw items từ Gemini để Flutter hiện SplitScreen
        final List rawItems = (body['items'] as List?) ?? [];
        return {
          'success': true,
          'items': rawItems,
        };
      } else {
        // Ảnh lỗi (400) hoặc lỗi server (500): trả về error_type
        return {
          'success': false,
          'items': [],
          'error_type': body['error_type'] ?? 'UNKNOWN_ERROR',
          'message': body['message'] ?? 'Đã có lỗi xảy ra.',
        };
      }
    } on SocketException {
      return {
        'success': false,
        'items': [],
        'error_type': 'NETWORK_ERROR',
        'message': 'Không thể kết nối đến máy chủ. Kiểm tra lại IP và Wifi!',
      };
    } catch (e) {
      return {
        'success': false,
        'items': [],
        'error_type': 'UNKNOWN_ERROR',
        'message': 'Lỗi không xác định: $e',
      };
    }
  }

  // ============================================================
  // 2. API LƯU THỦ CÔNG (POST /api/manual-entry) - Dùng cho nhập tay
  // Chỉ dùng khi người dùng sửa lại dữ liệu sau khi scan
  // ============================================================
  Future<Map<String, dynamic>> saveTransactions({
    required String userId,
    required List<Map<String, dynamic>> items,
  }) async {
    if (MockData.useMockDemo) {
      await Future.delayed(const Duration(milliseconds: 300));
      for (final item in items) {
        final amountNum = double.tryParse(item['amount']?.toString() ?? '0') ?? 0.0;
        MockData.addTransaction({
          '_id': 'tx_demo_${DateTime.now().millisecondsSinceEpoch}',
          'id': 'tx_demo_${DateTime.now().millisecondsSinceEpoch}',
          'transactionType': item['transactionType'] ?? 'CHI',
          'category': item['category'] ?? 'Hoa Don Le',
          'totalAmount': amountNum,
          'reason': item['reason'] ?? 'Giao dịch mới lưu',
          'transactionDate': DateTime.now().toIso8601String(),
          'status': 'VALID',
          'source': 'SCAN',
        });
      }
      return {'success': true, 'message': 'Đã lưu giao dịch thành công (Demo)'};
    }

    try {
      final uri = Uri.parse('$_baseUrl/manual-entry');
      final response = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: jsonEncode({'userId': userId, 'items': items}),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return {'success': false};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ============================================================
  // 4. API LẤY DANH SÁCH GIAO DỊCH (GET /api/transactions)
  // ============================================================
  Future<List<Map<String, dynamic>>> getTransactions(String userId) async {
    if (MockData.useMockDemo) {
      await Future.delayed(const Duration(milliseconds: 200));
      return MockData.getTransactions();
    }

    try {
      final uri = Uri.parse('$_baseUrl/transactions?userId=$userId');
      final response = await http.get(uri).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        if (body['success'] == true) {
          final list = body['data'] as List?;
          if (list != null) {
            return list.cast<Map<String, dynamic>>();
          }
        }
      }
      return [];
    } catch (e) {
      debugPrint('getTransactions error: $e');
      return [];
    }
  }

  // ============================================================
  // 5. API ĐĂNG NHẬP (POST /api/login)
  // ============================================================
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    if (MockData.useMockDemo) {
      await Future.delayed(const Duration(milliseconds: 250));
      return {
        'success': true,
        'user': {
          'id': MockData.demoUserId,
          'email': email.isNotEmpty ? email : MockData.demoEmail,
          'shopName': MockData.demoShopName,
          'role': MockData.demoRole,
          'subscriptionPlan': MockData.demoPlan,
        },
        'message': 'Đăng nhập thành công (Demo)',
      };
    }

    try {
      final uri = Uri.parse('$_baseUrl/login');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        return {
          'success': true,
          'user': body['user'],
          'message': body['message'] ?? 'Đăng nhập thành công',
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Đăng nhập thất bại',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Lỗi kết nối máy chủ: $e',
      };
    }
  }

  // ============================================================
  // 3. DEEP LINK MỞ TELEGRAM
  // ============================================================
  static String getTelegramDeepLink(String userId) {
    return 'https://t.me/$_telegramBotUsername?start=$userId';
  }

  // ============================================================
  // 5. CẬP NHẬT TÙY CHỌN THÔNG BÁO (PUT /api/user/:id/notification-settings)
  // ============================================================
  Future<Map<String, dynamic>> updateNotificationSettings({
    required String userId,
    bool? receiveEmail,
    bool? receiveTelegram,
    bool? receiveInApp,
  }) async {
    if (MockData.useMockDemo) {
      return {'success': true, 'message': 'Cập nhật thành công (Demo)'};
    }

    try {
      final uri = Uri.parse('$_baseUrl/user/$userId/notification-settings');
      final body = <String, dynamic>{};
      if (receiveEmail != null) body['receiveEmail'] = receiveEmail;
      if (receiveTelegram != null) body['receiveTelegram'] = receiveTelegram;
      if (receiveInApp != null) body['receiveInApp'] = receiveInApp;

      final response = await http.put(
        uri,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));
      
      final resBody = jsonDecode(response.body) as Map<String, dynamic>;
      return resBody;
    } catch (e) {
      debugPrint('Lỗi updateNotificationSettings: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  // ============================================================
  // 6. LẤY THÔNG TIN PROFILE (GET /api/user/:id/profile)
  // ============================================================
  Future<Map<String, dynamic>> getUserProfile(String userId) async {
    if (MockData.useMockDemo) {
      return {
        'success': true,
        'user': {
          'id': MockData.demoUserId,
          'email': MockData.demoEmail,
          'shopName': MockData.demoShopName,
          'phone': MockData.demoPhone,
          'role': MockData.demoRole,
          'subscriptionPlan': MockData.demoPlan,
        }
      };
    }

    try {
      final uri = Uri.parse('$_baseUrl/user/$userId/profile');
      final response = await http.get(uri).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return {'success': false};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ============================================================
  // 7. LẤY DANH SÁCH CHI NHÁNH / CỬA HÀNG CỦA OWNER (GET /api/shops)
  // Kết nối trực tiếp Backend để đồng bộ trạng thái duyệt chi nhánh
  // ============================================================
  Future<List<Map<String, dynamic>>> getOwnerShops(String token) async {
    try {
      final uri = Uri.parse('$_baseUrl/shops');
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] is List) {
          return List<Map<String, dynamic>>.from(body['data']);
        }
      }
      return [];
    } catch (e) {
      debugPrint('Lỗi getOwnerShops: $e');
      return [];
    }
  }

  // =============================================================================
  // NGHIỆP VỤ 8: CHUYỂN ĐỔI CHI NHÁNH LÀM VIỆC HIỆN TẠI (PATCH /api/shops/:id/switch)
  // - Bắt đầu từ dòng này đến hết hàm switchActiveShop
  // - Dùng để: Gửi yêu cầu chuyển cửa hàng hoạt động lên máy chủ Backend
  // - Phục vụ: Cho phép chủ hộ kinh doanh đổi giữa các chi nhánh đã được Admin duyệt
  //   Mọi hóa đơn chụp OCR hay giao dịch sau đó sẽ được tính đúng cho chi nhánh này.
  // =============================================================================
  Future<Map<String, dynamic>> switchActiveShop(String shopId, String token) async {
    try {
      final uri = Uri.parse('$_baseUrl/shops/$shopId/switch');
      final response = await http.patch(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body);
      return body is Map<String, dynamic> ? body : {'success': false, 'message': 'Phản hồi không hợp lệ'};
    } catch (e) {
      debugPrint('Lỗi switchActiveShop: $e');
      return {'success': false, 'message': 'Lỗi kết nối máy chủ khi chuyển chi nhánh'};
    }
  }

  // =============================================================================
  // NGHIỆP VỤ 9: ĐĂNG KÝ CỬA HÀNG / CHI NHÁNH MỚI KÈM CHỨNG TỪ (POST /api/shops)
  // - Bắt đầu từ dòng này đến hết hàm createShop
  // - Dùng để: Gửi hồ sơ đăng ký chi nhánh mới kèm ảnh chứng từ lên máy chủ Backend
  // - Phục vụ: Cho phép chủ hộ kinh doanh mở rộng kinh doanh, tạo chi nhánh mới
  //   với trạng thái PENDING chờ Ban Quản Trị (Admin) thẩm định và phê duyệt.
  // =============================================================================
  Future<Map<String, dynamic>> createShop({
    required String shopName,
    required String businessType,
    required String address,
    required String phone,
    required List<String> verificationDocs,
    required String token,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/shops');
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'shopName': shopName.trim(),
          'businessType': businessType,
          'address': address.trim(),
          'phone': phone.trim(),
          'verificationDocs': verificationDocs,
          'documentUrls': verificationDocs,
        }),
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body);
      return body is Map<String, dynamic> ? body : {'success': false, 'message': 'Phản hồi không hợp lệ'};
    } catch (e) {
      debugPrint('Lỗi createShop: $e');
      return {'success': false, 'message': 'Lỗi kết nối máy chủ khi tạo chi nhánh: $e'};
    }
  }

  /// Cập nhật thông tin chi tiết cửa hàng (PUT /api/shops/:id)
  Future<Map<String, dynamic>> updateShopDetails({
    required String shopId,
    required String token,
    String? shopName,
    String? phone,
    String? businessType,
    String? address,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/shops/$shopId');
      final payload = <String, dynamic>{};
      if (shopName != null) payload['shopName'] = shopName.trim();
      if (phone != null) payload['phone'] = phone.trim();
      if (businessType != null) payload['businessType'] = businessType.trim();
      if (address != null) payload['address'] = address.trim();

      final response = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 20));

      final body = jsonDecode(response.body);
      return body is Map<String, dynamic> ? body : {'success': false, 'message': 'Phản hồi không hợp lệ'};
    } catch (e) {
      debugPrint('Lỗi updateShopDetails: $e');
      return {'success': false, 'message': 'Lỗi kết nối máy chủ khi cập nhật cửa hàng: $e'};
    }
  }
}
