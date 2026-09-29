import type { Transaction, HouseholdTask, ExpenseCategory, FamilyMember } from './types';

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Bố Minh',
    role: 'Quản trị viên gia đình',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'm2',
    name: 'Mẹ Lan',
    role: 'Quản lý thu chi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'm3',
    name: 'Bé Bi',
    role: 'Thành viên nhỏ',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    title: 'Bách hóa Xanh',
    user: 'Mẹ Lan',
    time: 'Hôm nay 08:15',
    amount: -450000,
    type: 'expense',
    category: 'Ăn uống',
    iconType: 'shopping',
  },
  {
    id: 't2',
    title: 'Tiền lương tháng 10',
    user: 'Bố Minh',
    time: 'Hôm qua',
    amount: 35000000,
    type: 'income',
    category: 'Thu nhập',
    iconType: 'salary',
  },
  {
    id: 't3',
    title: 'Tiền sữa bột cho con',
    user: 'Ví chung',
    time: '2 ngày trước',
    amount: -820000,
    type: 'expense',
    category: 'Bé yêu',
    iconType: 'baby',
  },
];

export const INITIAL_TASKS: HouseholdTask[] = [
  {
    id: 'task-1',
    title: 'Đi chợ siêu thị cuối tuần',
    time: 'Hôm nay, 17:30',
    assignedTo: 'Bố Minh',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    tag: 'Ưu tiên',
    priority: true,
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Đóng tiền học tiếng Anh cho bé...',
    amount: 2450000,
    assignedTo: 'Mẹ Lan',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    tag: 'Học phí',
    priority: false,
    completed: false,
  },
];

export const MONTHLY_EXPENSES: ExpenseCategory[] = [
  { name: 'Ăn uống gia đình', percentage: 38, amount: 6365000, color: '#056839' },
  { name: 'Giáo dục con cái', percentage: 25, amount: 4187500, color: '#78350F' },
  { name: 'Mua sắm sinh hoạt', percentage: 18, amount: 3015000, color: '#0891B2' },
  { name: 'Giải trí & du lịch', percentage: 12, amount: 2010000, color: '#EA580C' },
  { name: 'Khoản khác', percentage: 7, amount: 1172500, color: '#94A3B8' },
];

export const WEEKLY_EXPENSES: ExpenseCategory[] = [
  { name: 'Ăn uống gia đình', percentage: 45, amount: 1800000, color: '#056839' },
  { name: 'Mua sắm sinh hoạt', percentage: 22, amount: 880000, color: '#0891B2' },
  { name: 'Giải trí & du lịch', percentage: 18, amount: 720000, color: '#EA580C' },
  { name: 'Khoản khác', percentage: 15, amount: 600000, color: '#94A3B8' },
];
