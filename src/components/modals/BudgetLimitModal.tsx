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
import { X, SlidersHorizontal, Check, Edit2, ShieldAlert } from 'lucide-react-native';
import type { CategoryBudget, Transaction, RoleType } from '../../types';

interface BudgetLimitModalProps {
  visible: boolean;
  budgets: CategoryBudget[];
  transactions: Transaction[];
  userRole: RoleType;
  onClose: () => void;
  onUpdateLimit: (category: string, newLimit: number) => void;
}

export const BudgetLimitModal: React.FC<BudgetLimitModalProps> = ({
  visible,
  budgets,
  transactions,
  userRole,
  onClose,
  onUpdateLimit,
}) => {
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [inputLimit, setInputLimit] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  // Calculate actual spending per category
  const categorySpentMap = new Map<string, number>();
  transactions.forEach((t) => {
    if (t.type === 'expense') {
      const current = categorySpentMap.get(t.category) || 0;
      categorySpentMap.set(t.category, current + Math.abs(t.amount));
    }
  });

  const handleStartEdit = (b: CategoryBudget) => {
    if (userRole === 'VIEWER') {
      setError('Tài khoản Trẻ Em không có quyền thay đổi hạn mức.');
      return;
    }
    setError(null);
    setEditingCat(b.category);
    setInputLimit(b.limit.toLocaleString('vi-VN'));
  };

  const handleSaveEdit = (category: string) => {
    setError(null);
    if (userRole === 'VIEWER') {
      setError('Tài khoản Trẻ Em không có quyền thay đổi hạn mức.');
      return;
    }

    const numericLimit = parseFloat(inputLimit.replace(/\D/g, '')) || 0;
    if (numericLimit <= 0) {
      setError('Hạn mức phải lớn hơn 0 đ.');
      return;
    }

    onUpdateLimit(category, numericLimit);
    setEditingCat(null);
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
                  <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                    <SlidersHorizontal size={20} color="#EA580C" strokeWidth={2.2} />
                  </View>
                  <View>
                    <Text style={styles.headerText}>Cài đặt hạn mức chi tiêu</Text>
                    <Text style={styles.headerSub}>Theo dõi & quản lý ngân sách tháng</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {error && (
                  <View style={styles.errorBox}>
                    <ShieldAlert size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.limitList}>
                  {budgets.map((b) => {
                    const spent = categorySpentMap.get(b.category) || 0;
                    const percent = Math.min(100, Math.round((spent / b.limit) * 100)) || 0;
                    const isOver = spent > b.limit;
                    const isEditing = editingCat === b.category;

                    return (
                      <View key={b.id} style={styles.budgetCard}>
                        <View style={styles.budgetTop}>
                          <Text style={styles.catTitle}>{b.category}</Text>
                          {isEditing ? (
                            <View style={styles.editRow}>
                              <TextInput
                                keyboardType="numeric"
                                value={inputLimit}
                                onChangeText={(t) => {
                                  const raw = t.replace(/\D/g, '');
                                  setInputLimit(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
                                }}
                                style={styles.editInput}
                                autoFocus
                              />
                              <TouchableOpacity
                                onPress={() => handleSaveEdit(b.category)}
                                style={styles.saveBtn}
                              >
                                <Check size={16} color="#FFFFFF" strokeWidth={3} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleStartEdit(b)}
                              style={styles.limitDisplayBtn}
                            >
                              <Text style={styles.limitValue}>
                                {b.limit.toLocaleString('vi-VN')} đ
                              </Text>
                              {userRole !== 'VIEWER' && <Edit2 size={12} color="#056839" />}
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Progress info */}
                        <View style={styles.progressMeta}>
                          <Text style={styles.spentText}>
                            Đã dùng: <Text style={styles.spentBold}>{spent.toLocaleString('vi-VN')} đ</Text>
                          </Text>
                          <Text
                            style={[
                              styles.percentBadgeText,
                              { color: isOver ? '#DC2626' : percent > 80 ? '#EA580C' : '#056839' },
                            ]}
                          >
                            {percent}%
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${percent}%`,
                                backgroundColor: isOver ? '#DC2626' : percent > 80 ? '#EA580C' : '#056839',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
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
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
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
    gap: 14,
    paddingBottom: 30,
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
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  limitList: {
    gap: 12,
  },
  budgetCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  budgetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  limitDisplayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  limitValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#056839',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#056839',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 100,
  },
  saveBtn: {
    backgroundColor: '#056839',
    padding: 6,
    borderRadius: 8,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spentText: {
    fontSize: 12,
    color: '#64748B',
  },
  spentBold: {
    fontWeight: '700',
    color: '#1E293B',
  },
  percentBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
