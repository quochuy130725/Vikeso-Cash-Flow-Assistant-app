export type PortalType = 'owner' | 'admin';

export type OwnerTab =
  | 'so-thu-chi-dong-tien'
  | 'bao-cao-xuat-du-lieu'
  | 'bao-cao-tu-dong-telegram'
  | 'cai-dat-cua-hang';

export type AdminTab =
  | 'tong-quan-van-hanh'
  | 'bao-cao-tai-chinh-doanh-thu'
  | 'cau-hinh-telegram-bot'
  | 'cai-dat-he-thong';

export interface Transaction {
  id: string;
  time: string;
  dateLabel: string;
  title: string;
  category: string;
  details: string;
  amount: number;
  type: 'in' | 'out' | 'merged';
  method: string;
  methodIcon: string;
  methodColor?: string;
  status: 'reconciled' | 'merged' | 'pending';
  statusText: string;
  subBillCount?: number;
  isStrikethrough?: boolean;
  refCode?: string;
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
