import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Globe,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  Lock,
  Mail,
  Smartphone,
  Server,
  AlertTriangle,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'database'>('general');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Form states
  const [systemName, setSystemName] = useState('HomeFlow - Quản Lý Gia Đình');
  const [supportEmail, setSupportEmail] = useState('support@homeflow.vn');
  const [currency, setCurrency] = useState('VND');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh (GMT+7)');
  const [language, setLanguage] = useState('vi');

  // Security states
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [ipWhitelist, setIpWhitelist] = useState('118.69.182.0/24, 14.161.0.0/16');

  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [unusualTxAlert, setUnusualTxAlert] = useState(true);
  const [telegramWebhook, setTelegramWebhook] = useState('https://api.telegram.org/bot<TOKEN>/sendMessage');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('Đã lưu cấu hình hệ thống thành công!');
    setTimeout(() => {
      setSavedNotice(null);
    }, 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            Cài Đặt Hệ Thống Admin
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý tham số toàn hệ thống, bảo mật phân quyền, cấu hình thông báo và sao lưu cơ sở dữ liệu.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Lưu Tất Cả Cài Đặt
        </button>
      </div>

      {/* Success Notification */}
      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{savedNotice}</span>
          </div>
          <button
            onClick={() => setSavedNotice(null)}
            className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          Cấu hình chung
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          Bảo mật & Quyền truy cập
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          Thông báo & Webhooks
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Cơ sở dữ liệu & Sao lưu
        </button>
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Thông Tin Nền Tảng</h3>
            <p className="text-xs text-slate-500 mt-1">Thiết lập các thuộc tính định danh cơ bản của ứng dụng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Tên Ứng Dụng
              </label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Hỗ Trợ Kỹ Thuật
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Đơn Vị Tiền Tệ Mặc Định
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="VND">VND (Việt Nam Đồng - ₫)</option>
                <option value="USD">USD (Đô la Mỹ - $)</option>
                <option value="EUR">EUR (Euro - €)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Múi Giờ Hệ Thống
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Asia/Ho_Chi_Minh (GMT+7)">Asia/Ho_Chi_Minh (GMT+7)</option>
                <option value="Asia/Bangkok (GMT+7)">Asia/Bangkok (GMT+7)</option>
                <option value="UTC (GMT+0)">UTC (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Ngôn Ngữ Giao Diện Quản Trị
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="vi">Tiếng Việt (Mặc định)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Permissions */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Chính Sách An Toàn & Bảo Mật</h3>
            <p className="text-xs text-slate-500 mt-1">Cấu hình phòng vệ chống xâm nhập và quy tắc phiên làm việc</p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-800">Xác thực 2 bước (2FA) bắt buộc</span>
                </div>
                <p className="text-xs text-slate-500">Yêu cầu mã TOTP (Google Authenticator) khi đăng nhập tài khoản Quản trị</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Thời Gian Hết Hạn Phiên (Phút)
                </label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Giới Hạn Đăng Nhập Sai Tối Đa
                </label>
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Danh Sách IP Được Phép Truy Cập (IP Whitelist)
              </label>
              <textarea
                rows={2}
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                placeholder="Nhập các dải IP cách nhau bởi dấu phẩy"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Để trống nếu cho phép truy cập từ mọi địa chỉ IP hợp lệ.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications & Webhooks */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Kênh Gửi Thông Báo Tự Động</h3>
            <p className="text-xs text-slate-500 mt-1">Quản lý cách hệ thống liên lạc với người dùng và quản trị viên</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Thông báo Email tự động</h4>
                  <p className="text-xs text-slate-500">Gửi hóa đơn, báo cáo tuần và cảnh báo số dư qua SMTP</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Thông báo đẩy di động (Push FCM)</h4>
                  <p className="text-xs text-slate-500">Gửi nhắc nhở việc nhà và phân chia nợ đến ứng dụng React Native</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotification}
                onChange={(e) => setPushNotification(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Cảnh báo giao dịch bất thường</h4>
                  <p className="text-xs text-slate-500">Báo động khi có giao dịch lớn hơn 50.000.000 VND</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={unusualTxAlert}
                onChange={(e) => setUnusualTxAlert(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Webhook Báo Cáo Telegram Bot
              </label>
              <input
                type="text"
                value={telegramWebhook}
                onChange={(e) => setTelegramWebhook(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Database & Backups */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Trạng Thái Database & Sao Lưu Dữ Liệu</h3>
            <p className="text-xs text-slate-500 mt-1">Quản lý sức khỏe cơ sở dữ liệu MongoDB và lịch snapshot</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">MongoDB Atlas Production</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    KẾT NỐI TỐT
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Cluster0 (ap-southeast-1) • Dung lượng lưu trữ: 1.42 GB / 5.0 GB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Kiểm tra Ping
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Sao lưu tự động</span>
                <h4 className="text-base font-bold text-slate-800 mt-1">Định kỳ mỗi 24 giờ</h4>
                <p className="text-xs text-slate-500 mt-1">Bản sao lưu gần nhất: Hôm nay lúc 02:00:15 GMT+7</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Đang kích hoạt quy trình sao lưu khẩn cấp MongoDB Atlas snapshot...')}
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tạo Bản Snapshot Ngay
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Xuất cơ sở dữ liệu</span>
                <h4 className="text-base font-bold text-slate-800 mt-1">Dump JSON / BSON Archive</h4>
                <p className="text-xs text-slate-500 mt-1">Xuất toàn bộ 7 collections chính để lưu trữ ngoại tuyến</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Đang tạo file nén dump cơ sở dữ liệu...')}
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải Về File Dump (ZIP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

