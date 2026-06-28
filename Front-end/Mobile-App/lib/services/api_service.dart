import 'dart:io';
import '../models/thu_chi.dart';

class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://localhost:5000/api'});

  // Gọi HTTP Request gửi ảnh hóa đơn/biên lai lên API Gateway để Gemini AI bóc tách
  Future<ThuChi?> uploadReceipt(File imageFile) async {
    // Mocking API call delay
    await Future.delayed(const Duration(seconds: 2));
    
    // Trả về dữ liệu mock bóc tách thành công
    return ThuChi(
      id: 'mock_ocr_${DateTime.now().millisecondsSinceEpoch}',
      shopId: 'shop_123',
      phanLoai: 'Hoa Don Le',
      loaiGiaoDich: 'CHI',
      soTien: 150000.0,
      lyDo: 'Tiền điện',
      ngayTao: DateTime.now(),
      mucDoTinCay: 'Trung Binh',
    );
  }

  // Lấy danh sách thu chi lịch sử từ CSDL MongoDB Atlas
  Future<List<ThuChi>> fetchTransactions() async {
    await Future.delayed(const Duration(milliseconds: 800));
    return [
      ThuChi(
        id: '1',
        shopId: 'shop_123',
        phanLoai: 'Hoa Don Le',
        loaiGiaoDich: 'THU',
        soTien: 1500000.0,
        lyDo: 'Bán hàng',
        ngayTao: DateTime.now(),
        mucDoTinCay: 'Cao',
      ),
      ThuChi(
        id: '2',
        shopId: 'shop_123',
        phanLoai: 'Hoa Don Le',
        loaiGiaoDich: 'CHI',
        soTien: 500000.0,
        lyDo: 'Tiền điện',
        ngayTao: DateTime.now(),
        mucDoTinCay: 'Trung Binh',
      ),
    ];
  }
}
