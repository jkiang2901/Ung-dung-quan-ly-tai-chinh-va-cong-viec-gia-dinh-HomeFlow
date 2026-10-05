import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { X, PiggyBank, ReceiptText, ArrowLeftRight, QrCode, Check } from 'lucide-react-native';

const DateTimePicker = (() => {
  try {
    return require('@react-native-community/datetimepicker').default;
  } catch {
    return null;
  }
})();

import type { Wallet, RoleType } from '../../types';
import { ShieldAlert } from 'lucide-react-native';

export type ModalType = 'deposit' | 'expense' | 'transfer' | 'qr' | 'quick_add' | null;

interface ActionModalProps {
  type: ModalType;
  wallets?: Wallet[];
  userRole?: RoleType;
  onClose: () => void;
  onSubmitExpense: (data: { title: string; amount: number; category: string; user: string; sourceWalletId?: string; dateTime?: string }) => void;
  onSubmitDeposit: (data: { amount: number; user: string; note: string; sourceWalletId?: string; dateTime?: string }) => void;
  onSubmitTransfer: (data: { fromWalletId: string; toWalletId: string; amount: number; note?: string; dateTime?: string }) => void;
  onNavigateTab?: (tab: any) => void;
}

const formatDateTimeValue = (date: Date) => {
  const datePart = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${datePart} - ${timePart}`;
};

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  wallets = [],
  userRole = 'OWNER',
  onClose,
  onSubmitExpense,
  onSubmitDeposit,
  onSubmitTransfer,
}) => {
  const activeWallets = wallets.filter((w) => w.active);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Ăn uống gia đình');
  const [user, setUser] = useState<string>('Mẹ Lan');

  const [fromWalletId, setFromWalletId] = useState<string>(activeWallets[1]?.id || activeWallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState<string>(activeWallets[2]?.id || activeWallets[0]?.id || '');
  const [depositSourceId, setDepositSourceId] = useState<string>(activeWallets[1]?.id || activeWallets[0]?.id || '');

  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [dateTimeValue, setDateTimeValue] = useState<string>(formatDateTimeValue(new Date()));
  const isWeb = Platform.OS === 'web';

  if (!type) return null;

  const handleSubmit = () => {
    setErrorMsg(null);

    if (userRole === 'VIEWER') {
      setErrorMsg('Tài khoản chỉ xem (VIEWER) không có quyền thực hiện giao dịch.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\D/g, '')) || 0;
    if (numAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ (> 0 đ).');
      return;
    }

    if (type === 'expense' || type === 'quick_add') {
      onSubmitExpense({
        title: title || 'Chi tiêu gia đình',
        amount: numAmount,
        category,
        user,
        sourceWalletId: fromWalletId,
        dateTime: dateTimeValue,
      });
      onClose();
    } else if (type === 'deposit') {
      const sourceW = activeWallets.find((w) => w.id === depositSourceId);
      if (!sourceW) {
        setErrorMsg('Vui lòng chọn nguồn tiền nạp quỹ.');
        return;
      }
      if (sourceW.balance < numAmount) {
        setErrorMsg(`Số dư ví "${sourceW.name}" không đủ (${sourceW.balance.toLocaleString('vi-VN')} đ).`);
        return;
      }

      onSubmitDeposit({
        amount: numAmount,
        user,
        note: note || 'Nộp quỹ gia đình',
        sourceWalletId: depositSourceId,
        dateTime: dateTimeValue,
      });
      onClose();
    } else if (type === 'transfer') {
      if (!fromWalletId) {
        setErrorMsg('Vui lòng chọn Ví nguồn.');
        return;
      }
      if (!toWalletId) {
        setErrorMsg('Vui lòng chọn Ví đích.');
        return;
      }
      if (fromWalletId === toWalletId) {
        setErrorMsg('Ví nguồn và ví đích không được giống nhau.');
        return;
      }

      const sourceW = activeWallets.find((w) => w.id === fromWalletId);
      if (!sourceW) {
        setErrorMsg('Ví nguồn không hợp lệ.');
        return;
      }
      if (sourceW.balance < numAmount) {
        setErrorMsg(`Số dư ví nguồn "${sourceW.name}" không đủ (${sourceW.balance.toLocaleString('vi-VN')} đ).`);
        return;
      }

      onSubmitTransfer({
        fromWalletId,
        toWalletId,
        amount: numAmount,
        note: note || 'Chuyển tiền nội bộ',
        dateTime: dateTimeValue,
      });
      onClose();
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'deposit':
        return { text: 'Nạp quỹ gia đình chung', icon: PiggyBank, color: '#056839' };
      case 'expense':
      case 'quick_add':
        return { text: 'Thêm khoản chi mới', icon: ReceiptText, color: '#EA580C' };
      case 'transfer':
        return { text: 'Chuyển tiền nội bộ', icon: ArrowLeftRight, color: '#0891B2' };
      case 'qr':
        return { text: 'Quét mã QR thanh toán', icon: QrCode, color: '#9333EA' };
      default:
        return { text: 'Thao tác', icon: Check, color: '#1E293B' };
    }
  };

  const modalInfo = getTitle();
  const IconComp = modalInfo.icon;

  const categories = [
    'Ăn uống gia đình',
    'Giáo dục con cái',
    'Mua sắm sinh hoạt',
    'Giải trí & du lịch',
    'Bé yêu',
    'Khoản khác',
  ];

  const users = ['Mẹ Lan', 'Bố Minh', 'Ví gia đình chung'];

  return (
    <Modal
      visible={!!type}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                    <IconComp size={20} color={modalInfo.color} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.headerText}>{modalInfo.text}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Content Body */}
              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {errorMsg && (
                  <View style={styles.errorBoxAlert}>
                    <ShieldAlert size={16} color="#DC2626" />
                    <Text style={styles.errorTextAlert}>{errorMsg}</Text>
                  </View>
                )}

                {type === 'qr' ? (
                  <View style={styles.qrContainer}>
                    <View style={styles.qrBox}>
                      {!scanned ? (
                        <>
                          <QrCode size={96} color="#056839" />
                          <Text style={styles.qrInstructions}>
                            Di chuyển camera đến mã VietQR / MoMo của hoá đơn
                          </Text>
                        </>
                      ) : (
                        <View style={styles.qrSuccess}>
                          <Check size={64} color="#059669" strokeWidth={3} />
                          <Text style={styles.qrSuccessTitle}>Đã quét thành công!</Text>
                          <Text style={styles.qrSuccessSub}>
                            Hoá đơn Siêu thị Bách Hoá Xanh - 450.000 đ
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => setScanned(!scanned)}
                      style={styles.qrButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.qrButtonText}>
                        {scanned ? 'Quét lại' : 'Mô phỏng Quét thành công'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.form}>
                    {/* Amount input */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Số tiền (VNĐ) (*)</Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#A7F3D0"
                        value={amount}
                        onChangeText={(text) => {
                          const raw = text.replace(/\D/g, '');
                          setAmount(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
                        }}
                        style={styles.amountInput}
                      />
                    </View>

                    {/* Expense title */}
                    {(type === 'expense' || type === 'quick_add') && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Tên khoản chi / Nội dung</Text>
                        <TextInput
                          placeholder="VD: Đi chợ, Tiền điện tháng 10..."
                          placeholderTextColor="#94A3B8"
                          value={title}
                          onChangeText={setTitle}
                          style={styles.textInput}
                        />
                      </View>
                    )}

                    {/* Deposit source wallet */}
                    {type === 'deposit' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Nguồn tiền nộp vào Quỹ (*)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                          {activeWallets
                            .filter((w) => w.type !== 'Quỹ chung')
                            .map((w) => (
                              <TouchableOpacity
                                key={w.id}
                                onPress={() => setDepositSourceId(w.id)}
                                style={[styles.chip, depositSourceId === w.id && styles.chipActive]}
                              >
                                <Text style={[styles.chipText, depositSourceId === w.id && styles.chipTextActive]}>
                                  {w.name} ({w.balance.toLocaleString('vi-VN')} đ)
                                </Text>
                              </TouchableOpacity>
                            ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Transfer wallet selectors */}
                    {type === 'transfer' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Từ ví (Ví nguồn)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                          {activeWallets.map((w) => (
                            <TouchableOpacity
                              key={`from-${w.id}`}
                              onPress={() => setFromWalletId(w.id)}
                              style={[styles.chip, fromWalletId === w.id && styles.chipActive]}
                            >
                              <Text style={[styles.chipText, fromWalletId === w.id && styles.chipTextActive]}>
                                {w.name} ({w.balance.toLocaleString('vi-VN')}đ)
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <Text style={[styles.label, { marginTop: 10 }]}>Đến ví (Ví đích)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                          {activeWallets.map((w) => (
                            <TouchableOpacity
                              key={`to-${w.id}`}
                              onPress={() => setToWalletId(w.id)}
                              style={[styles.chip, toWalletId === w.id && styles.chipActive]}
                            >
                              <Text style={[styles.chipText, toWalletId === w.id && styles.chipTextActive]}>
                                {w.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Category Selector */}
                    {(type === 'expense' || type === 'quick_add') && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Hạng mục</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                          {categories.map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              onPress={() => setCategory(cat)}
                              style={[styles.chip, category === cat && styles.chipActive]}
                            >
                              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                                {cat}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* User Selector */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Người thực hiện</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {users.map((u) => (
                          <TouchableOpacity
                            key={u}
                            onPress={() => setUser(u)}
                            style={[styles.chip, user === u && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, user === u && styles.chipTextActive]}>{u}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Note */}
                    {(type === 'deposit' || type === 'transfer') && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Ghi chú</Text>
                        <TextInput
                          placeholder={type === 'deposit' ? 'VD: Đóng góp quỹ gia đình...' : 'VD: Rút tiền mặt, chuyển tiết kiệm...'}
                          placeholderTextColor="#94A3B8"
                          value={note}
                          onChangeText={setNote}
                          style={styles.textInput}
                        />
                      </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={handleSubmit}
                      style={styles.submitButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.submitText}>
                        {type === 'transfer'
                          ? 'Xác nhận chuyển'
                          : type === 'deposit'
                          ? 'Nạp quỹ ngay'
                          : 'Xác nhận lưu'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrBox: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#056839',
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  qrInstructions: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
  },
  qrSuccess: {
    alignItems: 'center',
  },
  qrSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
    marginTop: 8,
  },
  qrSuccessSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  qrButton: {
    marginTop: 20,
    backgroundColor: '#056839',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  amountInput: {
    fontSize: 26,
    fontWeight: '900',
    color: '#056839',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickerWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  doneButton: {
    backgroundColor: '#056839',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  textInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#056839',
    borderColor: '#056839',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#056839',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  errorBoxAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorTextAlert: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
});
