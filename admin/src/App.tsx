import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
