import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/intl.dart';
import '../../core/utils/ui_helpers.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';

class ManualEntryScreen extends StatefulWidget {
  const ManualEntryScreen({super.key});

  @override
  State<ManualEntryScreen> createState() => _ManualEntryScreenState();
}

class _ManualEntryScreenState extends State<ManualEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _reasonController = TextEditingController();

  String _transactionType = 'THU'; // 'THU' hoặc 'CHI'
  String _selectedCategory = 'Hoa Don Le';
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;

  final Map<String, String> _categories = {
    'Hoa Don Le': 'Hóa đơn lẻ',
    'POS Ket Ca': 'POS kết ca',
    'So Tay': 'Sổ tay / Ghi nợ',
    'Chuyen Khoan': 'Chuyển khoản',
    'Khac': 'Khác',
  };

  @override
  void dispose() {
    _amountController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate.isAfter(now) ? now : _selectedDate,
      firstDate: DateTime(2020),
      lastDate: now, // Khóa không cho phép chọn ngày tương lai
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF198754),
              onPrimary: Colors.white,
              onSurface: Colors.black87,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      // Giữ giờ phút hiện tại hoặc đặt mốc giữa ngày
      setState(() {
        _selectedDate = DateTime(
          picked.year,
          picked.month,
          picked.day,
          now.hour,
          now.minute,
          now.second,
        );
      });
    }
  }

  String _formatDisplayDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final compareDate = DateTime(date.year, date.month, date.day);

    final formatter = DateFormat('dd/MM/yyyy');
    if (compareDate == today) {
      return 'Hôm nay, ${formatter.format(date)}';
    } else if (compareDate == yesterday) {
      return 'Hôm qua, ${formatter.format(date)}';
    } else {
      return DateFormat('EEEE, dd/MM/yyyy', 'vi').format(date);
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final rawAmount = _amountController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final double? amount = double.tryParse(rawAmount);

    if (amount == null || amount <= 0) {
      UIHelpers.showWarningToast(context, 'Vui lòng nhập số tiền hợp lệ (> 0 đ)');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final userId = await AuthRepository().getUserId() ?? dotenv.env['USER_ID'] ?? '';
      if (userId.isEmpty) {
        if (mounted) {
          UIHelpers.showWarningToast(context, 'Không tìm thấy thông tin tài khoản (userId)');
        }
        return;
      }

      // Payload JSON: ép kiểu ngày đã chọn thành ISO 8601 String
      final payloadItem = {
        'totalAmount': amount,
        'transactionType': _transactionType,
        'category': _selectedCategory,
        'reason': _reasonController.text.trim(),
        'transactionDate': _selectedDate.toIso8601String(),
      };

      final response = await ApiService().saveTransactions(
        userId: userId,
        items: [payloadItem],
      );

      if (mounted) {
        if (response['success'] == true) {
          UIHelpers.showSuccessToast(context, 'Đã lưu giao dịch thành công!');
          Navigator.pop(context, true);
        } else {
          final msg = response['message'] ?? 'Lưu thất bại, vui lòng thử lại';
          UIHelpers.showWarningToast(context, msg.toString());
        }
      }
    } catch (e) {
      if (mounted) {
        UIHelpers.showWarningToast(context, 'Lỗi kết nối: $e');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'vi_VN');

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Nhập Giao Dịch Thủ Công',
          style: TextStyle(
            color: Color(0xFF191C1D),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Color(0xFF191C1D)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. CHỌN LOẠI THU / CHI
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _transactionType = 'THU';
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: _transactionType == 'THU'
                                ? const Color(0xFF198754)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFF198754),
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.arrow_downward_rounded,
                                color: _transactionType == 'THU'
                                    ? Colors.white
                                    : const Color(0xFF198754),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'TIỀN THU',
                                style: TextStyle(
                                  color: _transactionType == 'THU'
                                      ? Colors.white
                                      : const Color(0xFF198754),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _transactionType = 'CHI';
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: _transactionType == 'CHI'
                                ? const Color(0xFFDC3545)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFFDC3545),
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.arrow_upward_rounded,
                                color: _transactionType == 'CHI'
                                    ? Colors.white
                                    : const Color(0xFFDC3545),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'TIỀN CHI',
                                style: TextStyle(
                                  color: _transactionType == 'CHI'
                                      ? Colors.white
                                      : const Color(0xFFDC3545),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // 2. NHẬP SỐ TIỀN
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Số tiền giao dịch *',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6C757D),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _amountController,
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        onChanged: (val) {
                          if (val.isNotEmpty) {
                            final number = int.tryParse(val.replaceAll('.', ''));
                            if (number != null) {
                              final formatted = currencyFormatter.format(number);
                              if (formatted != val) {
                                _amountController.value = TextEditingValue(
                                  text: formatted,
                                  selection: TextSelection.collapsed(
                                    offset: formatted.length,
                                  ),
                                );
                              }
                            }
                          }
                          setState(() {});
                        },
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: _transactionType == 'THU'
                              ? const Color(0xFF198754)
                              : const Color(0xFFDC3545),
                        ),
                        decoration: const InputDecoration(
                          hintText: '0',
                          hintStyle: TextStyle(
                            color: Colors.black26,
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                          suffixText: 'đ',
                          suffixStyle: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black54,
                          ),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.all(0),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Vui lòng nhập số tiền';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // 3. COMPONENT "NGÀY GIAO DỊCH" (showDatePicker)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Ngày giao dịch *',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6C757D),
                        ),
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: _pickDate,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F3F5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFFE9ECEF),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.calendar_today_outlined,
                                color: Color(0xFF198754),
                                size: 20,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _formatDisplayDate(_selectedDate),
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF212529),
                                  ),
                                ),
                              ),
                              const Icon(
                                Icons.arrow_drop_down,
                                color: Color(0xFF6C757D),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // 4. DANH MỤC
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Danh mục giao dịch',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6C757D),
                        ),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedCategory,
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          filled: true,
                          fillColor: const Color(0xFFF1F3F5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFE9ECEF),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFE9ECEF),
                            ),
                          ),
                        ),
                        items: _categories.entries.map((entry) {
                          return DropdownMenuItem<String>(
                            value: entry.key,
                            child: Text(
                              entry.value,
                              style: const TextStyle(
                                fontSize: 15,
                                color: Color(0xFF212529),
                              ),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedCategory = val;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // 5. LÝ DO / GHI CHÚ
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Lý do / Nội dung',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6C757D),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _reasonController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'Nhập nội dung (VD: Tiền mua rau củ, Bán đơn lẻ...)',
                          hintStyle: const TextStyle(
                            fontSize: 14,
                            color: Colors.black38,
                          ),
                          filled: true,
                          fillColor: const Color(0xFFF1F3F5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFE9ECEF),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFE9ECEF),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // 6. NÚT LƯU GIAO DỊCH
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF198754),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 2,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'LƯU GIAO DỊCH',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.5,
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
}
