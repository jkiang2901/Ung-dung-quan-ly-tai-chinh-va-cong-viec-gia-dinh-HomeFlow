import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, FileText, ArrowLeftRight, Landmark, ShoppingBag, Baby, PiggyBank, CreditCard, Tag } from 'lucide-react-native';
import type { Transaction, TransactionType } from '../../types';

interface StatementModalProps {
  visible: boolean;
  transactions: Transaction[];
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  visible,
  transactions,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer' | 'contribution'>('all');

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions;
    return transactions.filter((t) => t.type === filterType);
  }, [transactions, filterType]);

  if (!visible) return null;

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
                    <Text style={styles.headerText}>Sao kê chi tiết giao dịch</Text>
                    <Text style={styles.headerSub}>Tổng số {filteredTransactions.length} giao dịch</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Filter Tabs */}
              <View style={styles.filterRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                  {[
                    { key: 'all', label: 'Tất cả' },
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
                    <FileText size={40} color="#CBD5E1" />
                    <Text style={styles.emptyText}>Chưa có giao dịch nào trong mục này</Text>
                  </View>
                ) : (
                  filteredTransactions.map((tx) => {
                    const badge = getBadgeConfig(tx.type);
                    const iconConfig = getIcon(tx);
                    const IconComp = iconConfig.icon;

                    return (
                      <View key={tx.id} style={styles.txItem}>
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
    maxHeight: '88%',
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
    fontSize: 16,
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
  filterRow: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#056839',
    borderColor: '#056839',
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
    flexGrow: 0,
  },
  bodyContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
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
    fontWeight: '800',
    color: '#0F172A',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  transferPath: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
  txNote: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
