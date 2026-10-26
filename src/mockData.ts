import type { Transaction, HouseholdTask, ExpenseCategory, FamilyMember, Wallet, CategoryBudget, FamilyInvitation } from './types';

// Dữ liệu ứng dụng hiện tại lấy trực tiếp từ MongoDB Atlas, không sử dụng dữ liệu ảo
export const INITIAL_MEMBERS: FamilyMember[] = [];
export const INITIAL_WALLETS: Wallet[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGET_LIMITS: CategoryBudget[] = [];
export const INITIAL_INVITATIONS: FamilyInvitation[] = [];
export const INITIAL_TASKS: HouseholdTask[] = [];
export const MONTHLY_EXPENSES: ExpenseCategory[] = [];
export const WEEKLY_EXPENSES: ExpenseCategory[] = [];
