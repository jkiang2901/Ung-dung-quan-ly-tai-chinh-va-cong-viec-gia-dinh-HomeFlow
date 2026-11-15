import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'user' | 'role' | 'transaction' | 'debt' | 'task';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'user' }) => {
  // 1. User status badge
  if (type === 'user') {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Hoạt động
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Chờ kích hoạt
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Đã khóa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  }

  // 2. Role badge
  if (type === 'role') {
    switch (status) {
      case 'OWNER':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            Chủ Hộ
          </span>
        );
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
            Quản trị
          </span>
        );
      case 'MEMBER':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            Thành viên
          </span>
        );
      case 'VIEWER':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
            Trẻ Em
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  }

  // 3. Transaction badge
  if (type === 'transaction') {
    switch (status) {
      case 'income':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            + Thu nhập
          </span>
        );
      case 'expense':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            - Chi tiêu
          </span>
        );
      case 'transfer':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            ⇄ Chuyển ví
          </span>
        );
    }
  }

  // 4. Debt status badge
  if (type === 'debt') {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã thanh toán
          </span>
        );
      case 'partial':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Trả một phần
          </span>
        );
      case 'unpaid':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Chưa thanh toán
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Quá hạn
          </span>
        );
    }
  }

  // 5. Task status badge
  if (type === 'task') {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Hoàn thành
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            ⏳ Đang làm
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Chờ thực hiện
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Quá hạn
          </span>
        );
    }
  }

  return <span className="text-xs text-slate-600">{status}</span>;
};

