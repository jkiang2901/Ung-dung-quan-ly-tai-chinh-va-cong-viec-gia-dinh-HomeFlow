import React from 'react';
import type { FamilyMember } from '../../types';
import { UserPlus, ShieldCheck, Heart } from 'lucide-react';

interface FamilyTabProps {
  members: FamilyMember[];
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ members }) => {
  return (
    <div className="p-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Thành Viên Gia Đình</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Tổ ấm: Gia đình Hạnh Phúc (3 người)
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#056839] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#04522d]">
          <UserPlus className="w-4 h-4" />
          Mời người thân
        </button>
      </div>

      {/* Family Banner Card */}
      <div className="p-5 rounded-[24px] bg-gradient-to-r from-emerald-600 via-teal-700 to-[#056839] text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Heart className="w-6 h-6 text-rose-300 fill-rose-300" />
          </div>
          <div>
            <h3 className="text-base font-extrabold">Gia Đình Hạnh Phúc</h3>
            <p className="text-xs font-medium text-emerald-100">
              Đồng hành tài chính & sẻ chia việc nhà mỗi ngày
            </p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Danh sách thành viên
        </h3>
        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-4 bg-white rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-slate-100"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{m.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#056839]" />
                    {m.role}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-[#056839] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Đã đồng bộ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Roles Info */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-2 text-slate-600">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#056839]" /> Quyền hạn & Phân quyền
        </div>
        <p>• Quản trị viên (Bố Minh): Có quyền duyệt ngân sách & điều chuyển tiền từ Quỹ chung.</p>
        <p>• Quản lý thu chi (Mẹ Lan): Thêm thu chi, quản lý việc nhà & duyệt thanh toán hoá đơn.</p>
      </div>
    </div>
  );
};
