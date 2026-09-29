import React, { useState } from 'react';
import { MONTHLY_EXPENSES, WEEKLY_EXPENSES } from '../mockData';

export const ExpenseAllocation: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const data = period === 'month' ? MONTHLY_EXPENSES : WEEKLY_EXPENSES;

  // Render pure SVG Donut Chart
  let cumulativePercent = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mx-4 my-4 bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
      {/* Top Header & Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Phân bổ chi tiêu
          </h3>
          <p className="text-[12px] font-semibold text-slate-400 mt-0.5">
            {period === 'month' ? 'Tháng 10/2023' : 'Tuần này'}
          </p>
        </div>

        {/* Toggle Pill */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/60">
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all ${
              period === 'month'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all ${
              period === 'week'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* Main Grid: Chart Left, Legend Right */}
      <div className="flex items-center gap-4">
        {/* Left: Interactive Donut Chart */}
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((cat, idx) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth="14"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>
          {/* Inner Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[11px] font-semibold text-slate-400">Hạng mục</span>
            <span className="text-[13px] font-extrabold text-slate-900 leading-tight">
              {data.length} mục
            </span>
          </div>
        </div>

        {/* Right: Legend Breakdown List */}
        <div className="flex-1 space-y-2.5">
          {data.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
              </div>
              <span className="font-extrabold text-slate-900 ml-2">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
