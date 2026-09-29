import React, { useState } from 'react';
import type { HouseholdTask, FamilyMember } from '../../types';
import {
  CheckCircle2,
  Circle,
  Users,
  Sparkles,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  Coins,
  ArrowRight,
} from 'lucide-react';

interface TasksTabProps {
  tasks?: HouseholdTask[];
  members: FamilyMember[];
  onToggleTask: (id: string) => void;
  onAddTask?: (task: HouseholdTask) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks = [],
  members,
  onToggleTask,
  onAddTask,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'todo' | 'members'>('todo');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('Mẹ Lan');
  const [taskInput, setTaskInput] = useState<string>('');
  const [rewardPoints, setRewardPoints] = useState<string>('+20k');

  // Sample data matching the uploaded design
  const todayTasks = [
    {
      id: 'today-1',
      title: 'Lau dọn phòng khách',
      completed: true,
      completedTime: '10:15',
      assignedTo: 'Bé Bon',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      reward: '+20k sao',
    },
    {
      id: 'today-2',
      title: 'Đi siêu thị mua thực phẩ...',
      completed: false,
      time: '17:30 chiều',
      assignedTo: 'Bố Minh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Cần thiết',
      tagColor: 'bg-blue-50 text-blue-600',
    },
  ];

  const upcomingTasks = [
    {
      id: 'up-1',
      title: 'Bảo dưỡng điều hòa & lọc nước',
      completed: false,
      dateLabel: 'Thứ 7',
      assignedTo: 'Bố Minh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Gia dụng',
    },
    {
      id: 'up-2',
      title: 'Đóng bảo hiểm sức khỏe gia đì...',
      completed: false,
      dateLabel: '15/11',
      dateColor: 'text-rose-500 font-bold',
      assignedTo: 'Mẹ Lan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      tag: 'Tài chính',
      tagColor: 'bg-[#056839]/10 text-[#056839]',
    },
    {
      id: 'up-3',
      title: 'Đọc 3 cuốn sách khoa h...',
      completed: false,
      reward: '+30k sao',
      assignedTo: 'Bé Bon',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      tag: 'Học tập',
    },
  ];

  // Combined stateful handlers
  const [localTodayTasks, setLocalTodayTasks] = useState(todayTasks);
  const [localUpcomingTasks, setLocalUpcomingTasks] = useState(upcomingTasks);

  const toggleTodayTask = (id: string) => {
    setLocalTodayTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    onToggleTask(id);
  };

  const toggleUpcomingTask = (id: string) => {
    setLocalUpcomingTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    onToggleTask(id);
  };

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const newTaskItem = {
      id: `task-${Date.now()}`,
      title: taskInput,
      completed: false,
      time: 'Hôm nay',
      assignedTo: selectedAssignee,
      avatar:
        members.find((m) => m.name === selectedAssignee)?.avatar ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      tag: 'Cần thiết',
      tagColor: 'bg-emerald-50 text-emerald-700',
    };

    setLocalTodayTasks((prev) => [...prev, newTaskItem]);
    if (onAddTask) {
      onAddTask({
        id: newTaskItem.id,
        title: newTaskItem.title,
        assignedTo: newTaskItem.assignedTo,
        completed: false,
        tag: 'Cần thiết',
      });
    }

    setTaskInput('');
  };

  return (
    <div className="p-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* 1. Top Sub-Tab Switcher Pills */}
      <div className="p-1 bg-slate-200/70 rounded-2xl flex items-center justify-between">
        <button
          onClick={() => setActiveSubTab('todo')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'todo'
              ? 'bg-white text-emerald-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#056839]" />
          <span>Việc cần làm</span>
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#056839] text-[11px] font-extrabold flex items-center justify-center">
            {localTodayTasks.filter((t) => !t.completed).length + localUpcomingTasks.length + (tasks ? 0 : 0)}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all relative ${
            activeSubTab === 'members'
              ? 'bg-white text-emerald-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Thành viên</span>
          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-4"></span>
        </button>
      </div>

      {/* 2. Gamification / Family Reward Banner Card */}
      <div className="p-5 rounded-[24px] bg-gradient-to-br from-[#056839] via-[#045930] to-[#023e20] text-white shadow-xl shadow-[#056839]/20 relative overflow-hidden">
        {/* Subtle curved background lines */}
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-emerald-200">
              <span>⭐</span> GIA ĐÌNH CÙNG VUI
            </div>
            <h3 className="text-[17px] font-extrabold mt-1 leading-snug">
              Hoàn thành 3 việc để thưởng trà sữa!
            </h3>
            <p className="text-[12px] font-semibold text-emerald-100/90 mt-1">
              Tiến độ hôm nay: <span className="font-bold text-white">1/2 việc</span>
            </p>
          </div>

          {/* Circular Percentage Badge */}
          <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-[15px] font-black text-white">50%</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Household Task Creator Box */}
      <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#056839] flex items-center justify-center">
              <CheckCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h4 className="text-[15px] font-extrabold text-slate-900">Thêm việc nhà nhanh</h4>
          </div>

          <button className="text-[12px] font-bold text-[#056839] flex items-center gap-1 hover:underline">
            Gợi ý mẫu <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>

        <form onSubmit={handleQuickCreate} className="space-y-3">
          {/* Input text */}
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập tên việc (vd: Rửa bát, Mua sữa...)"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full text-[13.5px] font-medium bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#056839]/20"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Assignee selection chips */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12px] font-semibold text-slate-400 mr-1">Giao:</span>
              {[
                { name: 'Bố Minh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
                { name: 'Mẹ Lan', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
                { name: 'Bé Bon', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
              ].map((p) => {
                const isSelected = selectedAssignee === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedAssignee(p.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                      isSelected
                        ? 'bg-emerald-100/70 border-emerald-500/60 text-[#056839]'
                        : 'bg-slate-100/80 border-slate-200/60 text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row Action buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() =>
                setRewardPoints(rewardPoints === '+20k' ? '+30k' : '+20k')
              }
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200/60 text-rose-700 text-[12px] font-extrabold rounded-xl"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{rewardPoints}</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#056839] hover:bg-[#04522d] text-white text-[13px] font-extrabold rounded-xl shadow-md shadow-[#056839]/20 transition-all active:scale-95"
            >
              <span>Tạo</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>

      {/* 4. "Hôm nay" Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#056839]"></span>
            <h3 className="text-[16px] font-extrabold text-slate-900">
              Hôm nay <span className="text-slate-400 text-[13px]">({localTodayTasks.length} việc)</span>
            </h3>
          </div>
          <span className="text-[12px] font-bold text-[#056839]">
            {localTodayTasks.filter((t) => t.completed).length} đã xong
          </span>
        </div>

        <div className="space-y-3">
          {localTodayTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTodayTask(t.id)}
              className={`p-4 bg-white rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
                t.completed ? 'bg-slate-50/70' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Completed Check Button */}
                <button className="flex-shrink-0">
                  {t.completed ? (
                    <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-5 h-5 fill-amber-700 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-indigo-300 stroke-[1.8]" />
                  )}
                </button>

                <div className="min-w-0">
                  <h4
                    className={`text-[14px] font-bold leading-snug truncate ${
                      t.completed ? 'line-through text-slate-400 font-semibold' : 'text-slate-900'
                    }`}
                  >
                    {t.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500 font-semibold">
                    <div className="flex items-center gap-1">
                      <img src={t.avatar} alt={t.assignedTo} className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-slate-700">{t.assignedTo}</span>
                    </div>

                    {t.completed ? (
                      <span className="text-amber-700/80 font-medium">
                        Đã hoàn thành lúc {t.completedTime}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-500" />
                        {t.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tag / Reward */}
              {t.reward && (
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200/80 text-amber-700 font-extrabold text-[11px] rounded-full flex-shrink-0 ml-2">
                  🎖️ {t.reward}
                </span>
              )}

              {t.tag && (
                <span
                  className={`px-2.5 py-1 font-bold text-[11px] rounded-full flex-shrink-0 ml-2 ${
                    t.tagColor || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. "Sắp tới" Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <h3 className="text-[16px] font-extrabold text-slate-900">
              Sắp tới <span className="text-slate-400 text-[13px]">({localUpcomingTasks.length} việc)</span>
            </h3>
          </div>
          <button className="text-[12px] font-bold text-slate-500 hover:text-[#056839]">
            Xem tất cả &rsaquo;
          </button>
        </div>

        <div className="space-y-3">
          {localUpcomingTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleUpcomingTask(t.id)}
              className={`p-4 bg-white rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
                t.completed ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button className="flex-shrink-0">
                  {t.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-indigo-300 stroke-[1.8]" />
                  )}
                </button>

                <div className="min-w-0">
                  <h4
                    className={`text-[14px] font-bold leading-snug truncate ${
                      t.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {t.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500 font-semibold">
                    <div className="flex items-center gap-1">
                      <img src={t.avatar} alt={t.assignedTo} className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-slate-700">{t.assignedTo}</span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-500">{t.tag}</span>
                  </div>
                </div>
              </div>

              {/* Date tag or Reward */}
              {t.dateLabel && (
                <span
                  className={`text-[12px] font-bold flex-shrink-0 ml-2 ${
                    t.dateColor || 'text-slate-500'
                  }`}
                >
                  {t.dateLabel}
                </span>
              )}

              {t.reward && (
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200/80 text-amber-700 font-extrabold text-[11px] rounded-full flex-shrink-0 ml-2">
                  🎖️ {t.reward}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
