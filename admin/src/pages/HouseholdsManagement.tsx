import React, { useState, useMemo } from 'react';
import {
  Search,
  Home,
  Users,
  Wallet,
  Calendar,
  Eye,
  Shield,
  CreditCard,
  UserPlus,
  Coins,
  Pencil,
  Trash2,
} from 'lucide-react';
import { HouseholdItem } from '../types';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { adminApi } from '../services/api';
import { AdminDataMessage, useAdminData } from '../services/useAdminData';

export const HouseholdsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdItem | null>(null);
  const [actionError, setActionError] = useState('');
  const { data: households, setData: setHouseholds, loading, error, refresh } =
    useAdminData<HouseholdItem[]>(async () => (await adminApi.households()).households, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredHouseholds = useMemo(() => {
    return households.filter(
      (h) =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [households, searchTerm]);

  const editHousehold = async (household: HouseholdItem) => {
    const name = window.prompt('Tên gia đình', household.name);
    if (name === null) return;
    const currency = window.prompt('Mã tiền tệ (3 ký tự)', household.currency);
    if (currency === null) return;
    setActionError('');
    try {
      await adminApi.updateHousehold(household.id, { name, currency });
      setHouseholds((current) => current.map((item) => item.id === household.id ? { ...item, name: name.trim(), currency: currency.toUpperCase() } : item));
      setSelectedHousehold((current) => current?.id === household.id ? { ...current, name: name.trim(), currency: currency.toUpperCase() } : current);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Không thể cập nhật gia đình.');
    }
  };

  const removeHousehold = async (household: HouseholdItem) => {
    if (!window.confirm(`Xóa "${household.name}"? Thao tác này sẽ xóa các ví, giao dịch, công việc, thành viên và lời mời liên quan, không thể hoàn tác.`)) return;
    setActionError('');
    try {
      await adminApi.deleteHousehold(household.id);
      setHouseholds((current) => current.filter((item) => item.id !== household.id));
      setSelectedHousehold(null);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Không thể xóa gia đình.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminDataMessage loading={loading} error={error} />
      {actionError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p>}
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên gia đình, chủ hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-900">{filteredHouseholds.length}</strong> hộ gia đình
          </span>
        </div>
      </div>

      {/* Grid of Household Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHouseholds.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
          >
            <div>
              {/* Header card */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{h.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Chủ hộ: <strong className="text-slate-700">{h.ownerName}</strong>
                  </p>
                </div>
              </div>

              {/* Fund balance badge */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500">Quỹ chung gia đình</p>
                <p className="text-lg font-extrabold text-teal-700 tracking-tight mt-0.5">
                  {formatCurrency(h.totalFund)}
                </p>
              </div>

              {/* Stats pill row */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{h.membersCount} thành viên</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>{h.walletsCount} ví hoạt động</span>
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {h.createdAt}
              </span>
              <button
                onClick={() => setSelectedHousehold(h)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Chi tiết
              </button>
              <button onClick={() => void editHousehold(h)} className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100" title="Sửa gia đình"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => void removeHousehold(h)} className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" title="Xóa gia đình"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Household Detail Modal */}
      {selectedHousehold && (
        <Modal
          isOpen={Boolean(selectedHousehold)}
          onClose={() => setSelectedHousehold(null)}
          title="Thông Tin Chi Tiết Hộ Gia Đình"
          subtitle={`Mã không gian: ${selectedHousehold.id}`}
          maxWidth="xl"
        >
          <div className="space-y-6 text-left">
            {/* Main Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">{selectedHousehold.name}</h4>
                  <p className="text-xs text-slate-300">
                    Chủ hộ sáng lập: {selectedHousehold.ownerName} ({selectedHousehold.ownerEmail})
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span>Số dư quỹ chung:</span>
                <span className="text-base font-extrabold text-teal-300">
                  {formatCurrency(selectedHousehold.totalFund)}
                </span>
              </div>
            </div>

            {/* Members List */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Danh sách thành viên ({selectedHousehold.members.length})
              </h5>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedHousehold.members.map((member, i) => (
                  <div key={i} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-900">{member.name}</span>
                    </div>
                    <StatusBadge status={member.role} type="role" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Đơn vị tiền tệ chính:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedHousehold.currency}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Ngày khởi tạo:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedHousehold.createdAt}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => void editHousehold(selectedHousehold)}
                className="mr-2 inline-flex items-center gap-1 rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
              >
                <Pencil className="h-3.5 w-3.5" /> Sửa
              </button>
              <button
                onClick={() => void removeHousehold(selectedHousehold)}
                className="mr-auto inline-flex items-center gap-1 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa gia đình
              </button>
              <button
                onClick={() => setSelectedHousehold(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
      {!loading && !error && filteredHouseholds.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">Không tìm thấy hộ gia đình.</div>
      )}
      <button onClick={() => void refresh()} className="text-xs font-semibold text-blue-600 hover:underline">Tải lại danh sách</button>
    </div>
  );
};
