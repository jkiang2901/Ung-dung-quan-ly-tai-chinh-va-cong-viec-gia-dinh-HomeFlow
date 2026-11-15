import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Home,
  ArrowLeftRight,
  Scale,
  CheckSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  Database,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  {
    path: '/',
    label: 'Dashboard tổng quan',
    icon: LayoutDashboard,
    badge: 'Mới',
  },
  {
    path: '/users',
    label: 'Quản lý người dùng',
    icon: Users,
    count: '8',
  },
  {
    path: '/households',
    label: 'Quản lý gia đình',
    icon: Home,
    count: '3',
  },
  {
    path: '/transactions',
    label: 'Quản lý giao dịch',
    icon: ArrowLeftRight,
    count: '142',
  },
  {
    path: '/debts',
    label: 'Quản lý công nợ',
    icon: Scale,
    count: '5',
  },
  {
    path: '/tasks',
    label: 'Quản lý công việc',
    icon: CheckSquare,
    count: '12',
  },
  {
    path: '/reports',
    label: 'Thống kê & báo cáo',
    icon: BarChart3,
  },
  {
    path: '/settings',
    label: 'Cài đặt hệ thống',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-18 px-6 flex items-center gap-3.5 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Home className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white tracking-tight">HomeFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hệ thống quản trị tài chính</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Phân hệ quản trị
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-400 text-slate-900">
                          {item.badge}
                        </span>
                      )}
                      {item.count && !isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300">
                          {item.count}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Database Status Card */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB Atlas
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Cluster0 (ap-southeast-1)</p>
            </div>
          </div>
        </div>

        {/* Admin User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Admin"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[11px] text-slate-400 truncate">admin@homeflow.vn</p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-blue-400" />
        </div>
      </aside>
    </>
  );
};

