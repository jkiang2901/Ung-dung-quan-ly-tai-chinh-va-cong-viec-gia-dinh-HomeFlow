import React from 'react';
import { Target } from 'lucide-react';

interface BudgetProgressProps {
  spent: number;
  totalBudget: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ spent, totalBudget }) => {
  const percentage = Math.round((spent / totalBudget) * 100);
  const remaining = totalBudget - spent;

  const formatShort = (val: number) => {
    return (val / 1000000).toFixed(2) + 'M';
  };

  const formatFull = (val: number) => val.toLocaleString('vi-VN');

  return (
    <div className="mx-4 my-3 bg-white rounded-[20px] p-4 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-[#056839]">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[14px] font-bold text-slate-800">
            Tiến độ ngân sách chi tiêu
          </span>
        </div>
        <span className="text-[13px] font-extrabold text-slate-900">
          {formatShort(spent)} / {formatShort(totalBudget)} đ
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-[#056839] to-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Footer statistics */}
      <div className="flex items-center justify-between mt-2.5 text-[12px] font-medium text-slate-500">
        <span>Đã dùng {percentage}% tháng này</span>
        <span className="font-semibold text-slate-700">
          Còn {formatFull(remaining)} đ
        </span>
      </div>
    </div>
  );
};
