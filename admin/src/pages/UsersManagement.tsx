import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Wallet,
  Home,
  Clock,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { UserItem, UserRole, UserStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const UsersManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userList, setUserList] = useState<UserItem[]>(mockUsers);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const matchSearch =
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);

      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      const matchStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [userList, searchTerm, roleFilter, statusFilter]);

  // Toggle user ban status
  const handleToggleStatus = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus: UserStatus = u.status === 'banned' ? 'active' : 'banned';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, status: prev.status === 'banned' ? 'active' : 'banned' } : null
      );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Search & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="OWNER">Chủ Hộ (Owner)</option>
              <option value="ADMIN">Quản trị (Admin)</option>
              <option value="MEMBER">Thành viên (Member)</option>
              <option value="VIEWER">Trẻ em (Viewer)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ kích hoạt</option>
              <option value="banned">Đã bị khóa</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium ml-2">
            Hiển thị: <strong className="text-slate-900">{filteredUsers.length}</strong> người dùng
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Người dùng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4">Hoạt động gần nhất</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{user.displayName}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700">
                    {user.phone || 'Chưa cập nhật'}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={user.role} type="role" />
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={user.status} type="user" />
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {user.joinedAt}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {user.lastActive}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.status === 'banned'
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                        title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                      >
                        {user.status === 'banned' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title="Hồ Sơ Chi Tiết Người Dùng"
          subtitle={`Mã định danh: ${selectedUser.id}`}
        >
          <div className="space-y-6 text-left">
            {/* Header Profile Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.displayName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {selectedUser.displayName}
                  </h4>
                  <StatusBadge status={selectedUser.role} type="role" />
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.email}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedUser.phone}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <Home className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-blue-900">{selectedUser.householdsCount}</span>
                <p className="text-[11px] text-blue-700 font-medium">Gia đình</p>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-center">
                <Wallet className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-teal-900">{selectedUser.walletsCount}</span>
                <p className="text-[11px] text-teal-700 font-medium">Ví sở hữu</p>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-purple-900">{selectedUser.totalTransactions}</span>
                <p className="text-[11px] text-purple-700 font-medium">Giao dịch</p>
              </div>
            </div>

            {/* Detailed Properties */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái tài khoản</span>
                <StatusBadge status={selectedUser.status} type="user" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Ngày tham gia hệ thống</span>
                <span className="font-semibold text-slate-800">{selectedUser.joinedAt}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Hoạt động lần cuối</span>
                <span className="font-semibold text-slate-800">{selectedUser.lastActive}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Quyền hạn hệ thống</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-600" /> Thành viên chính thức (Verified)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(selectedUser.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedUser.status === 'banned'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {selectedUser.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

