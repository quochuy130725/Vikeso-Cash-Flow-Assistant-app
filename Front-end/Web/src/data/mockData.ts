import { Transaction, BusinessHousehold, SubscriptionPayment } from '../types';

export const ownerTransactions: Transaction[] = [
  {
    id: 'tx-1',
    time: '15:35',
    dateLabel: 'Hôm nay',
    title: 'Khách lẻ thanh toán đơn hàng #8492',
    category: 'Bán lẻ quầy',
    details: 'Sữa tươi thanh trùng, bánh gạo Ichi, gia vị tổng hợp',
    amount: 485000,
    type: 'in',
    method: 'Quét mã chuyển khoản VietQR',
    methodIcon: 'qr_code_2',
    methodColor: 'bg-primary-fixed text-on-primary-fixed',
    status: 'reconciled',
    statusText: 'Đã đối soát',
    refCode: 'VQR-8492'
  },
  {
    id: 'tx-2',
    time: '14:10',
    dateLabel: 'Hôm nay',
    title: 'Thanh toán đại lý nước giải khát Hưng Thịnh',
    category: 'Nhập hàng sỉ',
    details: '5 két nước ngọt các loại (Có ảnh phiếu thu đại lý)',
    amount: -3200000,
    type: 'out',
    method: 'Trí tuệ nhân tạo đọc hóa đơn',
    methodIcon: 'document_scanner',
    methodColor: 'bg-secondary-fixed text-on-secondary-fixed',
    status: 'reconciled',
    statusText: 'Đã đối soát',
    refCode: 'AI-OCR-782'
  },
  {
    id: 'tx-3',
    time: '12:30',
    dateLabel: 'Hôm nay',
    title: 'Kết ca bán buôn trưa máy tính tiền',
    category: 'Gộp ca POS',
    details: 'Tổng hợp 23 đơn lẻ gộp lại & đã đối soát chéo từng bill con',
    amount: 6840000,
    type: 'merged',
    method: 'Máy tính tiền kết ca',
    methodIcon: 'point_of_sale',
    methodColor: 'bg-surface-container-highest text-on-surface',
    status: 'merged',
    statusText: 'Đã tự động gộp tránh trùng',
    subBillCount: 23,
    refCode: 'POS-SHIFT-01'
  },
  {
    id: 'tx-4',
    time: '10:15',
    dateLabel: 'Hôm nay',
    title: 'Đổ xăng xe máy giao hàng cửa hàng',
    category: 'Vận hành',
    details: 'Cây xăng Petrolimex số 14 (Hóa đơn điện tử VAT)',
    amount: -120000,
    type: 'out',
    method: 'Trí tuệ nhân tạo đọc hóa đơn',
    methodIcon: 'document_scanner',
    methodColor: 'bg-secondary-fixed text-on-secondary-fixed',
    status: 'reconciled',
    statusText: 'Đã đối soát',
    refCode: 'AI-OCR-619'
  },
  {
    id: 'tx-5',
    time: '09:00',
    dateLabel: 'Hôm nay',
    title: 'Khách đặt cọc 2 thùng bia Tết',
    category: 'Tiền cọc',
    details: 'Chị Lan lấy hàng chiều 28 Tết (SĐT: 0918.xxx.921)',
    amount: 800000,
    type: 'in',
    method: 'Quét mã chuyển khoản VietQR',
    methodIcon: 'qr_code_2',
    methodColor: 'bg-primary-fixed text-on-primary-fixed',
    status: 'reconciled',
    statusText: 'Đã đối soát',
    refCode: 'VQR-0921'
  },
  {
    id: 'tx-6',
    time: '08:15',
    dateLabel: 'Hôm nay',
    title: 'Hóa đơn bán lẻ nước giải khát lẻ tại quầy',
    category: 'Đơn lẻ con',
    details: '2 lon nước tăng lực & 1 gói kẹo cao su',
    amount: 150000,
    type: 'merged',
    method: 'Trí tuệ nhân tạo đọc hóa đơn',
    methodIcon: 'document_scanner',
    methodColor: 'bg-surface-container text-outline',
    status: 'merged',
    statusText: 'Đã gộp vào kết ca',
    isStrikethrough: true,
    refCode: 'POS-SUB-04'
  }
];

export const businessHouseholds: BusinessHousehold[] = [
  {
    id: 'hh-1',
    ownerName: 'Trần Thị Mai Loan',
    phone: '0912.845.221',
    storeName: 'Tạp Hóa Mai Loan',
    businessType: 'Tạp hóa gia đình',
    joinDate: '14/10/2024',
    plan: 'pro',
    telegramStatus: 'active'
  },
  {
    id: 'hh-2',
    ownerName: 'Lê Hoàng Quân',
    phone: '0983.114.908',
    storeName: 'Nông Sản Sạch Ba Vì',
    businessType: 'Nông sản sạch',
    joinDate: '14/10/2024',
    plan: 'pro',
    telegramStatus: 'active'
  },
  {
    id: 'hh-3',
    ownerName: 'Đặng Quốc Thịnh',
    phone: '0905.772.339',
    storeName: 'Quán Phở Bò Bến Ngự',
    businessType: 'Quán ăn ăn uống',
    joinDate: '13/10/2024',
    plan: 'free',
    telegramStatus: 'waiting'
  },
  {
    id: 'hh-4',
    ownerName: 'Vũ Bích Ngọc',
    phone: '0944.209.615',
    storeName: 'Thời Trang Mini Ngọc Boutique',
    businessType: 'Thời trang mini',
    joinDate: '12/10/2024',
    plan: 'pro',
    telegramStatus: 'active'
  },
  {
    id: 'hh-5',
    ownerName: 'Nguyễn Văn Bình',
    phone: '0978.502.193',
    storeName: 'Tiệm Cà Phê Mộc Phố',
    businessType: 'Quán ăn ăn uống',
    joinDate: '11/10/2024',
    plan: 'free',
    telegramStatus: 'error'
  }
];

export const subscriptionPayments: SubscriptionPayment[] = [
  {
    invoiceId: '#INV-2024-981',
    storeName: 'Vựa Nông Sản Ba Cường',
    storeLocation: 'Chợ Đầu Mối Bình Điền, HCM',
    avatarInitials: 'BC',
    avatarColor: 'text-secondary bg-surface-container-high',
    planDescription: 'Gia hạn Gói Chuyên Nghiệp 12 tháng',
    amount: 1188000,
    paymentMethod: 'Quét mã VietQR',
    timestamp: '24/10/2024 14:20',
    status: 'success'
  },
  {
    invoiceId: '#INV-2024-980',
    storeName: 'Quán Cơm Tấm Minh Tiến',
    storeLocation: 'Quận 5, TP. Hồ Chí Minh',
    avatarInitials: 'MT',
    avatarColor: 'text-primary bg-surface-container-high',
    planDescription: 'Nâng cấp Gói Chuyên Nghiệp 1 tháng',
    amount: 99000,
    paymentMethod: 'Thẻ ngân hàng',
    timestamp: '24/10/2024 11:15',
    status: 'success'
  },
  {
    invoiceId: '#INV-2024-979',
    storeName: 'Tiệm Tạp Hóa Hương Loan',
    storeLocation: 'Phường Bạch Mai, Hai Bà Trưng, HN',
    avatarInitials: 'HL',
    avatarColor: 'text-secondary bg-surface-container-high',
    planDescription: 'Gia hạn Gói Chuyên Nghiệp 6 tháng',
    amount: 594000,
    paymentMethod: 'Quét mã VietQR',
    timestamp: '24/10/2024 09:40',
    status: 'success'
  }
];

export const telegramHistory = [
  {
    sendTime: '24/10/2024 22:00:02',
    shift: 'Ca Ngày 24/10/2024',
    inflow: '+15.450.000 đ',
    outflow: '-4.200.000 đ',
    net: '+11.250.000 đ',
    file: 'BangKe_24102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '23/10/2024 22:00:02',
    shift: 'Ca Ngày 23/10/2024',
    inflow: '+18.120.000 đ',
    outflow: '-6.850.000 đ',
    net: '+11.270.000 đ',
    file: 'BangKe_23102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '22/10/2024 22:00:02',
    shift: 'Ca Ngày 22/10/2024',
    inflow: '+12.980.000 đ',
    outflow: '-2.100.000 đ',
    net: '+10.880.000 đ',
    file: 'BangKe_22102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '21/10/2024 22:00:02',
    shift: 'Ca Ngày 21/10/2024',
    inflow: '+16.740.000 đ',
    outflow: '-5.900.000 đ',
    net: '+10.840.000 đ',
    file: 'BangKe_21102024.xlsx',
    status: 'Thành công (200 OK)'
  },
  {
    sendTime: '20/10/2024 22:00:02',
    shift: 'Ca Ngày 20/10/2024',
    inflow: '+21.350.000 đ',
    outflow: '-8.420.000 đ',
    net: '+12.930.000 đ',
    file: 'BangKe_20102024.xlsx',
    status: 'Thành công (200 OK)'
  }
];
