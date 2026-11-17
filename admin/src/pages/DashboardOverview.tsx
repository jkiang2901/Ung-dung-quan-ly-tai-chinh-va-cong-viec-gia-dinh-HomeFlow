import React from 'react';
import {
  Users,
  Home,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { adminApi, formatAdminDate, type AdminOverview } from '../services/api';
import { AdminDataMessage, useAdminData } from '../services/useAdminData';
import type { TransactionItem, UserItem } from '../types';

export const DashboardOverview: React.FC = () => {
  const { data: dashboard, loading, error } = useAdminData<AdminOverview>(
    () => adminApi.overview(),
    { stats: { users: 0, households: 0, accounts: 0, transactions: 0, monthlyIncome: 0, monthlyExpense: 0, debts: 0, overdueDebts: 0, tasks: 0, completedTasks: 0 }, monthlyCashFlow: [], userGrowth: [] },
  );
  const { data: users } = useAdminData<UserItem[]>(async () => (await adminApi.users()).users, []);
  const { data: transactions, loading: transactionsLoading, error: transactionsError } =
    useAdminData<TransactionItem[]>(async () => (await adminApi.transactions()).transactions.slice(0, 5), []);
  const stats = dashboard.stats;
  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <AdminDataMessage loading={loading} error={error} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Hệ thống Quản trị HomeFlow 2026</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Tổng quan hoạt động HomeFlow 👋
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Số liệu được truy vấn từ máy chủ HomeFlow: <strong className="text-white">{stats.users.toLocaleString('vi-VN')} người dùng</strong> và <strong className="text-white">{stats.households.toLocaleString('vi-VN')} hộ gia đình</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
            >
              <span>Xem báo cáo chi tiết</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={stats.users.toLocaleString('vi-VN')}
          change="Tổng tài khoản"
          isPositive={true}
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Hộ gia đình"
          value={stats.households.toLocaleString('vi-VN')}
          change="Đang lưu trữ"
          isPositive={true}
          icon={Home}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Tổng số ví"
          value={stats.accounts.toLocaleString('vi-VN')}
          change="Ví đang hoạt động"
          isPositive={true}
          icon={Wallet}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Tổng giao dịch"
          value={stats.transactions.toLocaleString('vi-VN')}
          change="Tổng bản ghi"
          isPositive={true}
          icon={ArrowLeftRight}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Tổng thu tháng 11"
          value={formatCurrency(stats.monthlyIncome)}
          change="Tháng hiện tại"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Tổng chi tháng 11"
          value={formatCurrency(stats.monthlyExpense)}
          change="Tháng hiện tại"
          isPositive={false}
          icon={ArrowDownRight}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Cash Flow Over Time */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Biểu đồ Thu Chi Toàn Hệ Thống</h3>
              <p className="text-xs text-slate-500 mt-0.5">Xu hướng dòng tiền thu nhập và chi tiêu (12 tháng gần nhất)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Calendar className="w-3.5 h-3.5" /> Năm 2026
              </span>
            </div>
          </div>

          <div className="mt-6 h-76 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.monthlyCashFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#10b981" stop-opacity={0.3} />
                    <stop offset="95%" stop-color="#10b981" stop-opacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#ef4444" stop-opacity={0.3} />
                    <stop offset="95%" stop-color="#ef4444" stop-opacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Tổng Thu Nhập"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Tổng Chi Tiêu"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart: User Growth */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tăng Trưởng Người Dùng</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tốc độ mở rộng quy mô thành viên</p>
              </div>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.userGrowth} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="users" name="Người dùng" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Công việc hoàn thành: <strong className="text-slate-900">{stats.completedTasks}/{stats.tasks}</strong></span>
            <span className="text-rose-600 font-bold">{stats.overdueDebts} khoản nợ quá hạn</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & New Users */}
      <AdminDataMessage loading={transactionsLoading} error={transactionsError} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Giao Dịch Gần Đây</h3>
              <p className="text-xs text-slate-500 mt-0.5">Nhật ký thu chi trực tiếp trên hệ thống</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6">Giao dịch</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-6 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{tx.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{tx.accountName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {tx.userName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatAdminDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold">
                      <span className={tx.type === 'income' ? 'text-emerald-600' : tx.type === 'expense' ? 'text-rose-600' : 'text-blue-600'}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): New Users List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Người Dùng Mới</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tài khoản vừa gia nhập gần đây</p>
              </div>
              <Link to="/users" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Xem hết
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={user.status} type="user" />
                    <span className="block text-[10px] text-slate-400 mt-1">{user.joinedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/users"
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors inline-block"
            >
              Quản lý danh sách thành viên
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
