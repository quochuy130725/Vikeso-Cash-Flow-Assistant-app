import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

import '../../core/config/env_config.dart';

class ApiService {
  // ============================================================
  // 🔧 CẤU HÌNH - ĐỔI IP NÀY THÀNH IP MÁY TÍNH CỦA ÔNG
  // ============================================================
  static const String _baseUrl = EnvConfig.apiBaseUrl;
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
  Future<bool> saveTransactions({
    required String userId,
    required List<Map<String, dynamic>> items,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/manual-entry');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({'userId': userId, 'items': items}),
      ).timeout(const Duration(seconds: 30));

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  // ============================================================
  // 4. API LẤY DANH SÁCH GIAO DỊCH (GET /api/transactions)
  // ============================================================
  Future<List<Map<String, dynamic>>> getTransactions(String userId) async {
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
      return [];
    }
  }

  // ============================================================
  // 3. DEEP LINK MỞ TELEGRAM
  // ============================================================
  static String getTelegramDeepLink(String userId) {
    return 'https://t.me/$_telegramBotUsername?start=$userId';
  }
}
