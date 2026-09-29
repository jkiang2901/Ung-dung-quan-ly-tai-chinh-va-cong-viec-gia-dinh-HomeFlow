import React from 'react';
import type { HouseholdTask } from '../types';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

interface TodayTasksProps {
  tasks: HouseholdTask[];
  onToggleTask: (id: string) => void;
  onViewAll?: () => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({ tasks, onToggleTask, onViewAll }) => {
  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  return (
    <div className="mx-4 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
            Việc nhà hôm nay
          </h3>
          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[12px] font-bold flex items-center justify-center">
            {tasks.filter((t) => !t.completed).length}
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[13px] font-bold text-slate-500 hover:text-[#056839] transition-colors flex items-center gap-0.5"
        >
          Xem tất cả <span className="text-[15px]">&rsaquo;</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            className={`p-4 bg-white rounded-[20px] shadow-sm border border-slate-100/90 flex items-start justify-between cursor-pointer transition-all hover:shadow-md ${
              task.completed ? 'opacity-60 bg-slate-50' : ''
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
              {/* Checkbox Icon */}
              <button
                className="mt-0.5 text-indigo-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                aria-label="Toggle completed"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                ) : (
                  <Circle className="w-6 h-6 text-indigo-300 stroke-[1.8]" />
                )}
              </button>

              <div className="min-w-0">
                <h4
                  className={`text-[14px] font-bold text-slate-800 leading-snug truncate ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h4>

                <div className="flex items-center gap-2.5 mt-1.5 flex-wrap text-[12px] text-slate-500 font-medium">
                  {task.time && (
                    <span className="flex items-center gap-1 text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      {task.time}
                    </span>
                  )}
                  {task.amount && (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      💵 {formatMoney(task.amount)} đ
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {task.avatarUrl && (
                      <img
                        src={task.avatarUrl}
                        alt={task.assignedTo}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    )}
                    <span className="text-slate-600 font-semibold">{task.assignedTo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Badge */}
            {task.tag && (
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  task.priority
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {task.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
