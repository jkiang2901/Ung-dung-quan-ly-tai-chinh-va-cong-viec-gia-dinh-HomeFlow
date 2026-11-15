import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<div className="p-8 text-center text-slate-500">HomeFlow Admin Dashboard</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
