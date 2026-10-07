import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../repositories/auth_repository.dart';

class AdminService {
  static final AdminService _instance = AdminService._internal();
  factory AdminService() => _instance;
  AdminService._internal();

  static String get _baseUrl {
    final base = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
    return '$base/admin';
  }

  static const _timeout = Duration(seconds: 30);

  Future<Map<String, String>> _getHeaders() async {
    final token = await AuthRepository().getAccessToken() ?? '';
    return {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer $token',
    };
  }

  /// Lấy thống kê tổng quan hệ thống
  Future<Map<String, dynamic>?> getOverview() async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/overview');
      final response = await http.get(uri, headers: headers).timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        return (body['data'] as Map<String, dynamic>?) ?? {};
      }
      return null;
    } catch (e) {
      debugPrint('getOverview error: $e');
      return null;
    }
  }

  /// Lấy danh sách người dùng
  Future<Map<String, dynamic>?> getUsers({int page = 1, int limit = 20, String? search}) async {
    try {
      final headers = await _getHeaders();
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (search != null && search.isNotEmpty) 'search': search,
      };
      final uri = Uri.parse('$_baseUrl/users').replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: headers).timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        return body;
      }
      return null;
    } catch (e) {
      debugPrint('getUsers error: $e');
      return null;
    }
  }

  /// Cập nhật gói dịch vụ cho user
  Future<bool> updatePlan(String userId, String plan, {int days = 30}) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/users/$userId/plan');
      final response = await http
          .patch(
            uri,
            headers: headers,
            body: jsonEncode({'plan': plan, 'days': days}),
          )
          .timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      return response.statusCode == 200 && body['success'] == true;
    } catch (e) {
      debugPrint('updatePlan error: $e');
      return false;
    }
  }

  /// Cập nhật vai trò (Role: ADMIN / OWNER)
  Future<bool> updateRole(String userId, String role) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/users/$userId/role');
      final response = await http
          .patch(
            uri,
            headers: headers,
            body: jsonEncode({'role': role}),
          )
          .timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      return response.statusCode == 200 && body['success'] == true;
    } catch (e) {
      debugPrint('updateRole error: $e');
      return false;
    }
  }

  /// Xóa người dùng
  Future<bool> deleteUser(String userId) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/users/$userId');
      final response = await http.delete(uri, headers: headers).timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      return response.statusCode == 200 && body['success'] == true;
    } catch (e) {
      debugPrint('deleteUser error: $e');
      return false;
    }
  }
}
