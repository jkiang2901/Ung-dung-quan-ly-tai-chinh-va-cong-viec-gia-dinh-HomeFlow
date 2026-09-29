import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Home } from 'lucide-react';

interface FamilyFundCardProps {
  balance: number;
}

export const FamilyFundCard: React.FC<FamilyFundCardProps> = ({ balance }) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  return (
    <div className="mx-4 my-2 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#056839] via-[#045930] to-[#023b1f] p-5 text-white shadow-xl shadow-[#056839]/25 transition-all duration-300 hover:shadow-2xl">
      {/* Decorative background house motif / curves */}
      <div className="absolute -right-8 -top-8 w-40 h-40 opacity-10 pointer-events-none">
        <Home className="w-full h-full text-white" />
      </div>
      <div className="absolute right-6 top-6 w-16 h-16 border-4 border-white/5 rounded-full pointer-events-none" />

      {/* Top section: Title badge & Hide/Show toggle */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold tracking-wider uppercase text-emerald-200">
            Quỹ gia đình chung
          </span>
          <span className="text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 backdrop-blur-sm">
            Chính thức
          </span>
        </div>

        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors backdrop-blur-sm"
          title={showBalance ? "Ẩn số dư" : "Hiện số dư"}
        >
          {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Balance Display */}
      <div className="mt-4 mb-5 relative z-10">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[34px] font-extrabold tracking-tight font-sans leading-none">
            {showBalance ? formatMoney(balance) : '••••••••'}
          </span>
          <span className="text-xl font-bold text-emerald-200 underline underline-offset-4 decoration-emerald-400/60">
            đ
          </span>
        </div>
      </div>

      {/* Bottom info stats pills */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-1 bg-white/10 text-emerald-100 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
          <span className="font-bold text-emerald-300">+12.4%</span>
          <span className="text-emerald-100/80">so với tháng 09</span>
        </div>

        <div className="bg-white/10 text-emerald-100 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm">
          3 nguồn đóng góp
        </div>
      </div>
    </div>
  );
};
