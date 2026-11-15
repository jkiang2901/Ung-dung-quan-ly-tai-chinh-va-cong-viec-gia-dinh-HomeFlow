import React, { useState, useMemo } from 'react';
import {
  Search,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Filter,
} from 'lucide-react';
import { mockDebts } from '../data/mockData';
import { DebtItem, DebtStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const DebtsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredDebts = useMemo(() => {
    return mockDebts.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.creditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.debtorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  // Totals
  const totalDebtAmount = useMemo(() => {
    return mockDebts.reduce((sum, d) => sum + d.amount, 0);
  }, []);

  const totalPaidAmount = useMemo(() => {
    return mockDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  }, []);

  const overdueCount = useMemo(() => {
    return mockDebts.filter((d) => d.status === 'overdue').length;
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng công nợ ghi nhận</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalDebtAmount)}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{mockDebts.length} khoản nợ đang quản lý</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Đã thu hồi / thanh toán</p>
            <h4 className="text-xl font-extrabold text-emerald-600 mt-1">
              {formatCurrency(totalPaidAmount)}
            </h4>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Đạt {Math.round((totalPaidAmount / totalDebtAmount) * 100)}% tổng nợ
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Khoản nợ quá hạn</p>
            <h4 className="text-xl font-extrabold text-rose-600 mt-1">
              {overdueCount} khoản
            </h4>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Cần gửi nhắc nhở</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo khoản nợ, người vay, người cho vay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái nợ</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="partial">Thanh toán một phần</option>
            <option value="paid">Đã thanh toán đủ</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>
      </div>

      {/* Debts Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Khoản nợ</th>
                <th className="py-3.5 px-4">Bên cho vay</th>
                <th className="py-3.5 px-4">Bên vay</th>
                <th className="py-3.5 px-4">Tiến độ thanh toán</th>
                <th className="py-3.5 px-4">Hạn trả</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDebts.map((d) => {
                const percent = Math.min(100, Math.round((d.paidAmount / d.amount) * 100));
                return (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{d.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{d.note}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {d.creditorName}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {d.debtorName}
                    </td>
                    <td className="py-4 px-4 w-48">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>{formatCurrency(d.paidAmount)}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percent === 100
                              ? 'bg-emerald-500'
                              : percent > 0
                              ? 'bg-blue-500'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {d.dueDate}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={d.status} type="debt" />
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-sm text-slate-900 whitespace-nowrap">
                      {formatCurrency(d.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

