import React from 'react';

export const Greeting: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div>
        <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
          Chào buổi sáng! <span className="animate-bounce inline-block">👋</span>
        </h2>
        <p className="text-[13px] text-slate-500 font-medium mt-0.5">
          Gia đình Hạnh Phúc <span className="mx-1 text-slate-300">•</span> Tháng 10 ấm no
        </p>
      </div>

      {/* Pill with family photos preview */}
      <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full px-2 py-1 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
          alt="Avatar"
          className="w-6 h-6 rounded-full object-cover"
        />
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
          alt="Avatar"
          className="w-6 h-6 rounded-full object-cover -ml-2 border border-white"
        />
        <span className="text-[11px] font-bold text-[#056839] ml-1 pr-1 bg-emerald-50 px-1.5 py-0.5 rounded-full">
          +1
        </span>
      </div>
    </div>
  );
};
