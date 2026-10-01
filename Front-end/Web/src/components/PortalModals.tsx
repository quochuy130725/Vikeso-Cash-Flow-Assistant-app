import React from 'react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
                Quét mã để chụp ảnh hóa đơn &amp; sổ tay AI
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
          <div className="w-48 h-48 bg-white p-3 rounded-xl shadow-xs border border-surface-container flex items-center justify-center">
            {/* Real SVG QR code representation */}
            <svg className="w-full h-full text-on-surface" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0 0h30v30H0zm5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zm5 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zm5 5h20v20H5zM10 80h10v10H10zM35 10h10v10H35zM50 10h10v10H50zM35 25h10v10H35zM50 35h10v10H50zM65 35h10v10H65zM20 35h10v10H20zM35 50h30v10H35zM10 50h10v10H10zM70 50h20v10H70zM50 65h10v10H50zM65 70h10v20H65zM80 70h10v10H80zM35 80h20v10H35zM80 85h20v15H80zM35 90h10v10H35z" />
            </svg>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface font-semibold">
            Quét bằng camera điện thoại iPhone hoặc Android
          </p>
          <span className="font-label-sm text-label-sm text-outline">
            Tự động nhận diện chữ viết tay &amp; biên lai trong 2 giây
          </span>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md pt-space-xs">
          <span>Phiên bản: 2.4.1 (Mobile Pro)</span>
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
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  storeName,
  subscriptionPlan,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n-1',
      title: 'Đã hoàn tất đối soát ca trưa tự động',
      time: '12:30 hôm nay',
      desc: '23 hóa đơn bán lẻ đã được gộp thành công vào doanh thu kết ca quầy POS, khớp 100%.',
      unread: true,
      icon: 'done_all',
      color: 'text-primary bg-primary/10',
    },
    {
      id: 'n-2',
      title: `Gói cước ${subscriptionPlan || 'FREE'} đang kích hoạt`,
      time: '09:00 hôm nay',
      desc: `Thời hạn bản quyền gói ${subscriptionPlan || 'FREE'} của ${storeName || 'Admin Quản Trị'} được duy trì ổn định.`,
      unread: false,
      icon: 'verified',
      color: 'text-secondary bg-secondary/10',
    },
    {
      id: 'n-3',
      title: 'Telegram Bot đã sẵn sàng chốt ca 22:00',
      time: 'Hôm qua',
      desc: `Kênh Telegram "Ban Quản Lý ${storeName || 'Admin Quản Trị'}" đã kết nối thông suốt WebHook 2.4.`,
      unread: false,
      icon: 'send',
      color: 'text-primary bg-primary/10',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-surface-container space-y-space-md">
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
                Nhật ký sự kiện thời gian thực VikeSo
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
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-space-md flex items-start gap-space-md hover:bg-surface-container-low transition-colors ${
                n.unread ? 'bg-surface-container-low/40' : ''
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
                <p className="font-body-sm text-body-sm text-on-surface-variant">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
          <button
            onClick={() => alert('Đã đánh dấu đọc tất cả')}
            className="text-primary font-label-md text-label-md font-semibold hover:underline cursor-pointer"
          >
            Đánh dấu đã đọc
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
