import { Platform } from 'react-native';
import type { Wallet, WalletType, Transaction } from '../types';

export const getBaseApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Khi chạy Android Emulator, sử dụng 10.0.2.2 để kết nối vào localhost của máy host
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  // Môi trường Web và iOS Simulator
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseApiUrl();

export const mapUiWalletTypeToBackend = (type: WalletType): 'cash' | 'bank' | 'e_wallet' | 'savings' | 'other' => {
  switch (type) {
    case 'Tiền mặt': return 'cash';
    case 'Ngân hàng': return 'bank';
    case 'Ví điện tử': return 'e_wallet';
    case 'Tiết kiệm': return 'savings';
    case 'Quỹ chung': return 'bank';
    default: return 'other';
  }
};

export const mapBackendAccountToWallet = (acc: any, ownerName: string = 'Tôi'): Wallet => {
  let uiType: WalletType = 'Khác';
  if (acc.household_id) {
    uiType = 'Quỹ chung';
  } else {
    switch (acc.type) {
      case 'cash': uiType = 'Tiền mặt'; break;
      case 'bank': uiType = 'Ngân hàng'; break;
      case 'e_wallet': uiType = 'Ví điện tử'; break;
      case 'savings': uiType = 'Tiết kiệm'; break;
      default: uiType = 'Khác'; break;
    }
  }

  return {
    id: acc.id,
    name: acc.name,
    type: uiType,
    balance: acc.balance !== undefined ? acc.balance : (acc.initial_balance || 0),
    initialBalance: acc.initial_balance || 0,
    ownerId: acc.owner_user_id || undefined,
    ownerName: acc.household_id ? 'Gia đình' : ownerName,
    active: !acc.is_archived,
    createdAt: acc.created_at ? new Date(acc.created_at).toLocaleDateString('vi-VN') : undefined,
  };
};

export const mapBackendTransactionToUi = (t: any, userName: string = 'Tôi'): Transaction => {
  const isTransfer = Boolean(t.is_transfer);
  let uiType: 'expense' | 'income' | 'transfer' | 'contribution' = t.type === 'expense' ? 'expense' : 'income';
  if (isTransfer) {
    uiType = 'transfer';
  } else if (t.category_name && t.category_name.toLowerCase().includes('đóng góp')) {
    uiType = 'contribution';
  }

  return {
    id: t.id,
    title: t.note || (isTransfer ? 'Chuyển tiền nội bộ' : (t.type === 'expense' ? 'Khoản chi tiêu' : 'Khoản thu nhập')),
    user: t.user_name || (t.user_id ? userName : 'Tôi'),
    userId: t.user_id,
    time: t.transaction_date ? new Date(t.transaction_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
    date: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('vi-VN') : undefined,
    amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount),
    type: uiType,
    category: t.category_name || (isTransfer ? 'Chuyển ví' : (t.type === 'expense' ? 'Chi tiêu' : 'Thu nhập')),
    iconType: isTransfer ? 'transfer' : (t.type === 'expense' ? 'shopping' : 'salary'),
    sourceWalletId: t.account_id,
    sourceWalletName: t.account_name,
    destinationWalletId: t.destination_account_id,
    destinationWalletName: t.destination_account_name,
    note: t.note,
  };
};

export interface TransactionStatistics {
  filter: {
    account_id: string | null;
    household_id: string | null;
    start_date: string | null;
    end_date: string | null;
    group_by: 'day' | 'week' | 'month';
  };
  summary: {
    total_income: number;
    total_expense: number;
    net_income: number;
    transaction_count: number;
  };
  breakdown: Array<{
    period: string;
    income: number;
    expense: number;
    net: number;
    count: number;
  }>;
  by_category: Array<{
    category_id: string | null;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  by_income_category: Array<{
    category_id: string | null;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
    count: number;
    percentage: number;
  }>;
}

class ApiService {
  private token: string | null = null;
  private baseUrl: string = API_BASE_URL;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = window.localStorage.getItem('homeflow_token');
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('homeflow_token', token);
      } else {
        window.localStorage.removeItem('homeflow_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Yêu cầu API thất bại');
    }

    return data;
  }

  // --- 1. AUTH API ---
  auth = {
    register: (payload: { email: string; password: string; display_name: string; avatar_url?: string; phone?: string; timezone?: string }) =>
      this.request<{ success: boolean; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: { email: string; password: string }) =>
      this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getProfile: () => this.request<{ success: boolean; user: any }>('/auth/me'),

    updateProfile: (payload: { display_name?: string; avatar_url?: string | null; phone?: string | null; timezone?: string }) =>
      this.request<{ success: boolean; message: string; user: any }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  };

  // --- 2. VÍ TIỀN (ACCOUNTS) API ---
  accounts = {
    list: (params?: { household_id?: string; include_archived?: boolean }) => {
      const search = new URLSearchParams();
      if (params?.household_id) search.append('household_id', params.household_id);
      if (params?.include_archived) search.append('include_archived', 'true');
      return this.request<{ success: boolean; data: any[] }>(`/accounts?${search.toString()}`);
    },

    getById: (id: string) => this.request<{ success: boolean; data: any }>(`/accounts/${id}`),

    create: (payload: {
      name: string;
      type: 'cash' | 'bank' | 'e_wallet' | 'savings' | 'other';
      initial_balance?: number;
      currency?: string;
      household_id?: string;
    }) =>
      this.request<{ success: boolean; message: string; data: any }>('/accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: Partial<{ name: string; type: string; initial_balance: number; currency: string; is_archived: boolean }>) =>
      this.request<{ success: boolean; message: string; data: any }>(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      this.request<{ success: boolean; message: string }>(`/accounts/${id}`, {
        method: 'DELETE',
      }),
  };

  // --- 3. GIAO DỊCH / THU CHI (TRANSACTIONS) API ---
  transactions = {
    list: (params?: {
      account_id?: string;
      category_id?: string;
      household_id?: string;
      type?: 'income' | 'expense';
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    }) => {
      const search = new URLSearchParams();
      if (params?.account_id) search.append('account_id', params.account_id);
      if (params?.category_id) search.append('category_id', params.category_id);
      if (params?.household_id) search.append('household_id', params.household_id);
      if (params?.type) search.append('type', params.type);
      if (params?.start_date) search.append('start_date', params.start_date);
      if (params?.end_date) search.append('end_date', params.end_date);
      if (params?.page) search.append('page', params.page.toString());
      if (params?.limit) search.append('limit', params.limit.toString());
      return this.request<{ success: boolean; total: number; page: number; totalPages: number; data: any[] }>(
        `/transactions?${search.toString()}`
      );
    },

    getById: (id: string) => this.request<{ success: boolean; data: any }>(`/transactions/${id}`),

    statistics: (params?: {
      account_id?: string;
      household_id?: string;
      start_date?: string;
      end_date?: string;
      group_by?: 'day' | 'week' | 'month';
    }) => {
      const search = new URLSearchParams();
      if (params?.account_id) search.append('account_id', params.account_id);
      if (params?.household_id) search.append('household_id', params.household_id);
      if (params?.start_date) search.append('start_date', params.start_date);
      if (params?.end_date) search.append('end_date', params.end_date);
      if (params?.group_by) search.append('group_by', params.group_by);
      return this.request<{ success: boolean; data: TransactionStatistics }>(
        `/transactions/statistics?${search.toString()}`
      );
    },

    create: (payload: {
      account_id: string;
      category_id?: string;
      amount: number;
      type: 'income' | 'expense';
      note?: string;
      transaction_date?: string;
    }) =>
      this.request<{ success: boolean; message: string; data: any; balance: number }>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: any) =>
      this.request<{ success: boolean; message: string; data: any; balance?: number }>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      this.request<{ success: boolean; message: string; balance?: number }>(`/transactions/${id}`, {
        method: 'DELETE',
      }),

    transfer: (payload: {
      from_account_id: string;
      to_account_id: string;
      amount: number;
      fee?: number;
      note?: string;
      transfer_date?: string;
    }) =>
      this.request<{
        success: boolean;
        message: string;
        data: any;
        balances: {
          from_account_id: string;
          from_balance: number;
          to_account_id: string;
          to_balance: number;
        };
      }>('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  };

  // --- 4. DANH MỤC THU CHI (CATEGORIES) API ---
  categories = {
    list: (params?: { type?: 'income' | 'expense'; household_id?: string }) => {
      const search = new URLSearchParams();
      if (params?.type) search.append('type', params.type);
      if (params?.household_id) search.append('household_id', params.household_id);
      return this.request<{ success: boolean; data: any[] }>(`/categories?${search.toString()}`);
    },

    create: (payload: { name: string; type: 'income' | 'expense'; icon?: string; color?: string; household_id?: string }) =>
      this.request<{ success: boolean; message: string; data: any }>('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  };

  // --- 5. GIA ĐÌNH (HOUSEHOLDS) API ---
  households = {
    list: () => this.request<{ success: boolean; data: any[] }>('/households'),
    create: (payload: { name: string; currency?: string }) =>
      this.request<{ success: boolean; message: string; data: any }>('/households', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getMembers: (householdId: string) =>
      this.request<{ success: boolean; data: any[] }>(`/households/${householdId}/members`),
    inviteMember: (householdId: string, payload: { invited_email: string; role?: 'admin' | 'member' }) =>
      this.request<{ success: boolean; message: string; invite_token: string; data: any }>(
        `/households/${householdId}/invitations`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
  };

  // --- 6. VIỆC NHÀ (TASKS) API (MongoDB Atlas) ---
  tasks = {
    list: () => this.request<{ success: boolean; data: any[] }>('/tasks'),
    create: (payload: {
      title: string;
      time?: string;
      amount?: number;
      assigned_to?: string;
      avatar_url?: string;
      tag?: string;
      priority?: boolean;
    }) =>
      this.request<{ success: boolean; message: string; data: any }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    toggle: (id: string) =>
      this.request<{ success: boolean; message: string; data: any }>(`/tasks/${id}/toggle`, {
        method: 'PUT',
      }),
    delete: (id: string) =>
      this.request<{ success: boolean; message: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  };
}

export const mapBackendTaskToUi = (t: any): import('../types').HouseholdTask => ({
  id: t.id,
  title: t.title,
  time: t.time || '',
  amount: t.amount || 0,
  assignedTo: t.assigned_to || 'Tôi',
  avatarUrl: t.avatar_url || '',
  tag: t.tag || 'Gia đình',
  priority: Boolean(t.priority),
  completed: Boolean(t.completed),
});

export const api = new ApiService();
