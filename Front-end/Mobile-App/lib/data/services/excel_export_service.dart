import 'dart:io';
import 'package:excel/excel.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class ExcelExportService {
  static final _currencyFormat =
      NumberFormat.currency(locale: 'vi_VN', symbol: '');

  /// Xuất danh sách giao dịch ra file Excel và mở hộp thoại chia sẻ.
  static Future<void> exportTransactions(
    BuildContext context,
    List<Map<String, dynamic>> transactions, {
    String fileName = 'FinAuto_BaoCao',
  }) async {
    try {
      final excel = Excel.createExcel();
      final sheet = excel['Báo cáo'];
      // Xóa sheet mặc định "Sheet1" nếu tồn tại
      excel.delete('Sheet1');

      // ── Tiêu đề file ──────────────────────────────────────────────────────
      final titleStyle = CellStyle(
        bold: true,
        fontSize: 14,
        fontColorHex: ExcelColor.fromHexString('#FFFFFF'),
        backgroundColorHex: ExcelColor.fromHexString('#FF5C8D'),
        horizontalAlign: HorizontalAlign.Center,
      );

      sheet.merge(
        CellIndex.indexByString('A1'),
        CellIndex.indexByString('F1'),
      );
      final titleCell = sheet.cell(CellIndex.indexByString('A1'));
      titleCell.value = TextCellValue('BÁO CÁO THU CHI - FINAUTO');
      titleCell.cellStyle = titleStyle;

      // Ngày xuất
      sheet.merge(
        CellIndex.indexByString('A2'),
        CellIndex.indexByString('F2'),
      );
      final dateCell = sheet.cell(CellIndex.indexByString('A2'));
      dateCell.value = TextCellValue(
        'Ngày xuất: ${DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now())}',
      );
      dateCell.cellStyle = CellStyle(
        italic: true,
        fontColorHex: ExcelColor.fromHexString('#888888'),
        horizontalAlign: HorizontalAlign.Center,
      );

      // ── Header cột ─────────────────────────────────────────────────────────
      final headerStyle = CellStyle(
        bold: true,
        fontColorHex: ExcelColor.fromHexString('#FFFFFF'),
        backgroundColorHex: ExcelColor.fromHexString('#B31F56'),
        horizontalAlign: HorizontalAlign.Center,
      );

      const headers = [
        'STT',
        'Ngày giờ',
        'Loại',
        'Danh mục',
        'Lý do',
        'Số tiền (đ)',
      ];

      for (var i = 0; i < headers.length; i++) {
        final cell =
            sheet.cell(CellIndex.indexByColumnRow(columnIndex: i, rowIndex: 2));
        cell.value = TextCellValue(headers[i]);
        cell.cellStyle = headerStyle;
      }

      // ── Dữ liệu ────────────────────────────────────────────────────────────
      double totalThu = 0;
      double totalChi = 0;

      final thuStyle = CellStyle(
        fontColorHex: ExcelColor.fromHexString('#198754'),
        bold: true,
      );
      final chiStyle = CellStyle(
        fontColorHex: ExcelColor.fromHexString('#DC3545'),
        bold: true,
      );

      for (var idx = 0; idx < transactions.length; idx++) {
        final tx = transactions[idx];
        final rowIndex = idx + 3;

        final type = tx['transactionType'] ?? '';
        final amount = (tx['totalAmount'] as num?)?.toDouble() ?? 0.0;
        final category = _formatCategory(tx['category'] ?? '');
        final reason = tx['reason'] ?? '';
        final tDate = _parseDate(tx['transactionDate']);
        final dateStr = tDate != null
            ? DateFormat('dd/MM/yyyy HH:mm').format(tDate.toLocal())
            : '';

        if (type == 'THU') totalThu += amount;
        if (type == 'CHI') totalChi += amount;

        final amountStyle = type == 'THU' ? thuStyle : chiStyle;

        _setCell(sheet, rowIndex, 0, TextCellValue('${idx + 1}'));
        _setCell(sheet, rowIndex, 1, TextCellValue(dateStr));
        _setCell(sheet, rowIndex, 2,
            TextCellValue(type == 'THU' ? '↑ Thu' : '↓ Chi'),
            style: amountStyle);
        _setCell(sheet, rowIndex, 3, TextCellValue(category));
        _setCell(sheet, rowIndex, 4, TextCellValue(reason));
        _setCell(
          sheet,
          rowIndex,
          5,
          TextCellValue(
              '${type == 'THU' ? '+' : '-'}${_currencyFormat.format(amount)}'),
          style: amountStyle,
        );
      }

      // ── Dòng tổng kết ───────────────────────────────────────────────────────
      final summaryRow = transactions.length + 4;
      final summaryStyle = CellStyle(
        bold: true,
        backgroundColorHex: ExcelColor.fromHexString('#FFF0F5'),
      );

      sheet.merge(
        CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: summaryRow),
        CellIndex.indexByColumnRow(columnIndex: 4, rowIndex: summaryRow),
      );
      final sumLabel = sheet.cell(
          CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: summaryRow));
      sumLabel.value = TextCellValue('TỔNG KẾT');
      sumLabel.cellStyle = summaryStyle;

      final netRow = summaryRow + 1;
      _setCell(sheet, netRow, 0, TextCellValue('Tổng Thu'),
          style: CellStyle(
              bold: true, fontColorHex: ExcelColor.fromHexString('#198754')));
      _setCell(sheet, netRow, 5,
          TextCellValue('+${_currencyFormat.format(totalThu)} đ'),
          style: CellStyle(
              bold: true, fontColorHex: ExcelColor.fromHexString('#198754')));

      final chiRow = summaryRow + 2;
      _setCell(sheet, chiRow, 0, TextCellValue('Tổng Chi'),
          style: CellStyle(
              bold: true, fontColorHex: ExcelColor.fromHexString('#DC3545')));
      _setCell(sheet, chiRow, 5,
          TextCellValue('-${_currencyFormat.format(totalChi)} đ'),
          style: CellStyle(
              bold: true, fontColorHex: ExcelColor.fromHexString('#DC3545')));

      final profitRow = summaryRow + 3;
      final profit = totalThu - totalChi;
      final profitColor = profit >= 0 ? '#198754' : '#DC3545';
      _setCell(sheet, profitRow, 0, TextCellValue('Lợi nhuận'),
          style: CellStyle(
              bold: true, fontColorHex: ExcelColor.fromHexString(profitColor)));
      _setCell(
          sheet,
          profitRow,
          5,
          TextCellValue(
              '${profit >= 0 ? '+' : ''}${_currencyFormat.format(profit)} đ'),
          style: CellStyle(
              bold: true, fontColorHex: ExcelColor.fromHexString(profitColor)));

      // ── Độ rộng cột ─────────────────────────────────────────────────────────
      sheet.setColumnWidth(0, 6);
      sheet.setColumnWidth(1, 20);
      sheet.setColumnWidth(2, 10);
      sheet.setColumnWidth(3, 18);
      sheet.setColumnWidth(4, 30);
      sheet.setColumnWidth(5, 20);

      // ── Lưu và chia sẻ file ─────────────────────────────────────────────────
      final bytes = excel.encode();
      if (bytes == null) throw Exception('Không thể tạo file Excel');

      final dir = await getTemporaryDirectory();
      final filePath =
          '${dir.path}/${fileName}_${DateFormat('ddMMyyyy_HHmm').format(DateTime.now())}.xlsx';
      final file = File(filePath);
      await file.writeAsBytes(bytes);

      await Share.shareXFiles(
        [XFile(filePath)],
        text: 'Báo cáo thu chi FinAuto',
        subject: 'Báo cáo thu chi FinAuto',
      );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Xuất báo cáo thất bại: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  static void _setCell(Sheet sheet, int row, int col, CellValue value,
      {CellStyle? style}) {
    final cell =
        sheet.cell(CellIndex.indexByColumnRow(columnIndex: col, rowIndex: row));
    cell.value = value;
    if (style != null) cell.cellStyle = style;
  }

  static DateTime? _parseDate(dynamic dateVal) {
    if (dateVal == null) return null;
    if (dateVal is DateTime) return dateVal;
    if (dateVal is Map && dateVal.containsKey('\$date')) {
      return DateTime.tryParse(dateVal['\$date'].toString());
    }
    return DateTime.tryParse(dateVal.toString());
  }

  static String _formatCategory(String raw) {
    switch (raw) {
      case 'Hoa Don Le':
        return 'Hóa đơn lẻ';
      case 'POS Ket Ca':
        return 'POS kết ca';
      case 'So Tay':
        return 'Sổ tay';
      default:
        return raw.isEmpty ? 'Khác' : raw;
    }
  }
}
