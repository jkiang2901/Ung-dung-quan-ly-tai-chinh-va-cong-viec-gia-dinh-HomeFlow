import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  FileText,
  ArrowLeftRight,
  Landmark,
  ShoppingBag,
  Baby,
  PiggyBank,
  CreditCard,
  Tag,
  Trash2,
  Calendar,
} from 'lucide-react-native';
import type { Transaction, TransactionType } from '../../types';

interface StatementModalProps {
  visible: boolean;
  transactions: Transaction[];
  onClose: () => void;
  onDeleteTransaction?: (id: string) => Promise<void> | void;
}

type TimeFilter = 'all' | 'today' | 'week' | 'month';

export const StatementModal: React.FC<StatementModalProps> = ({
  visible,
  transactions,
  onClose,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer' | 'contribution'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const parseTxDate = (tx: Transaction): Date => {
    if (!tx.date) return new Date();
    if (tx.date.includes('/')) {
      const parts = tx.date.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    const d = new Date(tx.date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // 1. Filter by type
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    // 2. Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (timeFilter === 'today') {
        result = result.filter((t) => {
          const d = parseTxDate(t);
          return d >= startOfToday;
        });
      } else if (timeFilter === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter((t) => {
          const d = parseTxDate(t);
          return d >= sevenDaysAgo;
        });
      } else if (timeFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        result = result.filter((t) => {
          const d = parseTxDate(t);
          return d >= startOfMonth;
        });
      }
    }

    return result;
  }, [transactions, filterType, timeFilter]);

  if (!visible) return null;

  const handleDelete = async (id: string, title: string) => {
    if (!onDeleteTransaction) return;
    const confirmDelete = typeof window !== 'undefined' && window.confirm
      ? window.confirm(`Bạn có chắc chắn muốn xóa giao dịch "${title}" trên MongoDB Atlas không?`)
      : true;

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await onDeleteTransaction(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatMoney = (tx: Transaction) => {
    const isIncome = tx.amount > 0 && tx.type === 'income';
    const isContribution = tx.type === 'contribution';
    const isTransfer = tx.type === 'transfer';

    const absVal = Math.abs(tx.amount).toLocaleString('vi-VN');
    if (isIncome) return `+${absVal} đ`;
    if (isContribution) return `+${absVal} đ`;
    if (isTransfer) return `↔ ${absVal} đ`;
    return `-${absVal} đ`;
  };

  const getBadgeConfig = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return { label: 'Thu nhập', bg: '#DCFCE7', text: '#15803D' };
      case 'expense':
        return { label: 'Chi tiêu', bg: '#FEE2E2', text: '#B91C1C' };
      case 'transfer':
        return { label: 'Chuyển tiền', bg: '#CFFAFE', text: '#0891B2' };
      case 'contribution':
        return { label: 'Đóng góp quỹ', bg: '#FEF3C7', text: '#B45309' };
      default:
        return { label: 'Giao dịch', bg: '#F1F5F9', text: '#475569' };
    }
  };

  const getIcon = (tx: Transaction) => {
    if (tx.type === 'transfer') return { icon: ArrowLeftRight, bg: '#E0F2FE', color: '#0284C7' };
    if (tx.type === 'contribution') return { icon: PiggyBank, bg: '#FEF3C7', color: '#D97706' };
    if (tx.iconType === 'shopping') return { icon: ShoppingBag, bg: '#FFEDD5', color: '#EA580C' };
    if (tx.iconType === 'salary') return { icon: Landmark, bg: '#D1FAE5', color: '#059669' };
    if (tx.iconType === 'baby') return { icon: Baby, bg: '#CFFAFE', color: '#0891B2' };
    return { icon: CreditCard, bg: '#F3E8FF', color: '#9333EA' };
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
                  <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                    <FileText size={20} color="#2563EB" strokeWidth={2.2} />
                  </View>
                  <View>
                    <Text style={styles.headerText}>Sao kê & Lịch sử giao dịch</Text>
                    <Text style={styles.headerSub}>
                      {filteredTransactions.length} giao dịch trên MongoDB Atlas
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Time Filter Bar */}
              <View style={styles.timeFilterRow}>
                <Calendar size={14} color="#64748B" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeFilterContainer}>
                  {[
                    { key: 'all', label: 'Tất cả thời gian' },
                    { key: 'today', label: 'Hôm nay' },
                    { key: 'week', label: '7 ngày qua' },
                    { key: 'month', label: 'Tháng này' },
                  ].map((tf) => (
                    <TouchableOpacity
                      key={tf.key}
                      onPress={() => setTimeFilter(tf.key as TimeFilter)}
                      style={[
                        styles.timeChip,
                        timeFilter === tf.key && styles.timeChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          timeFilter === tf.key && styles.timeChipTextActive,
                        ]}
                      >
                        {tf.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Type Filter Tabs */}
              <View style={styles.filterRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                  {[
                    { key: 'all', label: 'Tất cả loại' },
                    { key: 'expense', label: 'Chi tiêu' },
                    { key: 'income', label: 'Thu nhập' },
                    { key: 'transfer', label: 'Chuyển tiền' },
                    { key: 'contribution', label: 'Đóng góp quỹ' },
                  ].map((tab) => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setFilterType(tab.key as any)}
                      style={[styles.filterChip, filterType === tab.key && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, filterType === tab.key && styles.filterChipTextActive]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Transaction List */}
              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {filteredTransactions.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <FileText size={44} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
                    <Text style={styles.emptyText}>
                      Các giao dịch bạn thêm sẽ được lưu trực tiếp vào MongoDB Atlas và hiển thị ở đây.
                    </Text>
                  </View>
                ) : (
                  filteredTransactions.map((tx) => {
                    const badge = getBadgeConfig(tx.type);
                    const iconConfig = getIcon(tx);
                    const IconComp = iconConfig.icon;
                    const isDeletingThis = deletingId === tx.id;

                    return (
                      <View key={tx.id} style={[styles.txItem, isDeletingThis && { opacity: 0.5 }]}>
                        <View style={styles.txLeft}>
                          <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
                            <IconComp size={20} color={iconConfig.color} strokeWidth={2.2} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.txHeaderRow}>
                              <Text style={styles.txTitle} numberOfLines={1}>
                                {tx.title}
                              </Text>
                              <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                                <Text style={[styles.typeBadgeText, { color: badge.text }]}>
                                  {badge.label}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.txMeta}>
                              👤 {tx.user} • 🕒 {tx.date || 'Gần đây'} {tx.time ? `(${tx.time})` : ''}
                            </Text>

                            {tx.type === 'transfer' && (
                              <Text style={styles.transferPath}>
                                ↔ {tx.sourceWalletName || 'Ví nguồn'} → {tx.destinationWalletName || 'Ví đích'}
                              </Text>
                            )}

                            {tx.sourceWalletName && tx.type !== 'transfer' && (
                              <Text style={styles.txWalletName}>
                                💳 Ví: {tx.sourceWalletName}
                              </Text>
                            )}

                            {tx.note && <Text style={styles.txNote}>📝 {tx.note}</Text>}
                          </View>
                        </View>

                        <View style={styles.txRight}>
                          <Text
                            style={[
                              styles.txAmount,
                              {
                                color:
                                  tx.type === 'income' || tx.type === 'contribution'
                                    ? '#059669'
                                    : tx.type === 'transfer'
                                    ? '#0284C7'
                                    : '#0F172A',
                              },
                            ]}
                          >
                            {formatMoney(tx)}
                          </Text>
                          <View style={styles.categoryTag}>
                            <Tag size={10} color="#94A3B8" />
                            <Text style={styles.categoryText}>{tx.category}</Text>
                          </View>

                          {/* Delete Transaction Button */}
                          {onDeleteTransaction && (
                            <TouchableOpacity
                              onPress={() => handleDelete(tx.id, tx.title)}
                              style={styles.deleteBtn}
                              activeOpacity={0.7}
                              disabled={isDeletingThis}
                            >
                              {isDeletingThis ? (
                                <ActivityIndicator size="small" color="#DC2626" />
                              ) : (
                                <>
                                  <Trash2 size={13} color="#DC2626" />
                                  <Text style={styles.deleteBtnText}>Xóa</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
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
    maxHeight: '90%',
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
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  closeButton: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  timeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  timeFilterContainer: {
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  timeChipTextActive: {
    color: '#056839',
    fontWeight: '700',
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#056839',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    gap: 10,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  txHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txMeta: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  txWalletName: {
    fontSize: 11,
    color: '#056839',
    marginTop: 2,
    fontWeight: '600',
  },
  transferPath: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
    marginTop: 3,
  },
  txNote: {
    fontSize: 11.5,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 3,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
