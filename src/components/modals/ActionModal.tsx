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
import { X, PiggyBank, ReceiptText, ArrowLeftRight, QrCode, Check } from 'lucide-react-native';

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

  const handleSubmit = () => {
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
        return { text: 'Nộp quỹ gia đình', icon: PiggyBank, color: '#056839' };
      case 'expense':
      case 'quick_add':
        return { text: 'Thêm khoản chi mới', icon: ReceiptText, color: '#EA580C' };
      case 'transfer':
        return { text: 'Chuyển tiền giữa các ví', icon: ArrowLeftRight, color: '#0891B2' };
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
  const wallets = ['Ví Mẹ Lan', 'Ví Bố Minh', 'Quỹ gia đình chung'];

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
                      <Text style={styles.label}>Số tiền (VNĐ)</Text>
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

                    {/* Expense / Quick Add title */}
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

                    {/* Category Selector */}
                    {(type === 'expense' || type === 'quick_add') && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Hạng mục</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                          {categories.map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              onPress={() => setCategory(cat)}
                              style={[
                                styles.chip,
                                category === cat && styles.chipActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  category === cat && styles.chipTextActive,
                                ]}
                              >
                                {cat}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Transfer fields */}
                    {type === 'transfer' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Từ ví sang Đến ví</Text>
                        <View style={styles.rowTwo}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.subLabel}>Từ ví</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                              {wallets.map((w) => (
                                <TouchableOpacity
                                  key={w}
                                  onPress={() => setFromWallet(w)}
                                  style={[styles.chip, fromWallet === w && styles.chipActive]}
                                >
                                  <Text style={[styles.chipText, fromWallet === w && styles.chipTextActive]}>{w}</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
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
                    {type === 'deposit' && (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Ghi chú</Text>
                        <TextInput
                          placeholder="VD: Đóng quỹ tháng 10..."
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
                      <Text style={styles.submitText}>Xác nhận lưu</Text>
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
});
