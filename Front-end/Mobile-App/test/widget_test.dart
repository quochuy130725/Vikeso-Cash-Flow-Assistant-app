// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:finauto_mobile/main.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const QuanLyCuaHangApp());

    // Verify that our splash screen text exists.
    expect(find.text('Quản lý cửa hàng'), findsOneWidget);
    expect(find.text('Đang tải...'), findsOneWidget);

    // Let the splash screen timer run and settle the navigation to the login screen
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
  });
}
