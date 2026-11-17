import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Header } from './components/Header';
import { Greeting } from './components/Greeting';
import { PersonalWalletCard } from './components/PersonalWalletCard';
import { MonthlySummary } from './components/MonthlySummary';
import { BudgetProgress } from './components/BudgetProgress';
import { QuickActions } from './components/QuickActions';
import { TodayTasks } from './components/TodayTasks';
import { RecentTransactions } from './components/RecentTransactions';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { ActionModal } from './components/modals/ActionModal';
import type { ModalType } from './components/modals/ActionModal';
import { WalletModal } from './components/modals/WalletModal';
import { StatementModal } from './components/modals/StatementModal';
import { BudgetLimitModal } from './components/modals/BudgetLimitModal';
import { InviteMemberModal } from './components/modals/InviteMemberModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { WalletTab } from './components/tabs/WalletTab';
import { StatisticsTab } from './components/tabs/StatisticsTab';
import { TasksTab } from './components/tabs/TasksTab';
import { FamilyTab } from './components/tabs/FamilyTab';
import { DebtsTab } from './components/tabs/DebtsTab';
import { ConfirmInviteModal, type InvitationInfo } from './components/modals/ConfirmInviteModal';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { ThemeProvider } from './context/ThemeContext';
import {
  api,
  mapBackendAccountToWallet,
  mapBackendTransactionToUi,
  mapBackendTaskToUi,
  mapBackendDebtToUi,
  mapUiWalletTypeToBackend,
} from './services/api';
import type {
  Transaction,
  HouseholdTask,
  DebtItem,
  DebtType,
  AuthUser,
  Wallet,
  WalletType,
  FamilyMember,
  CategoryBudget,
  FamilyInvitation,
  RoleType,
  UserPreferences,
} from './types';
import { DEFAULT_USER_PREFERENCES, getRoleLabel } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Không có user mặc định - phải đăng nhập thật qua MongoDB Atlas
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [actionModalType, setActionModalType] = useState<ModalType>(null);
  const [toast, setToast] = useState<string | null>(null);

  // App domain states - khởi tạo rỗng, dữ liệu thật lấy từ MongoDB Atlas
  const members: FamilyMember[] = currentUser
    ? [
        {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          roleLabel: currentUser.roleLabel || getRoleLabel(currentUser.role),
          avatar: currentUser.avatar,
          email: currentUser.email,
        },
      ]
    : [];
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('homeflow_wallets');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      {
        id: 'w-cash-default',
        name: 'Ví tiền mặt',
        type: 'Tiền mặt',
        balance: 0,
        initialBalance: 0,
        ownerName: 'Tôi',
        active: true,
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage && wallets.length > 0) {
      try {
        window.localStorage.setItem('homeflow_wallets', JSON.stringify(wallets));
      } catch {}
    }
  }, [wallets]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<CategoryBudget[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('homeflow_debts');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      {
        id: 'd-1',
        type: 'lend',
        personName: 'Anh Tuấn',
        phoneNumber: '0988123456',
        amount: 3000000,
        paidAmount: 1000000,
        remainingAmount: 2000000,
        startDate: '01/11/2026',
        dueDate: '20/11/2026',
        note: 'Mượn tiền sửa xe máy',
        status: 'partial',
        payments: [],
      },
      {
        id: 'd-2',
        type: 'borrow',
        personName: 'Cô Lan',
        phoneNumber: '0912345678',
        amount: 1500000,
        paidAmount: 0,
        remainingAmount: 1500000,
        startDate: '05/11/2026',
        dueDate: '30/11/2026',
        note: 'Vay mua đồ gia dụng phòng bếp',
        status: 'pending',
        payments: [],
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('homeflow_debts', JSON.stringify(debts));
      } catch {}
    }
  }, [debts]);

  // Additional Modal States
  const [walletModal, setWalletModal] = useState<{
    visible: boolean;
    mode: 'add' | 'edit' | 'delete' | null;
    targetWallet: Wallet | null;
  }>({
    visible: false,
    mode: null,
    targetWallet: null,
  });

  const [statementVisible, setStatementVisible] = useState<boolean>(false);
  const [budgetLimitsVisible, setBudgetLimitsVisible] = useState<boolean>(false);
  const [inviteModalVisible, setInviteModalVisible] = useState<boolean>(false);
  const [editProfileVisible, setEditProfileVisible] = useState<boolean>(false);
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState<boolean>(false);

  // User Personalization Preferences State
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('homeflow_preferences');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return DEFAULT_USER_PREFERENCES;
  });

  const handleUpdatePreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('homeflow_preferences', JSON.stringify(prefs));
      } catch {}
    }
    showToastMessage('✅ Đã lưu cài đặt cá nhân hóa!');
  };

  // Link Invite Confirmation State
  const [pendingInvitation, setPendingInvitation] = useState<InvitationInfo | null>(null);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState<boolean>(false);

  // Quỹ gia đình chung ĐỘC LẬP (Tách riêng khỏi danh sách ví cá nhân)
  const [familyFundBalance, setFamilyFundBalance] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('homeflow_fund_balance');
        if (stored) return Number(stored) || 0;
      } catch {}
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('homeflow_fund_balance', String(familyFundBalance));
      } catch {}
    }
  }, [familyFundBalance]);

  // Derived Values
  const userRole: RoleType = currentUser?.role || 'OWNER';

  // 1. Tổng tiền đóng góp thực tế vào Quỹ chung từ toàn bộ các giao dịch đóng góp (type = 'contribution')
  const totalContributions = transactions
    .filter((t) => t.type === 'contribution')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // Số dư hiển thị của Quỹ gia đình chung ĐỘC LẬP
  const fundBalance = Math.max(familyFundBalance, totalContributions);

  // Số dư ví cá nhân: tính từ tổng số dư các ví cá nhân đang active
  const personalWallets = wallets.filter(
    (w) => w.active && w.type !== 'Quỹ chung' && !w.name.toLowerCase().includes('quỹ') && !w.name.toLowerCase().includes('quy')
  );
  const personalBalance = personalWallets.length > 0
    ? personalWallets.reduce((sum, w) => sum + (w.balance || 0), 0)
    : (currentUser?.personalBalance ?? 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalBudget = budgetLimits.reduce((sum, b) => sum + b.limit, 0);

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Phát hiện và xử lý link mời gia nhập (?invite=TOKEN hoặc ?token=TOKEN)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const searchParams = new URLSearchParams(window.location.search);
      const inviteToken = searchParams.get('invite') || searchParams.get('token');
      if (inviteToken) {
        api.households
          .getInvitationInfo(inviteToken)
          .then((res) => {
            if (res.success && res.data) {
              setPendingInvitation({
                token: inviteToken,
                household_id: res.data.household_id,
                household_name: res.data.household_name,
                currency: res.data.currency,
                members_count: res.data.members_count,
                invited_by_name: res.data.invited_by_name,
                role: res.data.role,
                role_label: res.data.role_label,
                expires_at: res.data.expires_at,
              });
            }
          })
          .catch((err) => {
            console.warn('Lỗi đọc thông tin lời mời:', err);
          });
      }
    }
  }, []);

  // Khôi phục phiên đăng nhập thật nếu đã lưu token trong localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = api.getToken();
      if (!token) return;

      try {
        const res = await api.auth.getProfile();
        if (res.success && res.user) {
          setCurrentUser({
            id: res.user.id,
            name: res.user.display_name,
            email: res.user.email,
            role: 'OWNER',
            roleLabel: 'Chủ Hộ Gia Đình',
            avatar: res.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            personalBalance: 0,
          });
        }
      } catch {
        api.setToken(null);
      }
    };
    restoreSession();
  }, []);

  // Tải dữ liệu thật từ MongoDB Atlas khi người dùng đăng nhập
  const fetchBackendData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // 1. Tải danh sách giao dịch trước để nhận diện chính xác các khoản đóng góp quỹ
      const transactionsRes = await api.transactions.list({ limit: 50 });
      let currentTransactions = transactions;
      if (transactionsRes.success && Array.isArray(transactionsRes.data)) {
        const mappedTx = transactionsRes.data.map((transaction) =>
          mapBackendTransactionToUi(transaction)
        );
        currentTransactions = mappedTx;
        setTransactions(mappedTx);
      }

      // Tính tổng tiền đã đóng góp vào Quỹ chung từ transactions
      const contribTotal = currentTransactions
        .filter((t) => t.type === 'contribution')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      // 2. Tải danh sách ví tiền từ MongoDB (bảng accounts) - CHỈ LẤY CÁC VÍ CÁ NHÂN (Độc lập với Quỹ gia đình)
      const accountsRes = await api.accounts.list();
      if (accountsRes.success && Array.isArray(accountsRes.data)) {
        // Lọc bỏ Quỹ chung khỏi danh sách ví tiền, chỉ giữ ví cá nhân
        const personalMappedWallets = accountsRes.data
          .filter(
            (acc: any) =>
              !acc.household_id &&
              !acc.name?.toLowerCase().includes('quỹ') &&
              !acc.name?.toLowerCase().includes('quy')
          )
          .map((acc: any) => mapBackendAccountToWallet(acc, currentUser.name));

        setWallets(personalMappedWallets);

        // Đồng bộ số dư Quỹ chung độc lập từ backend (nếu có tài khoản Quỹ)
        const fundAcc = accountsRes.data.find(
          (acc: any) =>
            acc.household_id ||
            acc.name?.toLowerCase().includes('quỹ') ||
            acc.name?.toLowerCase().includes('quy')
        );
        if (fundAcc && fundAcc.balance > 0) {
          setFamilyFundBalance((prev) => Math.max(prev, fundAcc.balance));
        }
      }

      // 3. Tải danh sách việc nhà từ MongoDB (bảng tasks)
      const tasksRes = await api.tasks.list();
      if (tasksRes.success && Array.isArray(tasksRes.data)) {
        const mappedTasks = tasksRes.data.map(mapBackendTaskToUi);
        setTasks(mappedTasks);
      }

      // 4. Tải danh sách công nợ từ MongoDB (bảng debts)
      const debtsRes = await api.debts.list();
      if (debtsRes.success && Array.isArray(debtsRes.data)) {
        const mappedDebts = debtsRes.data.map(mapBackendDebtToUi);
        setDebts(mappedDebts);
      }
    } catch (err: any) {
      console.warn('⚠️ Không thể kết nối tới MongoDB Atlas:', err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchBackendData();
    }
  }, [currentUser, fetchBackendData]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    showToastMessage(`Đã đăng nhập thành công: ${user.name}`);
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setWallets([]);
    setTransactions([]);
    setBudgetLimits([]);
    setInvitations([]);
    showToastMessage('Đã đăng xuất khỏi tài khoản');
  };

  // 1. CHỨC NĂNG THÊM VÍ (Lưu vào MongoDB Atlas: collection accounts)
  const handleAddWallet = async (data: {
    name: string;
    type: WalletType;
    initialBalance: number;
    ownerName: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền thêm ví.');
      return;
    }

    try {
      const res = await api.accounts.create({
        name: data.name,
        type: mapUiWalletTypeToBackend(data.type),
        initial_balance: data.initialBalance,
        currency: 'VND',
      });

      if (res.success && res.data) {
        const newW = mapBackendAccountToWallet(res.data, data.ownerName);
        setWallets((prev) => [...prev, newW]);
        showToastMessage(`Đã thêm ví "${data.name}" lên MongoDB Atlas thành công!`);
        return;
      }
    } catch {
      // Fallback local nếu server chưa bật
    }

    const newW: Wallet = {
      id: `w-${Date.now()}`,
      name: data.name,
      type: data.type,
      balance: data.initialBalance,
      initialBalance: data.initialBalance,
      ownerName: data.ownerName,
      active: true,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setWallets((prev) => [...prev, newW]);
    showToastMessage(`Đã thêm ví mới "${data.name}" thành công!`);
  };

  // 2. CHỨC NĂNG SỬA VÍ (Cập nhật MongoDB Atlas)
  const handleEditWallet = async (
    id: string,
    data: { name: string; type: WalletType; ownerName: string }
  ) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền sửa ví.');
      return;
    }

    try {
      await api.accounts.update(id, {
        name: data.name,
        type: mapUiWalletTypeToBackend(data.type),
      });
    } catch {
      // ignore
    }

    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data, updatedAt: new Date().toLocaleDateString('vi-VN') } : w))
    );
    showToastMessage(`Đã cập nhật thông tin ví "${data.name}"`);
  };

  // 3. VÔ HIỆU HÓA VÍ (Lưu trữ is_archived: true trong MongoDB)
  const handleDisableWallet = async (id: string) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền vô hiệu hóa ví.');
      return;
    }

    try {
      await api.accounts.update(id, { is_archived: true });
    } catch {
      // ignore
    }

    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: false } : w))
    );
    const target = wallets.find((w) => w.id === id);
    showToastMessage(`Đã vô hiệu hóa ví "${target?.name || ''}"`);
  };

  // 4. XÓA VÍ
  const handleDeleteWallet = async (id: string) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền xóa ví.');
      return;
    }

    try {
      await api.accounts.delete(id);
    } catch {
      // ignore
    }

    const target = wallets.find((w) => w.id === id);
    setWallets((prev) => prev.filter((w) => w.id !== id));
    showToastMessage(`Đã xóa hoàn toàn ví "${target?.name || ''}"`);
  };

  // 5. CHUYỂN TIỀN NỘI BỘ (Lưu vào MongoDB Atlas)
  const handleTransfer = async (data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    note?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền chuyển tiền.');
      return;
    }

    const sourceW = wallets.find((w) => w.id === data.fromWalletId);
    const destW = wallets.find((w) => w.id === data.toWalletId);

    if (!sourceW || !destW) {
      showToastMessage('Ví không hợp lệ.');
      return;
    }

    if (sourceW.balance < data.amount) {
      showToastMessage(`Số dư ví "${sourceW.name}" không đủ.`);
      return;
    }

    try {
      const res = await api.transactions.transfer({
        from_account_id: sourceW.id,
        to_account_id: destW.id,
        amount: data.amount,
        note: data.note,
      });

      if (res.success) {
        const fromBal = res.balances?.from_balance !== undefined ? res.balances.from_balance : sourceW.balance - data.amount;
        const toBal = res.balances?.to_balance !== undefined ? res.balances.to_balance : destW.balance + data.amount;
        setWallets((prev) =>
          prev.map((w) => {
            if (w.id === sourceW.id) return { ...w, balance: fromBal };
            if (w.id === destW.id) return { ...w, balance: toBal };
            return w;
          })
        );
        await fetchBackendData();
        showToastMessage(`✅ Đã chuyển ${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} đến ${destW.name}`);
        return;
      }
    } catch (err: any) {
      console.warn('Lỗi chuyển tiền backend, chuyển local:', err);
    }

    // Fallback cập nhật local
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === sourceW.id) return { ...w, balance: w.balance - data.amount };
        if (w.id === destW.id) return { ...w, balance: w.balance + data.amount };
        return w;
      })
    );

    const isDestFund = destW.type === 'Quỹ chung' || destW.id === 'w-fund' || destW.name.toLowerCase().includes('quỹ');
    const localTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: data.note || (isDestFund ? `Góp quỹ gia đình` : `Chuyển ví: ${sourceW.name} ➔ ${destW.name}`),
      user: currentUser?.name || 'Tôi',
      time: 'Vừa xong',
      amount: data.amount,
      type: isDestFund ? 'contribution' : 'transfer',
      category: isDestFund ? 'Đóng góp quỹ' : 'Chuyển ví',
      iconType: 'transfer',
      sourceWalletId: sourceW.id,
      sourceWalletName: sourceW.name,
      destinationWalletId: destW.id,
      destinationWalletName: destW.name,
    };
    setTransactions((prev) => [localTx, ...prev]);

    showToastMessage(`✅ Đã chuyển ${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} đến ${destW.name}`);
  };

  // 6. NẠP QUỸ CHUNG (Lưu vào MongoDB Atlas - Quỹ chung ĐỘC LẬP)
  const handleDeposit = async (data: {
    amount: number;
    user: string;
    note: string;
    sourceWalletId?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền nạp quỹ.');
      return;
    }

    // 1. Xác định chính xác ví nguồn cá nhân trích nộp
    const sourceW =
      wallets.find((w) => w.id === data.sourceWalletId) ||
      wallets[0];

    if (!sourceW) {
      showToastMessage('Vui lòng chọn nguồn tiền nạp quỹ.');
      return;
    }

    if (sourceW.balance < data.amount) {
      showToastMessage(`Số dư ví "${sourceW.name}" không đủ để nạp quỹ.`);
      return;
    }

    // 2. Cập nhật số dư: Trừ tiền ví cá nhân, Quỹ gia đình tăng độc lập
    const newSourceBal = sourceW.balance - data.amount;
    const newFundBalance = familyFundBalance + data.amount;
    setWallets((prev) =>
      prev.map((w) => (w.id === sourceW.id ? { ...w, balance: newSourceBal } : w))
    );
    setFamilyFundBalance(newFundBalance);

    const depositTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: data.note || 'Nộp quỹ gia đình',
      user: data.user || currentUser?.name || 'Tôi',
      time: 'Vừa xong',
      amount: data.amount,
      type: 'contribution',
      category: 'Đóng góp quỹ',
      iconType: 'transfer',
      sourceWalletId: sourceW.id,
      sourceWalletName: sourceW.name,
    };
    setTransactions((prev) => [depositTx, ...prev]);

    try {
      // Tìm tài khoản Quỹ chung trên backend (nếu có) để tạo giao dịch transfer/income
      const accountsRes = await api.accounts.list();
      const backendFundAcc = accountsRes.data?.find(
        (a: any) =>
          a.household_id ||
          a.name?.toLowerCase().includes('quỹ') ||
          a.name?.toLowerCase().includes('quy')
      );

      if (backendFundAcc && backendFundAcc.id !== sourceW.id) {
        await api.transactions.transfer({
          from_account_id: sourceW.id,
          to_account_id: backendFundAcc.id,
          amount: data.amount,
          note: data.note || 'Nạp quỹ chung gia đình',
        });
      } else {
        await api.transactions.create({
          account_id: sourceW.id,
          amount: data.amount,
          type: 'expense',
          note: `Nộp quỹ gia đình: ${data.note || ''}`,
        });
      }

      // KHÔNG gọi fetchBackendData() ở đây vì backend chưa kịp tính balance mới
      // => số dư Quỹ đã được cập nhật local ở trên (newFundBalance), sẽ persist vào localStorage
      // Chỉ sync transactions để hiển thị lịch sử đúng
      const latestTx = await api.transactions.list({ limit: 50 });
      if (latestTx.success && Array.isArray(latestTx.data)) {
        const mappedTx = latestTx.data.map((t: any) => mapBackendTransactionToUi(t));
        setTransactions(mappedTx);
      }
      // Đảm bảo số dư Quỹ không bị ghi đè
      setFamilyFundBalance((prev) => Math.max(prev, newFundBalance));
      showToastMessage(`✅ Đã nộp +${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} vào Quỹ chung`);
      return;
    } catch (err: any) {
      console.warn('Lỗi nạp quỹ backend, giữ số dư local đã cập nhật:', err);
      showToastMessage(`✅ Đã nộp +${data.amount.toLocaleString('vi-VN')} đ vào Quỹ chung`);
    }
  };

  // 7. THÊM KHOẢN CHI TIÊU (Lưu vào MongoDB Atlas)
  const handleAddExpense = async (data: {
    title: string;
    amount: number;
    category: string;
    user: string;
    sourceWalletId?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền tạo chi tiêu.');
      return;
    }

    const targetWallet = wallets.find((w) => w.id === data.sourceWalletId) || wallets[0];
    if (!targetWallet) {
      showToastMessage('Vui lòng tạo hoặc chọn ví tiền trước khi chi tiêu.');
      return;
    }

    if (targetWallet && targetWallet.balance < data.amount) {
      showToastMessage(`Cảnh báo: Số dư ví "${targetWallet.name}" đang bị âm/thiếu.`);
    }

    try {
      const res = await api.transactions.create({
        account_id: targetWallet.id,
        amount: data.amount,
        type: 'expense',
        note: data.title,
      });

      if (res.success && res.data) {
        const newTx = mapBackendTransactionToUi(res.data);
        newTx.category = data.category;
        newTx.user = data.user;
        newTx.sourceWalletName = targetWallet.name;
        setTransactions((prev) => [newTx, ...prev]);

        const newBalance = res.balance !== undefined ? res.balance : targetWallet.balance - data.amount;
        setWallets((prev) =>
          prev.map((w) => (w.id === targetWallet.id ? { ...w, balance: newBalance } : w))
        );

        showToastMessage(`✅ Đã lưu chi tiêu -${data.amount.toLocaleString('vi-VN')} đ lên MongoDB Atlas!`);
      } else {
        showToastMessage(`⚠️ Lỗi: ${res.message || 'Không thể tạo chi tiêu'}`);
      }
    } catch (err: any) {
      console.warn('Lỗi lưu giao dịch MongoDB:', err);
      showToastMessage(`⚠️ Lỗi lưu MongoDB: ${err.message || 'Không thể tạo giao dịch'}`);
    }
  };

  // 8. THÊM KHOẢN THU NHẬP (Lưu vào MongoDB Atlas)
  const handleAddIncome = async (data: {
    title: string;
    amount: number;
    category: string;
    user: string;
    destinationWalletId?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền ghi thu nhập.');
      return;
    }

    const targetWallet =
      wallets.find((w) => w.id === data.destinationWalletId) ||
      wallets[0];

    if (!targetWallet) {
      showToastMessage('Vui lòng tạo hoặc chọn ví tiền để nhận thu nhập.');
      return;
    }

    try {
      const res = await api.transactions.create({
        account_id: targetWallet.id,
        amount: data.amount,
        type: 'income',
        note: data.title,
      });

      if (res.success && res.data) {
        const newTx = mapBackendTransactionToUi(res.data);
        newTx.category = data.category || 'Thu nhập';
        newTx.user = data.user || currentUser?.name || 'Tôi';
        newTx.sourceWalletName = targetWallet.name;
        setTransactions((prev) => [newTx, ...prev]);

        const newBalance = res.balance !== undefined ? res.balance : targetWallet.balance + data.amount;
        setWallets((prev) =>
          prev.map((w) => (w.id === targetWallet.id ? { ...w, balance: newBalance } : w))
        );

        showToastMessage(`✅ Đã lưu khoản thu +${data.amount.toLocaleString('vi-VN')} đ lên MongoDB Atlas!`);
        return;
      } else {
        showToastMessage(`⚠️ Lỗi: ${res.message || 'Không thể tạo thu nhập'}`);
      }
    } catch (err: any) {
      console.warn('Lỗi lưu thu nhập MongoDB, lưu local:', err);
    }

    // Local fallback
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: data.title || 'Khoản thu nhập',
      user: data.user || currentUser?.name || 'Tôi',
      time: 'Vừa xong',
      amount: data.amount,
      type: 'income',
      category: data.category || 'Thu nhập',
      iconType: 'salary',
      sourceWalletId: targetWallet.id,
      sourceWalletName: targetWallet.name,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setWallets((prev) =>
      prev.map((w) => (w.id === targetWallet.id ? { ...w, balance: w.balance + data.amount } : w))
    );
    showToastMessage(`✅ Đã thêm khoản thu +${data.amount.toLocaleString('vi-VN')} đ vào ví "${targetWallet.name}"!`);
  };

  // 9. XÓA GIAO DỊCH (Xóa khỏi MongoDB Atlas và cập nhật lại số dư ví)
  const handleDeleteTransaction = async (id: string) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền xóa giao dịch.');
      return;
    }

    try {
      const res = await api.transactions.delete(id);
      if (res.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        await fetchBackendData();
        showToastMessage('✅ Đã xóa giao dịch khỏi MongoDB Atlas thành công!');
      } else {
        showToastMessage(`⚠️ Không thể xóa: ${res.message || 'Lỗi server'}`);
      }
    } catch (err: any) {
      showToastMessage(`⚠️ Lỗi xóa giao dịch: ${err.message || 'Không thể xóa'}`);
    }
  };

  // 8. CẬP NHẬT HẠN MỨC
  const handleUpdateLimit = (category: string, newLimit: number) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản Trẻ Em không có quyền cài đặt hạn mức.');
      return;
    }

    setBudgetLimits((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
    showToastMessage(`Đã cập nhật hạn mức danh mục "${category}" thành ${newLimit.toLocaleString('vi-VN')} đ`);
  };

  // 9. MỜI NGƯỜI THÂN
  const handleSendInvitation = (email: string, role: RoleType) => {
    if (userRole !== 'OWNER') {
      showToastMessage('⚠️ Chỉ Chủ Hộ Gia Đình mới có quyền gửi lời mời.');
      return;
    }

    const newInv: FamilyInvitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      invitedBy: currentUser?.name || 'Chủ hộ',
    };

    setInvitations((prev) => [newInv, ...prev]);
    showToastMessage(`Đã gửi lời mời tới ${email}`);
  };

  const handleCancelInvitation = (id: string) => {
    if (userRole !== 'OWNER') return;
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    showToastMessage('Đã hủy lời mời.');
  };

  // 10. XÁC NHẬN HOẶC TỪ CHỐI LỜI MỜI GIA NHẬP GIA ĐÌNH QUA LINK
  const handleConfirmJoinHousehold = async () => {
    if (!pendingInvitation) return;

    if (!currentUser) {
      showToastMessage('Vui lòng đăng nhập để hoàn tất việc tham gia gia đình.');
      return;
    }

    setIsAcceptingInvite(true);
    try {
      const res = await api.households.acceptInvitation(pendingInvitation.token);
      if (res.success) {
        showToastMessage(`🎉 Bạn đã tham gia gia đình "${pendingInvitation.household_name}" thành công!`);
        if (typeof window !== 'undefined' && window.history && window.location) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setPendingInvitation(null);
        fetchBackendData();
      } else {
        showToastMessage(`⚠️ ${res.message || 'Không thể chấp nhận lời mời'}`);
      }
    } catch (err: any) {
      showToastMessage(`⚠️ Lỗi: ${err.message || 'Không thể chấp nhận lời mời'}`);
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  const handleRejectInvitation = () => {
    if (typeof window !== 'undefined' && window.history && window.location) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setPendingInvitation(null);
    showToastMessage('Đã từ chối lời mời gia nhập gia đình.');
  };

  const handleToggleTask = async (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    try {
      await api.tasks.toggle(id);
    } catch (err: any) {
      console.warn('Lỗi cập nhật việc nhà trên MongoDB:', err);
    }
  };

  const handleAddTask = async (newTask: HouseholdTask) => {
    try {
      const res = await api.tasks.create({
        title: newTask.title,
        time: newTask.time,
        amount: newTask.amount,
        assigned_to: newTask.assignedTo,
        avatar_url: newTask.avatarUrl,
        tag: newTask.tag,
        priority: newTask.priority,
      });

      if (res.success && res.data) {
        const saved = mapBackendTaskToUi(res.data);
        setTasks((prev) => [saved, ...prev]);
        showToastMessage(`✅ Đã lưu việc nhà "${newTask.title}" lên MongoDB Atlas!`);
        return;
      }
    } catch (err: any) {
      console.warn('Lỗi lưu việc nhà lên MongoDB Atlas:', err);
      showToastMessage(`⚠️ Lỗi lưu việc nhà: ${err.message || 'Không thể tạo việc nhà'}`);
    }

    setTasks((prev) => [newTask, ...prev]);
  };

  // 11. CHỨC NĂNG CÔNG NỢ (Lưu vào MongoDB Atlas hoặc Local)
  const handleAddDebt = async (data: {
    type: DebtType;
    personName: string;
    phoneNumber?: string;
    amount: number;
    startDate?: string;
    dueDate?: string;
    note?: string;
    walletId?: string;
    affectWallet?: boolean;
  }) => {
    try {
      const res = await api.debts.create({
        type: data.type,
        person_name: data.personName,
        phone_number: data.phoneNumber,
        amount: data.amount,
        start_date: data.startDate,
        due_date: data.dueDate,
        note: data.note,
        wallet_id: data.walletId,
        affect_wallet: data.affectWallet,
      });

      if (res.success && res.data) {
        const saved = mapBackendDebtToUi(res.data);
        setDebts((prev) => [saved, ...prev]);
        if (data.affectWallet && data.walletId) {
          await fetchBackendData();
        }
        showToastMessage(
          `✅ Đã lưu khoản ${data.type === 'lend' ? 'cho vay' : 'đi vay'} ${data.amount.toLocaleString('vi-VN')} đ!`
        );
        return;
      }
    } catch (err: any) {
      console.warn('Lỗi lưu công nợ backend, lưu local:', err);
    }

    // Local fallback
    const targetWallet = wallets.find((w) => w.id === data.walletId);
    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      type: data.type,
      personName: data.personName,
      phoneNumber: data.phoneNumber,
      amount: data.amount,
      paidAmount: 0,
      remainingAmount: data.amount,
      startDate: new Date().toLocaleDateString('vi-VN'),
      dueDate: data.dueDate,
      note: data.note,
      status: 'pending',
      walletId: data.walletId,
      walletName: targetWallet?.name,
      payments: [],
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setDebts((prev) => [newDebt, ...prev]);

    if (data.affectWallet && targetWallet) {
      const balanceChange = data.type === 'lend' ? -data.amount : data.amount;
      setWallets((prev) =>
        prev.map((w) => (w.id === targetWallet.id ? { ...w, balance: w.balance + balanceChange } : w))
      );
    }

    showToastMessage(
      `✅ Đã tạo khoản nợ: ${data.personName} (${data.amount.toLocaleString('vi-VN')} đ)`
    );
  };

  const handlePayDebt = async (data: {
    debtId: string;
    amount: number;
    note?: string;
    walletId?: string;
    affectWallet?: boolean;
  }) => {
    try {
      const res = await api.debts.pay(data.debtId, {
        amount: data.amount,
        note: data.note,
        wallet_id: data.walletId,
        affect_wallet: data.affectWallet,
      });

      if (res.success && res.data) {
        const updated = mapBackendDebtToUi(res.data);
        setDebts((prev) => prev.map((d) => (d.id === data.debtId ? updated : d)));
        if (data.affectWallet && data.walletId) {
          await fetchBackendData();
        }
        showToastMessage(`✅ Đã ghi nhận thanh toán ${data.amount.toLocaleString('vi-VN')} đ!`);
        return;
      }
    } catch (err: any) {
      console.warn('Lỗi thanh toán công nợ backend, lưu local:', err);
    }

    // Local fallback
    const targetWallet = wallets.find((w) => w.id === data.walletId);
    const targetDebt = debts.find((d) => d.id === data.debtId);

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== data.debtId) return d;
        const newPaid = d.paidAmount + data.amount;
        const newRemaining = Math.max(0, d.amount - newPaid);
        const newStatus = newRemaining === 0 ? 'completed' : 'partial';
        return {
          ...d,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
        };
      })
    );

    if (data.affectWallet && targetWallet && targetDebt) {
      const balanceChange = targetDebt.type === 'lend' ? data.amount : -data.amount;
      setWallets((prev) =>
        prev.map((w) => (w.id === targetWallet.id ? { ...w, balance: w.balance + balanceChange } : w))
      );
    }

    showToastMessage(`✅ Đã thanh toán ${data.amount.toLocaleString('vi-VN')} đ`);
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      const res = await api.debts.delete(id);
      if (res.success) {
        setDebts((prev) => prev.filter((d) => d.id !== id));
        showToastMessage('✅ Đã xóa khoản công nợ thành công!');
        return;
      }
    } catch (err: any) {
      console.warn('Lỗi xóa công nợ backend, xóa local:', err);
    }

    setDebts((prev) => prev.filter((d) => d.id !== id));
    showToastMessage('✅ Đã xóa khoản công nợ');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollBody}>
            <Greeting userName={currentUser?.name || 'bạn'} />
            <PersonalWalletCard
              userName={currentUser?.name || 'Cá nhân'}
              balance={personalBalance}
              familyFundBalance={fundBalance}
              initialHideBalance={userPreferences.hideBalanceDefault}
              onGoToFamilyFund={() => setActiveTab('wallet')}
              onDepositToFund={() => setActionModalType('deposit')}
              onAddIncome={() => setActionModalType('income')}
            />
            <MonthlySummary totalIncome={totalIncome} totalExpense={totalExpense} />
            <BudgetProgress spent={totalExpense} totalBudget={totalBudget} />
            <QuickActions
              onAddIncome={() => setActionModalType('income')}
              onDeposit={() => setActionModalType('deposit')}
              onAddExpense={() => setActionModalType('expense')}
              onTransfer={() => setActionModalType('transfer')}
              onScanQR={() => setActionModalType('qr')}
            />
            <TodayTasks
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onViewAll={() => setActiveTab('tasks')}
            />
            <RecentTransactions
              transactions={transactions}
              onViewHistory={() => setStatementVisible(true)}
            />
          </ScrollView>
        );

      case 'wallet':
        return (
          <WalletTab
            fundBalance={fundBalance}
            wallets={wallets}
            transactions={transactions}
            members={members}
            userRole={userRole}
            initialHideBalance={userPreferences.hideBalanceDefault}
            onOpenDeposit={() => setActionModalType('deposit')}
            onOpenTransfer={() => setActionModalType('transfer')}
            onOpenAddWallet={() =>
              setWalletModal({ visible: true, mode: 'add', targetWallet: null })
            }
            onOpenEditWallet={(w) =>
              setWalletModal({ visible: true, mode: 'edit', targetWallet: w })
            }
            onOpenDeleteWallet={(w) =>
              setWalletModal({ visible: true, mode: 'delete', targetWallet: w })
            }
            onOpenStatement={() => setStatementVisible(true)}
            onOpenBudgetLimits={() => setBudgetLimitsVisible(true)}
          />
        );

      case 'debts':
        return (
          <DebtsTab
            debts={debts}
            wallets={wallets}
            onAddDebt={handleAddDebt}
            onPayDebt={handlePayDebt}
            onDeleteDebt={handleDeleteDebt}
            onShowToast={showToastMessage}
          />
        );

      case 'statistics':
        return <StatisticsTab />;

      case 'tasks':
        const filteredTasks = userPreferences.taskFilterMyOnly
          ? tasks.filter(
              (t) =>
                (t.assignedTo || '').toLowerCase() === (currentUser?.name || '').toLowerCase()
            )
          : tasks;
        return (
          <TasksTab
            tasks={filteredTasks}
            members={members}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            showCreateModal={createTaskModalVisible}
            onCloseCreateModal={() => setCreateTaskModalVisible(false)}
          />
        );

      case 'family':
        return (
          <FamilyTab
            members={members}
            userRole={userRole}
            onOpenInviteModal={() => setInviteModalVisible(true)}
          />
        );

      default:
        return <StatisticsTab />;
    }
  };

  const handleBottomNavAdd = () => {
    if (activeTab === 'tasks') {
      setCreateTaskModalVisible(true);
    } else if (activeTab === 'family') {
      setInviteModalVisible(true);
    } else {
      setActionModalType('quick_add');
    }
  };

  return (
    <ThemeProvider themeColor={userPreferences.themeColor}>
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar style="dark" />
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} autoHideDuration={2200} />
      )}

      {showSplash ? null : !currentUser ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <View style={styles.innerContainer}>
          <Header
            members={members}
            currentUser={currentUser}
            subtitle={
              activeTab === 'home'
                ? 'Trang Chủ'
                : activeTab === 'tasks'
                ? 'Công Việc'
                : activeTab === 'wallet'
                ? 'Ví Tiền & Quỹ Chung'
                : activeTab === 'debts'
                ? 'Sổ Công Nợ'
                : activeTab === 'statistics'
                ? 'Thống Kê'
                : 'Gia Đình'
            }
            onLogoClick={() => setShowSplash(true)}
            onOpenNotifications={() => showToastMessage('Bạn không có thông báo mới!')}
            onLogout={handleLogout}
            onOpenFamily={() => setActiveTab('family')}
            onOpenProfile={() => setEditProfileVisible(true)}
          />

          {renderActiveTabContent()}

          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenQuickAdd={handleBottomNavAdd}
          />

          {/* Modal Action Suite */}
          <ActionModal
            type={actionModalType}
            wallets={wallets}
            userRole={userRole}
            defaultWalletId={userPreferences.defaultWalletId}
            onClose={() => setActionModalType(null)}
            onSubmitExpense={handleAddExpense}
            onSubmitIncome={handleAddIncome}
            onSubmitDeposit={handleDeposit}
            onSubmitTransfer={handleTransfer}
            onNavigateTab={setActiveTab}
          />

          <WalletModal
            visible={walletModal.visible}
            mode={walletModal.mode}
            wallet={walletModal.targetWallet}
            wallets={wallets}
            userRole={userRole}
            members={members}
            hasTransactions={
              walletModal.targetWallet
                ? transactions.some(
                    (t) =>
                      t.sourceWalletId === walletModal.targetWallet?.id ||
                      t.destinationWalletId === walletModal.targetWallet?.id
                  )
                : false
            }
            onClose={() => setWalletModal({ visible: false, mode: null, targetWallet: null })}
            onAddWallet={handleAddWallet}
            onEditWallet={handleEditWallet}
            onDisableWallet={handleDisableWallet}
            onDeleteWallet={handleDeleteWallet}
          />

          <StatementModal
            visible={statementVisible}
            transactions={transactions}
            onClose={() => setStatementVisible(false)}
            onDeleteTransaction={handleDeleteTransaction}
          />

          <BudgetLimitModal
            visible={budgetLimitsVisible}
            budgets={budgetLimits}
            transactions={transactions}
            userRole={userRole}
            onClose={() => setBudgetLimitsVisible(false)}
            onUpdateLimit={handleUpdateLimit}
          />

          <InviteMemberModal
            visible={inviteModalVisible}
            currentUserEmail={currentUser.email}
            userRole={userRole}
            members={members}
            invitations={invitations}
            onClose={() => setInviteModalVisible(false)}
            onSendInvitation={handleSendInvitation}
            onCancelInvitation={handleCancelInvitation}
          />

          <EditProfileModal
            visible={editProfileVisible}
            currentUser={currentUser}
            wallets={wallets}
            preferences={userPreferences}
            onClose={() => setEditProfileVisible(false)}
            onProfileUpdated={(updatedUser) => {
              setCurrentUser(updatedUser);
              showToastMessage('✅ Đã cập nhật thông tin cá nhân!');
            }}
            onPreferencesUpdated={handleUpdatePreferences}
          />
        </View>
      )}

      <ConfirmInviteModal
        visible={!!pendingInvitation}
        loading={isAcceptingInvite}
        invitationInfo={pendingInvitation}
        onConfirm={handleConfirmJoinHousehold}
        onReject={handleRejectInvitation}
      />

      {toast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  scrollContent: {
    flex: 1,
  },
  scrollBody: {
    paddingBottom: 20,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default App;
