export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'banned';

export interface UserItem {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string;
  joinedAt: string;
  lastActive: string;
  householdsCount: number;
  walletsCount: number;
  totalTransactions: number;
}

export interface HouseholdMemberItem {
  userId: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export interface HouseholdItem {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  membersCount: number;
  walletsCount: number;
  totalFund: number;
  currency: string;
  createdAt: string;
  members: HouseholdMemberItem[];
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface TransactionItem {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  accountName: string;
  householdName?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  status: TransactionStatus;
  isTransfer?: boolean;
}

export type DebtStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface DebtItem {
  id: string;
  title: string;
  creditorName: string; // Người cho vay
  debtorName: string;   // Người vay
  amount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
  status: DebtStatus;
  note: string;
}

export type TaskStatus = 'completed' | 'in_progress' | 'pending' | 'overdue';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedToAvatar: string;
  createdByName: string;
  householdName: string;
  dueDate: string;
  amount: number; // Tiền thưởng việc nhà
  tag: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  completedAt?: string;
}

export interface StatMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
}
