import 'package:flutter/material.dart';
import '../../data/services/admin_service.dart';
import 'package:intl/intl.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _adminService = AdminService();
  final _searchController = TextEditingController();

  bool _isLoadingOverview = true;
  bool _isLoadingUsers = true;
  Map<String, dynamic>? _overviewData;
  List<dynamic> _users = [];
  int _totalUsersCount = 0;
  final _currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadOverview();
    _loadUsers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadOverview() async {
    setState(() => _isLoadingOverview = true);
    final data = await _adminService.getOverview();
    if (mounted) {
      setState(() {
        _overviewData = data;
        _isLoadingOverview = false;
      });
    }
  }

  Future<void> _loadUsers({String? search}) async {
    setState(() => _isLoadingUsers = true);
    final res = await _adminService.getUsers(search: search);
    if (mounted) {
      setState(() {
        _users = (res?['users'] as List?) ?? [];
        _totalUsersCount = (res?['total'] is int) ? res!['total'] as int : _users.length;
        _isLoadingUsers = false;
      });
    }
  }

  Future<void> _handleUpdatePlan(Map<String, dynamic> user) async {
    final currentPlan = (user['subscriptionPlan']?.toString() ?? 'FREE').toUpperCase();
    final newPlan = currentPlan == 'PRO' ? 'FREE' : 'PRO';
    final userId = user['_id']?.toString() ?? user['id']?.toString() ?? '';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Chuyển gói sang $newPlan'),
        content: Text('Bạn có chắc muốn chuyển tài khoản ${user['email']} sang gói $newPlan không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF673AB7)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xác nhận', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _adminService.updatePlan(userId, newPlan, days: 30);
      if (!mounted) return;
      if (success) {
        _showSnack('Cập nhật gói thành công sang $newPlan!', isSuccess: true);
        _loadUsers(search: _searchController.text.trim());
        _loadOverview();
      } else {
        _showSnack('Không thể cập nhật gói.');
      }
    }
  }

  Future<void> _handleUpdateRole(Map<String, dynamic> user) async {
    final currentRole = (user['role']?.toString() ?? 'OWNER').toUpperCase();
    final newRole = currentRole == 'ADMIN' ? 'OWNER' : 'ADMIN';
    final userId = user['_id']?.toString() ?? user['id']?.toString() ?? '';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Phân quyền sang $newRole'),
        content: Text('Bạn có chắc muốn đổi vai trò của ${user['email']} thành $newRole?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.deepOrange),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Đổi quyền', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _adminService.updateRole(userId, newRole);
      if (!mounted) return;
      if (success) {
        _showSnack('Cập nhật quyền thành công sang $newRole!', isSuccess: true);
        _loadUsers(search: _searchController.text.trim());
      } else {
        _showSnack('Không thể cập nhật vai trò.');
      }
    }
  }

  Future<void> _handleDeleteUser(Map<String, dynamic> user) async {
    final userId = user['_id']?.toString() ?? user['id']?.toString() ?? '';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa người dùng', style: TextStyle(color: Colors.red)),
        content: Text('Hành động này không thể hoàn tác! Bạn có chắc muốn xóa vĩnh viễn tài khoản ${user['email']}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xóa', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _adminService.deleteUser(userId);
      if (!mounted) return;
      if (success) {
        _showSnack('Đã xóa người dùng thành công!', isSuccess: true);
        _loadUsers(search: _searchController.text.trim());
        _loadOverview();
      } else {
        _showSnack('Không thể xóa người dùng.');
      }
    }
  }

  void _showSnack(String msg, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isSuccess ? Colors.green : Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const primaryAdmin = Color(0xFF2C1654);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Trị Hệ Thống', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: primaryAdmin,
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFFFD700),
          labelColor: const Color(0xFFFFD700),
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.analytics_outlined), text: 'Tổng quan'),
            Tab(icon: Icon(Icons.people_outline), text: 'Người dùng'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildUsersTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    if (_isLoadingOverview) {
      return const Center(child: CircularProgressIndicator());
    }

    final totalUsers = _overviewData?['totalUsers'] ?? 0;
    final proUsers = _overviewData?['proUsers'] ?? 0;
    final totalRevenue = (_overviewData?['totalRevenue'] is num) ? (_overviewData!['totalRevenue'] as num).toDouble() : 0.0;
    final totalIncome = (_overviewData?['totalIncome'] is num) ? (_overviewData!['totalIncome'] as num).toDouble() : 0.0;
    final totalExpense = (_overviewData?['totalExpense'] is num) ? (_overviewData!['totalExpense'] as num).toDouble() : 0.0;

    return RefreshIndicator(
      onRefresh: _loadOverview,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Chỉ số quan trọng (KPIs)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildKpiCard(
                    'Tổng Users',
                    '$totalUsers',
                    Icons.people,
                    const Color(0xFF2196F3),
                    subtitle: 'PRO: $proUsers user',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKpiCard(
                    'Doanh thu nạp PRO',
                    _currencyFormat.format(totalRevenue),
                    Icons.workspace_premium,
                    const Color(0xFFFF9800),
                    subtitle: 'Qua SePay VietQR',
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildKpiCard(
                    'Tổng Doanh Thu Cửa Hàng',
                    _currencyFormat.format(totalIncome),
                    Icons.trending_up,
                    Colors.green,
                    subtitle: 'Từ các hóa đơn THU',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildKpiCard(
                    'Tổng Chi Phí Cửa Hàng',
                    _currencyFormat.format(totalExpense),
                    Icons.trending_down,
                    Colors.redAccent,
                    subtitle: 'Từ các hóa đơn CHI',
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Card Thông tin hệ thống
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.shield_outlined, color: Color(0xFF2C1654), size: 20),
                      SizedBox(width: 8),
                      Text('Trạng thái Máy chủ & Dịch vụ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                  const Divider(height: 20),
                  _buildStatusRow('Backend API', 'Online (Express v5)', Colors.green),
                  _buildStatusRow('SePay VietQR', 'Sẵn sàng nhận thanh toán', Colors.green),
                  _buildStatusRow('Telegram Bot', '@FinautoDemo_bot (Active)', Colors.blue),
                  _buildStatusRow('Cronjob Báo cáo', 'Lên lịch 22:00 mỗi ngày', Colors.purple),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color, {String? subtitle}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusRow(String label, String status, Color statusColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
          Row(
            children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(status, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUsersTab() {
    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Tìm theo email, tên cửa hàng...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _searchController.clear();
                  _loadUsers();
                },
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              filled: true,
              fillColor: Colors.white,
            ),
            onSubmitted: (query) => _loadUsers(search: query.trim()),
          ),
        ),

        // User count label
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tổng cộng: $_totalUsersCount tài khoản', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              IconButton(
                icon: const Icon(Icons.refresh, size: 20),
                onPressed: () => _loadUsers(search: _searchController.text.trim()),
              ),
            ],
          ),
        ),

        // List
        Expanded(
          child: _isLoadingUsers
              ? const Center(child: CircularProgressIndicator())
              : _users.isEmpty
                  ? const Center(child: Text('Không tìm thấy người dùng nào.'))
                  : ListView.builder(
                      itemCount: _users.length,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      itemBuilder: (context, index) {
                        final user = _users[index] as Map<String, dynamic>;
                        final email = user['email']?.toString() ?? '';
                        final shopName = user['shopName']?.toString() ?? 'Chưa đặt tên';
                        final role = (user['role']?.toString() ?? 'OWNER').toUpperCase();
                        final plan = (user['subscriptionPlan']?.toString() ?? 'FREE').toUpperCase();
                        final phone = user['phone']?.toString() ?? '';
                        final isPro = plan == 'PRO';
                        final isAdmin = role == 'ADMIN';

                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 1,
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: isAdmin
                                  ? Colors.deepPurple
                                  : (isPro ? const Color(0xFFFFD700) : Colors.grey[300]),
                              child: Text(
                                shopName.isNotEmpty ? shopName[0].toUpperCase() : 'U',
                                style: TextStyle(
                                  color: isPro && !isAdmin ? Colors.black87 : Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    shopName,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isAdmin ? Colors.redAccent : Colors.blueGrey,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    role,
                                    style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isPro ? const Color(0xFFFFD700) : Colors.grey[200],
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    plan,
                                    style: TextStyle(
                                      fontSize: 9,
                                      color: isPro ? Colors.black87 : Colors.grey[800],
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 2),
                                Text(email, style: const TextStyle(fontSize: 13, color: Colors.grey)),
                                if (phone.isNotEmpty)
                                  Text('SĐT: $phone', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                              ],
                            ),
                            trailing: PopupMenuButton<String>(
                              onSelected: (val) {
                                if (val == 'plan') _handleUpdatePlan(user);
                                if (val == 'role') _handleUpdateRole(user);
                                if (val == 'delete') _handleDeleteUser(user);
                              },
                              itemBuilder: (ctx) => [
                                PopupMenuItem(
                                  value: 'plan',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.workspace_premium, size: 18, color: Colors.orange),
                                      const SizedBox(width: 8),
                                      Text(isPro ? 'Hạ xuống FREE' : 'Nâng cấp lên PRO'),
                                    ],
                                  ),
                                ),
                                PopupMenuItem(
                                  value: 'role',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.admin_panel_settings, size: 18, color: Colors.deepPurple),
                                      const SizedBox(width: 8),
                                      Text(isAdmin ? 'Bỏ quyền ADMIN' : 'Cấp quyền ADMIN'),
                                    ],
                                  ),
                                ),
                                const PopupMenuDivider(),
                                const PopupMenuItem(
                                  value: 'delete',
                                  child: Row(
                                    children: [
                                      Icon(Icons.delete_outline, size: 18, color: Colors.red),
                                      SizedBox(width: 8),
                                      Text('Xóa tài khoản', style: TextStyle(color: Colors.red)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}
