import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';

/// AuthRepository - Quan ly toan bo luong xac thuc FinAuto.
class AuthRepository {
  static final AuthRepository _instance = AuthRepository._internal();
  factory AuthRepository() => _instance;
  AuthRepository._internal();

  static String get _authBaseUrl {
    final base = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
    return '$base/auth';
  }

  static const _timeout = Duration(seconds: 50);

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static final _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    clientId: dotenv.env['GOOGLE_CLIENT_ID'],
  );

  static const _kAccessToken = 'access_token';
  static const _kUserId = 'user_id';
  static const _kEmail = 'user_email';
  static const _kShopName = 'user_shopName';
  static const _kAvatar = 'user_avatar';
  static const _kProvider = 'user_authProvider';
  static const _kNotificationSettings = 'user_notificationSettings';

  Future<AuthResult> loginWithEmail(
      {required String email, required String password}) async {
    try {
      final uri = Uri.parse('$_authBaseUrl/login');
      final response = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: jsonEncode({'email': email.trim(), 'password': password}),
          )
          .timeout(_timeout);
      return _handleAuthResponse(response);
    } on SocketException {
      return AuthResult.failure(
          'Khong the ket noi may chu. Kiem tra Wifi va IP!');
    } on Exception catch (e) {
      if (e.toString().contains('TimeoutException')) {
        return AuthResult.failure(
            'May chu phan hoi qua cham (cold start). Thu lai sau 30 giay.');
      }
      return AuthResult.failure('Loi khong xac dinh: $e');
    }
  }

  Future<AuthResult> register(
      {required String email,
      required String password,
      String shopName = ''}) async {
    try {
      final uri = Uri.parse('$_authBaseUrl/register');
      final response = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: jsonEncode({
              'email': email.trim(),
              'password': password,
              'shopName': shopName.trim()
            }),
          )
          .timeout(_timeout);
      return _handleAuthResponse(response);
    } on SocketException {
      return AuthResult.failure(
          'Khong the ket noi may chu. Kiem tra Wifi va IP!');
    } on Exception catch (e) {
      if (e.toString().contains('TimeoutException')) {
        return AuthResult.failure(
            'May chu phan hoi qua cham. Thu lai sau 30 giay.');
      }
      return AuthResult.failure('Loi khong xac dinh: $e');
    }
  }

  Future<AuthResult> loginWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return AuthResult.failure('Nguoi dung huy dang nhap Google.');
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) {
        return AuthResult.failure('Khong the lay Google ID Token.');
      }

      final uri = Uri.parse('$_authBaseUrl/google');
      final response = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: jsonEncode({'idToken': idToken}),
          )
          .timeout(_timeout);
      return _handleAuthResponse(response);
    } on SocketException {
      return AuthResult.failure(
          'Khong the ket noi may chu. Kiem tra Wifi va IP!');
    } on Exception catch (e) {
      debugPrint('Google Sign-In error: $e');
      if (e.toString().contains('TimeoutException')) {
        return AuthResult.failure(
            'May chu phan hoi qua cham. Thu lai sau 30 giay.');
      }
      return AuthResult.failure('Loi dang nhap Google: $e');
    }
  }

  Future<UserInfo?> autoLogin() async {
    try {
      final token = await _storage.read(key: _kAccessToken);
      final userId = await _storage.read(key: _kUserId);
      if (token == null || userId == null) return null;

      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = jsonDecode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
      ) as Map<String, dynamic>;
      final exp = payload['exp'] as int? ?? 0;
      if (DateTime.now().millisecondsSinceEpoch ~/ 1000 >= exp) {
        await logout();
        return null;
      }

      return UserInfo(
        id: userId,
        email: await _storage.read(key: _kEmail) ?? '',
        shopName: await _storage.read(key: _kShopName) ?? '',
        avatar: await _storage.read(key: _kAvatar),
        authProvider: await _storage.read(key: _kProvider) ?? 'local',
        notificationSettings: await _storage.read(key: _kNotificationSettings),
        accessToken: token,
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    await _storage.deleteAll();
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
  }

  Future<String?> getAccessToken() => _storage.read(key: _kAccessToken);
  Future<String?> getUserId() => _storage.read(key: _kUserId);

  Future<AuthResult> _handleAuthResponse(http.Response response) async {
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if ((response.statusCode == 200 || response.statusCode == 201) &&
        body['success'] == true) {
      final accessToken = body['accessToken'] as String;
      final userInfo = body['userInfo'] as Map<String, dynamic>;
      await Future.wait([
        _storage.write(key: _kAccessToken, value: accessToken),
        _storage.write(key: _kUserId, value: userInfo['id']?.toString() ?? ''),
        _storage.write(
            key: _kEmail, value: userInfo['email']?.toString() ?? ''),
        _storage.write(
            key: _kShopName, value: userInfo['shopName']?.toString() ?? ''),
        _storage.write(key: _kAvatar, value: userInfo['avatar']?.toString()),
        _storage.write(
            key: _kProvider,
            value: userInfo['authProvider']?.toString() ?? 'local'),
      ]);
      return AuthResult.success(UserInfo(
        id: userInfo['id']?.toString() ?? '',
        email: userInfo['email']?.toString() ?? '',
        shopName: userInfo['shopName']?.toString() ?? '',
        avatar: userInfo['avatar']?.toString(),
        authProvider: userInfo['authProvider']?.toString() ?? 'local',
        notificationSettings: userInfo['notificationSettings'] != null
            ? jsonEncode(userInfo['notificationSettings'])
            : null,
        accessToken: accessToken,
      ));
    }
    return AuthResult.failure(
        body['message']?.toString() ?? 'Da co loi xay ra.');
  }
}

class AuthResult {
  final bool isSuccess;
  final String? errorMessage;
  final UserInfo? userInfo;
  const AuthResult._(
      {required this.isSuccess, this.errorMessage, this.userInfo});
  factory AuthResult.success(UserInfo user) =>
      AuthResult._(isSuccess: true, userInfo: user);
  factory AuthResult.failure(String message) =>
      AuthResult._(isSuccess: false, errorMessage: message);
}

class UserInfo {
  final String id;
  final String email;
  final String shopName;
  final String? avatar;
  final String authProvider;
  final String accessToken;
  final String? notificationSettings;
  const UserInfo(
      {required this.id,
      required this.email,
      required this.shopName,
      this.avatar,
      required this.authProvider,
      required this.accessToken,
      this.notificationSettings});
}
