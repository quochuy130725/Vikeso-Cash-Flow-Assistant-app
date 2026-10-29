export type PortalType = 'owner' | 'admin' | 'staff';

export type OwnerTab =
  | 'so-thu-chi-dong-tien'
  | 'bao-cao-xuat-du-lieu'
  | 'quan-ly-danh-muc'
  | 'quan-ly-nhan-vien'
  | 'bao-cao-tu-dong-telegram'
  | 'cai-dat-cua-hang';

export type AdminTab =
  | 'tong-quan-van-hanh'
  | 'bao-cao-tai-chinh-doanh-thu'
  | 'duyet-cua-hang-moi'
  | 'cau-hinh-telegram-bot'
  | 'cai-dat-he-thong';

export interface Transaction {
  id: string;
  time: string;
  dateLabel: string;
  rawDate?: string;
  accountingDate?: string;
  isAfter22h?: boolean;
  title: string;
  category: string;
  parentCategory?: string;
  subCategory?: string;
  details: string;
  amount: number;
  type: 'in' | 'out' | 'merged';
  method: string;
  paymentMethod?: 'CASH' | 'TRANSFER' | 'POS' | 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'THE_POS';
  paymentMethodLabel?: string;
  methodIcon: string;
  methodColor?: string;
  status: 'reconciled' | 'merged' | 'pending';
  statusText: string;
  subBillCount?: number;
  isStrikethrough?: boolean;
  refCode?: string;
  createdBy?: string;
  createdByName?: string;
  createdByRole?: 'OWNER' | 'STAFF' | string;
  shopId?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'STAFF' | 'OWNER';
  shopId?: string;
  shopName?: string;
  status?: 'ACTIVE' | 'LOCKED';
  isActive: boolean;
  todayScans?: number;
  receiptCountToday?: number;
  lastLogin?: string;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'THU' | 'CHI';
  transactionType?: 'THU' | 'CHI';
  parentId: string | null;
  parentName?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  isSystemDefault?: boolean;
}

export interface ShopBranch {
  id: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  shopName: string;
  businessType: string;
  address: string;
  phone?: string;
  isPrimary?: boolean;
  documentUrls?: string[];
  verificationDocs?: string[];
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  rejectionReason?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface BusinessHousehold {
  id: string;
  ownerName: string;
  phone: string;
  storeName: string;
  businessType: string;
  joinDate: string;
  plan: 'pro' | 'free';
  telegramStatus: 'active' | 'waiting' | 'error';
  proExpiresAt?: string;
  proExpiresAtRaw?: string;
  role?: 'ADMIN' | 'OWNER';
}

export interface SubscriptionPayment {
  invoiceId: string;
  storeName: string;
  storeLocation: string;
  avatarInitials: string;
  avatarColor: string;
  planDescription: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  status: 'success' | 'pending';
}
