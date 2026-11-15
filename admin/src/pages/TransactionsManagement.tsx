import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { mockTransactions } from '../data/mockData';
import { TransactionItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const TransactionsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set(mockTransactions.map((t) => t.category));
    return Array.from(set);
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((tx) => {
      const matchSearch =
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.accountName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      return matchSearch && matchType && matchCategory;
    });
  }, [searchTerm, typeFilter, categoryFilter]);

  // Aggregate totals
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng thu lọc được</p>
            <h4 className="text-xl font-extrabold text-emerald-600 mt-1">
              +{formatCurrency(totalIncome)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng chi lọc được</p>
            <h4 className="text-xl font-extrabold text-rose-600 mt-1">
              -{formatCurrency(totalExpense)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Chênh lệch dòng tiền (Net)</p>
            <h4 className={`text-xl font-extrabold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, người dùng, ví..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả loại giao dịch</option>
              <option value="income">Chỉ Thu Nhập</option>
              <option value="expense">Chỉ Chi Tiêu</option>
              <option value="transfer">Chỉ Chuyển Ví</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => alert('Xuất file CSV danh sách giao dịch')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Giao dịch</th>
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Ví / Tài khoản</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-6 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600'
                            : tx.type === 'expense'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : tx.type === 'expense' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowLeftRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div>{tx.title}</div>
                        {tx.householdName && (
                          <div className="text-[10px] text-teal-600 font-medium">
                            {tx.householdName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={tx.type} type="transaction" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">{tx.userName}</div>
                    <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{tx.accountName}</td>
                  <td className="py-4 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                  <td className="py-4 px-6 text-right font-extrabold text-sm whitespace-nowrap">
                    <span
                      className={
                        tx.type === 'income'
                          ? 'text-emerald-600'
                          : tx.type === 'expense'
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

