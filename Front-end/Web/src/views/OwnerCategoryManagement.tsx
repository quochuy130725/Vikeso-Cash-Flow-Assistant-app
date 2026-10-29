import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchCategories,
  createCategoryItem,
  updateCategoryItem,
  deleteCategoryItem,
} from '../services/api';
import { CategoryItem } from '../types';
import { UserAccount } from '../components/AuthModal';

interface OwnerCategoryManagementProps {
  currentUser?: UserAccount | null;
}

export const OwnerCategoryManagement: React.FC<OwnerCategoryManagementProps> = ({ currentUser }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'THU' | 'CHI'>('THU');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLevel, setModalLevel] = useState<'PARENT' | 'CHILD'>('CHILD');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [catName, setCatName] = useState('');
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    const list = await fetchCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((c) => c.type === activeTab && !c.parentId),
    [categories, activeTab]
  );

  const getChildren = (parentId: string) =>
    categories.filter((c) => c.type === activeTab && c.parentId === parentId);

  const handleOpenAddParent = () => {
    setEditingItem(null);
    setModalLevel('PARENT');
    setSelectedParentId('');
    setCatName('');
    setModalOpen(true);
  };

  const handleOpenAddChild = (parentId: string) => {
    setEditingItem(null);
    setModalLevel('CHILD');
    setSelectedParentId(parentId);
    setCatName('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CategoryItem) => {
    setEditingItem(item);
    setCatName(item.name);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingItem) {
      await updateCategoryItem(editingItem.id, catName.trim());
      showToast(`Đã cập nhật danh mục "${catName.trim()}" thành công!`);
    } else {
      await createCategoryItem({
        name: catName.trim(),
        type: activeTab,
        parentId: modalLevel === 'PARENT' ? null : selectedParentId || parentCategories[0]?.id || null,
      });
      showToast(`Đã tạo danh mục ${modalLevel === 'PARENT' ? 'Cha' : 'Con'} "${catName.trim()}" & đồng bộ xuống Mobile App!`);
    }
    setModalOpen(false);
    setCatName('');
    loadCategories();
  };

  const handleDelete = async (item: CategoryItem) => {
    if (!window.confirm(`Xóa danh mục "${item.name}"?`)) return;
    await deleteCategoryItem(item.id);
    showToast(`Đã xóa danh mục "${item.name}"`);
    loadCategories();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-[#d0f81b] text-slate-950 text-xs font-bold border border-[#bde412]">
              Cấu trúc 2 cấp: Danh mục Cha – Con
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600 font-semibold">
              Cửa hàng: <strong className="text-slate-900">{currentUser?.shopName || currentUser?.storeName || 'Cửa Hàng Hộ Kinh Doanh'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Danh Mục Kinh Doanh (Thu &amp; Chi)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Thiết lập danh mục Cha – Con riêng cho cửa hàng và tự động đồng bộ xuống Mobile App.
          </p>
        </div>

        <button
          onClick={handleOpenAddParent}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d6155f] hover:bg-[#b01755] text-white text-xs font-black shadow-xs transition-all cursor-pointer self-start lg:self-auto shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
          <span>+ Thêm Nhóm Danh Mục Cha</span>
        </button>
      </div>

      {/* Segmented THU / CHI Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('THU')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'THU'
                ? 'bg-[#d6155f] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>DANH MỤC TIỀN VÀO (THU)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHI')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CHI'
                ? 'bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4] shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff4783]"></span>
            <span>DANH MỤC TIỀN RA (CHI)</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Đang hiển thị <strong>{parentCategories.length}</strong> nhóm Danh mục Cha ({activeTab === 'THU' ? 'Khoản Thu' : 'Khoản Chi'})
        </span>
      </div>

      {/* Parent-Child Tree Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {parentCategories.map((parent) => {
          const children = getChildren(parent.id);
          return (
            <div
              key={parent.id}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activeTab === 'THU'
                          ? 'bg-[#ff4783]/10 text-[#ff4783] border border-[#ff4783]/20'
                          : 'bg-[#fff0f5] text-[#b01755] border border-[#ffd6e4]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {parent.icon || 'category'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-slate-900">{parent.name}</h2>
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                          Danh mục Cha
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {children.length} danh mục con trực thuộc
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(parent)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                      title="Đổi tên nhóm cha"
                    >
                      <span className="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                    {!parent.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(parent)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Xóa nhóm cha"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-categories list with clean flat row layout */}
                <div className="pt-3">
                  {children.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-2">
                      Chưa có danh mục con nào trong nhóm này.
                    </div>
                  ) : (
                    <div className="space-y-1 border-l-2 border-slate-200 ml-3 pl-3.5">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                activeTab === 'THU' ? 'bg-[#ff4783]' : 'bg-rose-400'
                              }`}
                            ></span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {child.name}
                            </span>
                            {!child.isDefault && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#d0f81b]/40 text-slate-900 border border-[#bde412]">
                                Tùy chỉnh
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(child)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
                              title="Sửa tên"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(child)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Xóa danh mục con"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Hiển thị trên Mobile App &amp; Biểu đồ so sánh
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAddChild(parent.id)}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#b01755] hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Thêm danh mục con</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem
                  ? 'Chỉnh Sửa Tên Danh Mục'
                  : modalLevel === 'PARENT'
                    ? `Thêm Danh Mục Cha (${activeTab})`
                    : `Thêm Danh Mục Con (${activeTab})`}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {!editingItem && modalLevel === 'CHILD' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thuộc Nhóm Danh Mục Cha *
                  </label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-900 border border-slate-200"
                  >
                    {parentCategories.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên danh mục kinh doanh *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="VD: Thu bán sỉ thùng bia / Chi mua đá viên"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#ff4783]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff4783] hover:bg-[#e0326e] text-white text-xs font-black cursor-pointer"
                >
                  Lưu &amp; Đồng Bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-white text-slate-900 shadow-xl flex items-center gap-2 text-xs font-semibold border-2 border-[#ffd6e4]">
          <span className="material-symbols-outlined text-[#ff4783] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

