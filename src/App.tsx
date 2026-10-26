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
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import {
  api,
  mapBackendAccountToWallet,
  mapBackendTransactionToUi,
  mapBackendTaskToUi,
  mapUiWalletTypeToBackend,
} from './services/api';
import type {
  Transaction,
  HouseholdTask,
  AuthUser,
  Wallet,
  WalletType,
  CategoryBudget,
  FamilyInvitation,
  RoleType,
} from './types';

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
          roleLabel: currentUser.roleLabel,
          avatar: currentUser.avatar,
          email: currentUser.email,
          phone: currentUser.phone,
        },
      ]
    : [];
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<CategoryBudget[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);

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

  // Derived Values
  const userRole: RoleType = currentUser?.role || 'OWNER';
  const fundWallet = wallets.find((w) => w.id === 'w-fund');
  const fundBalance = fundWallet ? fundWallet.balance : 0;

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
      // 1. Tải danh sách ví tiền từ MongoDB (bảng accounts)
      const accountsRes = await api.accounts.list();
      if (accountsRes.success && Array.isArray(accountsRes.data)) {
        const mappedWallets = accountsRes.data.map((acc: any) =>
          mapBackendAccountToWallet(acc, currentUser.name)
        );
        setWallets(mappedWallets);
      }

      // 2. Tải danh sách giao dịch từ MongoDB (bảng transactions)
      const transactionsRes = await api.transactions.list({ limit: 50 });
      if (transactionsRes.success && Array.isArray(transactionsRes.data)) {
        const mappedTx = transactionsRes.data.map(mapBackendTransactionToUi);
        setTransactions(mappedTx);
      }

      // 3. Tải danh sách việc nhà từ MongoDB (bảng tasks)
      const tasksRes = await api.tasks.list();
      if (tasksRes.success && Array.isArray(tasksRes.data)) {
        const mappedTasks = tasksRes.data.map(mapBackendTaskToUi);
        setTasks(mappedTasks);
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
        await fetchBackendData();
        showToastMessage(`✅ Đã chuyển ${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} đến ${destW.name}`);
        return;
      }
    } catch (err: any) {
      showToastMessage(`⚠️ Lỗi chuyển tiền: ${err.message || 'Thất bại'}`);
    }
  };

  // 6. NẠP QUỸ CHUNG (Lưu vào MongoDB Atlas)
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

    const sourceW = wallets.find((w) => w.id === data.sourceWalletId) || wallets.find((w) => w.type === 'Ngân hàng') || wallets[0];
    if (!sourceW) {
      showToastMessage('Vui lòng chọn nguồn tiền nạp quỹ.');
      return;
    }

    if (sourceW.balance < data.amount) {
      showToastMessage(`Số dư ví "${sourceW.name}" không đủ để nạp quỹ.`);
      return;
    }

    try {
      if (fundWallet && fundWallet.id !== sourceW.id) {
        await api.transactions.transfer({
          from_account_id: sourceW.id,
          to_account_id: fundWallet.id,
          amount: data.amount,
          note: data.note || 'Nạp quỹ chung gia đình',
        });
      } else {
        await api.transactions.create({
          account_id: sourceW.id,
          amount: data.amount,
          type: 'expense',
          note: `Nạp quỹ chung: ${data.note || 'Đóng góp gia đình'}`,
        });
      }

      await fetchBackendData();
      showToastMessage(`✅ Đã nộp +${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} vào Quỹ chung`);
    } catch (err: any) {
      showToastMessage(`⚠️ Lỗi nạp quỹ: ${err.message || 'Không thể nạp quỹ'}`);
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

    const targetWallet = wallets.find((w) => w.id === data.sourceWalletId) || fundWallet || wallets[0];
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

    const targetWallet = wallets.find((w) => w.id === data.destinationWalletId) || fundWallet || wallets[0];
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
      } else {
        showToastMessage(`⚠️ Lỗi: ${res.message || 'Không thể tạo thu nhập'}`);
      }
    } catch (err: any) {
      console.warn('Lỗi lưu thu nhập MongoDB:', err);
      showToastMessage(`⚠️ Lỗi lưu MongoDB: ${err.message || 'Không thể tạo thu nhập'}`);
    }
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

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollBody}>
            <Greeting userName={currentUser?.name || 'bạn'} />
            <PersonalWalletCard
              userName={currentUser?.name || 'Cá nhân'}
              balance={currentUser?.personalBalance ?? 0}
              familyFundBalance={fundBalance}
              onGoToFamilyFund={() => setActiveTab('wallet')}
              onDepositToFund={() => setActionModalType('deposit')}
            />
            <MonthlySummary totalIncome={totalIncome} totalExpense={totalExpense} />
            <BudgetProgress spent={totalExpense} totalBudget={totalBudget} />
            <QuickActions
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

      case 'statistics':
        return <StatisticsTab />;

      case 'tasks':
        return (
          <TasksTab
            tasks={tasks}
            members={members}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
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

  return (
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
            onOpenQuickAdd={() => setActionModalType('quick_add')}
          />

          {/* Modal Action Suite */}
          <ActionModal
            type={actionModalType}
            wallets={wallets}
            userRole={userRole}
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
            onClose={() => setEditProfileVisible(false)}
            onProfileUpdated={(updatedUser) => {
              setCurrentUser(updatedUser);
              showToastMessage('✅ Đã cập nhật thông tin cá nhân trên MongoDB Atlas!');
            }}
          />
        </View>
      )}

      {toast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
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
