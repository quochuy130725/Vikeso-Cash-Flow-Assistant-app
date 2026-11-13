import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../shared_widgets/side_drawer.dart';
import '../shared_widgets/pro_badge.dart';
import '../shared_widgets/pro_paywall_sheet.dart';
import '../shared_widgets/address_form_field.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';
import '../../data/services/socket_service.dart';
import '../billing/upgrade_pro_screen.dart';

class StoreScreen extends StatefulWidget {
  const StoreScreen({super.key});

  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> with WidgetsBindingObserver {
  static const _storage = FlutterSecureStorage(aOptions: AndroidOptions());

  String _shopName = '';
  String _name = '';
  String _phone = ''; // Số điện thoại cá nhân của chủ hộ (nhận OTP & đăng nhập)
  String _storePhone = ''; // Hotline liên hệ riêng của cơ sở kinh doanh / chi nhánh đang chọn
  String _businessType = 'Bán lẻ / Tạp hóa';
  String _subscriptionPlan = 'FREE';
  bool _isLoading = false;

  bool _receiveEmail = true;
  bool _receiveTelegram = false;
  bool _hasTelegram = false;
  StreamSubscription? _profileSub;

  final List<Map<String, String>> _branches = [];
  int _selectedBranchIndex = 0;

  // Cờ khóa chống xung đột luồng và hiện tượng giật chuyển đổi qua lại liên tục (Debounce / Race-condition Lock)
  bool _isSwitchingBranch = false;
  bool _isLoadingProfile = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadStoreProfile();
    // Lắng nghe sự kiện hồ sơ từ Socket: chỉ nạp lại nếu không đang trong quá trình chuyển chi nhánh
    _profileSub = SocketService.instance.onProfileChanged.listen((event) {
      if (_isSwitchingBranch) return;
      if (event['source'] == 'store_screen') return;

      // Xử lý trực tiếp sự kiện chuyển chi nhánh mà không cần reload toàn bộ màn hình
      if (event['reason'] == 'shop_switched') {
        final switchedShopId = event['activeShopId']?.toString();
        final switchedShopName = event['shopName']?.toString();
        if (switchedShopId != null && switchedShopId.isNotEmpty) {
          final idx = _branches.indexWhere((b) => b['id'] == switchedShopId);
          if (idx >= 0 && mounted) {
            setState(() {
              _selectedBranchIndex = idx;
              _shopName = switchedShopName ?? _branches[idx]['name'] ?? _shopName;
              if (_branches[idx]['phone'] != null && _branches[idx]['phone']!.isNotEmpty) {
                _storePhone = _branches[idx]['phone']!;
              }
            });
            _storage.write(key: 'user_activeShopId', value: switchedShopId);
            _storage.write(key: 'user_shopName', value: _shopName);
            return;
          }
        }
      }

      _loadStoreProfile();
    });
  }

  @override
  void dispose() {
    _profileSub?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadStoreProfile();
    }
  }

// =============================================================================
// NGHIỆP VỤ 1: TẢI VÀ ĐỒNG BỘ HỒ SƠ CỬA HÀNG & DANH SÁCH CHI NHÁNH TỪ DATABASE
// - Dùng để: Lấy thông tin chủ hộ, tên cửa hàng thực tế, gói dịch vụ (FREE/PRO),
//   cài đặt nhận báo cáo doanh thu 22:00 và toàn bộ chi nhánh từ Backend (/api/shops).
// - Phục vụ:
//   1. Hiển thị chính xác tên quán từ Database, đồng bộ 100% với Web Portal.
//   2. Đồng bộ danh sách các chi nhánh từ máy chủ Backend (GET /api/shops),
//      phân biệt rõ ràng "Đang hoạt động" và "Chờ Admin duyệt".
// =============================================================================
  Future<void> _loadStoreProfile() async {
    // Nếu đang trong quá trình chuyển chi nhánh hoặc đang có luồng load khác thì dừng ngay
    if (_isSwitchingBranch || _isLoadingProfile) return;
    _isLoadingProfile = true;

    try {
      final profile = await AuthRepository().fetchUserProfile();
      String loadedName = '';
      String loadedShopName = '';
      String loadedPhone = '';
      String loadedPlan = 'FREE';

      if (profile != null) {
        loadedName = profile.name ?? '';
        loadedShopName = profile.shopName.isNotEmpty ? profile.shopName : 'Chưa thiết lập cửa hàng';
        loadedPhone = profile.phone ?? '';
        loadedPlan = profile.subscriptionPlan;
      } else {
        loadedName = await _storage.read(key: 'user_name') ?? '';
        loadedShopName = await _storage.read(key: 'user_shopName') ?? 'Chưa thiết lập cửa hàng';
        loadedPhone = await _storage.read(key: 'user_phone') ?? '';
        loadedPlan = await _storage.read(key: 'user_subscriptionPlan') ?? 'FREE';
      }

      if (_isSwitchingBranch) return;

      final userId = await AuthRepository().getUserId();
      if (userId != null && userId.isNotEmpty) {
        try {
          final serverProfile = await ApiService().getUserProfile(userId);
          if (serverProfile['success'] == true && mounted) {
            final bool hasTg = serverProfile['hasTelegram'] == true;
            final Map<String, dynamic>? st = serverProfile['settings'] as Map<String, dynamic>?;
            if (st != null) {
              _hasTelegram = hasTg;
              _receiveEmail = st['receiveEmail'] ?? true;
              _receiveTelegram = hasTg && (st['receiveTelegram'] == true);
              await _storage.write(key: 'user_telegramChatId', value: hasTg ? 'linked' : '');
              await _storage.write(key: 'user_notificationSettings', value: jsonEncode(st));
            }
          }
        } catch (_) {}
      }

      if (_isSwitchingBranch) return;

      // Luôn gọi API lấy danh sách chi nhánh thực tế từ Database
      final token = await AuthRepository().getAccessToken();
      final List<Map<String, String>> newBranches = [];
      int newSelectedIndex = 0;
      String finalShopName = loadedShopName;

      if (token != null && token.isNotEmpty) {
        try {
          final serverShops = await ApiService().getOwnerShops(token);
          final savedActiveShopId = await _storage.read(key: 'user_activeShopId');

          if (serverShops.isNotEmpty) {
            for (final s in serverShops) {
              final status = s['approvalStatus'] == 'APPROVED' ? 'ACTIVE' : s['approvalStatus'] ?? 'PENDING';
              final statusLabel = status == 'ACTIVE' ? 'Đang hoạt động' : 'Chờ Admin duyệt';
              // Bóc tách hotline riêng của từng cơ sở kinh doanh từ Backend
              final storePhone = (s['phone'] != null && s['phone'].toString().trim().isNotEmpty)
                  ? s['phone'].toString().trim()
                  : '';
              newBranches.add({
                'id': s['_id']?.toString() ?? '',
                'name': s['shopName']?.toString() ?? 'Chi nhánh',
                'type': s['businessType']?.toString() ?? 'Hộ kinh doanh',
                'status': status,
                'phone': storePhone,
                'address': (s['address'] != null && s['address'].toString().trim().isNotEmpty)
                    ? s['address'].toString().trim()
                    : (status == 'ACTIVE' ? 'Cơ sở đang hoạt động' : 'Đang chờ Admin duyệt'),
                'statusLabel': statusLabel,
              });
            }

            // Tìm chi nhánh trùng với activeShopId hoặc finalShopName đang chọn
            int matchedIndex = -1;
            if (savedActiveShopId != null && savedActiveShopId.isNotEmpty) {
              matchedIndex = newBranches.indexWhere((b) => b['id'] == savedActiveShopId);
            }
            if (matchedIndex == -1 && finalShopName.isNotEmpty && finalShopName != 'Chưa thiết lập cửa hàng') {
              matchedIndex = newBranches.indexWhere((b) => b['name'] == finalShopName && b['status'] == 'ACTIVE');
            }

            if (matchedIndex >= 0) {
              newSelectedIndex = matchedIndex;
              finalShopName = newBranches[matchedIndex]['name'] ?? finalShopName;
            } else {
              final firstActive = newBranches.indexWhere((b) => b['status'] == 'ACTIVE');
              if (firstActive >= 0) {
                newSelectedIndex = firstActive;
                finalShopName = newBranches[firstActive]['name'] ?? '';
              } else {
                newSelectedIndex = 0;
                finalShopName = newBranches[0]['status'] != 'ACTIVE'
                    ? 'Chưa thiết lập cửa hàng'
                    : (newBranches[0]['name'] ?? 'Chưa thiết lập cửa hàng');
              }
            }

            final hasApproved = serverShops.any((s) => s['approvalStatus'] == 'APPROVED');
            final pendingShop = serverShops.firstWhere(
              (s) => s['approvalStatus'] == 'PENDING',
              orElse: () => <String, dynamic>{},
            );
            if (hasApproved) {
              await _storage.write(key: 'user_shopStatus', value: 'ACTIVE');
            } else if (pendingShop.isNotEmpty) {
              await _storage.write(key: 'user_shopStatus', value: 'PENDING');
              await _storage.write(key: 'user_pendingShopName', value: pendingShop['shopName']?.toString() ?? '');
            } else {
              await _storage.write(key: 'user_shopStatus', value: 'NO_STORE');
            }
          } else {
            finalShopName = 'Chưa thiết lập cửa hàng';
            await _storage.write(key: 'user_shopStatus', value: 'NO_STORE');
            newBranches.add({
              'id': '',
              'name': 'Chưa thiết lập cửa hàng',
              'type': 'Tạp hóa & Bán lẻ',
              'status': 'ACTIVE',
              'phone': '',
              'address': 'Chưa thiết lập cơ sở kinh doanh',
              'statusLabel': 'Đang hoạt động',
            });
            newSelectedIndex = 0;
          }
        } catch (_) {}
      }

      if (_isSwitchingBranch) return;

      final settingsStr = await _storage.read(key: 'user_notificationSettings');
      bool receiveEmail = true;
      bool receiveTelegram = false;
      bool hasTelegram = false;
      if (settingsStr != null) {
        try {
          final Map<String, dynamic> settings = jsonDecode(settingsStr);
          final hasTg = await _storage.read(key: 'user_telegramChatId');
          hasTelegram = hasTg != null && hasTg.isNotEmpty;
          receiveEmail = settings['receiveEmail'] ?? true;
          receiveTelegram = hasTelegram && (settings['receiveTelegram'] == true);
        } catch (_) {}
      }

      // Xác định Hotline của cơ sở đang chọn: ưu tiên hotline của chi nhánh, fallback SĐT cá nhân nếu quán chưa có SĐT
      String selectedStorePhone = '';
      if (newBranches.isNotEmpty && newSelectedIndex >= 0 && newSelectedIndex < newBranches.length) {
        selectedStorePhone = newBranches[newSelectedIndex]['phone'] ?? '';
      }
      if (selectedStorePhone.isEmpty) {
        selectedStorePhone = loadedPhone;
      }

      // Cập nhật toàn bộ trạng thái trong đúng 1 lần setState nguyên tử (Atomic UI Update)
      if (mounted) {
        setState(() {
          _name = loadedName;
          _shopName = finalShopName;
          _phone = loadedPhone; // SĐT cá nhân chủ hộ (dùng OTP / đăng nhập)
          _storePhone = selectedStorePhone; // Hotline cơ sở đang chọn
          _subscriptionPlan = loadedPlan;
          _receiveEmail = receiveEmail;
          _hasTelegram = hasTelegram;
          _receiveTelegram = receiveTelegram;
          if (newBranches.isNotEmpty) {
            _branches.clear();
            _branches.addAll(newBranches);
            _selectedBranchIndex = newSelectedIndex;
          }
        });
        await _storage.write(key: 'user_shopName', value: finalShopName);
      }
    } finally {
      _isLoadingProfile = false;
    }
  }

// =============================================================================
// NGHIỆP VỤ 2: CẬP NHẬT THÔNG TIN CỬA HÀNG / HỘ KINH DOANH (DÒNG 180 ĐẾN 255)
// - Dùng để làm gì: Mở hộp thoại (Dialog) cho phép chủ quán chỉnh sửa:
//   1. Tên cửa hàng (in trên đầu phiếu thu/chi).
//   2. Loại hình kinh doanh (Tạp hóa, F&B, Thời trang, v.v.).
//   3. Số điện thoại hotline cửa hàng.
// - Phục vụ mục đích gì: Giúp tiểu thương cập nhật lại thông tin khi mở rộng quy mô,
//   đổi tên quán hoặc thay số hotline mà không cần liên hệ quản trị viên.
// =============================================================================
  Future<void> _openEditShopDialog() async {
    final shopCtrl = TextEditingController(text: _shopName);
    // Tách biệt hotline cửa hàng: Ưu tiên hotline riêng của chi nhánh, fallback SĐT cá nhân nếu quán chưa có SĐT
    final phoneCtrl = TextEditingController(text: _storePhone.isNotEmpty ? _storePhone : _phone);
    String selectedType = _businessType;
    final currentAddress = (_branches.isNotEmpty && _selectedBranchIndex < _branches.length)
        ? (_branches[_selectedBranchIndex]['address'] ?? '')
        : '';
    String addressValue = currentAddress;
    final types = [
      'Bán lẻ / Tạp hóa',
      'F&B / Quán cà phê / Ăn uống',
      'Thời trang / Phụ kiện',
      'Dịch vụ / Spa / Tiệm tóc',
      'Hộ kinh doanh khác',
    ];

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Cập nhật thông tin cửa hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: shopCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Tên cửa hàng / Hộ kinh doanh',
                    prefixIcon: Icon(Icons.storefront_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: types.contains(selectedType) ? selectedType : types.first,
                  decoration: const InputDecoration(
                    labelText: 'Loại hình kinh doanh',
                    prefixIcon: Icon(Icons.category_outlined),
                  ),
                  items: types.map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13.5)))).toList(),
                  onChanged: (v) {
                    if (v != null) setDialogState(() => selectedType = v);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Hotline cửa hàng',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 14),
                AddressFormField(
                  initialAddress: addressValue,
                  labelText: 'Địa chỉ cơ sở kinh doanh',
                  onChanged: (v) => addressValue = v,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
              onPressed: () => Navigator.pop(ctx, {
                'shopName': shopCtrl.text.trim(),
                'phone': phoneCtrl.text.trim(),
                'businessType': selectedType,
                'address': addressValue.trim(),
              }),
              child: const Text('Lưu thay đổi', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );

    if (result == null) return;
    await _storage.write(key: 'user_businessType', value: result['businessType']);
    setState(() => _businessType = result['businessType'] ?? _businessType);
    if (result['address'] != null && result['address']!.isNotEmpty) {
      await _storage.write(key: 'user_address', value: result['address']!);
    }
    await _updateShopProfile(
      result['shopName']!,
      result['phone']!,
      address: result['address'],
      businessType: result['businessType'],
    );
  }

  Future<void> _updateShopProfile(
    String shopName,
    String phone, {
    String? address,
    String? businessType,
  }) async {
    setState(() => _isLoading = true);
    try {
      final token = await AuthRepository().getAccessToken() ?? await _storage.read(key: 'access_token') ?? '';
      String shopId = '';
      if (_branches.isNotEmpty && _selectedBranchIndex < _branches.length) {
        shopId = _branches[_selectedBranchIndex]['id'] ?? '';
      }
      if (shopId.isEmpty) {
        shopId = await _storage.read(key: 'user_activeShopId') ?? '';
      }

      if (shopId.isNotEmpty && token.isNotEmpty) {
        final body = await ApiService().updateShopDetails(
          shopId: shopId,
          token: token,
          shopName: shopName,
          phone: phone,
          businessType: businessType ?? _businessType,
          address: address,
        );

        if (body['success'] == true) {
          final shopData = body['data'] as Map<String, dynamic>? ?? {};
          final updatedName = shopData['shopName']?.toString() ?? shopName;
          final updatedPhone = shopData['phone']?.toString() ?? phone;
          final updatedType = shopData['businessType']?.toString() ?? (businessType ?? _businessType);
          final updatedAddress = shopData['address']?.toString() ?? address ?? '';

          await _storage.write(key: 'user_shopName', value: updatedName);
          await _storage.write(key: 'user_businessType', value: updatedType);
          if (updatedAddress.isNotEmpty) {
            await _storage.write(key: 'user_address', value: updatedAddress);
          }

          SocketService.instance.notifyProfileChanged({'shopName': updatedName});
          if (!mounted) return;
          setState(() {
            _shopName = updatedName;
            _storePhone = updatedPhone;
            _businessType = updatedType;
            if (_branches.isNotEmpty && _selectedBranchIndex < _branches.length) {
              _branches[_selectedBranchIndex]['name'] = updatedName;
              _branches[_selectedBranchIndex]['phone'] = updatedPhone;
              _branches[_selectedBranchIndex]['type'] = updatedType;
              if (updatedAddress.isNotEmpty) {
                _branches[_selectedBranchIndex]['address'] = updatedAddress;
              }
            }
          });
          _showSnack('Đã cập nhật thông tin cửa hàng!', isSuccess: true);
        } else {
          _showSnack(body['message']?.toString() ?? 'Không thể cập nhật thông tin cửa hàng.');
        }
        return;
      }

      final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
      final uri = Uri.parse('$baseUrl/auth/profile');

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({
              'name': _name,
              'shopName': shopName,
              'phone': _phone, // Luôn giữ nguyên SĐT cá nhân của chủ hộ trong User collection
              if (address != null && address.isNotEmpty) 'address': address,
            }),
          )
          .timeout(const Duration(seconds: 30));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && body['success'] == true) {
        final info = body['userInfo'] as Map<String, dynamic>;
        final updatedName = info['shopName']?.toString() ?? shopName;
        await _storage.write(key: 'user_shopName', value: updatedName);
        if (address != null && address.isNotEmpty) {
          await _storage.write(key: 'user_address', value: address);
        }
        // Đồng bộ tức thì tên cửa hàng trên toàn ứng dụng (AppBar, Side Drawer, Dashboard)
        SocketService.instance.notifyProfileChanged({'shopName': updatedName});
        if (!mounted) return;
        setState(() {
          _shopName = updatedName;
          _storePhone = phone; // Cập nhật hotline cơ sở
          if (_branches.isNotEmpty && _selectedBranchIndex < _branches.length) {
            _branches[_selectedBranchIndex]['name'] = _shopName;
            _branches[_selectedBranchIndex]['phone'] = phone;
            if (address != null && address.isNotEmpty) {
              _branches[_selectedBranchIndex]['address'] = address;
            }
          }
        });
        _showSnack('Đã cập nhật thông tin cửa hàng!', isSuccess: true);
      } else {
        _showSnack(body['message']?.toString() ?? 'Không thể cập nhật thông tin cửa hàng.');
      }
    } catch (e) {
      await _storage.write(key: 'user_shopName', value: shopName);
      if (address != null && address.isNotEmpty) {
        await _storage.write(key: 'user_address', value: address);
      }
      SocketService.instance.notifyProfileChanged({'shopName': shopName});
      if (mounted) {
        setState(() {
          _shopName = shopName;
          _storePhone = phone;
          if (_branches.isNotEmpty && _selectedBranchIndex < _branches.length) {
            _branches[_selectedBranchIndex]['name'] = shopName;
            _branches[_selectedBranchIndex]['phone'] = phone;
            if (address != null && address.isNotEmpty) {
              _branches[_selectedBranchIndex]['address'] = address;
            }
          }
        });
        _showSnack('Đã lưu thông tin cửa hàng cục bộ!', isSuccess: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

// =============================================================================
// NGHIỆP VỤ 3: CÀI ĐẶT NHẬN BÁO CÁO DOANH THU 22:00 QUA EMAIL & TELEGRAM (DÒNG 320 ĐẾN 350)
// - Dùng để làm gì: Bật/tắt chế độ tự động nhận báo cáo doanh thu mỗi đêm lúc 22h.
// - Phục vụ mục đích gì: Đáp ứng yêu cầu của Mentor về việc chốt số liệu tự động
//   cuối ngày (chuẩn 22:00) gửi trực tiếp về điện thoại giúp chủ quán nắm lãi/lỗ.
// =============================================================================
  Future<void> _updateSetting(String key, bool value) async {
    setState(() {
      if (key == 'receiveEmail') _receiveEmail = value;
      if (key == 'receiveTelegram') _receiveTelegram = value;
      _isLoading = true;
    });

    final userId = await AuthRepository().getUserId();
    if (userId != null) {
      await ApiService().updateNotificationSettings(
        userId: userId,
        receiveEmail: key == 'receiveEmail' ? value : null,
        receiveTelegram: key == 'receiveTelegram' ? value : null,
      );
      final settingsStr = await _storage.read(key: 'user_notificationSettings');
      Map<String, dynamic> settings = {};
      if (settingsStr != null) {
        try {
          settings = jsonDecode(settingsStr);
        } catch (_) {}
      }
      settings[key] = value;
      await _storage.write(key: 'user_notificationSettings', value: jsonEncode(settings));
    }

    if (mounted) setState(() => _isLoading = false);
  }

// =============================================================================
// NGHIỆP VỤ 4: CHUYỂN ĐỔI VÀ ĐỒNG BỘ CHI NHÁNH LÀM VIỆC (DÒNG 410 ĐẾN 470)
// - Dùng để: Gửi yêu cầu chuyển cửa hàng hoạt động lên Backend qua PATCH /api/shops/:id/switch
// - Phục vụ: Cập nhật activeShopId, ghi đè user_shopName vào Storage,
//   và phát tín hiệu SocketService.notifyProfileChanged để Dashboard, Side Drawer đổi tên tức thì.
// - Triệt tiêu hiện tượng Flickering (giật qua lại liên tục):
//   1. Áp dụng Optimistic UI cập nhật tức thì trong 0ms.
//   2. Khóa _isSwitchingBranch = true để chặn Socket phản hồi dội ngược làm xáo trộn index.
// =============================================================================
  Future<void> _handleSelectBranch(int index, Map<String, String> b) async {
    final isSelected = index == _selectedBranchIndex;
    final isPending = b['status'] == 'PENDING' || b['statusLabel'] == 'Chờ Admin duyệt';

    if (isPending) {
      _showSnack('Chi nhánh này đang chờ Ban Quản Trị (Admin) phê duyệt chứng từ pháp lý.');
      return;
    }
    if (isSelected || _isSwitchingBranch) {
      return;
    }

    final shopId = b['id'];
    final targetShopName = b['name'] ?? 'Chi nhánh';
    final targetStorePhone = (b['phone'] != null && b['phone']!.isNotEmpty) ? b['phone']! : _phone;
    final prevIndex = _selectedBranchIndex;
    final prevShopName = _shopName;
    final prevStorePhone = _storePhone;

    // Kích hoạt cờ khóa chống xung đột luồng
    _isSwitchingBranch = true;

    // Cập nhật giao diện tức thì (Optimistic UI Update) giúp người dùng thấy ngay chi nhánh mới
    setState(() {
      _selectedBranchIndex = index;
      _shopName = targetShopName;
      _storePhone = targetStorePhone;
    });

    if (shopId != null && shopId.isNotEmpty) {
      await _storage.write(key: 'user_activeShopId', value: shopId);
      await _storage.write(key: 'user_shopName', value: targetShopName);

      final token = await AuthRepository().getAccessToken();
      if (token != null && token.isNotEmpty) {
        final res = await ApiService().switchActiveShop(shopId, token);

        if (res['success'] == true) {
          final newActiveShopId = res['activeShopId']?.toString() ?? shopId;
          final newShopName = res['shopName']?.toString() ?? targetShopName;

          await _storage.write(key: 'user_activeShopId', value: newActiveShopId);
          await _storage.write(key: 'user_shopName', value: newShopName);

          if (mounted) {
            setState(() {
              _selectedBranchIndex = index;
              _shopName = newShopName;
              _storePhone = targetStorePhone;
            });
            _showSnack('Đã chuyển làm việc sang: $newShopName!', isSuccess: true);
          }

          // Phát tín hiệu đồng bộ tức thì cho các màn hình khác (Dashboard & Side Drawer)
          SocketService.instance.notifyProfileChanged({
            'shopName': newShopName,
            'activeShopId': newActiveShopId,
            'reason': 'shop_switched',
            'source': 'store_screen',
          });

          // Giữ cờ khóa 1.5 giây để toàn bộ các sự kiện Socket / HTTP dội ngược từ server đều bị chặn
          await Future.delayed(const Duration(milliseconds: 1500));
          _isSwitchingBranch = false;
          return;
        } else {
          // Hoàn tác về chi nhánh ban đầu nếu máy chủ xử lý không thành công
          if (mounted) {
            setState(() {
              _selectedBranchIndex = prevIndex;
              _shopName = prevShopName;
              _storePhone = prevStorePhone;
            });
            _showSnack(res['message']?.toString() ?? 'Chuyển chi nhánh không thành công.');
          }
          await _storage.write(key: 'user_shopName', value: prevShopName);
          _isSwitchingBranch = false;
          return;
        }
      }
    }

    _isSwitchingBranch = false;
  }

  // =============================================================================
  // NGHIỆP VỤ 4B: TẠO CỬA HÀNG MỚI / CHI NHÁNH KÈM CHỨNG TỪ XÁC MINH
  // - Dùng để: Mở form nhập thông tin cửa hàng / chi nhánh mới và đính kèm chứng từ
  // - Phục vụ: Cho phép chủ hộ gửi hồ sơ cửa hàng lên hệ thống để Admin duyệt
  //   Hồ sơ gồm: Tên quán, Loại hình kinh doanh, Địa chỉ, Hotline, Ảnh GPKD/biển hiệu.
  // =============================================================================
  Future<void> _openCreateShopSheet() async {
    final shopNameCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final phoneCtrl = TextEditingController(text: _phone);
    String selectedType = 'Bán lẻ / Tạp hóa';
    final List<String> docUrls = [];
    final types = [
      'Bán lẻ / Tạp hóa',
      'F&B / Quán cà phê / Ăn uống',
      'Thời trang / Phụ kiện',
      'Dịch vụ / Spa / Tiệm tóc',
      'Hộ kinh doanh khác',
    ];

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF0F5),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFFFD6E4)),
                      ),
                      child: const Icon(Icons.add_business_rounded, color: Color(0xFFFF4783), size: 20),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tạo Cửa Hàng / Chi Nhánh Mới',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          Text(
                            'Gửi hồ sơ kèm chứng từ để Ban Quản Trị thẩm định',
                            style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Tên cửa hàng
                TextField(
                  controller: shopNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Tên cửa hàng / Chi nhánh mới *',
                    hintText: 'VD: Tạp Hóa Minh Phát - CN 2',
                    prefixIcon: Icon(Icons.storefront_outlined),
                  ),
                ),
                const SizedBox(height: 12),

                // Loại hình kinh doanh
                DropdownButtonFormField<String>(
                  initialValue: selectedType,
                  decoration: const InputDecoration(
                    labelText: 'Loại hình kinh doanh',
                    prefixIcon: Icon(Icons.category_outlined),
                  ),
                  items: types
                      .map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13))))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setSheetState(() => selectedType = v);
                  },
                ),
                const SizedBox(height: 12),

                // Địa chỉ
                AddressFormField(
                  initialAddress: addressCtrl.text,
                  isRequired: true,
                  labelText: 'Địa chỉ kinh doanh',
                  onChanged: (val) {
                    addressCtrl.text = val;
                  },
                ),
                const SizedBox(height: 12),

                // Hotline
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Số điện thoại liên hệ cửa hàng',
                    hintText: 'VD: 0987654321',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 16),

                // Khu vực chứng từ xác minh
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Ảnh chứng từ xác minh (1 - 3 ảnh) *',
                            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                          ),
                          Text(
                            '${docUrls.length}/3 ảnh',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFF4783)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'GPKD, Hợp đồng thuê mặt bằng hoặc Ảnh biển hiệu cửa hàng.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 10),

                      // Nút chèn ảnh mẫu test nhanh (Đồng bộ chuẩn Web)
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFFF4783),
                          side: const BorderSide(color: Color(0xFFFFD6E4)),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () {
                          setSheetState(() {
                            docUrls.clear();
                            docUrls.add('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80');
                            docUrls.add('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
                          });
                          _showSnack('Đã nạp 2 ảnh chứng từ mẫu (GPKD & Biển hiệu) để thử nghiệm!', isSuccess: true);
                        },
                        icon: const Icon(Icons.auto_awesome, size: 16),
                        label: const Text('Nạp 2 ảnh chứng từ mẫu (GPKD & Biển hiệu)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700)),
                      ),

                      if (docUrls.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: docUrls.map((url) {
                            return Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    url,
                                    width: 70,
                                    height: 70,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      width: 70,
                                      height: 70,
                                      color: const Color(0xFFE2E8F0),
                                      alignment: Alignment.center,
                                      child: const Icon(Icons.image_not_supported, size: 24, color: Color(0xFF94A3B8)),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () {
                                      setSheetState(() => docUrls.remove(url));
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: Colors.black54,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.close, size: 14, color: Colors.white),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Nút Gửi hồ sơ
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF4783),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    onPressed: () async {
                      final name = shopNameCtrl.text.trim();
                      if (name.isEmpty) {
                        _showSnack('Vui lòng nhập tên cửa hàng / chi nhánh mới.');
                        return;
                      }
                      if (docUrls.isEmpty) {
                        _showSnack('Vui lòng đính kèm ít nhất 1 ảnh chứng từ xác minh (hoặc bấm Nạp ảnh mẫu).');
                        return;
                      }

                      Navigator.pop(ctx);
                      setState(() => _isLoading = true);

                      final token = await AuthRepository().getAccessToken();
                      if (token != null && token.isNotEmpty) {
                        final res = await ApiService().createShop(
                          shopName: name,
                          businessType: selectedType,
                          address: addressCtrl.text.trim(),
                          phone: phoneCtrl.text.trim(),
                          verificationDocs: docUrls,
                          token: token,
                        );

                        if (res['success'] == true) {
                          final newShopData = res['data'] is Map ? res['data'] : null;
                          final newId = newShopData != null ? (newShopData['_id'] ?? newShopData['id'])?.toString() ?? '' : '';

                          final hasActive = _branches.any((b) => b['status'] == 'ACTIVE' && b['name'] != 'Chưa thiết lập cửa hàng');
                          if (!hasActive) {
                            await _storage.write(key: 'user_shopStatus', value: 'PENDING');
                            await _storage.write(key: 'user_pendingShopName', value: name);
                            SocketService.instance.notifyProfileChanged({
                              'shopStatus': 'PENDING',
                              'pendingShopName': name,
                            });
                          }

                          setState(() {
                            _branches.add({
                              'id': newId,
                              'name': name,
                              'type': selectedType,
                              'address': addressCtrl.text.trim().isNotEmpty ? addressCtrl.text.trim() : 'Đang cập nhật địa chỉ',
                              'status': 'PENDING',
                              'statusLabel': 'Chờ Admin duyệt',
                            });
                          });

                          _showSnack('Đã gửi hồ sơ đăng ký chi nhánh lên hệ thống. Vui lòng chờ Ban Quản Trị phê duyệt!', isSuccess: true);
                        } else {
                          _showSnack(res['message']?.toString() ?? 'Tạo chi nhánh thất bại.');
                        }
                      }
                      setState(() => _isLoading = false);
                    },
                    child: const Text(
                      'Gửi Hồ Sơ Đăng Ký (Chờ Duyệt)',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showBranchSwitcherSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(4)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Chi Nhánh / Cửa Hàng',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                TextButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _openCreateShopSheet();
                  },
                  icon: const Icon(Icons.add, size: 16, color: Color(0xFFFF4783)),
                  label: const Text(
                    '+ Thêm cửa hàng',
                    style: TextStyle(color: Color(0xFFFF4783), fontWeight: FontWeight.w800, fontSize: 12.5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...List.generate(_branches.length, (i) {
              final b = _branches[i];
              final isSelected = i == _selectedBranchIndex;
              final isPending = b['status'] == 'PENDING' || b['statusLabel'] == 'Chờ Admin duyệt';

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFFFF0F5)
                      : isPending
                          ? const Color(0xFFFFFBEB)
                          : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFFFF4783)
                        : isPending
                            ? const Color(0xFFFDE68A)
                            : const Color(0xFFE2E8F0),
                    width: 1.4,
                  ),
                ),
                child: ListTile(
                  leading: Icon(
                    Icons.storefront_rounded,
                    color: isPending ? const Color(0xFFD97706) : const Color(0xFFFF4783),
                  ),
                  title: Text(
                    b['name'] ?? 'Chi nhánh chính',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF0F172A)),
                  ),
                  subtitle: Text(
                    isPending
                        ? 'Hồ sơ đang chờ Ban Quản Trị thẩm định chứng từ'
                        : (b['address'] ?? 'Đang hoạt động'),
                    style: TextStyle(
                      fontSize: 12,
                      color: isPending ? const Color(0xFFB45309) : const Color(0xFF64748B),
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFD0F81B)
                          : isPending
                              ? const Color(0xFFFEF3C7)
                              : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF0F172A)
                            : isPending
                                ? const Color(0xFFF59E0B)
                                : const Color(0xFFCBD5E1),
                      ),
                    ),
                    child: Text(
                      isSelected
                          ? 'ĐANG CHỌN'
                          : isPending
                              ? 'CHỜ DUYỆT'
                              : 'CHUYỂN',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: isSelected
                            ? const Color(0xFF0F172A)
                            : isPending
                                ? const Color(0xFF92400E)
                                : const Color(0xFF475569),
                      ),
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(ctx);
                    _handleSelectBranch(i, b);
                  },
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  // =============================================================================
  // NGHIỆP VỤ 4C: KHỐI QUẢN LÝ ĐA CỬA HÀNG / CHI NHÁNH TRỰC TIẾP TRÊN TRANG CÀI ĐẶT
  // - Hiển thị trực quan danh sách các cửa hàng kèm trạng thái duyệt
  // - Nút "+ Thêm cửa hàng / Chi nhánh" cho phép mở popup đăng ký ngay trên app
  // =============================================================================
  Widget _buildMultiShopCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF0F5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFFD6E4)),
                      ),
                      child: const Icon(Icons.domain_add_rounded, color: Color(0xFFFF4783), size: 22),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Quản Lý Đa Cửa Hàng / Chi Nhánh',
                            style: TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Đính kèm chứng từ để Admin phê duyệt',
                            style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF4783),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _openCreateShopSheet,
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Thêm cửa hàng',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          if (_branches.isEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              alignment: Alignment.center,
              child: const Text('Chưa có chi nhánh nào', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
            )
          else
            ...List.generate(_branches.length, (i) {
              final b = _branches[i];
              final isSelected = i == _selectedBranchIndex;
              final isPending = b['status'] == 'PENDING' || b['statusLabel'] == 'Chờ Admin duyệt';

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFFFF0F5)
                      : isPending
                          ? const Color(0xFFFFFBEB)
                          : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFFFF4783)
                        : isPending
                            ? const Color(0xFFFDE68A)
                            : const Color(0xFFE2E8F0),
                    width: 1.2,
                  ),
                ),
                child: InkWell(
                  onTap: () => _handleSelectBranch(i, b),
                  child: Row(
                    children: [
                      Icon(
                        Icons.storefront_rounded,
                        color: isPending
                            ? const Color(0xFFD97706)
                            : (isSelected ? const Color(0xFFFF4783) : const Color(0xFF64748B)),
                        size: 22,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              b['name'] ?? 'Chi nhánh',
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isPending
                                  ? 'Hồ sơ đang chờ Ban Quản Trị thẩm định chứng từ'
                                  : '${b['type'] ?? 'Hộ kinh doanh'}${(b['phone'] != null && b['phone']!.isNotEmpty) ? ' • Hotline: ${b['phone']}' : ''} • ${b['address'] ?? 'Đang hoạt động'}',
                              style: TextStyle(
                                fontSize: 11,
                                color: isPending ? const Color(0xFFB45309) : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFFD0F81B)
                              : isPending
                                  ? const Color(0xFFFEF3C7)
                                  : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF0F172A)
                                : isPending
                                    ? const Color(0xFFF59E0B)
                                    : const Color(0xFFCBD5E1),
                          ),
                        ),
                        child: Text(
                          isSelected
                              ? 'ĐANG CHỌN'
                              : isPending
                                  ? 'CHỜ ADMIN DUYỆT'
                                  : 'CHUYỂN',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: isSelected
                                ? const Color(0xFF0F172A)
                                : isPending
                                    ? const Color(0xFF92400E)
                                    : const Color(0xFF475569),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

// =============================================================================
// NGHIỆP VỤ 5: NÂNG CẤP GÓI DỊCH VỤ PRO BẰNG MÃ VIETQR (DÒNG 430 ĐẾN 440)
// - Dùng để làm gì: Chuyển hướng sang màn hình thanh toán VietQR (UpgradeProScreen).
// - Phục vụ mục đích gì: Cho phép chủ quán mở khóa các tính năng cao cấp
//   (quét không giới hạn biên lai, quản lý nhiều chi nhánh, tự động gửi báo cáo Telegram).
// =============================================================================
  Future<void> _navigateToUpgradePro() async {
    final upgraded = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (context) => const UpgradeProScreen()),
    );
    if (upgraded == true) {
      _loadStoreProfile();
    }
  }

// =============================================================================
// NGHIỆP VỤ 6: KẾT NỐI BOT TELEGRAM BÁO CÁO TỰ ĐỘNG LÚC 22:00 (DÒNG 445 ĐẾN 475)
// - Dùng để làm gì: Mở liên kết deep-link sang ứng dụng Telegram kết nối Bot VikeSo.
// - Phục vụ mục đích gì: Chủ quán bận rộn không cần mở app, đúng 22:00 tối Bot Telegram
//   sẽ tự động gửi tin nhắn báo cáo tóm tắt: Tổng thu, Tổng chi, Tiền lãi ròng trong ngày.
// =============================================================================
  Future<void> _promptConnectTelegram() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Liên kết Telegram 22:00'),
        content: const Text(
          'Bạn muốn mở ứng dụng Telegram và kết nối với Bot chốt sổ tự động 22:00 của VikeSo ngay bây giờ?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4783)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Kết nối ngay', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      final userId = await AuthRepository().getUserId();
      if (userId != null) {
        final link = ApiService.getTelegramDeepLink(userId);
        final uri = Uri.parse(link);
        try {
          final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
          if (!ok) await launchUrl(uri, mode: LaunchMode.platformDefault);
        } catch (e) {
          _showSnack('Không thể mở Telegram: $e');
        }
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) await _loadStoreProfile();
      }
    }
  }

  void _showSnack(String msg, {bool isSuccess = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isSuccess ? const Color(0xFF0F172A) : const Color(0xFFFF4783),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isPro = _subscriptionPlan.toUpperCase() == 'PRO';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: Builder(
          builder: (ctx) => IconButton(
            onPressed: () => Scaffold.of(ctx).openDrawer(),
            icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A), size: 24),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Quản Lý Cửa Hàng',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w800,
            fontSize: 19,
            letterSpacing: -0.4,
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: _showBranchSwitcherSheet,
            icon: const Icon(Icons.swap_horiz_rounded, size: 18, color: Color(0xFFFF4783)),
            label: const Text(
              'Đổi chi nhánh',
              style: TextStyle(color: Color(0xFFFF4783), fontWeight: FontWeight.w700, fontSize: 12.5),
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: const CustomSideDrawer(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStoreProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Cửa hàng
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 58,
                            height: 58,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF0F5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFFF4783), width: 1.8),
                            ),
                            child: const Icon(Icons.storefront_rounded, color: Color(0xFFFF4783), size: 30),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _shopName.isNotEmpty ? _shopName : 'Cửa hàng Vikeso',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 17,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  _businessType,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    color: Color(0xFF64748B),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                if (_storePhone.isNotEmpty) ...[
                                  const SizedBox(height: 3),
                                  Row(
                                    children: [
                                      const Icon(Icons.phone_in_talk_rounded, size: 12, color: Color(0xFF64748B)),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Hotline: $_storePhone',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFF0F172A),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.verified_rounded, size: 13, color: Color(0xFFFF4783)),
                                      SizedBox(width: 4),
                                      Text(
                                        'Hộ kinh doanh đã kích hoạt',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: _openEditShopDialog,
                            icon: const Icon(Icons.edit_outlined, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Card Gói Dịch Vụ Cửa Hàng (FREE / PRO)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF0F5),
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFFFFD6E4)),
                            ),
                            child: Icon(
                              isPro ? Icons.workspace_premium_rounded : Icons.storefront_outlined,
                              color: const Color(0xFFFF4783),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isPro ? 'Gói VikeSo PRO' : 'Gói Cơ Bản (FREE)',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  isPro
                                      ? 'Quét gộp 3 ảnh/lần & Báo cáo tự động 22:00'
                                      : 'Giới hạn 1 ảnh/lần • Nâng cấp PRO quét gộp 3 ảnh',
                                  style: const TextStyle(
                                    fontSize: 11.5,
                                    color: Color(0xFF64748B),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isPro)
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFF4783),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: _navigateToUpgradePro,
                              child: const Text(
                                'Nâng cấp',
                                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD0F81B),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF0F172A), width: 1),
                              ),
                              child: const Text(
                                'ĐANG BẬT',
                                style: TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // =============================================================================
                    // NGHIỆP VỤ 4A: KHỐI QUẢN LÝ ĐA CỬA HÀNG / CHI NHÁNH ĐỒNG BỘ VỚI BẢN WEB
                    // - Nút "+ Thêm cửa hàng" để tạo chi nhánh mới kèm ảnh chứng từ thẩm định
                    // - Danh sách chi nhánh hiển thị trực tiếp với badge: ĐANG CHỌN, CHỜ ADMIN DUYỆT, CHUYỂN
                    // =============================================================================
                    _buildMultiShopCard(),

                    const SizedBox(height: 20),

                    const Text(
                      'Thiết lập & Vận hành cửa hàng',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 10),

                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _menuItem(
                            Icons.storefront_rounded,
                            'Cập nhật thông tin cửa hàng',
                            subtitle: 'Tên hộ kinh doanh, loại hình, hotline',
                            onTap: _openEditShopDialog,
                          ),
                          _menuItem(
                            Icons.workspace_premium_rounded,
                            'Gói dịch vụ PRO & Hóa đơn thanh toán',
                            subtitle: 'Nâng cấp gói VikeSo PRO (99.000đ / 1 tháng) qua VietQR',
                            onTap: _navigateToUpgradePro,
                          ),
                          _menuItem(
                            Icons.send_rounded,
                            'Liên kết Bot Telegram nhận báo cáo 22:00',
                            subtitle: _hasTelegram ? 'Đã kết nối Bot Telegram chốt sổ' : 'Tự động gửi báo cáo dòng tiền lúc 22:00',
                            trailing: !isPro
                                ? const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      ProBadge(),
                                      SizedBox(width: 6),
                                      Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
                                    ],
                                  )
                                : null,
                            onTap: () {
                              if (!isPro) {
                                ProPaywallSheet.show(
                                  context,
                                  featureTitle: 'Báo Cáo Tự Động Telegram 22:00',
                                  featureDescription:
                                      'Tính năng tự động tổng kết sổ sách, chốt doanh thu - chi phí và gửi báo cáo trực tiếp qua Bot Telegram hàng đêm lúc 22h00 chỉ dành riêng cho gói VikeSo PRO.',
                                );
                                return;
                              }
                              _promptConnectTelegram();
                            },
                            isLast: true,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    const Text(
                      'Tự động hóa Báo cáo Chốt sổ 22:00',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 10),

                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          SwitchListTile(
                            title: Row(
                              children: [
                                const Text(
                                  'Email báo cáo',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
                                ),
                                if (!isPro) ...[
                                  const SizedBox(width: 8),
                                  const ProBadge(fontSize: 9),
                                ],
                              ],
                            ),
                            subtitle: const Text(
                              'Bảng sao kê chốt sổ hàng ngày (22:00)',
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                            value: isPro ? _receiveEmail : false,
                            activeThumbColor: const Color(0xFFFF4783),
                            onChanged: (val) {
                              if (!isPro) {
                                ProPaywallSheet.show(
                                  context,
                                  featureTitle: 'Email Báo Cáo 22:00',
                                  featureDescription:
                                      'Tự động gửi email sao kê chốt sổ doanh thu - chi phí cuối ngày lúc 22:00 là tính năng độc quyền của gói VikeSo PRO.',
                                );
                                return;
                              }
                              _updateSetting('receiveEmail', val);
                            },
                          ),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          SwitchListTile(
                            title: Row(
                              children: [
                                const Text(
                                  'Telegram Bot',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
                                ),
                                if (!isPro) ...[
                                  const SizedBox(width: 8),
                                  const ProBadge(fontSize: 9),
                                ],
                              ],
                            ),
                            subtitle: const Text(
                              'Tin nhắn tóm tắt dòng tiền vào/ra tức thì',
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                            value: isPro ? _receiveTelegram : false,
                            activeThumbColor: const Color(0xFFFF4783),
                            onChanged: (val) {
                              if (!isPro) {
                                ProPaywallSheet.show(
                                  context,
                                  featureTitle: 'Báo Cáo Telegram Bot',
                                  featureDescription:
                                      'Nhận tin nhắn thông báo dòng tiền tức thì và báo cáo chốt sổ lúc 22:00 qua Telegram Bot là tính năng độc quyền của gói VikeSo PRO.',
                                );
                                return;
                              }
                              if (val && !_hasTelegram) {
                                _promptConnectTelegram();
                                return;
                              }
                              _updateSetting('receiveTelegram', val);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _menuItem(
    IconData icon,
    String text, {
    String? subtitle,
    VoidCallback? onTap,
    bool isLast = false,
    Widget? trailing,
  }) {
    return Container(
      decoration: BoxDecoration(
        border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: ListTile(
        leading: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF0F172A), size: 20),
        ),
        title: Text(
          text,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0F172A)),
        ),
        subtitle: subtitle != null
            ? Text(subtitle, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)))
            : null,
        trailing: trailing ?? const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
        onTap: onTap,
      ),
    );
  }
}

