import React, { useState, useEffect } from 'react';
import { fetchUserTransactions } from '../services/api';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://vikeso.vn';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentOrigin)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl border border-surface-container space-y-space-md animate-scaleIn">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">smartphone</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Ứng Dụng VikeSo Di Động
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Quét mã để truy cập webapp PWA trên điện thoại
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-space-md bg-surface-container-low rounded-xl border border-surface-container text-center space-y-space-sm">
          <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-xs border border-surface-container flex items-center justify-center overflow-hidden">
            <img
              src={qrUrl}
              alt="Mã QR mở VikeSo WebApp"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface font-semibold">
            Mở camera iPhone hoặc Android để quét mã
          </p>
          <span className="font-label-sm text-label-sm text-outline">
            Tự động mở ứng dụng VikeSo trên điện thoại, đồng bộ thời gian thực
          </span>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md pt-space-xs">
          <span>Phiên bản: 2.4.1 (PWA Live)</span>
          <button
            onClick={onClose}
            className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-bold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  subscriptionPlan?: string;
  userId?: string;
  proExpiresAt?: string;
  userRole?: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  storeName,
  subscriptionPlan,
  userId,
  proExpiresAt,
  userRole,
}) => {
  const [allRead, setAllRead] = useState(false);
  const [recentEvents, setRecentEvents] = useState<
    { id: string; title: string; time: string; desc: string; unread: boolean; icon: string; color: string }[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadEvents = async () => {
      try {
        const txs = await fetchUserTransactions(userId);
        if (!isMounted) return;

        const dynamicEvents = [];

        // Check for expiring PRO package (<= 2 days) - only for Owner
        if (userRole !== 'ADMIN' && proExpiresAt && (subscriptionPlan || '').toUpperCase() === 'PRO') {
          const expiryTime = new Date(proExpiresAt).getTime();
          if (!isNaN(expiryTime)) {
            const diffDays = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 2 && diffDays > 0) {
              dynamicEvents.push({
                id: 'sys-pro-expiring',
                title: `Gói PRO sắp hết hạn (còn ${diffDays} ngày)`,
                time: 'Cần chú ý',
                desc: `Gói PRO của cửa hàng sẽ hết hạn vào ${new Date(proExpiresAt).toLocaleDateString('vi-VN')}. Vui lòng quét mã VietQR trong Cài Đặt Shop để gia hạn, duy trì đối soát tự động & báo cáo Telegram.`,
                unread: true,
                icon: 'warning',
                color: 'text-amber-700 bg-amber-100',
              });
            }
          }
        }

        if (txs && txs.length > 0) {
          const latest = txs[0];
          const isThu = latest.type === 'in' || latest.amount > 0;
          dynamicEvents.push({
            id: latest.id,
            title: `Biến động dòng tiền: ${isThu ? 'Thu +' : 'Chi -'}${Math.abs(latest.amount).toLocaleString('vi-VN')} đ`,
            time: latest.time || 'Vừa xong',
            desc: `${latest.title} (${latest.category}) - ${latest.details || 'Đã ghi nhận vào sổ quỹ'}`,
            unread: true,
            icon: isThu ? 'arrow_downward' : 'arrow_upward',
            color: isThu ? 'text-primary bg-primary/10' : 'text-[#ff4783] bg-[#ff4783]/10',
          });
        }

        if (userRole !== 'ADMIN' && subscriptionPlan) {
          dynamicEvents.push({
            id: 'sys-plan',
            title: `Gói dịch vụ ${subscriptionPlan} đang hoạt động`,
            time: 'Hôm nay',
            desc: `Tài khoản cửa hàng ${storeName || 'VikeSo'} được kết nối hệ thống đối soát thời gian thực.`,
            unread: false,
            icon: 'verified',
            color: 'text-secondary bg-secondary/10',
          });
        }

        if (userRole === 'ADMIN') {
          dynamicEvents.push({
            id: 'sys-admin-role',
            title: 'Tài khoản Quản Trị Viên (ADMIN)',
            time: 'Hôm nay',
            desc: 'Bạn đang quản trị hệ thống VikeSo với toàn bộ đặc quyền giám sát và vận hành.',
            unread: false,
            icon: 'verified',
            color: 'text-indigo-600 bg-indigo-50',
          });
        }

        dynamicEvents.push({
          id: 'sys-bot',
          title: 'Trợ lý Telegram chốt ca tự động 22:00',
          time: 'Hằng ngày',
          desc: 'Kênh Telegram đã đồng bộ WebHook nhận bảng kê tổng kết ca kinh doanh mỗi đêm.',
          unread: false,
          icon: 'send',
          color: 'text-primary bg-primary/10',
        });

        setRecentEvents(dynamicEvents);
      } catch {
        // Fallback
      }
    };

    loadEvents();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, storeName, subscriptionPlan, proExpiresAt, userRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-surface-container space-y-space-md animate-scaleIn">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Thông Báo Hệ Thống
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Nhật ký biến động dòng tiền &amp; sự kiện thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="divide-y divide-surface-container max-h-96 overflow-y-auto">
          {recentEvents.map((n) => (
            <div
              key={n.id}
              className={`p-space-md flex items-start gap-space-md hover:bg-surface-container-low transition-colors ${
                n.unread && !allRead ? 'bg-surface-container-low/60' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}
              >
                <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">
                    {n.title}
                  </h4>
                  <span className="font-label-sm text-[11px] text-outline">{n.time}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
          <button
            onClick={() => setAllRead(true)}
            className="text-primary font-label-md text-label-md font-semibold hover:underline cursor-pointer"
          >
            {allRead ? '✓ Đã đánh dấu đọc tất cả' : 'Đánh dấu đã đọc'}
          </button>
          <button
            onClick={onClose}
            className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
