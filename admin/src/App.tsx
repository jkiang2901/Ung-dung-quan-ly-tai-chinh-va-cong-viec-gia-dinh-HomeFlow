import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
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
