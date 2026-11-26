/**
 * Mock User Feedback Data for VikeSo Landing Page
 * Prioritizes PRO subscribers (5 users) alongside authentic Mock users (7 users).
 * Total: 12 high-quality reviews from Vietnamese business owners.
 */

import { UserFeedback } from '../types';

export const INITIAL_FEEDBACKS: UserFeedback[] = [
  // ==========================================
  // NHÓM 1: ƯU TIÊN HỘI VIÊN GÓI PRO (5 FEEDBACKS)
  // ==========================================
  {
    id: 'fb-pro-001',
    authorName: 'Nguyễn Thị Hiền Mai',
    storeName: 'Cửa hàng tạp hóa Hiền Mai',
    businessType: 'Hộ kinh doanh bán lẻ',
    plan: 'pro',
    rating: 5,
    tag: 'Bóc tách bill AI',
    highlight: 'Hóa đơn giấy than mờ tịt chụp vẫn chuẩn từng dòng tiền',
    content:
      'Quán tôi mỗi sáng giao nhận cả chục toa hàng từ đại lý, toàn giấy than mờ căm hoặc viết ngoáy vội vàng. Từ lúc nâng gói PRO, chụp một phát là AI nhận diện đúng từ tên hàng đến tiền nghìn, không sót một đồng. Tối về không còn phải ngồi căng mắt bấm máy tính Casio nữa!',
    date: '25/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-pro-002',
    authorName: 'Nguyễn Hoàng Bảo',
    storeName: 'Quán Cà Phê Gốc Phố',
    businessType: 'Dịch vụ ăn uống (F&B)',
    plan: 'pro',
    rating: 5,
    tag: 'Chống trùng bill POS',
    highlight: 'Tự động trừ phiếu POS kết ca, báo lãi ròng về Telegram lúc 22h',
    content:
      'Tính năng trừ cộng trùng giữa bill lẻ quẹt thẻ ban ngày và phiếu tổng kết ca POS ban đêm quá thông minh! Trước đây tôi hay bị tính đúp tiền thẻ vào tiền mặt. Giờ cứ 22h đêm là bot Telegram gửi trọn báo cáo doanh thu và lãi ròng, quản lý quán từ xa cực kỳ nhàn.',
    date: '24/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-pro-003',
    authorName: 'Lê Thị Tuyết Trinh',
    storeName: 'Tạp Hóa & Tiêu Dùng Tuyết Trinh',
    businessType: 'Hộ kinh doanh bán lẻ',
    plan: 'pro',
    rating: 5,
    tag: 'Nhập lùi ngày',
    highlight: 'Nhập bù chứng từ cuối tuần không làm lệch quỹ hôm nay',
    content:
      'Rất thích tính năng nhập bù lùi ngày của VikeSo. Có những đợt bận rộn 2-3 ngày dồn bill, tôi chụp bù một lượt chọn đúng ngày phát sinh là sổ quỹ tự cập nhật vào đúng báo cáo tuần đó. Dữ liệu đối soát tài chính rất chặt chẽ và chuyên nghiệp.',
    date: '22/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-pro-004',
    authorName: 'Trần Quốc Huy',
    storeName: 'Tiệm Kem Đá & Trà Trái Cây',
    businessType: 'Dịch vụ ăn uống (F&B)',
    plan: 'pro',
    rating: 5,
    tag: 'Quét không giới hạn',
    highlight: 'Gói PRO quét bill thả ga, nhân viên 2 ca phối hợp nhịp nhàng',
    content:
      'Quán tôi bán cả ngày lượng hóa đơn nhập nguyên liệu đá, siro, hoa quả rất nhiều. Gói PRO 99k/tháng quá rẻ so với lợi ích mang lại: quét không giới hạn, phân quyền cho nhân viên phụ bán ca sáng chụp bill nhập hàng, tôi là chủ ngồi đâu cũng kiểm soát được dòng tiền chi.',
    date: '20/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-pro-005',
    authorName: 'Bùi Thành Hải',
    storeName: 'Cơm Tấm Sài Gòn 39',
    businessType: 'Dịch vụ ăn uống (F&B)',
    plan: 'pro',
    rating: 5,
    tag: 'Dễ dùng như Zalo',
    highlight: 'Chủ quán U50 không rành công nghệ vẫn dùng ngon lành',
    content:
      'Tôi năm nay ngoài 50 tuổi, ngại nhất mấy phần mềm kế toán rườm rà. Thấy VikeSo hướng dẫn chụp ảnh như gửi hình qua Zalo nên tôi dùng thử và quyết định lên PRO luôn. Nhanh gọn, rõ ràng, cuối ngày biết ngay mình lời hay lỗ bao nhiêu tiền.',
    date: '18/11/2026',
    isVerified: true,
  },

  // ==========================================
  // NHÓM 2: CÁC ĐÁNH GIÁ TỪ MOCK USERS HỆ THỐNG (7 FEEDBACKS)
  // ==========================================
  {
    id: 'fb-free-006',
    authorName: 'Mai Công Hùng',
    storeName: 'Phở Bò Gia Truyền Bát Đàn',
    businessType: 'Dịch vụ ăn uống (F&B)',
    plan: 'free',
    rating: 5,
    tag: 'Bóc tách bill AI',
    highlight: 'Nhập tiền thịt bò, hành ngò buổi sớm chỉ tốn đúng 2 giây',
    content:
      'Sáng sớm 4h30 đi chợ đầu mối gom thịt bò, xương ống toàn phiếu chép tay. Đứng ngay sạp giơ điện thoại chụp cái tách là xong, không phải nhét túi quần rồi về nhà lôi ra vuốt phẳng cộng lại như trước nữa.',
    date: '17/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-free-007',
    authorName: 'Hoàng Minh Nghĩa',
    storeName: 'Shop Thời Trang May May',
    businessType: 'Hộ kinh doanh thời trang',
    plan: 'free',
    rating: 5,
    tag: 'Phân loại Thu - Chi',
    highlight: 'Tách bạch tiền nhập vải, tiền ship và tiền khách mua lẻ',
    content:
      'Shop kinh doanh quần áo hay bị lẫn lộn giữa tiền ứng ship COD và tiền nhập hàng sỉ. VikeSo phân loại danh mục tự động rất thông minh. Bản miễn phí 30 bill/tháng rất phù hợp để bắt đầu.',
    date: '15/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-free-008',
    authorName: 'Tạ Phương Yến',
    storeName: 'Quán Cà Phê Muối Chú Long',
    businessType: 'Dịch vụ ăn uống (F&B)',
    plan: 'free',
    rating: 5,
    tag: 'Báo cáo trực quan',
    highlight: 'Không còn cảnh sổ sách lem nhem vết nước và cà phê',
    content:
      'Mở quán nước thì sổ tay lúc nào cũng dễ dính nước, ghi chép bôi xóa lem nhem. Chuyển sang số hóa với VikeSo thấy quán chuyên nghiệp hẳn, kiểm tra chi phí đá, sữa đặc hàng tuần chỉ cần vài cái lướt màn hình.',
    date: '14/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-free-009',
    authorName: 'Cao Mỹ Nga',
    storeName: 'Nhà Thuốc Tây An Khang',
    businessType: 'Dược phẩm & y tế tư nhân',
    plan: 'free',
    rating: 5,
    tag: 'Quản lý dòng tiền',
    highlight: 'Kiểm soát chặt chẽ cả tiền mặt và khách quét mã QR VietQR',
    content:
      'Khách mua thuốc giờ 80% chuyển khoản ngân hàng qua VietQR. VikeSo ghi nhận nguồn thu chuyển khoản và tiền mặt tách bạch, đối soát tiền về tài khoản ngân hàng cuối ngày không lệch một xu.',
    date: '12/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-free-010',
    authorName: 'Đặng Văn Long',
    storeName: 'Tiệm Nail & Eyelash Quỳnh Anh',
    businessType: 'Chăm sóc sắc đẹp & Spa',
    plan: 'free',
    rating: 5,
    tag: 'Dễ dùng tiện lợi',
    highlight: 'Tiện lợi ghi nhận chi phí sơn móng và đồ tiêu hao hàng ngày',
    content:
      'Tiệm làm đẹp nhỏ của vợ chồng tôi trước giờ không biết dùng phần mềm gì cho vừa rẻ vừa dễ. VikeSo đúng là thứ chúng tôi tìm kiếm bấy lâu nay, thao tác cực kỳ mượt mà trên điện thoại di động.',
    date: '10/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-free-011',
    authorName: 'Bùi Văn Kiên',
    storeName: 'Bún Bò Huế O Phượng',
    businessType: 'Dịch vụ ăn uống (F&B)',
    plan: 'free',
    rating: 5,
    tag: 'Tiết kiệm thời gian',
    highlight: 'Dành thêm được cả tiếng đồng hồ buổi tối chơi với con',
    content:
      'Bán cả ngày mệt rã rời, tối dọn quán xong chỉ muốn ngủ. Trước đây ngồi cộng sổ tới 23h đêm, giờ chụp xong hết trong 5 phút. Rất cảm ơn đội ngũ phát triển ứng dụng thiết thực này!',
    date: '08/11/2026',
    isVerified: true,
  },
  {
    id: 'fb-free-012',
    authorName: 'Võ Như Oanh',
    storeName: 'Bách Hóa Mini Xanh',
    businessType: 'Hộ kinh doanh bán lẻ',
    plan: 'free',
    rating: 5,
    tag: 'Khởi đầu miễn phí',
    highlight: 'Trải nghiệm gói STARTER miễn phí trọn vẹn và an tâm',
    content:
      'Được dùng thử 30 hóa đơn AI miễn phí mỗi tháng không bị đòi hỏi thẻ tín dụng. Thấy dùng tốt và hiệu quả rõ rệt, chắc chắn tháng tới mở thêm quầy hàng tôi sẽ nâng cấp lên gói PRO.',
    date: '05/11/2026',
    isVerified: true,
  },
];

const LOCAL_STORAGE_KEY = 'vikeso_user_feedbacks';

/**
 * Lấy danh sách Feedbacks kết hợp giữa Feedback mặc định và Feedback người dùng mới gửi (lưu tại localStorage)
 */
export function getStoredFeedbacks(): UserFeedback[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const custom: UserFeedback[] = JSON.parse(raw);
      if (Array.isArray(custom) && custom.length > 0) {
        // Feedbacks mới của người dùng được đẩy lên đầu
        return [...custom, ...INITIAL_FEEDBACKS];
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return INITIAL_FEEDBACKS;
}

/**
 * Lưu Feedback mới gửi từ form trên Landing page vào localStorage
 */
export function saveNewFeedback(newFb: UserFeedback): UserFeedback[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: UserFeedback[] = raw ? JSON.parse(raw) : [];
    const updated = [newFb, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return [...updated, ...INITIAL_FEEDBACKS];
  } catch {
    return [newFb, ...INITIAL_FEEDBACKS];
  }
}
