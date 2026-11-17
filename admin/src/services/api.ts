import type { DebtItem, HouseholdItem, TaskItem, TransactionItem, UserItem } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'homeflow_admin_token';

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
}

export interface AdminOverview {
  stats: {
    users: number;
    households: number;
    accounts: number;
    transactions: number;
    monthlyIncome: number;
    monthlyExpense: number;
    debts: number;
    overdueDebts: number;
    tasks: number;
    completedTasks: number;
  };
  monthlyCashFlow: Array<{ month: string; income: number; expense: number }>;
  userGrowth: Array<{ month: string; users: number }>;
}

export interface AdminReport {
  monthlyCashFlow: Array<{ month: string; income: number; expense: number; net: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  categoryExpenses: Array<{ name: string; value: number; color: string }>;
  taskCompletion: Array<{ name: string; value: number; color: string }>;
  summary: { income: number; expense: number; netSavings: number; completedTasks: number; totalTasks: number; rewards: number };
}

export interface AdminSettingsData {
  general?: { systemName?: string; supportEmail?: string; currency?: string; timezone?: string; language?: string };
  security?: { twoFactorAuth?: boolean; sessionTimeout?: string; maxLoginAttempts?: string; ipWhitelist?: string };
  notifications?: { emailAlerts?: boolean; pushNotification?: boolean; unusualTxAlert?: boolean };
}

export interface AdminNotification {
  id: string;
  type: 'user' | 'debt' | 'task';
  title: string;
  description: string;
  createdAt: string;
}

export interface AdminSearchResult {
  id: string;
  label: string;
  detail: string;
  path: string;
}

export const getAdminToken = () => window.localStorage.getItem(TOKEN_KEY);
export const setAdminToken = (token: string) => window.localStorage.setItem(TOKEN_KEY, token);
export const clearAdminToken = () => window.localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAdminToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error(`Không kết nối được API tại ${API_URL}. Hãy kiểm tra server và VITE_API_URL.`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const body = contentType.includes('application/json') ? await response.json() : null;
    if (response.status === 401) {
      clearAdminToken();
      window.dispatchEvent(new Event('homeflow-admin-unauthorized'));
    }
    throw new Error(body?.message || `Yêu cầu thất bại (${response.status}).`);
  }
  if (contentType.includes('application/json')) return response.json() as Promise<T>;
  return response as T;
}

export const adminApi = {
  login: async (email: string, password: string) => {
    const result = await request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAdminToken(result.token);
    try {
      const admin = await request<{ user: AdminUser }>('/admin/me');
      return admin.user;
    } catch (error) {
      clearAdminToken();
      throw error;
    }
  },
  me: () => request<{ success: boolean; user: AdminUser }>('/admin/me'),
  health: () => request<{ status: string }>('/health'),
  overview: () => request<AdminOverview>('/admin/overview'),
  users: () => request<{ users: UserItem[] }>('/admin/users'),
  setUserStatus: (id: string, isBanned: boolean) =>
    request(`/admin/users/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ isBanned }) }),
  updateUser: (id: string, body: object) =>
    request<{ profile: { displayName: string; email: string; phone: string } }>(`/admin/users/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (id: string) => request(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  households: () => request<{ households: HouseholdItem[] }>('/admin/households'),
  updateHousehold: (id: string, body: object) =>
    request(`/admin/households/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteHousehold: (id: string) => request(`/admin/households/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  transactions: () => request<{ transactions: TransactionItem[] }>('/admin/transactions'),
  updateTransaction: (id: string, body: object) =>
    request(`/admin/transactions/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTransaction: (id: string) => request(`/admin/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  debts: () => request<{ debts: DebtItem[] }>('/admin/debts'),
  updateDebt: (id: string, body: object) =>
    request(`/admin/debts/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDebt: (id: string) => request(`/admin/debts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  tasks: () => request<{ tasks: TaskItem[] }>('/admin/tasks'),
  updateTask: (id: string, body: object) =>
    request(`/admin/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (id: string) => request(`/admin/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  reports: (range: string) => request<AdminReport>(`/admin/reports?range=${encodeURIComponent(range)}`),
  settings: () => request<{ settings: AdminSettingsData }>('/admin/settings'),
  saveSettings: (settings: AdminSettingsData) => request<{ settings: AdminSettingsData }>('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  notifications: () => request<{ notifications: AdminNotification[] }>('/admin/notifications'),
  search: (query: string) => request<{ results: AdminSearchResult[] }>(`/admin/search?q=${encodeURIComponent(query)}`),
  downloadBackup: async () => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/admin/backup`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (response.status === 401) {
        clearAdminToken();
        window.dispatchEvent(new Event('homeflow-admin-unauthorized'));
      }
      throw new Error(body?.message || `Không tải được bản sao lưu (${response.status}).`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `homeflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
};

export const formatAdminDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};
