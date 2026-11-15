import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title = 'Tổng quan hệ thống',
  subtitle = 'Dữ liệu thời gian thực từ MongoDB Atlas',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'user',
      title: 'Người dùng mới đăng ký',
      desc: 'Hoàng Quốc Bảo (bao.hoang@outlook.com) vừa tạo tài khoản',
      time: '10 phút trước',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 2,
      type: 'debt',
      title: 'Khoản nợ quá hạn cần xử lý',
      desc: 'Khoản vay nhập hàng của Nguyễn Hoàng Long đã quá hạn 14 ngày',
      time: '1 giờ trước',
      icon: AlertCircle,
      color: 'text-rose-500 bg-rose-50',
    },
    {
      id: 3,
      type: 'task',
      title: 'Công việc hoàn thành',
      desc: 'Nguyễn Tuấn Bi đã hoàn thành việc nhà "Rửa chén bát"',
      time: '2 giờ trước',
      icon: Clock,
      color: 'text-blue-500 bg-blue-50',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between transition-all">
      {/* Left: Hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng, giao dịch, gia đình, công nợ..."
            className="w-full pl-10 pr-12 py-2 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live API v1.0</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3 w-84 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Thông báo hệ thống</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600">
                      3 mới
                    </span>
                  </div>
                  <button className="text-xs text-blue-600 font-semibold hover:underline">
                    Đã đọc tất cả
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {notifications.map((n) => {
                    const NIcon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className={`p-2 rounded-lg ${n.color}`}>
                          <NIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
            alt="Admin"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-600/20"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">Bố Minh</p>
            <p className="text-[10px] text-blue-600 font-semibold mt-1">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

