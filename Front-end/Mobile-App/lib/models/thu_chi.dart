class ThuChi {
  final String id;
  final String shopId;
  final String phanLoai; // e.g., 'Hoa Don Le', 'POS Ket Ca'
  final String loaiGiaoDich; // 'THU' or 'CHI'
  final double soTien;
  final String lyDo;
  final DateTime ngayTao;
  final String mucDoTinCay; // 'Cao', 'Trung Binh', 'Thap'

  ThuChi({
    required this.id,
    required this.shopId,
    required this.phanLoai,
    required this.loaiGiaoDich,
    required this.soTien,
    required this.lyDo,
    required this.ngayTao,
    required this.mucDoTinCay,
  });

  factory ThuChi.fromJson(Map<String, dynamic> json) {
    return ThuChi(
      id: json['id'] ?? '',
      shopId: json['shopId'] ?? '',
      phanLoai: json['phanLoai'] ?? 'Hoa Don Le',
      loaiGiaoDich: json['loaiGiaoDich'] ?? 'CHI',
      soTien: (json['soTien'] ?? 0.0).toDouble(),
      lyDo: json['lyDo'] ?? '',
      ngayTao: json['ngayTao'] != null ? DateTime.parse(json['ngayTao']) : DateTime.now(),
      mucDoTinCay: json['mucDoTinCay'] ?? 'Trung Binh',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shopId': shopId,
      'phanLoai': phanLoai,
      'loaiGiaoDich': loaiGiaoDich,
      'soTien': soTien,
      'lyDo': lyDo,
      'ngayTao': ngayTao.toIso8601String(),
      'mucDoTinCay': mucDoTinCay,
    };
  }
}
