import React from 'react';
import { Bell, Home } from 'lucide-react';
import type { FamilyMember } from '../types';

interface HeaderProps {
  members: FamilyMember[];
  subtitle?: string;
  onOpenNotifications?: () => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  members,
  subtitle = 'Trang Chủ',
  onOpenNotifications,
  onLogoClick,
}) => {
  return (
    <header className="flex items-center justify-between px-4 pt-3 pb-2 bg-white sticky top-0 z-20 border-b border-slate-100/80">
      {/* Brand & Logo */}
      <div
        onClick={onLogoClick}
        className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="w-10 h-10 rounded-xl bg-[#056839] flex items-center justify-center text-white shadow-md shadow-[#056839]/20">
          <Home className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-[19px] font-bold text-[#056839] leading-tight tracking-tight">HomeFlow</h1>
          <p className="text-[12px] font-medium text-slate-400 -mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Right Actions: Notifications & Avatars */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Member Avatars Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
          {members.slice(0, 2).map((member) => (
            <img
              key={member.id}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
              src={member.avatar}
              alt={member.name}
            />
          ))}
          {members.length > 2 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-[#056839] text-white text-[11px] font-bold shadow-sm">
              +{members.length - 2}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
