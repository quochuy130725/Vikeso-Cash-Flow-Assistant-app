import 'package:flutter/material.dart';
import '../../data/vietnam_address_data.dart';

class AddressPickerResult {
  final String province;
  final String district;
  final String ward;

  AddressPickerResult({
    required this.province,
    required this.district,
    required this.ward,
  });

  String get administrativeText {
    final parts = [ward, district, province].where((p) => p.trim().isNotEmpty).toList();
    return parts.join(', ');
  }
}

Future<AddressPickerResult?> showAddressPickerBottomSheet({
  required BuildContext context,
  String initialProvince = '',
  String initialDistrict = '',
  String initialWard = '',
}) {
  return showModalBottomSheet<AddressPickerResult>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _AddressPickerBottomSheet(
      initialProvince: initialProvince,
      initialDistrict: initialDistrict,
      initialWard: initialWard,
    ),
  );
}

class _AddressPickerBottomSheet extends StatefulWidget {
  final String initialProvince;
  final String initialDistrict;
  final String initialWard;

  const _AddressPickerBottomSheet({
    this.initialProvince = '',
    this.initialDistrict = '',
    this.initialWard = '',
  });

  @override
  State<_AddressPickerBottomSheet> createState() => _AddressPickerBottomSheetState();
}

class _AddressPickerBottomSheetState extends State<_AddressPickerBottomSheet> {
  // 0: Tỉnh/TP, 1: Quận/Huyện, 2: Phường/Xã
  int _currentStep = 0;

  String _selectedProvince = '';
  String _selectedDistrict = '';
  String _selectedWard = '';

  final TextEditingController _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _selectedProvince = widget.initialProvince;
    _selectedDistrict = widget.initialDistrict;
    _selectedWard = widget.initialWard;

    // Xác định tab ban đầu nếu có dữ liệu truyền vào
    if (_selectedProvince.isNotEmpty) {
      if (_selectedDistrict.isNotEmpty) {
        _currentStep = 2;
      } else {
        _currentStep = 1;
      }
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<ProvinceData> get _allProvinces => VietnamAddressRepository.provinces;

  List<DistrictData> get _currentDistricts {
    if (_selectedProvince.isEmpty) return [];
    final prov = _allProvinces.firstWhere(
      (p) => p.name == _selectedProvince,
      orElse: () => const ProvinceData(name: '', districts: []),
    );
    return prov.districts;
  }

  List<String> get _currentWards {
    if (_selectedDistrict.isEmpty) return [];
    final dist = _currentDistricts.firstWhere(
      (d) => d.name == _selectedDistrict,
      orElse: () => const DistrictData(name: '', wards: []),
    );
    return dist.wards;
  }

  List<String> get _displayedItems {
    final query = _searchQuery.trim().toLowerCase();
    if (_currentStep == 0) {
      final names = _allProvinces.map((p) => p.name).toList();
      if (query.isEmpty) return names;
      return names.where((n) => n.toLowerCase().contains(query)).toList();
    } else if (_currentStep == 1) {
      final names = _currentDistricts.map((d) => d.name).toList();
      if (query.isEmpty) return names;
      return names.where((n) => n.toLowerCase().contains(query)).toList();
    } else {
      final names = _currentWards;
      if (query.isEmpty) return names;
      return names.where((n) => n.toLowerCase().contains(query)).toList();
    }
  }

  void _onStepSelected(int step) {
    if (step == 1 && _selectedProvince.isEmpty) return;
    if (step == 2 && (_selectedProvince.isEmpty || _selectedDistrict.isEmpty)) return;
    setState(() {
      _currentStep = step;
      _searchCtrl.clear();
      _searchQuery = '';
    });
  }

  void _onItemSelected(String item) {
    setState(() {
      if (_currentStep == 0) {
        _selectedProvince = item;
        _selectedDistrict = '';
        _selectedWard = '';
        _currentStep = 1;
        _searchCtrl.clear();
        _searchQuery = '';
      } else if (_currentStep == 1) {
        _selectedDistrict = item;
        _selectedWard = '';
        _currentStep = 2;
        _searchCtrl.clear();
        _searchQuery = '';
      } else {
        _selectedWard = item;
        Navigator.pop(
          context,
          AddressPickerResult(
            province: _selectedProvince,
            district: _selectedDistrict,
            ward: _selectedWard,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = _displayedItems;

    return Container(
      height: MediaQuery.of(context).size.height * 0.78,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 10, bottom: 6),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.location_on_rounded, color: Color(0xFFFF4783), size: 22),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Chọn địa chỉ cơ sở kinh doanh',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.grey),
                  onPressed: () => Navigator.pop(context),
                  splashRadius: 20,
                ),
              ],
            ),
          ),

          // Step Tabs Indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: _buildStepTab(
                    index: 0,
                    title: _selectedProvince.isNotEmpty ? _selectedProvince : 'Tỉnh / TP',
                    isActive: _currentStep == 0,
                    isDone: _selectedProvince.isNotEmpty,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: _buildStepTab(
                    index: 1,
                    title: _selectedDistrict.isNotEmpty ? _selectedDistrict : 'Quận / Huyện',
                    isActive: _currentStep == 1,
                    isDone: _selectedDistrict.isNotEmpty,
                    isEnabled: _selectedProvince.isNotEmpty,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: _buildStepTab(
                    index: 2,
                    title: _selectedWard.isNotEmpty ? _selectedWard : 'Phường / Xã',
                    isActive: _currentStep == 2,
                    isDone: _selectedWard.isNotEmpty,
                    isEnabled: _selectedDistrict.isNotEmpty,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: _currentStep == 0
                    ? 'Tìm Tỉnh / Thành phố...'
                    : _currentStep == 1
                        ? 'Tìm Quận / Huyện tại $_selectedProvince...'
                        : 'Tìm Phường / Xã tại $_selectedDistrict...',
                hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade400),
                prefixIcon: const Icon(Icons.search, size: 20, color: Colors.grey),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFFF4783)),
                ),
              ),
            ),
          ),

          const Divider(height: 16),

          // Items List
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Text(
                      'Không tìm thấy kết quả phù hợp',
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey.shade100),
                    itemBuilder: (ctx, index) {
                      final item = items[index];
                      final isSelected = (_currentStep == 0 && item == _selectedProvince) ||
                          (_currentStep == 1 && item == _selectedDistrict) ||
                          (_currentStep == 2 && item == _selectedWard);

                      return ListTile(
                        dense: true,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        title: Text(
                          item,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? const Color(0xFFFF4783) : const Color(0xFF1E293B),
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle_rounded, color: Color(0xFFFF4783), size: 20)
                            : const Icon(Icons.chevron_right_rounded, color: Colors.black26, size: 20),
                        onTap: () => _onItemSelected(item),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepTab({
    required int index,
    required String title,
    required bool isActive,
    required bool isDone,
    bool isEnabled = true,
  }) {
    return InkWell(
      onTap: isEnabled ? () => _onStepSelected(index) : null,
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFFFFF0F5)
              : (isDone ? const Color(0xFFF1F5F9) : const Color(0xFFF8FAFC)),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive
                ? const Color(0xFFFF4783)
                : (isDone ? Colors.grey.shade300 : Colors.grey.shade200),
            width: isActive ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              'Bước ${index + 1}',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isActive
                    ? const Color(0xFFFF4783)
                    : (isEnabled ? Colors.grey.shade600 : Colors.grey.shade400),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isActive || isDone ? FontWeight.bold : FontWeight.normal,
                color: isActive
                    ? const Color(0xFFFF4783)
                    : (isEnabled ? const Color(0xFF1E293B) : Colors.grey.shade400),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
