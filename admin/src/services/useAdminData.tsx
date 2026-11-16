import { useCallback, useEffect, useRef, useState } from 'react';

export function useAdminData<T>(load: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadRef = useRef(load);
  loadRef.current = load;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await loadRef.current());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { data, setData, loading, error, refresh };
}

export const AdminDataMessage = ({ loading, error }: { loading: boolean; error: string }) => {
  if (loading) return <p className="rounded-xl bg-white p-4 text-sm text-slate-500">Đang tải dữ liệu…</p>;
  if (error) return <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  return null;
};
