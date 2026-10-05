export type RoleType = 'OWNER' | 'MEMBER' | 'VIEWER';

export type WalletType = 'Tiền mặt' | 'Ngân hàng' | 'Ví điện tử' | 'Tiết kiệm' | 'Khác' | 'Quỹ chung';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  initialBalance: number;
  ownerId?: string;
  ownerName: string;
  icon?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer' | 'contribution';

export interface Transaction {
  id: string;
  title: string;
  user: string;
  userId?: string;
  time: string;
  date?: string;
  amount: number;
  type: TransactionType;
  category: string;
  iconType?: 'shopping' | 'salary' | 'baby' | 'bills' | 'general' | 'transfer' | 'deposit';
  sourceWalletId?: string;
  sourceWalletName?: string;
  destinationWalletId?: string;
  destinationWalletName?: string;
  note?: string;
}

export interface HouseholdTask {
  id: string;
  title: string;
  time?: string;
  amount?: number;
  assignedTo: string;
  avatarUrl?: string;
  tag: string;
  priority?: boolean;
  completed: boolean;
}

export interface ExpenseCategory {
  name: string;
  percentage: number;
  amount: number;
  color: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  role: RoleType;
  roleLabel: string;
  avatar: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: RoleType;
  roleLabel?: string;
  avatar: string;
  personalBalance: number;
}

export interface FamilyInvitation {
  id: string;
  email: string;
  role: RoleType;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  invitedBy: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limit: number;
}


