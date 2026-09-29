import React, { useState } from 'react';
import { X, PiggyBank, ReceiptText, ArrowLeftRight, QrCode, Check } from 'lucide-react';

export type ModalType = 'deposit' | 'expense' | 'transfer' | 'qr' | 'quick_add' | null;

interface ActionModalProps {
  type: ModalType;
  onClose: () => void;
  onSubmitExpense: (data: { title: string; amount: number; category: string; user: string }) => void;
  onSubmitDeposit: (data: { amount: number; user: string; note: string }) => void;
  onSubmitTransfer: (data: { from: string; to: string; amount: number }) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  onClose,
  onSubmitExpense,
  onSubmitDeposit,
  onSubmitTransfer,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Ăn uống gia đình');
  const [user, setUser] = useState<string>('Mẹ Lan');
  const [fromWallet, setFromWallet] = useState<string>('Ví Mẹ Lan');
  const [toWallet, setToWallet] = useState<string>('Quỹ gia đình chung');
  const [note, setNote] = useState<string>('');
  const [scanned, setScanned] = useState<boolean>(false);

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/\D/g, '')) || 0;

    if (type === 'expense' || type === 'quick_add') {
      onSubmitExpense({
        title: title || 'Chi tiêu gia đình',
        amount: numAmount,
        category,
        user,
      });
    } else if (type === 'deposit') {
      onSubmitDeposit({
        amount: numAmount,
        user,
        note,
      });
    } else if (type === 'transfer') {
      onSubmitTransfer({
        from: fromWallet,
        to: toWallet,
        amount: numAmount,
      });
    }
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'deposit':
        return { text: 'Nộp quỹ gia đình', icon: PiggyBank, color: 'text-[#056839]' };
      case 'expense':
      case 'quick_add':
        return { text: 'Thêm khoản chi mới', icon: ReceiptText, color: 'text-orange-600' };
      case 'transfer':
        return { text: 'Chuyển tiền giữa các ví', icon: ArrowLeftRight, color: 'text-cyan-600' };
      case 'qr':
        return { text: 'Quét mã QR thanh toán', icon: QrCode, color: 'text-purple-600' };
      default:
        return { text: 'Thao tác', icon: Check, color: 'text-slate-800' };
    }
  };

  const modalInfo = getTitle();
  const IconComp = modalInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-slate-100 ${modalInfo.color}`}>
              <IconComp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[17px] font-extrabold text-slate-900">{modalInfo.text}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {type === 'qr' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-64 h-64 border-2 border-dashed border-[#056839] rounded-2xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                {!scanned ? (
                  <>
                    <QrCode className="w-24 h-24 text-[#056839] animate-pulse" />
                    <p className="text-xs font-semibold text-slate-500 mt-4 px-4">
                      Di chuyển camera đến mã VietQR / MoMo của hoá đơn
                    </p>
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#056839]/60 shadow-[0_0_15px_#056839] animate-bounce" />
                  </>
                ) : (
                  <div className="flex flex-col items-center text-emerald-600">
                    <Check className="w-16 h-16 stroke-[3]" />
                    <span className="font-extrabold text-lg mt-2">Đã quét thành công!</span>
                    <span className="text-xs text-slate-500">Hoá đơn Siêu thị Bách Hoá Xanh - 450.000 đ</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setScanned(!scanned)}
                className="mt-6 px-6 py-2.5 bg-[#056839] text-white font-bold rounded-xl shadow-lg shadow-[#056839]/20 hover:bg-[#04522d] transition-colors"
              >
                {scanned ? 'Quét lại' : 'Mô phỏng Quét thành công'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setAmount(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
                  }}
                  className="w-full text-2xl font-extrabold text-[#056839] bg-emerald-50/50 border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#056839]/30"
                />
              </div>

              {/* Expense / Quick Add title */}
              {(type === 'expense' || type === 'quick_add') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tên khoản chi / Nội dung
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Đi chợ, Tiền điện tháng 10..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#056839]/20"
                  />
                </div>
              )}

              {/* Category Selector */}
              {(type === 'expense' || type === 'quick_add') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Hạng mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#056839]/20"
                  >
                    <option value="Ăn uống gia đình">Ăn uống gia đình</option>
                    <option value="Giáo dục con cái">Giáo dục con cái</option>
                    <option value="Mua sắm sinh hoạt">Mua sắm sinh hoạt</option>
                    <option value="Giải trí & du lịch">Giải trí & du lịch</option>
                    <option value="Bé yêu">Bé yêu</option>
                    <option value="Khoản khác">Khoản khác</option>
                  </select>
                </div>
              )}

              {/* Transfer fields */}
              {type === 'transfer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Từ ví
                    </label>
                    <select
                      value={fromWallet}
                      onChange={(e) => setFromWallet(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                    >
                      <option value="Ví Mẹ Lan">Ví Mẹ Lan</option>
                      <option value="Ví Bố Minh">Ví Bố Minh</option>
                      <option value="Quỹ gia đình chung">Quỹ gia đình chung</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Đến ví
                    </label>
                    <select
                      value={toWallet}
                      onChange={(e) => setToWallet(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                    >
                      <option value="Quỹ gia đình chung">Quỹ gia đình chung</option>
                      <option value="Ví Mẹ Lan">Ví Mẹ Lan</option>
                      <option value="Ví Bố Minh">Ví Bố Minh</option>
                    </select>
                  </div>
                </div>
              )}

              {/* User Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Người thực hiện
                </label>
                <select
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#056839]/20"
                >
                  <option value="Mẹ Lan">Mẹ Lan</option>
                  <option value="Bố Minh">Bố Minh</option>
                  <option value="Ví chung">Ví gia đình chung</option>
                </select>
              </div>

              {/* Note */}
              {type === 'deposit' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đóng quỹ tháng 10..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#056839] hover:bg-[#04532d] text-white font-extrabold text-base rounded-xl shadow-lg shadow-[#056839]/25 transition-all mt-4"
              >
                Xác nhận lưu
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
