import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { UsersManagement } from './pages/UsersManagement';
import { HouseholdsManagement } from './pages/HouseholdsManagement';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="households" element={<HouseholdsManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
