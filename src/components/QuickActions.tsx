import React from 'react';
import { PiggyBank, ReceiptText, ArrowLeftRight, QrCode } from 'lucide-react';

interface QuickActionsProps {
  onDeposit: () => void;
  onAddExpense: () => void;
  onTransfer: () => void;
  onScanQR: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onDeposit,
  onAddExpense,
  onTransfer,
  onScanQR,
}) => {
  const actions = [
    {
      id: 'deposit',
      label: 'Nộp quỹ',
      icon: PiggyBank,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconColor: 'text-[#056839]',
      onClick: onDeposit,
    },
    {
      id: 'add_expense',
      label: 'Thêm chi',
      icon: ReceiptText,
      bgColor: 'bg-orange-50 text-orange-600 border-orange-100',
      iconColor: 'text-orange-600',
      onClick: onAddExpense,
    },
    {
      id: 'transfer',
      label: 'Chuyển ví',
      icon: ArrowLeftRight,
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      iconColor: 'text-cyan-600',
      onClick: onTransfer,
    },
    {
      id: 'scan_qr',
      label: 'Quét mã',
      icon: QrCode,
      bgColor: 'bg-purple-50 text-purple-600 border-purple-100',
      iconColor: 'text-purple-600',
      onClick: onScanQR,
    },
  ];

  return (
    <div className="mx-4 my-3">
      <h3 className="text-[17px] font-extrabold text-slate-900 mb-3 tracking-tight">
        Thao tác nhanh
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((act) => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-[20px] shadow-sm border border-slate-100/80 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-[16px] ${act.bgColor} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border`}
              >
                <IconComponent className={`w-6 h-6 ${act.iconColor} stroke-[2.2]`} />
              </div>
              <span className="text-[12px] font-bold text-slate-700 leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
