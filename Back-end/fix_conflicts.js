const fs = require('fs');
const path = require('path');

// Fix api_service.dart
const apiPath = path.join(__dirname, '..', 'Front-end/Mobile-App/lib/data/services/api_service.dart');
let apiContent = fs.readFileSync(apiPath, 'utf8');

apiContent = apiContent.replace(
`<<<<<<< HEAD
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
=======
    } catch (e) { return {'success': false, 'error': e.toString()}; }
>>>>>>> main`,
`    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }`
);

fs.writeFileSync(apiPath, apiContent, 'utf8');


// Fix split_screen.dart
const splitPath = path.join(__dirname, '..', 'Front-end/Mobile-App/lib/views/scan_receipt/split_screen.dart');
let splitContent = fs.readFileSync(splitPath, 'utf8');

const targetConflict1 = `<<<<<<< HEAD
    final response = await _apiService.saveTransactions(
=======
    final result = await _apiService.saveTransactions(
>>>>>>> main
      userId: widget.userId,
      items: itemsToSave,
    );
    final success = result['success'] == true;
    final hasTelegram = result['hasTelegram'] == true;

    if (!mounted) return;
    setState(() => _isSaving = false);

<<<<<<< HEAD
    if (response['success'] == true) {
      _showSuccessDialog();
=======
    if (success) {
      _showSuccessDialog(hasTelegram);
>>>>>>> main`;

const replacement1 = `    final result = await _apiService.saveTransactions(
      userId: widget.userId,
      items: itemsToSave,
    );
    final success = result['success'] == true;
    final hasTelegram = result['hasTelegram'] == true;

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      _showSuccessDialog(hasTelegram);`;

splitContent = splitContent.replace(targetConflict1, replacement1);

// Also need to fix _showSuccessDialog definition
splitContent = splitContent.replace(
  `void _showSuccessDialog() {`,
  `void _showSuccessDialog(bool hasTelegram) {`
);

splitContent = splitContent.replace(
  `'Giao dịch đã được AI đối soát và lưu vào hệ thống. Báo cáo tổng kết sẽ được gửi tự động lúc 22:00 tối nay.',`,
  `'Ứng dụng đã mặc định gửi báo cáo chốt ca hàng ngày vào Email của bạn.\\n\\nTuy nhiên, nếu bạn muốn nhận thông báo nhanh chóng hơn ngay trên điện thoại, hãy kết nối với Bot Telegram chính thức của ViKeSo.\\n\\nLưu ý: Mọi thiết lập thông báo đều có thể tùy chỉnh lại trong phần Cài đặt tài khoản.',`
);

const tgButtonOld = `          // Nút Mở Telegram
          ElevatedButton.icon(`;
if (!splitContent.includes('if (!hasTelegram)')) {
  splitContent = splitContent.replace(tgButtonOld, `          if (!hasTelegram)\n  ${tgButtonOld}`);
}

fs.writeFileSync(splitPath, splitContent, 'utf8');

console.log('Fixed conflicts!');
