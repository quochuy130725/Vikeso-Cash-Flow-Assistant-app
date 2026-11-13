import 'package:flutter/material.dart';
import '../../data/vietnam_address_data.dart';
import 'address_picker_bottom_sheet.dart';

class AddressFormField extends StatefulWidget {
  final String? initialAddress;
  final ValueChanged<String> onChanged;
  final String labelText;
  final bool isRequired;

  const AddressFormField({
    super.key,
    this.initialAddress,
    required this.onChanged,
    this.labelText = 'Địa chỉ kinh doanh thực tế',
    this.isRequired = false,
  });

  @override
  State<AddressFormField> createState() => _AddressFormFieldState();
}

class _AddressFormFieldState extends State<AddressFormField> {
  String _province = '';
  String _district = '';
  String _ward = '';
  late final TextEditingController _streetCtrl;

  @override
  void initState() {
    super.initState();
    final parsed = VietnamAddressRepository.parseAddress(widget.initialAddress);
    _province = parsed['province'] ?? '';
    _district = parsed['district'] ?? '';
    _ward = parsed['ward'] ?? '';
    _streetCtrl = TextEditingController(text: parsed['street'] ?? '');

    _streetCtrl.addListener(_emitChanges);
  }

  @override
  void didUpdateWidget(covariant AddressFormField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialAddress != oldWidget.initialAddress && widget.initialAddress != _currentFullAddress) {
      final parsed = VietnamAddressRepository.parseAddress(widget.initialAddress);
      setState(() {
        _province = parsed['province'] ?? '';
        _district = parsed['district'] ?? '';
        _ward = parsed['ward'] ?? '';
        _streetCtrl.text = parsed['street'] ?? '';
      });
    }
  }

  @override
  void dispose() {
    _streetCtrl.removeListener(_emitChanges);
    _streetCtrl.dispose();
    super.dispose();
  }

  String get _currentFullAddress {
    return VietnamAddressRepository.formatAddress(
      street: _streetCtrl.text.trim(),
      ward: _ward,
      district: _district,
      province: _province,
    );
  }

  void _emitChanges() {
    widget.onChanged(_currentFullAddress);
  }

  Future<void> _handlePickAddress() async {
    final result = await showAddressPickerBottomSheet(
      context: context,
      initialProvince: _province,
      initialDistrict: _district,
      initialWard: _ward,
    );

    if (result != null) {
      setState(() {
        _province = result.province;
        _district = result.district;
        _ward = result.ward;
      });
      _emitChanges();
    }
  }

  String get _adminAreaSummary {
    final parts = [_ward, _district, _province].where((p) => p.trim().isNotEmpty).toList();
    return parts.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final hasAdminArea = _adminAreaSummary.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              widget.isRequired ? '${widget.labelText} *' : widget.labelText,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF475569),
              ),
            ),
            const Text(
              'Chọn danh mục chuẩn',
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        // Nút chọn Tỉnh / Quận / Phường
        InkWell(
          onTap: _handlePickAddress,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: hasAdminArea ? const Color(0xFFFF4783).withValues(alpha: 0.5) : Colors.grey.shade300,
                width: hasAdminArea ? 1.2 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.location_on_rounded,
                  color: hasAdminArea ? const Color(0xFFFF4783) : Colors.grey.shade500,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: hasAdminArea
                      ? Text(
                          _adminAreaSummary,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1E293B),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        )
                      : Text(
                          'Chạm để chọn Tỉnh/TP, Quận/Huyện, Phường/Xã',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade500,
                          ),
                        ),
                ),
                const SizedBox(width: 4),
                Icon(
                  hasAdminArea ? Icons.edit_location_alt_rounded : Icons.keyboard_arrow_down_rounded,
                  color: hasAdminArea ? const Color(0xFFFF4783) : Colors.grey,
                  size: 20,
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 8),

        // Ô nhập Số nhà, tên đường
        TextField(
          controller: _streetCtrl,
          decoration: InputDecoration(
            labelText: 'Số nhà, tên đường, tòa nhà, ngõ/hẻm',
            labelStyle: TextStyle(fontSize: 12.5, color: Colors.grey.shade600),
            hintText: 'VD: 123 Nguyễn Trãi',
            hintStyle: TextStyle(fontSize: 12.5, color: Colors.grey.shade400),
            prefixIcon: const Icon(Icons.home_outlined, size: 20),
            contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFFF4783)),
            ),
          ),
          style: const TextStyle(fontSize: 13.5),
        ),

        // Xem trước chuỗi địa chỉ đầy đủ
        if (_currentFullAddress.isNotEmpty) ...[
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline_rounded, color: Color(0xFFFF4783), size: 14),
                const SizedBox(width: 6),
                const Text(
                  'Địa chỉ lưu: ',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                ),
                Expanded(
                  child: Text(
                    _currentFullAddress,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E293B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

