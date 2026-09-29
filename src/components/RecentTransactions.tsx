import React from 'react';
import type { Transaction } from '../types';
import { ShoppingBag, Landmark, Baby, CreditCard, Tag } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewHistory?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onViewHistory,
}) => {
  const formatMoney = (val: number) => {
    const isIncome = val > 0;
    const absVal = Math.abs(val).toLocaleString('vi-VN');
    return `${isIncome ? '+' : '-'}${absVal} đ`;
  };

  const getIcon = (type: Transaction['iconType']) => {
    switch (type) {
      case 'shopping':
        return {
          icon: ShoppingBag,
          bg: 'bg-orange-100/80 text-orange-600',
        };
      case 'salary':
        return {
          icon: Landmark,
          bg: 'bg-emerald-100/80 text-emerald-600',
        };
      case 'baby':
        return {
          icon: Baby,
          bg: 'bg-cyan-100/80 text-cyan-600',
        };
      default:
        return {
          icon: CreditCard,
          bg: 'bg-purple-100/80 text-purple-600',
        };
    }
  };

  return (
    <div className="mx-4 my-4 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
          Giao dịch gần đây
        </h3>
        <button
          onClick={onViewHistory}
          className="text-[13px] font-bold text-slate-500 hover:text-[#056839] transition-colors flex items-center gap-0.5"
        >
          Lịch sử <span className="text-[15px]">&rsaquo;</span>
        </button>
      </div>

      {/* Transaction Items */}
      <div className="space-y-3">
        {transactions.map((tx) => {
          const { icon: IconComp, bg } = getIcon(tx.iconType);
          const isIncome = tx.amount > 0;

          return (
            <div
              key={tx.id}
              className="p-4 bg-white rounded-[20px] shadow-sm border border-slate-100/90 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Category Icon */}
                <div
                  className={`w-12 h-12 rounded-[16px] ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <IconComp className="w-6 h-6 stroke-[2.2]" />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <h4 className="text-[14.5px] font-bold text-slate-900 truncate leading-snug">
                    {tx.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-slate-400 font-medium">
                    <span className="text-slate-600 font-semibold">{tx.user}</span>
                    <span>•</span>
                    <span>{tx.time}</span>
                  </div>
                </div>
              </div>

              {/* Amount & Category label */}
              <div className="text-right flex-shrink-0 pl-2">
                <div
                  className={`text-[15px] font-extrabold tracking-tight ${
                    isIncome ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {formatMoney(tx.amount)}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                  <Tag className="w-3 h-3 text-slate-300" />
                  {tx.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
