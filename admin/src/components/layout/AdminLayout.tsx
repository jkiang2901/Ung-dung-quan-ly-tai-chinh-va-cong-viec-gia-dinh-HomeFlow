import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AdminUser } from '../../services/api';

interface AdminLayoutProps {
  currentUser: AdminUser;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic header titles based on pathname
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard Tổng Quan',
          subtitle: 'Giám sát toàn bộ hoạt động tài chính, gia đình & người dùng',
        };
      case '/users':
        return {
          title: 'Quản Lý Người Dùng',
          subtitle: 'Danh sách hồ sơ, quyền hạn và trạng thái kích hoạt tài khoản',
        };
      case '/households':
        return {
          title: 'Quản Lý Không Gian Gia Đình',
          subtitle: 'Các hộ gia đình, quỹ chung và cấu trúc thành viên',
        };
      case '/transactions':
        return {
          title: 'Quản Lý Giao Dịch Tài Chính',
          subtitle: 'Toàn bộ dòng tiền thu nhập, chi tiêu và luân chuyển nội bộ',
        };
      case '/debts':
        return {
          title: 'Quản Lý Công Nợ & Vay Mượn',
          subtitle: 'Theo dõi các khoản cho vay, nợ phải thu và lịch sử hoàn trả',
        };
      case '/tasks':
        return {
          title: 'Quản Lý Việc Nhà & Nhiệm Vụ',
          subtitle: 'Phân công công việc gia đình, tiến độ và quỹ thưởng',
        };
      case '/reports':
        return {
          title: 'Thống Kê & Báo Cáo Phân Tích',
          subtitle: 'Biểu đồ trực quan và phân tích tài chính chuyên sâu',
        };
      case '/settings':
        return {
          title: 'Cài Đặt Hệ Thống Admin',
          subtitle: 'Cấu hình tham số ứng dụng, bảo mật và sao lưu dữ liệu',
        };
      default:
        return {
          title: 'Admin Dashboard',
          subtitle: 'HomeFlow Management Console',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentUser={currentUser}
          onLogout={onLogout}
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
