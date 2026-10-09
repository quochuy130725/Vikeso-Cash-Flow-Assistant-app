import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../repositories/auth_repository.dart';

class BillingOrder {
  final String orderCode;
  final String plan;
  final int amount;
  final String status; // 'PENDING' | 'PAID' | 'EXPIRED'
  final String transferContent;
  final String qrUrl;
  final DateTime? expiresAt;
  final DateTime? createdAt;

  const BillingOrder({
    required this.orderCode,
    required this.plan,
    required this.amount,
    required this.status,
    required this.transferContent,
    required this.qrUrl,
    this.expiresAt,
    this.createdAt,
  });

  factory BillingOrder.fromJson(Map<String, dynamic> json) {
    return BillingOrder(
      orderCode: json['orderCode']?.toString() ?? '',
      plan: json['plan']?.toString() ?? 'PRO',
      amount: (json['amount'] is num) ? (json['amount'] as num).toInt() : 99000,
      status: json['status']?.toString() ?? 'PENDING',
      transferContent: json['transferContent']?.toString() ?? '',
      qrUrl: json['qrUrl']?.toString() ?? '',
      expiresAt: json['expiresAt'] != null ? DateTime.tryParse(json['expiresAt'].toString()) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }
}

class BillingService {
  static final BillingService _instance = BillingService._internal();
  factory BillingService() => _instance;
  BillingService._internal();

  static String get _baseUrl {
    final base = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
    return '$base/billing';
  }

  static const _timeout = Duration(seconds: 30);

  /// Tạo đơn hàng nâng cấp PRO (VietQR)
  Future<BillingOrder?> createOrder({required String userId}) async {
    try {
      final token = await AuthRepository().getAccessToken();
      final uri = Uri.parse('$_baseUrl/create-order');
      final headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode({'userId': userId}),
          )
          .timeout(_timeout);

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if ((response.statusCode == 200 || response.statusCode == 201) && body['success'] == true) {
        return BillingOrder.fromJson(body['data'] as Map<String, dynamic>);
      }
      debugPrint('createOrder failed: ${body['message']}');
      return null;
    } on SocketException {
      debugPrint('createOrder: Network error');
      return null;
    } catch (e) {
      debugPrint('createOrder error: $e');
      return null;
    }
  }

  /// Kiểm tra trạng thái đơn hàng (polling)
  Future<BillingOrder?> getOrderStatus(String orderCode) async {
    try {
      final token = await AuthRepository().getAccessToken();
      final uri = Uri.parse('$_baseUrl/status/$orderCode');
      final headers = {
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      };

      final response = await http.get(uri, headers: headers).timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        return BillingOrder.fromJson(body['data'] as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      debugPrint('getOrderStatus error: $e');
      return null;
    }
  }

  /// Lấy lịch sử giao dịch nạp tiền / nâng cấp của user
  Future<List<BillingOrder>> getHistory(String userId) async {
    try {
      final token = await AuthRepository().getAccessToken();
      final uri = Uri.parse('$_baseUrl/history?userId=$userId');
      final headers = {
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      };

      final response = await http.get(uri, headers: headers).timeout(_timeout);
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        final list = (body['data'] as List?) ?? [];
        return list.map((item) => BillingOrder.fromJson(item as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('getHistory error: $e');
      return [];
    }
  }
}
