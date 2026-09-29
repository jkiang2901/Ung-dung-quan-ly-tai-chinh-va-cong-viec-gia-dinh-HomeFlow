import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface MonthlySummaryProps {
  totalIncome: number;
  totalExpense: number;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ totalIncome, totalExpense }) => {
  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  return (
    <div className="mx-4 my-2 grid grid-cols-2 gap-3">
      {/* Monthly Income Card */}
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-slate-500">Tổng thu tháng</span>
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div>
          <div className="text-[18px] font-extrabold text-[#056839] leading-tight flex items-baseline gap-0.5">
            {formatMoney(totalIncome)} <span className="text-[14px] font-bold">đ</span>
          </div>
          <p className="text-[11px] font-medium text-emerald-700 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            2 khoản đã vào
          </p>
        </div>
      </div>

      {/* Monthly Expense Card */}
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-slate-500">Chi tiêu tháng</span>
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div>
          <div className="text-[18px] font-extrabold text-orange-600 leading-tight flex items-baseline gap-0.5">
            {formatMoney(totalExpense)} <span className="text-[14px] font-bold">đ</span>
          </div>
          <p className="text-[11px] font-medium text-orange-700 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            58% kế hoạch
          </p>
        </div>
      </div>
    </div>
  );
};
