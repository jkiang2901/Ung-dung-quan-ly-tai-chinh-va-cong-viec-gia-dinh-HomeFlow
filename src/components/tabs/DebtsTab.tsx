import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Share2,
  User,
  Wallet as WalletIcon,
  Phone,
} from 'lucide-react-native';
import type { DebtItem, Wallet, DebtType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { AddDebtModal } from '../modals/AddDebtModal';
import { PayDebtModal } from '../modals/PayDebtModal';

interface DebtsTabProps {
  debts: DebtItem[];
  wallets: Wallet[];
  onAddDebt: (data: {
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
  onPayDebt: (data: {
    debtId: string;
    amount: number;
    note?: string;
    walletId?: string;
    affectWallet?: boolean;
  }) => void;
  onDeleteDebt: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const DebtsTab: React.FC<DebtsTabProps> = ({
  debts,
  wallets,
  onAddDebt,
  onPayDebt,
  onDeleteDebt,
  onShowToast,
}) => {
  const { colors } = useTheme();
  const [filterType, setFilterType] = useState<'all' | 'lend' | 'borrow' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [payTargetDebt, setPayTargetDebt] = useState<DebtItem | null>(null);

  const formatMoney = (val: number) => {
    return (val || 0).toLocaleString('vi-VN');
  };

  // Tính tổng số tiền cần thu (Cho vay) và phải trả (Đi vay)
  const activeDebts = debts.filter((d) => d.status !== 'completed');
  const totalLendRemaining = activeDebts
    .filter((d) => d.type === 'lend')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalBorrowRemaining = activeDebts
    .filter((d) => d.type === 'borrow')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const netBalance = totalLendRemaining - totalBorrowRemaining;

  // Lọc danh sách nợ
  const filteredDebts = debts.filter((d) => {
    if (filterType === 'lend' && d.type !== 'lend') return false;
    if (filterType === 'borrow' && d.type !== 'borrow') return false;
    if (filterType === 'completed' && d.status !== 'completed') return false;
    if (filterType !== 'completed' && d.status === 'completed' && filterType !== 'all') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = d.personName.toLowerCase().includes(q);
      const matchNote = (d.note || '').toLowerCase().includes(q);
      const matchPhone = (d.phoneNumber || '').includes(q);
      if (!matchName && !matchNote && !matchPhone) return false;
    }

    return true;
  });

  // Sao chép tin nhắn nhắc nợ vào clipboard
  const handleCopyReminder = (debt: DebtItem) => {
    const isLend = debt.type === 'lend';
    const message = isLend
      ? `Chào ${debt.personName}, mình nhắn bạn thông tin khoản vay ${formatMoney(debt.amount)} đ (còn lại ${formatMoney(debt.remainingAmount)} đ)${debt.dueDate ? `, hạn trả ngày ${debt.dueDate}` : ''}. Khi nào thuận tiện bạn chuyển khoản lại giúp mình nhé! Cảm ơn bạn.`
      : `Chào ${debt.personName}, mình xác nhận khoản vay ${formatMoney(debt.amount)} đ (còn nợ ${formatMoney(debt.remainingAmount)} đ)${debt.dueDate ? `, hẹn trả ngày ${debt.dueDate}` : ''}. Mình sẽ thu xếp gửi lại bạn sớm nhé!`;

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message);
      onShowToast('📋 Đã sao chép tin nhắn nhắc nợ vào clipboard!');
    } else {
      onShowToast('📋 Lời nhắn: ' + message.slice(0, 60) + '...');
    }
  };

  const handleDeleteConfirm = (debt: DebtItem) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa khoản công nợ của "${debt.personName}"?`)) {
        onDeleteDebt(debt.id);
      }
    } else {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa khoản nợ của "${debt.personName}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: () => onDeleteDebt(debt.id) },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Overview Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <HandCoins size={14} color={colors.primary} />
            <Text style={[styles.heroBadgeText, { color: colors.primary }]}>SỔ CÔNG NỢ TÀI CHÍNH</Text>
          </View>
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            style={styles.heroAddBtn}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.primary} strokeWidth={3} />
            <Text style={[styles.heroAddBtnText, { color: colors.primary }]}>Thêm nợ</Text>
          </TouchableOpacity>
        </View>

        {/* Net Balance */}
        <View style={styles.netBalanceBox}>
          <Text style={styles.netBalanceLabel}>Chênh lệch công nợ ròng</Text>
          <View style={styles.netBalanceAmountRow}>
            <Text style={styles.netBalanceAmount}>
              {netBalance >= 0 ? `+${formatMoney(netBalance)}` : `-${formatMoney(Math.abs(netBalance))}`}
            </Text>
            <Text style={styles.netBalanceUnit}>đ</Text>
          </View>
          <Text style={styles.netBalanceSub}>
            {netBalance >= 0
              ? '🟢 Tiền người khác nợ bạn nhiều hơn tiền bạn đang nợ'
              : '🔴 Tiền bạn đang nợ nhiều hơn tiền bạn cho vay'}
          </Text>
        </View>

        {/* 2 Mini Stats Columns */}
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStatCard}>
            <View style={styles.miniStatHeader}>
              <View style={[styles.miniStatIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <ArrowUpRight size={14} color="#6EE7B7" strokeWidth={2.5} />
              </View>
              <Text style={styles.miniStatTitle}>Cần thu (Cho vay)</Text>
            </View>
            <Text style={styles.miniStatAmount}>{formatMoney(totalLendRemaining)} đ</Text>
            <Text style={styles.miniStatCount}>
              {debts.filter((d) => d.type === 'lend' && d.status !== 'completed').length} khoản chưa thu
            </Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={styles.miniStatHeader}>
              <View style={[styles.miniStatIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <ArrowDownLeft size={14} color="#FCA5A5" strokeWidth={2.5} />
              </View>
              <Text style={styles.miniStatTitle}>Phải trả (Đi vay)</Text>
            </View>
            <Text style={styles.miniStatAmount}>{formatMoney(totalBorrowRemaining)} đ</Text>
            <Text style={styles.miniStatCount}>
              {debts.filter((d) => d.type === 'borrow' && d.status !== 'completed').length} khoản phải trả
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên người, số điện thoại, lý do..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setFilterType('all')}
            style={[styles.filterPill, filterType === 'all' && [styles.filterPillActive, { backgroundColor: colors.primary }]]}
          >
            <Text style={[styles.filterPillText, filterType === 'all' && styles.filterPillTextActive]}>
              Tất cả ({debts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterType('lend')}
            style={[styles.filterPill, filterType === 'lend' && styles.filterPillActiveLend]}
          >
            <Text style={[styles.filterPillText, filterType === 'lend' && styles.filterPillTextActiveLend]}>
              🟢 Cần thu ({debts.filter((d) => d.type === 'lend').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterType('borrow')}
            style={[styles.filterPill, filterType === 'borrow' && styles.filterPillActiveBorrow]}
          >
            <Text style={[styles.filterPillText, filterType === 'borrow' && styles.filterPillTextActiveBorrow]}>
              🔴 Phải trả ({debts.filter((d) => d.type === 'borrow').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterType('completed')}
            style={[styles.filterPill, filterType === 'completed' && styles.filterPillActiveCompleted]}
          >
            <Text style={[styles.filterPillText, filterType === 'completed' && styles.filterPillTextActiveCompleted]}>
              ✓ Đã xong ({debts.filter((d) => d.status === 'completed').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Debts List */}
      <View style={styles.listSection}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>
            Danh sách công nợ ({filteredDebts.length})
          </Text>
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            style={styles.inlineAddBtn}
          >
            <Plus size={14} color="#056839" strokeWidth={2.5} />
            <Text style={styles.inlineAddBtnText}>Thêm mới</Text>
          </TouchableOpacity>
        </View>

        {filteredDebts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <HandCoins size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có khoản công nợ nào</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? 'Không tìm thấy kết quả phù hợp với từ khóa.'
                : 'Ghi lại các khoản tiền cho bạn bè, người thân vay mượn để tránh bị quên.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={() => setAddModalVisible(true)}
                style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.emptyActionBtnText}>Tạo khoản nợ đầu tiên</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredDebts.map((item) => {
            const isLend = item.type === 'lend';
            const isCompleted = item.status === 'completed';
            const percentPaid = item.amount > 0 ? Math.min(100, Math.round((item.paidAmount / item.amount) * 100)) : 0;

            return (
              <View key={item.id} style={styles.debtCard}>
                {/* Card Top: Type badge & Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: isLend ? '#ECFDF5' : '#FEF2F2' },
                      ]}
                    >
                      {isLend ? (
                        <ArrowUpRight size={13} color="#056839" strokeWidth={2.5} />
                      ) : (
                        <ArrowDownLeft size={13} color="#DC2626" strokeWidth={2.5} />
                      )}
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: isLend ? '#056839' : '#DC2626' },
                        ]}
                      >
                        {isLend ? 'Tôi Cho Vay' : 'Tôi Đi Vay'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isCompleted
                          ? styles.statusCompleted
                          : item.paidAmount > 0
                          ? styles.statusPartial
                          : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isCompleted
                            ? styles.statusCompletedText
                            : item.paidAmount > 0
                            ? styles.statusPartialText
                            : styles.statusPendingText,
                        ]}
                      >
                        {isCompleted
                          ? '✓ Đã xong'
                          : item.paidAmount > 0
                          ? `Đã trả ${percentPaid}%`
                          : 'Chưa trả'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteConfirm(item)}
                    style={styles.deleteIconBtn}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Person Info */}
                <View style={styles.personRow}>
                  <View style={[styles.avatarCircle, { backgroundColor: isLend ? '#D1FAE5' : '#FEE2E2' }]}>
                    <User size={18} color={isLend ? '#056839' : '#DC2626'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{item.personName}</Text>
                    {item.phoneNumber ? (
                      <View style={styles.phoneRow}>
                        <Phone size={12} color="#64748B" />
                        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Amount Details */}
                <View style={styles.amountBox}>
                  <View style={styles.amountCol}>
                    <Text style={styles.amountSubLabel}>Số nợ gốc</Text>
                    <Text style={styles.amountBaseVal}>{formatMoney(item.amount)} đ</Text>
                  </View>

                  <View style={styles.amountCol}>
                    <Text style={styles.amountSubLabel}>Đã thanh toán</Text>
                    <Text style={styles.amountPaidVal}>{formatMoney(item.paidAmount)} đ</Text>
                  </View>

                  <View style={[styles.amountCol, styles.amountColRemaining]}>
                    <Text style={styles.amountSubLabel}>Còn lại phải trả</Text>
                    <Text
                      style={[
                        styles.amountRemainingVal,
                        { color: isCompleted ? '#059669' : isLend ? '#056839' : '#DC2626' },
                      ]}
                    >
                      {formatMoney(item.remainingAmount)} đ
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${percentPaid}%`,
                        backgroundColor: isCompleted ? '#059669' : isLend ? '#056839' : '#EA580C',
                      },
                    ]}
                  />
                </View>

                {/* Meta Details: Due date, Note, Wallet */}
                <View style={styles.metaRow}>
                  {item.dueDate ? (
                    <View style={styles.metaItem}>
                      <Calendar size={13} color="#64748B" />
                      <Text style={styles.metaText}>Hạn: {item.dueDate}</Text>
                    </View>
                  ) : null}

                  {item.walletName ? (
                    <View style={styles.metaItem}>
                      <WalletIcon size={13} color="#64748B" />
                      <Text style={styles.metaText}>{item.walletName}</Text>
                    </View>
                  ) : null}

                  {item.startDate ? (
                    <View style={styles.metaItem}>
                      <Clock size={13} color="#64748B" />
                      <Text style={styles.metaText}>Tạo: {item.startDate}</Text>
                    </View>
                  ) : null}
                </View>

                {item.note ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>"{item.note}"</Text>
                  </View>
                ) : null}

                {/* Action Buttons Row */}
                {!isCompleted && (
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => setPayTargetDebt(item)}
                      style={[
                        styles.primaryActionBtn,
                        { backgroundColor: isLend ? '#056839' : '#DC2626' },
                      ]}
                      activeOpacity={0.8}
                    >
                      <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.primaryActionBtnText}>
                        {isLend ? 'Thu nợ' : 'Trả nợ'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleCopyReminder(item)}
                      style={styles.secondaryActionBtn}
                      activeOpacity={0.8}
                    >
                      <Share2 size={15} color="#475569" />
                      <Text style={styles.secondaryActionBtnText}>Nhắc nợ</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Add Debt Modal */}
      <AddDebtModal
        visible={addModalVisible}
        wallets={wallets}
        onClose={() => setAddModalVisible(false)}
        onSubmit={onAddDebt}
      />

      {/* Pay Debt Modal */}
      <PayDebtModal
        visible={payTargetDebt !== null}
        debt={payTargetDebt}
        wallets={wallets}
        onClose={() => setPayTargetDebt(null)}
        onSubmit={onPayDebt}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#056839',
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  heroAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  heroAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  netBalanceBox: {
    marginVertical: 4,
  },
  netBalanceLabel: {
    fontSize: 12,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  netBalanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 2,
  },
  netBalanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  netBalanceUnit: {
    fontSize: 18,
    fontWeight: '800',
    color: '#A7F3D0',
  },
  netBalanceSub: {
    fontSize: 11,
    color: '#E2E8F0',
    marginTop: 2,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 10,
  },
  miniStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  miniStatIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStatTitle: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  miniStatAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  miniStatCount: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 2,
  },
  searchSection: {
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  clearSearch: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 6,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#056839',
  },
  filterPillActiveLend: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#056839',
  },
  filterPillActiveBorrow: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  filterPillActiveCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#059669',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillTextActiveLend: {
    color: '#056839',
    fontWeight: '700',
  },
  filterPillTextActiveBorrow: {
    color: '#DC2626',
    fontWeight: '700',
  },
  filterPillTextActiveCompleted: {
    color: '#059669',
    fontWeight: '700',
  },
  listSection: {
    gap: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  inlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
  },
  inlineAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#056839',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#056839',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  debtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPartial: {
    backgroundColor: '#EFF6FF',
  },
  statusCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPendingText: {
    color: '#D97706',
  },
  statusPartialText: {
    color: '#2563EB',
  },
  statusCompletedText: {
    color: '#059669',
  },
  deleteIconBtn: {
    padding: 6,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneNumber: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  amountBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountCol: {
    flex: 1,
    gap: 2,
  },
  amountColRemaining: {
    alignItems: 'flex-end',
  },
  amountSubLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  amountBaseVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  amountPaidVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  amountRemainingVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noteText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#056839',
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});

