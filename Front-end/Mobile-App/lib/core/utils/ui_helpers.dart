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

  /// Hiển thị thông báo thành công (Màu xanh)
  static void showSuccessToast(BuildContext context, String message) {
    showSnackBar(context, message, backgroundColor: Colors.green);
  }

  /// Hiển thị thông báo cảnh báo (Màu cam)
  static void showWarningToast(BuildContext context, String message) {
    showSnackBar(context, message, backgroundColor: Colors.orange, duration: const Duration(seconds: 4));
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
