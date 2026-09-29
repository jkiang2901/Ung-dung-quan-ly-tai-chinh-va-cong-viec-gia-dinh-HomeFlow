import React from 'react';
import {
  ArrowLeftRight,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  Home,
  PiggyBank,
  MoreVertical,
  Plane,
  Plus,
  ArrowDown,
  ArrowUp,
  Building,
} from 'lucide-react';

interface WalletTabProps {
  fundBalance?: number;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  onOpenDeposit,
  onOpenTransfer,
}) => {
  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  return (
    <div className="p-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* 1. Header Hero Card: TỔNG GIÁ TRỊ RÒNG TÍCH LŨY */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#056839] via-[#045930] to-[#023e20] p-5 text-white shadow-xl shadow-[#056839]/20">
        {/* Watermark bank/columns icon overlay */}
        <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
          <Building className="w-20 h-20 text-white stroke-[1.5]" />
        </div>

        <div className="relative z-10">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-200">
            TỔNG GIÁ TRỊ RÒNG TÍCH LŨY
          </span>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[34px] font-black tracking-tight leading-none">
              128.500.000
            </span>
            <span className="text-xl font-bold text-emerald-200 underline underline-offset-4 decoration-emerald-400/60">
              đ
            </span>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-bold text-emerald-300">+4.2%</span>
              <span className="opacity-80">so với tháng trước</span>
            </div>

            <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-100 border border-white/15">
              5 Ví hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Buttons Row (Chuyển tiền, Cài đặt hạn mức, Sao kê) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={onOpenTransfer}
          className="p-3 bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-[16px] bg-emerald-50 text-[#056839] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-emerald-100">
            <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[12px] font-bold text-slate-800 leading-tight">
            Chuyển tiền nội bộ
          </span>
        </button>

        <button
          onClick={onOpenDeposit}
          className="p-3 bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-[16px] bg-orange-50 text-orange-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-orange-100">
            <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[12px] font-bold text-slate-800 leading-tight">
            Cài đặt hạn mức
          </span>
        </button>

        <button
          onClick={onOpenDeposit}
          className="p-3 bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-blue-100">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[12px] font-bold text-slate-800 leading-tight">
            Sao kê chi tiết
          </span>
        </button>
      </div>

      {/* 3. Weekly Cash Flow Chart Card (Luồng tiền tuần này) */}
      <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-slate-900 leading-tight">
                Luồng tiền tuần này
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">Tổng thu chi qua 5 ví</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            7 ngày qua
          </span>
        </div>

        {/* 2 Cash Flow Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <ArrowDown className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>Tiền vào</span>
            </div>
            <div className="text-[16px] font-black text-emerald-600 mt-0.5">
              +15.800.000 đ
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <ArrowUp className="w-3 h-3 text-rose-500 stroke-[3]" />
              <span>Tiền ra</span>
            </div>
            <div className="text-[16px] font-black text-rose-600 mt-0.5">
              -7.420.000 đ
            </div>
          </div>
        </div>

        {/* Smooth Area Wave Graph SVG */}
        <div className="pt-2">
          <div className="relative h-20 w-full">
            <svg className="w-full h-full" viewBox="0 0 300 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#056839" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#056839" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill under curve */}
              <path
                d="M 0 50 Q 50 45, 100 35 T 200 20 T 300 15 L 300 70 L 0 70 Z"
                fill="url(#chartGradient)"
              />

              {/* Smooth Stroke Line */}
              <path
                d="M 0 50 Q 50 45, 100 35 T 200 20 T 300 15"
                fill="none"
                stroke="#056839"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* End Circle dot */}
              <circle cx="300" cy="15" r="4" fill="#056839" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>

          {/* Days of week axis */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 mt-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span className="text-[#056839] font-extrabold">CN</span>
          </div>
        </div>
      </div>

      {/* 4. Danh Sách Ví Thành Viên Section */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
            Danh sách ví thành viên
          </h3>
          <span className="text-[12px] font-bold text-slate-400">Tự động đồng bộ</span>
        </div>

        {/* Wallet Item 1: Ví Sinh Hoạt Chung (Main Hero Card) */}
        <div className="p-4 rounded-[22px] bg-gradient-to-r from-[#056839] to-[#034e29] text-white shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[16px] font-extrabold">Ví Sinh Hoạt Chung</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 text-[10px] font-bold">
                    Chính
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-emerald-100/90 mt-0.5">
                  Tiền chợ, điện nước & học phí
                </p>
              </div>
            </div>
            <button className="text-white/60 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="text-[11px] font-semibold text-emerald-200">
                Số dư khả dụng
              </span>
              <div className="text-[22px] font-black tracking-tight leading-none mt-0.5">
                24.850.000 <span className="text-base font-bold underline">đ</span>
              </div>
            </div>

            {/* Avatar Pill ML */}
            <div className="flex items-center -space-x-1.5">
              <div className="w-7 h-7 rounded-full bg-teal-800 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                M
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                L
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Item 2: Quỹ Tiết Kiệm Tương Lai (Progress Bar Card) */}
        <div className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[15px] font-extrabold text-slate-900">
                    Quỹ Tiết Kiệm Tương Lai
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-extrabold">
                    +6.5%/năm
                  </span>
                </div>
                <p className="text-[12px] font-medium text-slate-400 mt-0.5">
                  Bảo hiểm & Du lịch gia đình
                </p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Goal Progress Section */}
          <div className="p-3 bg-slate-50/80 rounded-2xl space-y-2 border border-slate-100">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 text-amber-700" />
                Mục tiêu: Du lịch hè Đà Lạt
              </span>
              <span className="font-extrabold text-amber-800">75%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full"
                style={{ width: '75%' }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
              <span>Hiện có: {formatMoney(85000000)} đ</span>
              <span>Mục tiêu: {formatMoney(110000000)} đ</span>
            </div>
          </div>
        </div>

        {/* Wallet Item 3: Ví Cá Nhân - Bố Minh */}
        <div className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#056839] font-extrabold text-xs flex items-center justify-center border border-emerald-200 shadow-sm relative">
              BM
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#056839] text-white flex items-center justify-center text-[9px]">
                🚗
              </div>
            </div>
            <div>
              <h4 className="text-[14.5px] font-extrabold text-slate-900">
                Ví Cá Nhân - Bố Minh
              </h4>
              <p className="text-[12px] font-medium text-slate-400 mt-0.5">
                Xăng xe, ăn trưa & giao tiếp
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[15px] font-extrabold text-slate-900">
              6.200.000 đ
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Hạn mức: 8.0M
            </div>
          </div>
        </div>

        {/* Wallet Item 4: Ví Chi Tiêu - Mẹ Lan */}
        <div className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center border border-indigo-200 shadow-sm relative">
              ML
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center text-[9px]">
                👜
              </div>
            </div>
            <div>
              <h4 className="text-[14.5px] font-extrabold text-slate-900">
                Ví Chi Tiêu - Mẹ Lan
              </h4>
              <p className="text-[12px] font-medium text-slate-400 mt-0.5">
                Mua sắm, chăm sóc cá nhân
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[15px] font-extrabold text-slate-900">
              8.500.000 đ
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Hạn mức: 10.0M
            </div>
          </div>
        </div>

        {/* Wallet Item 5: Heo Đất Bé Bon */}
        <div className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-extrabold text-xs flex items-center justify-center border border-orange-200 shadow-sm relative">
              🐷
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#056839] text-white flex items-center justify-center text-[9px]">
                ⭐
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[14.5px] font-extrabold text-slate-900">
                  Heo Đất Bé Bon
                </h4>
                <span className="text-xs">🐷</span>
              </div>
              <p className="text-[12px] font-medium text-slate-400 mt-0.5">
                Tiền lì xì & thưởng việc ngoan
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[15px] font-extrabold text-slate-900">
              3.950.000 đ
            </div>
            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-[#056839] text-[10px] font-extrabold rounded-full mt-0.5 border border-emerald-200/60">
              +8 sao thưởng
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Add Wallet Button */}
      <div className="pt-2">
        <button
          onClick={onOpenDeposit}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-dashed border-[#056839]/40 text-[#056839] font-extrabold text-[14px] rounded-[22px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
        >
          <div className="w-6 h-6 rounded-full bg-[#056839] text-white flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>Thêm ví mới / Tài khoản ngân hàng</span>
        </button>
      </div>
    </div>
  );
};
