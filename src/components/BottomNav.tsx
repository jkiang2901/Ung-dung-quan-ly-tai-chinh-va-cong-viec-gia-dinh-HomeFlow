import React from 'react';
import { LayoutGrid, Wallet, CheckSquare, Users, Plus } from 'lucide-react';

export type TabType = 'home' | 'wallet' | 'tasks' | 'family';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAdd,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Trang chủ', icon: LayoutGrid },
    { id: 'wallet' as TabType, label: 'Ví tiền', icon: Wallet },
    { id: 'tasks' as TabType, label: 'Công việc', icon: CheckSquare },
    { id: 'family' as TabType, label: 'Gia đình', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto">
      {/* Container with shadow and white background */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2 flex items-center justify-between shadow-[0_-5px_25px_rgba(0,0,0,0.06)] relative">
        {/* Floating Center (+) Action Button */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <button
            onClick={onOpenQuickAdd}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#056839] to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-[#056839]/40 hover:scale-105 active:scale-95 transition-all ring-4 ring-slate-100"
            aria-label="Tạo mới"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Left Tabs: Home & Wallet */}
        <div className="flex items-center gap-6">
          {tabs.slice(0, 2).map((t) => {
            const IconComp = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChangeTab(t.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-[#056839]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <IconComp className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className={`text-[11px] font-bold ${isActive ? 'text-[#056839]' : ''}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tabs: Tasks & Family */}
        <div className="flex items-center gap-6">
          {tabs.slice(2, 4).map((t) => {
            const IconComp = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChangeTab(t.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-[#056839]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <IconComp className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className={`text-[11px] font-bold ${isActive ? 'text-[#056839]' : ''}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
