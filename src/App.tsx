import { useState } from 'react';
import { Header } from './components/Header';
import { Greeting } from './components/Greeting';
import { FamilyFundCard } from './components/FamilyFundCard';
import { MonthlySummary } from './components/MonthlySummary';
import { BudgetProgress } from './components/BudgetProgress';
import { QuickActions } from './components/QuickActions';
import { ExpenseAllocation } from './components/ExpenseAllocation';
import { TodayTasks } from './components/TodayTasks';
import { RecentTransactions } from './components/RecentTransactions';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { ActionModal } from './components/modals/ActionModal';
import type { ModalType } from './components/modals/ActionModal';
import { WalletTab } from './components/tabs/WalletTab';
import { TasksTab } from './components/tabs/TasksTab';
import { FamilyTab } from './components/tabs/FamilyTab';
import { SplashScreen } from './components/SplashScreen';
import {
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TASKS,
} from './mockData';
import type { Transaction, HouseholdTask } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
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
  const handleAddExpense = (data: { title: string; amount: number; category: string; user: string }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: data.title,
      user: data.user,
      time: 'Vừa xong',
      amount: -data.amount,
      type: 'expense',
      category: data.category,
      iconType: 'shopping',
    };
    setTransactions((prev) => [newTx, ...prev]);
    setFundBalance((prev) => prev - data.amount);
    setTotalExpense((prev) => prev + data.amount);
    showToastMessage(`Đã thêm chi tiêu -${data.amount.toLocaleString('vi-VN')} đ cho ${data.title}`);
  };

  // Handle deposit to fund
  const handleDeposit = (data: { amount: number; user: string; note: string }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Nộp quỹ: ${data.note || 'Đóng góp gia đình'}`,
      user: data.user,
      time: 'Vừa xong',
      amount: data.amount,
      type: 'income',
      category: 'Quỹ chung',
      iconType: 'salary',
    };
    setTransactions((prev) => [newTx, ...prev]);
    setFundBalance((prev) => prev + data.amount);
    setTotalIncome((prev) => prev + data.amount);
    showToastMessage(`Đã nộp +${data.amount.toLocaleString('vi-VN')} đ vào Quỹ chung`);
  };

  // Handle transfer wallet
  const handleTransfer = (data: { from: string; to: string; amount: number }) => {
    showToastMessage(`Đã chuyển ${data.amount.toLocaleString('vi-VN')} đ từ ${data.from} đến ${data.to}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex justify-center selection:bg-emerald-100">
      {/* Initial Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} autoHideDuration={2400} />
      )}

      {/* Mobile viewport container */}
      <div className="w-full max-w-md bg-[#f4f6f8] min-h-screen relative flex flex-col shadow-2xl">
        {/* Header */}
        <Header
          members={members}
          subtitle={
            activeTab === 'home'
              ? 'Trang Chủ'
              : activeTab === 'tasks'
              ? 'Công Việc'
              : activeTab === 'wallet'
              ? 'Ví Tiền'
              : 'Gia Đình'
          }
          onLogoClick={() => setShowSplash(true)}
          onOpenNotifications={() => showToastMessage('Bạn không có thông báo mới!')}
        />

        {/* Dynamic Screen Content based on Active Tab */}
        {activeTab === 'home' && (
          <main className="flex-1 space-y-1 animate-in fade-in duration-300">
            {/* Greeting Header */}
            <Greeting />

            {/* Main Family Fund Hero Card */}
            <FamilyFundCard balance={fundBalance} />

            {/* Income & Expense Monthly Summary Cards */}
            <MonthlySummary totalIncome={totalIncome} totalExpense={totalExpense} />

            {/* Budget Progress Indicator */}
            <BudgetProgress spent={totalExpense} totalBudget={totalBudget} />

            {/* Quick Actions (Nộp quỹ, Thêm chi, Chuyển ví, Quét mã) */}
            <QuickActions
              onDeposit={() => setModalType('deposit')}
              onAddExpense={() => setModalType('expense')}
              onTransfer={() => setModalType('transfer')}
              onScanQR={() => setModalType('qr')}
            />

            {/* Expense Breakdown Donut Chart */}
            <ExpenseAllocation />

            {/* Today Tasks */}
            <TodayTasks
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onViewAll={() => setActiveTab('tasks')}
            />

            {/* Recent Transactions */}
            <RecentTransactions
              transactions={transactions}
              onViewHistory={() => showToastMessage('Xem toàn bộ lịch sử giao dịch')}
            />
          </main>
        )}

        {activeTab === 'wallet' && (
          <WalletTab
            fundBalance={fundBalance}
            onOpenDeposit={() => setModalType('deposit')}
            onOpenTransfer={() => setModalType('transfer')}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            members={members}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        )}

        {activeTab === 'family' && <FamilyTab members={members} />}

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
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/90 text-white text-xs font-bold rounded-full shadow-xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
