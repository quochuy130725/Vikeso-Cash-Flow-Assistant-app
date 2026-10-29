import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../repositories/auth_repository.dart';

/// Kết nối Socket.IO duy nhất cho toàn app (singleton).
///
/// - Xác thực bằng JWT → server cho vào phòng riêng `user:<id>`,
///   chỉ nhận sự kiện của chính user đang đăng nhập.
/// - Các màn hình lắng nghe stream để tự tải lại dữ liệu, không cần reload app.
/// - Khi mất mạng rồi kết nối lại → tự phát sự kiện refresh để bù dữ liệu bị lỡ.
class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  io.Socket? _socket;
  String? _token;
  bool _hasConnectedOnce = false;

  final _transactionCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _profileCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _subscriptionCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _connectionCtrl = StreamController<bool>.broadcast();
  final _forceLogoutCtrl = StreamController<Map<String, dynamic>>.broadcast();

  /// Giao dịch thêm/sửa/xoá → Dashboard, Thu Chi, Báo cáo tải lại.
  Stream<Map<String, dynamic>> get onTransactionChanged => _transactionCtrl.stream;

  /// Hồ sơ / cài đặt thông báo / Telegram / gói dịch vụ thay đổi.
  Stream<Map<String, dynamic>> get onProfileChanged => _profileCtrl.stream;

  /// Thanh toán PRO thành công.
  Stream<Map<String, dynamic>> get onSubscriptionUpgraded => _subscriptionCtrl.stream;

  /// Trạng thái kết nối (true = đang kết nối).
  Stream<bool> get onConnectionChanged => _connectionCtrl.stream;

  /// Khóa tài khoản nhân viên tức thì (< 1 giây) từ Chủ cửa hàng / Admin.
  Stream<Map<String, dynamic>> get onForceLogout => _forceLogoutCtrl.stream;

  bool get isConnected => _socket?.connected ?? false;

  static String get _serverUrl {
    final api = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
    return api.replaceFirst(RegExp(r'/api/?$'), '');
  }

  /// Gọi sau khi đăng nhập / khi app mở lại. An toàn khi gọi nhiều lần.
  Future<void> connect() async {
    final token = await AuthRepository().getAccessToken();
    if (token == null || token.isEmpty) return;

    // Đã có socket với đúng token → chỉ cần đảm bảo đang kết nối
    if (_socket != null && _token == token) {
      if (!_socket!.connected) _socket!.connect();
      return;
    }

    disconnect();
    _token = token;

    final socket = io.io(
      _serverUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableReconnection()
          .setReconnectionDelay(2000)
          .setReconnectionDelayMax(10000)
          .disableAutoConnect()
          .enableForceNew()
          .build(),
    );

    socket.onConnect((_) {
      debugPrint('🔌 Socket connected: ${socket.id}');
      _connectionCtrl.add(true);
      // Kết nối lại sau khi rớt mạng → có thể đã lỡ sự kiện, yêu cầu các màn hình đồng bộ
      if (_hasConnectedOnce) {
        _transactionCtrl.add({'reason': 'reconnected'});
        _profileCtrl.add({'reason': 'reconnected'});
      }
      _hasConnectedOnce = true;
    });
    socket.onDisconnect((_) {
      debugPrint('❌ Socket disconnected');
      _connectionCtrl.add(false);
    });
    socket.onConnectError((err) => debugPrint('⚠️ Socket connect error: $err'));
    socket.on('auth_error', (data) => debugPrint('⚠️ Socket auth error: $data'));

    socket.on('new_transaction', (data) => _transactionCtrl.add(_asMap(data)));
    socket.on('profile_updated', (data) => _profileCtrl.add(_asMap(data)));
    socket.on('subscription_upgraded', (data) {
      final map = _asMap(data);
      _subscriptionCtrl.add(map);
      _profileCtrl.add({...map, 'reason': 'subscription_upgraded'});
    });
    socket.on('force_logout', (data) async {
      final map = _asMap(data);
      await AuthRepository().logout();
      _forceLogoutCtrl.add(map);
    });

    _socket = socket;
    socket.connect();
  }

  /// Gọi khi đăng xuất.
  void disconnect() {
    _socket?.dispose();
    _socket = null;
    _token = null;
    _hasConnectedOnce = false;
  }

  static Map<String, dynamic> _asMap(dynamic data) {
    if (data is Map) return Map<String, dynamic>.from(data);
    return <String, dynamic>{};
  }
}
