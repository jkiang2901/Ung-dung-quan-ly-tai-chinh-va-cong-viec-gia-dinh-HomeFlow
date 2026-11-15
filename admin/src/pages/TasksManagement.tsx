import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Gift,
  Tag,
  Flame,
} from 'lucide-react';
import { mockTasks } from '../data/mockData';
import { TaskItem, TaskStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const TasksManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tag.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  // Summary Metrics
  const completedCount = useMemo(() => {
    return mockTasks.filter((t) => t.status === 'completed').length;
  }, []);

  const totalRewards = useMemo(() => {
    return mockTasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng việc nhà được giao</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">{mockTasks.length} nhiệm vụ</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Trong toàn bộ các gia đình</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Đã hoàn thành</p>
            <h4 className="text-xl font-extrabold text-emerald-600 mt-1">
              {completedCount} / {mockTasks.length}
            </h4>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Tỷ lệ hoàn thành: {Math.round((completedCount / mockTasks.length) * 100)}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tiền thưởng đã trao</p>
            <h4 className="text-xl font-extrabold text-amber-600 mt-1">
              {formatCurrency(totalRewards)}
            </h4>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Khích lệ trẻ em làm việc nhà</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo việc nhà, người làm, thẻ tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="pending">Chờ thực hiện</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Bình thường</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium ml-2">
            {filteredTasks.length} nhiệm vụ
          </span>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Công việc</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Gia đình</th>
                <th className="py-3.5 px-4">Hạn hoàn thành</th>
                <th className="py-3.5 px-4">Ưu tiên</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Thưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{task.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> {task.tag}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{task.description}</p>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={task.assignedToAvatar}
                        alt={task.assignedToName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span>{task.assignedToName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{task.householdName}</td>
                  <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                    {task.dueDate}
                  </td>
                  <td className="py-4 px-4">
                    {task.priority === 'high' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                        <Flame className="w-3.5 h-3.5" /> Cao
                      </span>
                    ) : task.priority === 'medium' ? (
                      <span className="text-xs font-medium text-amber-600">Trung bình</span>
                    ) : (
                      <span className="text-xs text-slate-400">Thấp</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={task.status} type="task" />
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-sm whitespace-nowrap">
                    {task.amount > 0 ? (
                      <span className="text-amber-600 font-bold">+{formatCurrency(task.amount)}</span>
                    ) : (
                      <span className="text-slate-400 font-normal">Không thưởng</span>
                    )}
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

