import React, { useEffect, useMemo, useState } from 'react';
import {
  VIETNAM_ADDRESS_DATA,
  parseAddress,
  formatAddress,
} from '../data/vietnamAddressData';

interface AddressSelectPickerProps {
  value: string;
  onChange: (fullAddress: string) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  label?: string;
  showLabel?: boolean;
}

export const AddressSelectPicker: React.FC<AddressSelectPickerProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  id = 'store_address_picker',
  label = 'Địa chỉ cơ sở kinh doanh thực tế',
  showLabel = true,
}) => {
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');

  // Đồng bộ giá trị khởi tạo hoặc khi value từ ngoài thay đổi
  useEffect(() => {
    const currentFormatted = formatAddress(street, ward, district, province);
    if (value !== currentFormatted) {
      const parsed = parseAddress(value);
      setProvince(parsed.province);
      setDistrict(parsed.district);
      setWard(parsed.ward);
      setStreet(parsed.street);
    }
  }, [value]);

  // Danh sách Tỉnh / Thành phố
  const provinces = useMemo(() => VIETNAM_ADDRESS_DATA, []);

  // Danh sách Quận / Huyện dựa trên Tỉnh đã chọn
  const districts = useMemo(() => {
    if (!province) return [];
    const found = VIETNAM_ADDRESS_DATA.find((p) => p.name === province);
    return found ? found.districts : [];
  }, [province]);

  // Danh sách Phường / Xã dựa trên Quận đã chọn
  const wards = useMemo(() => {
    if (!district) return [];
    const found = districts.find((d) => d.name === district);
    return found ? found.wards : [];
  }, [districts, district]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    setProvince(newProv);
    setDistrict('');
    setWard('');
    onChange(formatAddress(street, '', '', newProv));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    setWard('');
    onChange(formatAddress(street, '', newDist, province));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWard = e.target.value;
    setWard(newWard);
    onChange(formatAddress(street, newWard, district, province));
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreet = e.target.value;
    setStreet(newStreet);
    onChange(formatAddress(newStreet, ward, district, province));
  };

  const fullDisplay = formatAddress(street, ward, district, province);

  return (
    <div className="space-y-2">
      {showLabel && (
        <label
          className="flex items-center justify-between text-xs font-bold text-slate-700 h-5 mb-1"
          htmlFor={`${id}_street`}
        >
          <span>
            {label} {required && <span className="text-[#ff4783]">*</span>}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Chọn Tỉnh / Quận / Phường chuẩn
          </span>
        </label>
      )}

      {/* 3 Dropdown cấp hành chính */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Tỉnh / Thành phố */}
        <div>
          <select
            id={`${id}_province`}
            disabled={disabled}
            value={province}
            onChange={handleProvinceChange}
            className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-[13px] text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all cursor-pointer truncate"
          >
            <option value="">-- Chọn Tỉnh / TP --</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quận / Huyện */}
        <div>
          <select
            id={`${id}_district`}
            disabled={disabled || !province}
            value={district}
            onChange={handleDistrictChange}
            className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-[13px] text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
          >
            <option value="">-- Chọn Quận / Huyện --</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Phường / Xã */}
        <div>
          <select
            id={`${id}_ward`}
            disabled={disabled || !district}
            value={ward}
            onChange={handleWardChange}
            className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-[13px] text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Số nhà, tên đường */}
      <div>
        <input
          id={`${id}_street`}
          type="text"
          disabled={disabled}
          value={street}
          onChange={handleStreetChange}
          placeholder="Số nhà, tên đường, tòa nhà, ngõ/hẻm (VD: 123 Nguyễn Trãi)"
          className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-[13px] text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4783]/20 focus:border-[#ff4783] transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Xem trước địa chỉ chuẩn */}
      {fullDisplay && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-[11px] text-slate-600">
          <span className="material-symbols-outlined text-[14px] text-[#ff4783] shrink-0">
            location_on
          </span>
          <span className="font-bold text-slate-500 shrink-0">Địa chỉ lưu:</span>
          <span className="font-semibold text-slate-800 truncate" title={fullDisplay}>
            {fullDisplay}
          </span>
        </div>
      )}
    </div>
  );
};

