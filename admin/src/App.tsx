import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLogin } from './pages/AdminLogin';
import { adminApi, clearAdminToken, getAdminToken, type AdminUser } from './services/api';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { UsersManagement } from './pages/UsersManagement';
import { HouseholdsManagement } from './pages/HouseholdsManagement';
import { TransactionsManagement } from './pages/TransactionsManagement';
import { DebtsManagement } from './pages/DebtsManagement';
import { TasksManagement } from './pages/TasksManagement';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { AdminSettings } from './pages/AdminSettings';

export const App: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getAdminToken();
    if (!token) {
      setChecking(false);
      return;
    }
    adminApi.me()
      .then(({ user: admin }) => { if (active) setUser(admin); })
      .catch(() => { if (active) clearAdminToken(); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const logout = () => setUser(null);
    window.addEventListener('homeflow-admin-unauthorized', logout);
    return () => window.removeEventListener('homeflow-admin-unauthorized', logout);
  }, []);

  useEffect(() => {
    if (!user) return;
    const activityKey = 'homeflow_admin_last_activity';
    const recordActivity = () => window.sessionStorage.setItem(activityKey, String(Date.now()));
    if (!window.sessionStorage.getItem(activityKey)) recordActivity();
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    const timer = window.setInterval(() => {
      const minutes = Number(window.localStorage.getItem('homeflow_admin_session_timeout') || 60);
      const lastActivity = Number(window.sessionStorage.getItem(activityKey) || Date.now());
      if (Date.now() - lastActivity >= minutes * 60_000) {
        clearAdminToken();
        window.sessionStorage.removeItem(activityKey);
        setUser(null);
      }
    }, 15_000);
    return () => {
      window.clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, recordActivity));
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const admin = await adminApi.login(email, password);
    setUser(admin);
  };

  if (checking) return <div className="flex min-h-screen items-center justify-center text-slate-500">Đang kiểm tra phiên đăng nhập…</div>;
  if (!user) return <AdminLogin onLogin={login} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout currentUser={user} onLogout={() => { clearAdminToken(); setUser(null); }} />}>
          <Route index element={<DashboardOverview />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="households" element={<HouseholdsManagement />} />
          <Route path="transactions" element={<TransactionsManagement />} />
          <Route path="debts" element={<DebtsManagement />} />
          <Route path="tasks" element={<TasksManagement />} />
          <Route path="reports" element={<AnalyticsReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
