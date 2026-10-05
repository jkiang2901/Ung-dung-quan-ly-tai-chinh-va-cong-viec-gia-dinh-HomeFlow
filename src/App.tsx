import { useState } from 'react';
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
import { WalletTab } from './components/tabs/WalletTab';
import { StatisticsTab } from './components/tabs/StatisticsTab';
import { TasksTab } from './components/tabs/TasksTab';
import { FamilyTab } from './components/tabs/FamilyTab';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen, DEMO_ACCOUNTS } from './components/auth/AuthScreen';
import {
  INITIAL_MEMBERS,
  INITIAL_WALLETS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGET_LIMITS,
  INITIAL_INVITATIONS,
  INITIAL_TASKS,
} from './mockData';
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

  // Default login: OWNER (Bố Minh owner@test.com)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(DEMO_ACCOUNTS[0]);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [actionModalType, setActionModalType] = useState<ModalType>(null);
  const [toast, setToast] = useState<string | null>(null);

  // App domain states
  const [members] = useState(INITIAL_MEMBERS);
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgetLimits, setBudgetLimits] = useState<CategoryBudget[]>(INITIAL_BUDGET_LIMITS);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>(INITIAL_INVITATIONS);
  const [tasks, setTasks] = useState<HouseholdTask[]>(INITIAL_TASKS);

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

  // Derived Values
  const userRole: RoleType = currentUser?.role || 'OWNER';
  const fundWallet = wallets.find((w) => w.id === 'w-fund');
  const fundBalance = fundWallet ? fundWallet.balance : 48250000;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 65000000);

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

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    showToastMessage(`Đã đăng nhập thành công với vai trò ${user.role} (${user.name})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToastMessage('Đã đăng xuất khỏi tài khoản');
  };

  // 1. CHỨC NĂNG THÊM VÍ
  const handleAddWallet = (data: {
    name: string;
    type: WalletType;
    initialBalance: number;
    ownerName: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền thêm ví.');
      return;
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

  // 2. CHỨC NĂNG SỬA VÍ
  const handleEditWallet = (
    id: string,
    data: { name: string; type: WalletType; ownerName: string }
  ) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền sửa ví.');
      return;
    }

    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data, updatedAt: new Date().toLocaleDateString('vi-VN') } : w))
    );
    showToastMessage(`Đã cập nhật thông tin ví "${data.name}"`);
  };

  // 3. VÔ HIỆU HÓA VÍ
  const handleDisableWallet = (id: string) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền vô hiệu hóa ví.');
      return;
    }

    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: false } : w))
    );
    const target = wallets.find((w) => w.id === id);
    showToastMessage(`Đã vô hiệu hóa ví "${target?.name || ''}"`);
  };

  // 4. XÓA VÍ (Ví chưa có giao dịch)
  const handleDeleteWallet = (id: string) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền xóa ví.');
      return;
    }

    const target = wallets.find((w) => w.id === id);
    setWallets((prev) => prev.filter((w) => w.id !== id));
    showToastMessage(`Đã xóa hoàn toàn ví "${target?.name || ''}"`);
  };

  // 5. CHUYỂN TIỀN NỘI BỘ (Không phải Expense)
  const handleTransfer = (data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    note?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền chuyển tiền.');
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

    // Cập nhật số dư các ví
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === data.fromWalletId) return { ...w, balance: w.balance - data.amount };
        if (w.id === data.toWalletId) return { ...w, balance: w.balance + data.amount };
        return w;
      })
    );

    const displayDate = data.dateTime ? data.dateTime.split(' - ')[0] : new Date().toLocaleDateString('vi-VN');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Chuyển tiền: ${sourceW.name} → ${destW.name}`,
      user: currentUser?.name || 'Thành viên',
      time: data.dateTime ? data.dateTime.split(' - ')[1] || 'Vừa xong' : 'Vừa xong',
      date: displayDate,
      amount: data.amount,
      type: 'transfer',
      category: 'Chuyển ví nội bộ',
      iconType: 'transfer',
      sourceWalletId: sourceW.id,
      sourceWalletName: sourceW.name,
      destinationWalletId: destW.id,
      destinationWalletName: destW.name,
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToastMessage(`Chuyển ${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} đến ${destW.name}`);
  };

  // 6. NẠP QUỸ CHUNG (Khấu trừ ví nguồn, tăng Quỹ chung, Không phải Expense)
  const handleDeposit = (data: {
    amount: number;
    user: string;
    note: string;
    sourceWalletId?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền nạp quỹ.');
      return;
    }

    const sourceW = wallets.find((w) => w.id === data.sourceWalletId) || wallets.find((w) => w.type === 'Ngân hàng');
    if (!sourceW) {
      showToastMessage('Vui lòng chọn nguồn tiền nạp quỹ.');
      return;
    }

    if (sourceW.balance < data.amount) {
      showToastMessage(`Số dư ví "${sourceW.name}" không đủ để nạp quỹ.`);
      return;
    }

    // Khấu trừ ví nguồn, tăng ví Quỹ chung
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === sourceW.id) return { ...w, balance: w.balance - data.amount };
        if (w.id === 'w-fund') return { ...w, balance: w.balance + data.amount };
        return w;
      })
    );

    const displayDate = data.dateTime ? data.dateTime.split(' - ')[0] : new Date().toLocaleDateString('vi-VN');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Nạp quỹ chung: ${data.note || 'Đóng góp gia đình'}`,
      user: data.user || currentUser?.name || 'Bố Minh',
      time: data.dateTime ? data.dateTime.split(' - ')[1] || 'Vừa xong' : 'Vừa xong',
      date: displayDate,
      amount: data.amount,
      type: 'contribution',
      category: 'Đóng góp quỹ',
      iconType: 'salary',
      sourceWalletId: sourceW.id,
      sourceWalletName: sourceW.name,
      destinationWalletId: 'w-fund',
      destinationWalletName: 'Quỹ gia đình chung',
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToastMessage(`Đã nộp +${data.amount.toLocaleString('vi-VN')} đ từ ${sourceW.name} vào Quỹ chung`);
  };

  // 7. THÊM KHOẢN CHI TIÊU
  const handleAddExpense = (data: {
    title: string;
    amount: number;
    category: string;
    user: string;
    sourceWalletId?: string;
    dateTime?: string;
  }) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền tạo chi tiêu.');
      return;
    }

    const targetWallet = wallets.find((w) => w.id === data.sourceWalletId) || fundWallet || wallets[0];
    if (targetWallet && targetWallet.balance < data.amount) {
      showToastMessage(`Cảnh báo: Số dư ví "${targetWallet.name}" đang bị âm/thiếu.`);
    }

    if (targetWallet) {
      setWallets((prev) =>
        prev.map((w) => (w.id === targetWallet.id ? { ...w, balance: w.balance - data.amount } : w))
      );
    }

    const displayDate = data.dateTime ? data.dateTime.split(' - ')[0] : new Date().toLocaleDateString('vi-VN');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: data.title,
      user: data.user,
      time: data.dateTime ? data.dateTime.split(' - ')[1] || 'Vừa xong' : 'Vừa xong',
      date: displayDate,
      amount: -data.amount,
      type: 'expense',
      category: data.category,
      iconType: 'shopping',
      sourceWalletId: targetWallet?.id,
      sourceWalletName: targetWallet?.name,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToastMessage(`Đã ghi nhận chi tiêu -${data.amount.toLocaleString('vi-VN')} đ cho ${data.title}`);
  };

  // 8. CẬP NHẬT HẠN MỨC
  const handleUpdateLimit = (category: string, newLimit: number) => {
    if (userRole === 'VIEWER') {
      showToastMessage('⚠️ Tài khoản VIEWER không có quyền cài đặt hạn mức.');
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
      showToastMessage('⚠️ Chỉ OWNER mới có quyền gửi lời mời.');
      return;
    }

    const newInv: FamilyInvitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      invitedBy: currentUser?.name || 'Bố Minh',
    };

    setInvitations((prev) => [newInv, ...prev]);
    showToastMessage(`Đã gửi lời mời tới ${email}`);
  };

  const handleCancelInvitation = (id: string) => {
    if (userRole !== 'OWNER') return;
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    showToastMessage('Đã hủy lời mời.');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleAddTask = (newTask: HouseholdTask) => {
    setTasks((prev) => [newTask, ...prev]);
    showToastMessage(`Đã thêm việc nhà: "${newTask.title}"`);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollBody}>
            <Greeting userName={currentUser?.name || 'bạn'} />
            <PersonalWalletCard
              userName={currentUser?.name || 'Cá nhân'}
              balance={currentUser?.personalBalance ?? 18500000}
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
