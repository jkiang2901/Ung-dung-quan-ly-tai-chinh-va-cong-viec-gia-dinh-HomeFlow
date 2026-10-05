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
  Alert,
} from 'react-native';
import { X, Wallet as WalletIcon, Trash2, ShieldAlert, Check } from 'lucide-react-native';
import type { Wallet, WalletType, RoleType } from '../../types';

interface WalletModalProps {
  visible: boolean;
  mode: 'add' | 'edit' | 'delete' | null;
  wallet?: Wallet | null;
  wallets: Wallet[];
  userRole: RoleType;
  members: { name: string }[];
  onClose: () => void;
  onAddWallet: (data: { name: string; type: WalletType; initialBalance: number; ownerName: string }) => void;
  onEditWallet: (id: string, data: { name: string; type: WalletType; ownerName: string }) => void;
  onDisableWallet: (id: string) => void;
  onDeleteWallet: (id: string) => void;
  hasTransactions?: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  visible,
  mode,
  wallet,
  wallets,
  userRole,
  members,
  onClose,
  onAddWallet,
  onEditWallet,
  onDisableWallet,
  onDeleteWallet,
  hasTransactions = false,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('Ngân hàng');
  const [initialBalance, setInitialBalance] = useState('');
  const [ownerName, setOwnerName] = useState('Bố Minh');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet && mode === 'edit') {
      setName(wallet.name);
      setType(wallet.type);
      setOwnerName(wallet.ownerName || 'Bố Minh');
    } else {
      setName('');
      setType('Ngân hàng');
      setInitialBalance('');
      setOwnerName('Bố Minh');
    }
    setError(null);
  }, [wallet, mode, visible]);

  if (!visible || !mode) return null;

  const walletTypes: WalletType[] = ['Tiền mặt', 'Ngân hàng', 'Ví điện tử', 'Tiết kiệm', 'Khác'];

  const handleSubmit = () => {
    setError(null);
    if (userRole === 'VIEWER') {
      setError('Tài khoản của bạn chỉ có quyền XEM (VIEWER), không thể chỉnh sửa ví.');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Tên ví là bắt buộc và không được chỉ có khoảng trắng.');
      return;
    }

    // Check duplicate name
    const isDuplicate = wallets.some(
      (w) => w.name.toLowerCase() === trimmedName.toLowerCase() && w.id !== wallet?.id
    );
    if (isDuplicate) {
      setError('Tên ví đã tồn tại trong hệ thống. Vui lòng chọn tên khác.');
      return;
    }

    if (mode === 'add') {
      const parsedBalance = parseFloat(initialBalance.replace(/\D/g, '')) || 0;
      if (parsedBalance < 0) {
        setError('Số dư ban đầu không được âm.');
        return;
      }

      onAddWallet({
        name: trimmedName,
        type,
        initialBalance: parsedBalance,
        ownerName: ownerName || 'Gia đình',
      });
      onClose();
    } else if (mode === 'edit' && wallet) {
      onEditWallet(wallet.id, {
        name: trimmedName,
        type,
        ownerName,
      });
      onClose();
    }
  };

  const handleDeleteOrDisable = () => {
    if (userRole === 'VIEWER') {
      setError('Tài khoản chỉ xem (VIEWER) không có quyền xóa hoặc vô hiệu hóa ví.');
      return;
    }
    if (!wallet) return;

    if (hasTransactions) {
      onDisableWallet(wallet.id);
    } else {
      onDeleteWallet(wallet.id);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                    <WalletIcon size={20} color="#056839" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.headerText}>
                    {mode === 'add'
                      ? 'Thêm ví mới'
                      : mode === 'edit'
                      ? 'Chỉnh sửa ví'
                      : 'Xác nhận xử lý ví'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {error && (
                  <View style={styles.errorBox}>
                    <ShieldAlert size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {mode === 'delete' ? (
                  <View style={styles.deleteConfirmBox}>
                    <ShieldAlert size={44} color="#EA580C" />
                    <Text style={styles.deleteTitle}>
                      {hasTransactions ? 'Vô hiệu hóa ví này?' : 'Xóa ví này?'}
                    </Text>
                    <Text style={styles.deleteSub}>
                      {hasTransactions
                        ? `Ví "${wallet?.name}" đã có lịch sử giao dịch. Ví sẽ chuyển sang trạng thái ẩn và không thể tạo giao dịch mới, lịch sử cũ vẫn được giữ nguyên.`
                        : `Ví "${wallet?.name}" chưa có giao dịch nào. Bạn có thể xóa hoàn toàn khỏi hệ thống.`}
                    </Text>

                    <View style={styles.deleteActionRow}>
                      <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Hủy</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleDeleteOrDisable}
                        style={[
                          styles.confirmDeleteBtn,
                          { backgroundColor: hasTransactions ? '#EA580C' : '#DC2626' },
                        ]}
                      >
                        <Text style={styles.confirmDeleteBtnText}>
                          {hasTransactions ? 'Vô hiệu hóa ví' : 'Xóa ví'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.form}>
                    {/* Wallet Name */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Tên ví (*)</Text>
                      <TextInput
                        placeholder="VD: MB Bank, Ví MoMo, Tiền mặt..."
                        placeholderTextColor="#94A3B8"
                        value={name}
                        onChangeText={setName}
                        style={styles.textInput}
                      />
                    </View>

                    {/* Wallet Type */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Loại ví</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {walletTypes.map((t) => (
                          <TouchableOpacity
                            key={t}
                            onPress={() => setType(t)}
                            style={[styles.chip, type === t && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Initial Balance (only add mode) */}
                    {mode === 'add' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Số dư ban đầu (VNĐ)</Text>
                        <TextInput
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#A7F3D0"
                          value={initialBalance}
                          onChangeText={(t) => {
                            const raw = t.replace(/\D/g, '');
                            setInitialBalance(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
                          }}
                          style={styles.amountInput}
                        />
                        <Text style={styles.helperText}>
                          Số dư sau này sẽ tự động tính = Số dư ban đầu + Tiền vào - Tiền ra.
                        </Text>
                      </View>
                    )}

                    {/* Owner */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Chủ sở hữu</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {['Bố Minh', 'Mẹ Lan', 'Gia đình'].map((m) => (
                          <TouchableOpacity
                            key={m}
                            onPress={() => setOwnerName(m)}
                            style={[styles.chip, ownerName === m && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, ownerName === m && styles.chipTextActive]}>
                              {m}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Hủy</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSubmit}
                        style={styles.submitBtn}
                        activeOpacity={0.8}
                      >
                        <Check size={18} color="#FFFFFF" strokeWidth={3} />
                        <Text style={styles.submitBtnText}>
                          {mode === 'add' ? 'Thêm ví' : 'Lưu thay đổi'}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
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
  amountInput: {
    fontSize: 22,
    fontWeight: '900',
    color: '#056839',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#056839',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteConfirmBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  deleteSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  deleteActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    width: '100%',
  },
  confirmDeleteBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
