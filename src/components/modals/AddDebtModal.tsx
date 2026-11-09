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
} from 'react-native';
import { X, HandCoins, ArrowUpRight, ArrowDownLeft, ShieldAlert } from 'lucide-react-native';
import type { DebtType, Wallet } from '../../types';

interface AddDebtModalProps {
  visible: boolean;
  wallets: Wallet[];
  onClose: () => void;
  onSubmit: (data: {
    type: DebtType;
    personName: string;
    phoneNumber?: string;
    amount: number;
    startDate?: string;
    dueDate?: string;
    note?: string;
    walletId?: string;
    affectWallet?: boolean;
  }) => void;
}

export const AddDebtModal: React.FC<AddDebtModalProps> = ({
  visible,
  wallets,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<DebtType>('lend'); // lend: Cho vay (Cần thu), borrow: Đi vay (Phải trả)
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [affectWallet, setAffectWallet] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!visible) return null;

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    if (!raw) {
      setAmount('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmount(num.toLocaleString('vi-VN'));
  };

  const handleSubmit = () => {
    setErrorMsg(null);
    const trimmedName = personName.trim();
    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập tên người liên quan.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\D/g, '')) || 0;
    if (numAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ (> 0 đ).');
      return;
    }

    onSubmit({
      type,
      personName: trimmedName,
      phoneNumber: phoneNumber.trim() || undefined,
      amount: numAmount,
      dueDate: dueDate.trim() || undefined,
      note: note.trim() || undefined,
      walletId: walletId || undefined,
      affectWallet,
    });

    // Reset form
    setPersonName('');
    setPhoneNumber('');
    setAmount('');
    setDueDate('');
    setNote('');
    setErrorMsg(null);
    onClose();
  };

  const activeWallets = wallets.filter((w) => w.active);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconBox, { backgroundColor: type === 'lend' ? '#ECFDF5' : '#FEF2F2' }]}>
                    <HandCoins size={22} color={type === 'lend' ? '#056839' : '#DC2626'} />
                  </View>
                  <View>
                    <Text style={styles.title}>Thêm Khoản Công Nợ</Text>
                    <Text style={styles.subtitle}>Ghi nhận nợ cần thu hoặc phải trả</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <ShieldAlert size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                )}

                {/* Type Selection */}
                <Text style={styles.inputLabel}>Loại công nợ</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    onPress={() => setType('lend')}
                    style={[styles.typeBtn, type === 'lend' && styles.typeBtnActiveLend]}
                    activeOpacity={0.8}
                  >
                    <ArrowUpRight size={18} color={type === 'lend' ? '#056839' : '#64748B'} />
                    <Text style={[styles.typeBtnText, type === 'lend' && styles.typeBtnTextActiveLend]}>
                      Tôi cho vay (Cần thu)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setType('borrow')}
                    style={[styles.typeBtn, type === 'borrow' && styles.typeBtnActiveBorrow]}
                    activeOpacity={0.8}
                  >
                    <ArrowDownLeft size={18} color={type === 'borrow' ? '#DC2626' : '#64748B'} />
                    <Text style={[styles.typeBtnText, type === 'borrow' && styles.typeBtnTextActiveBorrow]}>
                      Tôi đi vay (Phải trả)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Person Name */}
                <Text style={styles.inputLabel}>
                  {type === 'lend' ? 'Người vay tiền (Con nợ) *' : 'Người cho vay (Chủ nợ) *'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Anh Tuấn, Bạn Nam, Cô Lan..."
                  placeholderTextColor="#94A3B8"
                  value={personName}
                  onChangeText={setPersonName}
                />

                {/* Phone Number */}
                <Text style={styles.inputLabel}>Số điện thoại liên hệ (Tùy chọn)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: 0912345678"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />

                {/* Amount */}
                <Text style={styles.inputLabel}>Số tiền nợ (VNĐ) *</Text>
                <View style={styles.amountInputRow}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={handleAmountChange}
                  />
                  <Text style={styles.currencySuffix}>đ</Text>
                </View>

                {/* Due Date */}
                <Text style={styles.inputLabel}>Hạn thanh toán (Tùy chọn)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: 25/11/2026 hoặc Cuối tháng..."
                  placeholderTextColor="#94A3B8"
                  value={dueDate}
                  onChangeText={setDueDate}
                />

                {/* Wallet Selection */}
                {activeWallets.length > 0 && (
                  <>
                    <Text style={styles.inputLabel}>Ví tiền liên quan</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
                      {activeWallets.map((w) => (
                        <TouchableOpacity
                          key={w.id}
                          onPress={() => setWalletId(w.id)}
                          style={[styles.walletChip, walletId === w.id && styles.walletChipActive]}
                        >
                          <Text style={[styles.walletChipText, walletId === w.id && styles.walletChipTextActive]}>
                            {w.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Toggle affect wallet balance */}
                    <TouchableOpacity
                      onPress={() => setAffectWallet(!affectWallet)}
                      style={styles.checkboxRow}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, affectWallet && styles.checkboxActive]}>
                        {affectWallet && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        {type === 'lend'
                          ? 'Trừ tiền ví ngay bây giờ (Đã xuất tiền cho vay)'
                          : 'Cộng tiền vào ví ngay bây giờ (Đã nhận tiền vay)'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Note */}
                <Text style={styles.inputLabel}>Ghi chú lý do vay mượn</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Ví dụ: Tiền mua đồ điện tử, nợ tiền nhà..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  value={note}
                  onChangeText={setNote}
                />
              </ScrollView>

              {/* Footer Submit */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, { backgroundColor: type === 'lend' ? '#056839' : '#DC2626' }]}
                >
                  <Text style={styles.submitBtnText}>Lưu Khoản Nợ</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  body: {
    marginVertical: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  typeBtnActiveLend: {
    borderColor: '#056839',
    backgroundColor: '#ECFDF5',
  },
  typeBtnActiveBorrow: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  typeBtnTextActiveLend: {
    color: '#056839',
  },
  typeBtnTextActiveBorrow: {
    color: '#DC2626',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 6,
  },
  currencySuffix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 6,
  },
  walletScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  walletChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  walletChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#056839',
  },
  walletChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  walletChipTextActive: {
    color: '#056839',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#056839',
    borderColor: '#056839',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#056839',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

