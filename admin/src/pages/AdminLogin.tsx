import React, { useState } from 'react';
import { LockKeyhole, Home } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Home className="h-6 w-6" />
        </div>
        <h1 className="text-center text-2xl font-extrabold text-slate-900">HomeFlow Admin</h1>
        <p className="mb-6 mt-2 text-center text-sm text-slate-500">Đăng nhập bằng tài khoản quản trị được cấp quyền.</p>
        {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <label className="mb-4 block text-sm font-semibold text-slate-700">
          Email
          <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" />
        </label>
        <label className="mb-6 block text-sm font-semibold text-slate-700">
          Mật khẩu
          <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" />
        </label>
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-60">
          <LockKeyhole className="h-4 w-4" /> {loading ? 'Đang xác thực…' : 'Đăng nhập'}
        </button>
      </form>
    </main>
  );
};
