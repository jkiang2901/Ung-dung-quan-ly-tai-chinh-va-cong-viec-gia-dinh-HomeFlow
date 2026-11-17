import React, { useState, useEffect } from 'react';
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
import { X, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import type { DebtItem, Wallet } from '../../types';

interface PayDebtModalProps {
  visible: boolean;
  debt: DebtItem | null;
  wallets: Wallet[];
  onClose: () => void;
  onSubmit: (data: {
    debtId: string;
    amount: number;
    note?: string;
    walletId?: string;
    affectWallet?: boolean;
  }) => void;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({
  visible,
  debt,
  wallets,
  onClose,
  onSubmit,
}) => {
  const [payAmount, setPayAmount] = useState('');
  const [note, setNote] = useState('');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [affectWallet, setAffectWallet] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (debt) {
      setPayAmount(debt.remainingAmount.toLocaleString('vi-VN'));
      setNote('');
      setErrorMsg(null);
    }
  }, [debt]);

  if (!visible || !debt) return null;

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    if (!raw) {
      setPayAmount('');
      return;
    }
    const num = parseInt(raw, 10);
    setPayAmount(num.toLocaleString('vi-VN'));
  };

  const handleSubmit = () => {
    setErrorMsg(null);
    const numAmount = parseFloat(payAmount.replace(/\D/g, '')) || 0;
    if (numAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền thanh toán hợp lệ (> 0 đ).');
      return;
    }

    if (numAmount > debt.remainingAmount) {
      setErrorMsg(
        `Số tiền (${numAmount.toLocaleString('vi-VN')} đ) vượt quá số dư còn lại (${debt.remainingAmount.toLocaleString('vi-VN')} đ).`
      );
      return;
    }

    onSubmit({
      debtId: debt.id,
      amount: numAmount,
      note: note.trim() || undefined,
      walletId: walletId || undefined,
      affectWallet,
    });

    onClose();
  };

  const activeWallets = wallets.filter((w) => w.active);
  const isLend = debt.type === 'lend';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconBox, { backgroundColor: isLend ? '#ECFDF5' : '#FEF2F2' }]}>
                    <CheckCircle2 size={24} color={isLend ? '#056839' : '#DC2626'} />
                  </View>
                  <View>
                    <Text style={styles.title}>
                      {isLend ? 'Thu Hồi Nợ' : 'Thanh Toán Trả Nợ'}
                    </Text>
                    <Text style={styles.subtitle}>
                      {isLend
                        ? `Thu tiền từ ${debt.personName}`
                        : `Trả tiền cho ${debt.personName}`}
                    </Text>
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

                {/* Info Card */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tổng tiền nợ gốc:</Text>
                    <Text style={styles.infoValue}>{debt.amount.toLocaleString('vi-VN')} đ</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Đã thanh toán trước đó:</Text>
                    <Text style={styles.infoValuePaid}>{debt.paidAmount.toLocaleString('vi-VN')} đ</Text>
                  </View>
                  <View style={[styles.infoRow, styles.infoRowTotal]}>
                    <Text style={styles.infoLabelTotal}>Số tiền còn phải trả:</Text>
                    <Text style={[styles.infoValueTotal, { color: isLend ? '#056839' : '#DC2626' }]}>
                      {debt.remainingAmount.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                {/* Input Amount */}
                <Text style={styles.inputLabel}>Số tiền thanh toán đợt này (VNĐ) *</Text>
                <View style={styles.amountInputRow}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    value={payAmount}
                    onChangeText={handleAmountChange}
                  />
                  <Text style={styles.currencySuffix}>đ</Text>
                </View>

                {/* Quick Fill Buttons */}
                <View style={styles.quickFillRow}>
                  <TouchableOpacity
                    onPress={() => setPayAmount(debt.remainingAmount.toLocaleString('vi-VN'))}
                    style={styles.quickFillBtn}
                  >
                    <Text style={styles.quickFillText}>Thanh toán hết (100%)</Text>
                  </TouchableOpacity>
                  {debt.remainingAmount > 100000 && (
                    <TouchableOpacity
                      onPress={() =>
                        setPayAmount(Math.round(debt.remainingAmount / 2).toLocaleString('vi-VN'))
                      }
                      style={styles.quickFillBtn}
                    >
                      <Text style={styles.quickFillText}>Trả 50%</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Wallet Selection */}
                {activeWallets.length > 0 && (
                  <>
                    <Text style={styles.inputLabel}>
                      {isLend ? 'Cộng tiền vào ví nào?' : 'Trừ tiền từ ví nào?'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
                      {activeWallets.map((w) => (
                        <TouchableOpacity
                          key={w.id}
                          onPress={() => setWalletId(w.id)}
                          style={[styles.walletChip, walletId === w.id && styles.walletChipActive]}
                        >
                          <Text style={[styles.walletChipText, walletId === w.id && styles.walletChipTextActive]}>
                            {w.name} ({w.balance.toLocaleString('vi-VN')} đ)
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      onPress={() => setAffectWallet(!affectWallet)}
                      style={styles.checkboxRow}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, affectWallet && styles.checkboxActive]}>
                        {affectWallet && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        {isLend
                          ? 'Cộng trực tiếp số tiền này vào ví đã chọn'
                          : 'Trừ trực tiếp số tiền này khỏi ví đã chọn'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Note */}
                <Text style={styles.inputLabel}>Ghi chú đợt thanh toán</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Chuyển khoản Vietcombank, trả tiền mặt..."
                  placeholderTextColor="#94A3B8"
                  value={note}
                  onChangeText={setNote}
                />
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, { backgroundColor: isLend ? '#056839' : '#DC2626' }]}
                >
                  <Text style={styles.submitBtnText}>Xác Nhận</Text>
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
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowTotal: {
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoValuePaid: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  infoLabelTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoValueTotal: {
    fontSize: 16,
    fontWeight: '900',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
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
  quickFillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickFillBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
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

