import React, { useState } from 'react';
import { OwnerTab } from '../types';
import { UserAccount } from '../components/AuthModal';

interface OwnerDashboardProps {
  currentUser?: UserAccount | null;
  onNavigateTab: (tab: OwnerTab) => void;
  onDownloadExcel: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onDownloadExcel,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="flex flex-col w-full px-margin-desktop py-space-lg gap-space-xl">
      {/* Welcome Banner and Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Xin chào, {currentUser?.name || (currentUser?.role === 'ADMIN' ? 'Admin' : 'Chủ Hộ')}
            </h1>
            <span className="bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md px-space-sm py-1 rounded-full flex items-center gap-1 shadow-xs border border-primary-fixed-dim/60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Gói {currentUser?.subscriptionPlan === 'FREE' ? 'Miễn Phí (Cơ Bản)' : (currentUser?.subscriptionPlan || 'FREE')}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">storefront</span>
            <span>{currentUser?.shopName || currentUser?.storeName || (currentUser?.role === 'ADMIN' ? 'Admin Quản Trị' : 'Cửa Hàng Hộ Kinh Doanh')} •</span>
            <span className="text-primary font-semibold">Đang Hoạt Động</span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          <div className="flex bg-surface-container p-1 rounded-lg border border-surface-container-high/60">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                timeFilter === 'week'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Tuần này
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Tháng này
            </button>
          </div>

          <button
            onClick={onDownloadExcel}
            className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-lg py-2 rounded-lg font-label-lg text-label-lg shadow-sm transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Tải file Excel báo cáo</span>
          </button>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-md shadow-xs border border-surface-container">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
          <span className="material-symbols-outlined text-[22px]">lightbulb</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface font-bold">
            Mẹo nhỏ quản lý cho chủ cửa hàng:
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Trang web dùng để theo dõi toàn cảnh dòng tiền và xuất báo cáo. Để chụp ảnh hóa đơn hoặc sổ tay bằng trí tuệ nhân tạo, vui lòng mở ứng dụng <strong>VikeSo</strong> trên điện thoại thông minh.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop">
        {/* Card 1: Tiền Vào */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Tiền vào hôm nay
            </span>
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
            </div>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-primary font-bold tracking-tight">
              +15.450.000 <span className="font-metric-unit text-metric-unit font-medium text-primary">đ</span>
            </div>
            <div className="flex items-center gap-space-xs mt-space-xs">
              <span className="font-label-sm text-label-sm text-primary bg-primary-fixed/60 px-space-xs py-0.5 rounded font-bold">
                +18%
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">so với ngày hôm qua</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[78%] rounded-full"></div>
          </div>
        </div>

        {/* Card 2: Tiền Ra */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Tiền ra hôm nay
            </span>
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
            </div>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-tertiary font-bold tracking-tight">
              -4.200.000 <span className="font-metric-unit text-metric-unit font-medium text-tertiary">đ</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              Nhập nước giải khát, tiền điện nước, xăng xe giao hàng
            </p>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full w-[28%] rounded-full"></div>
          </div>
        </div>

        {/* Card 3: Dòng Tiền Ròng */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Dòng tiền thực thu (Còn lại)
            </span>
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">account_balance</span>
            </div>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
              +11.250.000 <span className="font-metric-unit text-metric-unit font-medium text-on-surface">đ</span>
            </div>
            <div className="flex items-center gap-space-xs mt-space-xs flex-wrap">
              <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed px-space-xs py-0.5 rounded font-bold">
                Tỷ lệ ròng 72.8%
              </span>
              <span className="font-body-sm text-body-sm text-primary font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                An toàn quỹ tiền mặt
              </span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary-container h-full w-[72.8%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Chart & Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
        {/* Left Column: 7-day Reconciliation Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Biểu đồ đối soát 7 ngày gần nhất
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                So sánh lượng tiền vào và lượng tiền chi trả
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Tiền Vào</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Tiền Ra</span>
              </div>
            </div>
          </div>

          <div className="w-full h-56 flex items-end justify-between gap-space-sm pt-space-md px-space-xs">
            {/* Thứ 2 */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '80%' }}
                  title="Tiền vào: 12.000.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-fixed-dim rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '35%' }}
                  title="Tiền ra: 4.500.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Thứ 2</span>
            </div>

            {/* Thứ 3 */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '65%' }}
                  title="Tiền vào: 9.800.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-fixed-dim rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '25%' }}
                  title="Tiền ra: 3.100.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Thứ 3</span>
            </div>

            {/* Thứ 4 */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '85%' }}
                  title="Tiền vào: 14.200.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-fixed-dim rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '50%' }}
                  title="Tiền ra: 6.800.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Thứ 4</span>
            </div>

            {/* Thứ 5 */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '55%' }}
                  title="Tiền vào: 8.500.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-fixed-dim rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '30%' }}
                  title="Tiền ra: 3.900.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Thứ 5</span>
            </div>

            {/* Thứ 6 */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '90%' }}
                  title="Tiền vào: 16.000.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-fixed-dim rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '40%' }}
                  title="Tiền ra: 5.200.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Thứ 6</span>
            </div>

            {/* Thứ 7 */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '100%' }}
                  title="Tiền vào: 18.500.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-fixed-dim rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '45%' }}
                  title="Tiền ra: 6.100.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Thứ 7</span>
            </div>

            {/* Hôm nay */}
            <div className="flex-1 flex flex-col items-center gap-space-xs h-full justify-end bg-surface-container-low/60 rounded-lg p-1 border border-primary-fixed/50 group">
              <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-[70%]">
                <div
                  className="w-1/2 bg-primary-container rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '95%' }}
                  title="Tiền vào: 15.450.000 đ"
                ></div>
                <div
                  className="w-1/2 bg-tertiary-container rounded-t transition-all group-hover:opacity-85"
                  style={{ height: '32%' }}
                  title="Tiền ra: 4.200.000 đ"
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">Hôm nay</span>
            </div>
          </div>
        </div>

        {/* Right Column: Source Proportion */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Tỷ trọng nguồn thu</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Kênh nhận tiền thực tế trong tuần
            </p>
          </div>

          <div className="flex flex-col gap-space-sm my-space-md">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">qr_code_2</span>
                  Mã quét ngân hàng
                </span>
                <span className="font-bold text-on-surface">48%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">credit_card</span>
                  Máy quẹt thẻ
                </span>
                <span className="font-bold text-on-surface">32%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary-container h-full rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">payments</span>
                  Tiền mặt tại quầy
                </span>
                <span className="font-bold text-on-surface">14%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-outline h-full rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">local_shipping</span>
                  Giao hàng thu hộ
                </span>
                <span className="font-bold text-on-surface">6%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '6%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-sm border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Dữ liệu kết nối tự động từ máy tính tiền và tài khoản ngân hàng.
            </span>
          </div>
        </div>
      </div>

      {/* Sổ Nhật Ký Giao Dịch Gần Đây Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container flex flex-col overflow-hidden">
        <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Sổ Nhật Ký Giao Dịch Gần Đây
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Tất cả khoản thu, chi được tự động đối chiếu trong ngày
            </p>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>Đã cập nhật lúc: 15:42 hôm nay</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-y border-surface-container">
                <th className="py-space-md px-space-lg">Thời gian</th>
                <th className="py-space-md px-space-lg">Nội dung khoản thu chi</th>
                <th className="py-space-md px-space-lg text-right">Số tiền</th>
                <th className="py-space-md px-space-lg">Hình thức ghi nhận</th>
                <th className="py-space-md px-space-lg text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                  15:35
                </td>
                <td className="py-space-lg px-space-lg">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Khách lẻ thanh toán hóa đơn #8492
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Sữa tươi, bánh gạo, gia vị nấu ăn
                    </span>
                  </div>
                </td>
                <td className="py-space-lg px-space-lg text-right font-headline-sm text-headline-sm text-primary font-bold whitespace-nowrap">
                  +485.000 đ
                </td>
                <td className="py-space-lg px-space-lg whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      qr_code_scanner
                    </span>
                    Quét mã chuyển khoản
                  </span>
                </td>
                <td className="py-space-lg px-space-lg text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    Đã đối soát
                  </span>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                <td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                  14:10
                </td>
                <td className="py-space-lg px-space-lg">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Thanh toán nhà cung cấp bia nước ngọt
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Đại lý phân phối cấp 1 nước giải khát Hưng Thịnh
                    </span>
                  </div>
                </td>
                <td className="py-space-lg px-space-lg text-right font-headline-sm text-headline-sm text-tertiary font-bold whitespace-nowrap">
                  -3.200.000 đ
                </td>
                <td className="py-space-lg px-space-lg whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      document_scanner
                    </span>
                    Trí tuệ nhân tạo đọc hóa đơn
                  </span>
                </td>
                <td className="py-space-lg px-space-lg text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    Đã đối soát
                  </span>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                  12:30
                </td>
                <td className="py-space-lg px-space-lg">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Kết ca bán buôn buổi sáng
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Tổng thu từ 23 đơn hàng lẻ tại quầy tính tiền
                    </span>
                  </div>
                </td>
                <td className="py-space-lg px-space-lg text-right font-headline-sm text-headline-sm text-primary font-bold whitespace-nowrap">
                  +6.840.000 đ
                </td>
                <td className="py-space-lg px-space-lg whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      point_of_sale
                    </span>
                    Máy tính tiền kết ca
                  </span>
                </td>
                <td className="py-space-lg px-space-lg text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">merge_type</span>
                    Đã tự động gộp tránh trùng
                  </span>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                <td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                  10:15
                </td>
                <td className="py-space-lg px-space-lg">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Đổ xăng xe máy giao hàng cửa hàng
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Cây xăng Petrolimex số 14
                    </span>
                  </div>
                </td>
                <td className="py-space-lg px-space-lg text-right font-headline-sm text-headline-sm text-tertiary font-bold whitespace-nowrap">
                  -120.000 đ
                </td>
                <td className="py-space-lg px-space-lg whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      document_scanner
                    </span>
                    Trí tuệ nhân tạo đọc hóa đơn
                  </span>
                </td>
                <td className="py-space-lg px-space-lg text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    Đã đối soát
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom table action bar */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-t border-surface-container">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Hiển thị 4 khoản thu chi gần nhất trong ngày
          </span>
          <button
            onClick={() => onNavigateTab('so-thu-chi-dong-tien')}
            className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
            type="button"
          >
            <span>Xem toàn bộ sổ nhật ký</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
