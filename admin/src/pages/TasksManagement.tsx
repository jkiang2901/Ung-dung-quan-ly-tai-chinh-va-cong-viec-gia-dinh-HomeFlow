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
  Trash2,
  CheckCircle2 as CompleteIcon,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import { TaskItem, TaskStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { adminApi } from '../services/api';
import { AdminDataMessage, useAdminData } from '../services/useAdminData';

export const TasksManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [actionError, setActionError] = useState('');
  const { data: taskList, setData: setTaskList, loading, error, refresh } =
    useAdminData<TaskItem[]>(async () => (await adminApi.tasks()).tasks, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tag.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [taskList, searchTerm, statusFilter, priorityFilter]);

  // Summary Metrics
  const completedCount = useMemo(() => {
    return taskList.filter((t) => t.status === 'completed').length;
  }, [taskList]);

  const totalRewards = useMemo(() => {
    return taskList
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [taskList]);

  const toggleCompleted = async (task: TaskItem) => {
    setActionError('');
    try {
      const completed = task.status !== 'completed';
      await adminApi.updateTask(task.id, { completed });
      setTaskList((current) => current.map((item) => item.id === task.id ? { ...item, status: completed ? 'completed' : 'pending' } : item));
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Không cập nhật được công việc.');
    }
  };

  const editTask = async (task: TaskItem) => {
    const title = window.prompt('Tên công việc', task.title);
    if (title === null) return;
    const amountText = window.prompt('Tiền thưởng (VND)', String(task.amount));
    if (amountText === null) return;
    const amount = Number(amountText);
    setActionError('');
    try {
      await adminApi.updateTask(task.id, { title, amount });
      setTaskList((current) => current.map((item) => item.id === task.id ? { ...item, title: title.trim(), amount } : item));
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Không cập nhật được công việc.');
    }
  };

  const deleteTask = async (task: TaskItem) => {
    if (!window.confirm(`Xóa công việc "${task.title}"?`)) return;
    setActionError('');
    try {
      await adminApi.deleteTask(task.id);
      setTaskList((current) => current.filter((item) => item.id !== task.id));
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Không xóa được công việc.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminDataMessage loading={loading} error={error} />
      {actionError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p>}
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng việc nhà được giao</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">{taskList.length} nhiệm vụ</h4>
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
              {completedCount} / {taskList.length}
            </h4>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Tỷ lệ hoàn thành: {taskList.length ? Math.round((completedCount / taskList.length) * 100) : 0}%
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
                <th className="py-3.5 px-4 text-right">Thao tác</th>
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
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button onClick={() => void editTask(task)} className="mr-1 rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100" title="Sửa công việc">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => void toggleCompleted(task)} className="mr-1 rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title={task.status === 'completed' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}>
                      {task.status === 'completed' ? <RotateCcw className="h-4 w-4" /> : <CompleteIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => void deleteTask(task)} className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" title="Xóa công việc">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && filteredTasks.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">Không có công việc phù hợp.</p>}
        <button onClick={() => void refresh()} className="text-xs font-semibold text-blue-600 hover:underline">Tải lại danh sách</button>
      </div>
    </div>
  );
};
