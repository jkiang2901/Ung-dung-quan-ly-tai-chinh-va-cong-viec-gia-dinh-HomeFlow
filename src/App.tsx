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
import { WalletTab } from './components/tabs/WalletTab';
import { StatisticsTab } from './components/tabs/StatisticsTab';
import { TasksTab } from './components/tabs/TasksTab';
import { FamilyTab } from './components/tabs/FamilyTab';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import {
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TASKS,
} from './mockData';
import type { Transaction, HouseholdTask, AuthUser } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  // User state: null = chưa đăng nhập (hiển thị AuthScreen)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [fundBalance, setFundBalance] = useState<number>(48250000);
  const [totalIncome, setTotalIncome] = useState<number>(65000000);
  const [totalExpense, setTotalExpense] = useState<number>(16750000);
  const [totalBudget] = useState<number>(28500000);
  const [toast, setToast] = useState<string | null>(null);

  const [members] = useState(INITIAL_MEMBERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [tasks, setTasks] = useState<HouseholdTask[]>(INITIAL_TASKS);

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    showToastMessage(`Chào mừng ${user.name} đã đăng nhập thành công!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToastMessage('Đã đăng xuất khỏi tài khoản');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollBody}>
            <Greeting userName={currentUser?.name || 'bạn'} />
            {/* Trang chủ: Hiện Ví tiền riêng của tài khoản */}
            <PersonalWalletCard
              userName={currentUser?.name || 'Cá nhân'}
              balance={currentUser?.personalBalance ?? 18500000}
              familyFundBalance={fundBalance}
              onGoToFamilyFund={() => setActiveTab('wallet')}
              onDepositToFund={() => setModalType('deposit')}
            />
            <MonthlySummary totalIncome={totalIncome} totalExpense={totalExpense} />
            <BudgetProgress spent={totalExpense} totalBudget={totalBudget} />
            <QuickActions
              onDeposit={() => setModalType('deposit')}
              onAddExpense={() => setModalType('expense')}
              onTransfer={() => setModalType('transfer')}
              onScanQR={() => setModalType('qr')}
            />
            <TodayTasks
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onViewAll={() => setActiveTab('tasks')}
            />
            <RecentTransactions
              transactions={transactions}
              onViewHistory={() => showToastMessage('Xem toàn bộ lịch sử giao dịch')}
            />
          </ScrollView>
        );
      case 'wallet':
        // Tab Ví tiền: Nơi quản lý QUỸ CHUNG GIA ĐÌNH
        return (
          <WalletTab
            fundBalance={fundBalance}
            members={members}
            onOpenDeposit={() => setModalType('deposit')}
            onOpenTransfer={() => setModalType('transfer')}
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
        return <FamilyTab members={members} />;
      default:
        return <StatisticsTab />;
    }
  };

  // Toggle household task completed state
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: HouseholdTask) => {
    setTasks((prev) => [newTask, ...prev]);
    showToastMessage(`Đã thêm việc nhà: "${newTask.title}"`);
  };

  // Handle adding expense
  const handleAddExpense = (data: { title: string; amount: number; category: string; user: string; dateTime?: string }) => {
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
    };
    setTransactions((prev) => [newTx, ...prev]);
    setFundBalance((prev) => prev - data.amount);
    setTotalExpense((prev) => prev + data.amount);

    // Cập nhật số dư cá nhân nếu người chi tiêu là người dùng hiện tại
    if (currentUser && data.user.includes(currentUser.name)) {
      setCurrentUser((prev) =>
        prev ? { ...prev, personalBalance: Math.max(0, prev.personalBalance - data.amount) } : null
      );
    }

    showToastMessage(`Đã thêm chi tiêu -${data.amount.toLocaleString('vi-VN')} đ cho ${data.title}`);
  };

  // Handle deposit to fund
  const handleDeposit = (data: { amount: number; user: string; note: string; dateTime?: string }) => {
    const displayDate = data.dateTime ? data.dateTime.split(' - ')[0] : new Date().toLocaleDateString('vi-VN');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Nộp quỹ: ${data.note || 'Đóng góp gia đình'}`,
      user: data.user,
      time: data.dateTime ? data.dateTime.split(' - ')[1] || 'Vừa xong' : 'Vừa xong',
      date: displayDate,
      amount: data.amount,
      type: 'income',
      category: 'Quỹ chung',
      iconType: 'salary',
    };
    setTransactions((prev) => [newTx, ...prev]);
    setFundBalance((prev) => prev + data.amount);
    setTotalIncome((prev) => prev + data.amount);

    // Giảm số dư cá nhân khi nộp vào quỹ chung
    if (currentUser && data.user.includes(currentUser.name)) {
      setCurrentUser((prev) =>
        prev ? { ...prev, personalBalance: Math.max(0, prev.personalBalance - data.amount) } : null
      );
    }

    showToastMessage(`Đã nộp +${data.amount.toLocaleString('vi-VN')} đ vào Quỹ chung`);
  };

  // Handle transfer wallet
  const handleTransfer = (data: { from: string; to: string; amount: number; dateTime?: string }) => {
    const displayDate = data.dateTime ? data.dateTime.split(' - ')[0] : new Date().toLocaleDateString('vi-VN');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Chuyển tiền: ${data.from} → ${data.to}`,
      user: data.from,
      time: data.dateTime ? data.dateTime.split(' - ')[1] || 'Vừa xong' : 'Vừa xong',
      date: displayDate,
      amount: -data.amount,
      type: 'expense',
      category: 'Chuyển ví',
      iconType: 'general',
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToastMessage(`Đã chuyển ${data.amount.toLocaleString('vi-VN')} đ từ ${data.from} đến ${data.to}`);
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar style="dark" />
      {/* Initial Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} autoHideDuration={2200} />
      )}

      {/* Luồng hiển thị rõ ràng 3 tầng: Splash → Auth → App chính */}
      {showSplash ? (
        // Tầng 1: Splash Screen đang chạy, không render gì khác phía sau
        null
      ) : !currentUser ? (
        // Tầng 2: Đã qua Splash nhưng chưa đăng nhập → Màn hình Auth
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Tầng 3: Đã đăng nhập → Main App
        <View style={styles.innerContainer}>
          {/* Header */}
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

          {/* Bottom Floating Navigation Bar */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenQuickAdd={() => setModalType('quick_add')}
          />

          {/* Action Modals */}
          <ActionModal
            type={modalType}
            onClose={() => setModalType(null)}
            onSubmitExpense={handleAddExpense}
            onSubmitDeposit={handleDeposit}
            onSubmitTransfer={handleTransfer}
            onNavigateTab={setActiveTab}
          />
        </View>
      )}

      {/* Toast Notification */}
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
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 50,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default App;
