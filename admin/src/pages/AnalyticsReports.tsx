import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  DollarSign,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  monthlyCashFlowData,
  categoryExpenseData,
  taskCompletionData,
} from '../data/mockData';

export const AnalyticsReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30days' | 'quarter' | 'year' | 'all'>('year');
  const [reportType, setReportType] = useState<'overview' | 'finance' | 'tasks'>('overview');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleExport = (format: 'PDF' | 'Excel') => {
    setExportNotice(`Đã tạo và sẵn sàng tải về file Báo cáo tổng hợp (${format}).`);
    setTimeout(() => {
      setExportNotice(null);
    }, 4000);
  };

  // KPI calculations
  const totalIncome = monthlyCashFlowData.reduce((acc, cur) => acc + cur.income, 0);
  const totalExpense = monthlyCashFlowData.reduce((acc, cur) => acc + cur.expense, 0);
  const totalNetSavings = totalIncome - totalExpense;
  const savingsRate = Math.round((totalNetSavings / totalIncome) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Thống kê & Báo cáo Chuyên sâu
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Phân tích số liệu toàn diện về tình hình tài chính gia đình, phân bổ ngân sách và hiệu suất công việc.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-medium text-slate-700 bg-transparent pr-3 py-1.5 focus:outline-none"
            >
              <option value="30days">30 ngày gần đây</option>
              <option value="quarter">Quý này (Q4/2026)</option>
              <option value="year">Cả năm 2026</option>
              <option value="all">Toàn bộ thời gian</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('Excel')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Excel
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất PDF
            </button>
          </div>
        </div>
      </div>

      {/* Export notification alert */}
      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900"
          >
            Đóng
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu Hộ</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome)}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              +14.8% so với chu kỳ trước
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Chi Tiêu Toàn Sàn</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpense)}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Chi tiêu trung bình: ~34.2 tr/tháng
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tích Lũy / Thặng Dư</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalNetSavings)}</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Tỷ lệ thặng dư đạt {savingsRate}%
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chỉ Số Việc Nhà Đúng Hạn</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">86.2%</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              Mức độ gắn kết gia đình rất cao
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts: Income vs Expense Trend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Biểu đồ So Sánh Thu Chi & Thặng Dư Ròng (12 Tháng)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá dòng tiền tổng thể qua các tháng trong năm
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Thu nhập</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Chi tiêu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-600">Tiết kiệm ròng</span>
            </div>
          </div>
        </div>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyCashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="netColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Area type="monotone" dataKey="income" name="Thu nhập" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeColor)" />
              <Area type="monotone" dataKey="expense" name="Chi tiêu" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseColor)" />
              <Area type="monotone" dataKey="net" name="Tiết kiệm ròng" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#netColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Task Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Expense Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  Cơ Cấu Chi Tiêu Theo Hạng Mục
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỷ lệ phần trăm và giá trị các nhóm chi tiêu chính
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Tổng chi']}
                    contentStyle={{ borderRadius: '10px', borderColor: '#e2e8f0' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {categoryExpenseData.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-400 block truncate">{item.name}</span>
                <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart: Task Efficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Chất Lượng & Tiến Độ Phân Công Việc Nhà
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đo lường mức độ hoàn thành nhiệm vụ gia đình
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskCompletionData.map((entry, index) => (
                      <Cell key={`cell-task-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Tỷ lệ']}
                    contentStyle={{ borderRadius: '10px', borderColor: '#e2e8f0' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-700 font-semibold block">Đúng hạn & Hoàn tất</span>
              <span className="text-xl font-bold text-emerald-900">86%</span>
              <p className="text-[11px] text-emerald-600 mt-0.5">Bao gồm 72% đúng hẹn + 14% hoàn tất trễ</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-amber-700 font-semibold block">Cần nhắc nhở / Quá hạn</span>
              <span className="text-xl font-bold text-amber-900">14%</span>
              <p className="text-[11px] text-amber-600 mt-0.5">Bao gồm 10% đang làm + 4% quá hạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Net Savings Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Biểu đồ Phân Bổ Tiết Kiệm Tích Lũy Ròng (VND)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Số dư tích lũy thực tế sau khi đã cân đối toàn bộ thu chi theo tháng
            </p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Thặng dư ròng']}
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
              />
              <Bar dataKey="net" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Health Summary Recommendation Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-blue-600" />
            Đánh Giá Sức Khỏe Tài Chính Hệ Thống HomeFlow
          </h4>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Chỉ số chi tiêu thiết yếu (Ăn uống, Hóa đơn) chiếm 60% tổng chi tiêu, nằm trong ngưỡng chi tiêu an toàn theo khuyến nghị 50/30/20. Tỷ lệ tiết kiệm trung bình của các hộ gia đình đạt mức rất tốt (38.2%).
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-sm">
            Xếp hạng: Hạng A+ (Rất Tốt)
          </span>
        </div>
      </div>
    </div>
  );
};

