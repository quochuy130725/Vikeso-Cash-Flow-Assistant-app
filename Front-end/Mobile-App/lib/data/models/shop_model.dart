/// Model đại diện cho Cửa hàng / Chi nhánh (Shop) trong hệ thống VikeSo
/// Chuẩn hóa theo Hợp đồng Kỹ thuật (API Contract) v3.3-STABLE
class ShopModel {
  final String id;
  final String ownerId;
  final String shopName;
  final String businessType;
  final String taxCode;
  final String legalOwnerName;
  final String ownerCccd;
  final String address;
  final String registeredAddress;
  final String invoiceAddress;
  final String phone;
  final bool isPrimary;
  final String approvalStatus; // 'APPROVED' | 'PENDING' | 'REJECTED'
  final String rejectionReason;
  final List<String> licenseImageUrls;
  final String cccdFrontUrl;
  final String cccdBackUrl;
  final List<String> verificationDocs;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  ShopModel({
    required this.id,
    required this.ownerId,
    required this.shopName,
    this.businessType = 'Hộ kinh doanh bán lẻ',
    this.taxCode = '',
    this.legalOwnerName = '',
    this.ownerCccd = '',
    this.address = '',
    this.registeredAddress = '',
    this.invoiceAddress = '',
    this.phone = '',
    this.isPrimary = false,
    this.approvalStatus = 'APPROVED',
    this.rejectionReason = '',
    this.licenseImageUrls = const [],
    this.cccdFrontUrl = '',
    this.cccdBackUrl = '',
    this.verificationDocs = const [],
    this.createdAt,
    this.updatedAt,
  });

  bool get isApproved => approvalStatus == 'APPROVED';
  bool get isPending => approvalStatus == 'PENDING';
  bool get isRejected => approvalStatus == 'REJECTED';

  String get statusLabel {
    switch (approvalStatus) {
      case 'APPROVED':
        return 'Đang hoạt động';
      case 'PENDING':
        return 'Chờ Admin duyệt';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return 'Đang hoạt động';
    }
  }

  factory ShopModel.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic val) {
      if (val is List) {
        return val.map((e) => e.toString()).toList();
      }
      return [];
    }

    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      return DateTime.tryParse(val.toString());
    }

    return ShopModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      ownerId: json['ownerId'] is Map
          ? (json['ownerId']['_id']?.toString() ?? '')
          : (json['ownerId']?.toString() ?? ''),
      shopName: json['shopName']?.toString() ?? '',
      businessType: json['businessType']?.toString() ?? 'Hộ kinh doanh bán lẻ',
      taxCode: json['taxCode']?.toString() ?? '',
      legalOwnerName: json['legalOwnerName']?.toString() ?? '',
      ownerCccd: json['ownerCccd']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      registeredAddress: json['registeredAddress']?.toString() ?? '',
      invoiceAddress: json['invoiceAddress']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      isPrimary: json['isPrimary'] == true,
      approvalStatus: json['approvalStatus']?.toString().toUpperCase() ?? 'APPROVED',
      rejectionReason: json['rejectionReason']?.toString() ?? '',
      licenseImageUrls: parseList(json['licenseImageUrls']),
      cccdFrontUrl: json['cccdFrontUrl']?.toString() ?? '',
      cccdBackUrl: json['cccdBackUrl']?.toString() ?? '',
      verificationDocs: parseList(json['verificationDocs']),
      createdAt: parseDate(json['createdAt']),
      updatedAt: parseDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ownerId': ownerId,
      'shopName': shopName,
      'businessType': businessType,
      'taxCode': taxCode,
      'legalOwnerName': legalOwnerName,
      'ownerCccd': ownerCccd,
      'address': address,
      'registeredAddress': registeredAddress,
      'invoiceAddress': invoiceAddress,
      'phone': phone,
      'isPrimary': isPrimary,
      'approvalStatus': approvalStatus,
      'rejectionReason': rejectionReason,
      'licenseImageUrls': licenseImageUrls,
      'cccdFrontUrl': cccdFrontUrl,
      'cccdBackUrl': cccdBackUrl,
      'verificationDocs': verificationDocs,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
