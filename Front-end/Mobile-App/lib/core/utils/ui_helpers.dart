import 'package:flutter/material.dart';

class UIHelpers {
  /// Hiển thị thông báo (SnackBar) cơ bản
  static void showSnackBar(BuildContext context, String message,
      {Color backgroundColor = Colors.black87,
      Duration duration = const Duration(seconds: 3)}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: backgroundColor,
          duration: duration,
          behavior: SnackBarBehavior.floating,
        ),
      );
  }

  /// Hiển thị thông báo thành công
  static void showSuccessToast(BuildContext context, String message) {
    showSnackBar(context, message, backgroundColor: const Color(0xFF0F172A));
  }

  /// Hiển thị thông báo cảnh báo
  static void showWarningToast(BuildContext context, String message) {
    showSnackBar(context, message, backgroundColor: const Color(0xFFFF4783), duration: const Duration(seconds: 4));
  }

  /// Hiển thị Dialog thông báo đơn giản
  static void showInfoDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}
