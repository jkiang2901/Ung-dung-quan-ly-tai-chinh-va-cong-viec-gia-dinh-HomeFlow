export interface Transaction {
  id: string;
  title: string;
  user: string;
  time: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  iconType: 'shopping' | 'salary' | 'baby' | 'bills' | 'general';
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
  role: string;
  avatar: string;
}
