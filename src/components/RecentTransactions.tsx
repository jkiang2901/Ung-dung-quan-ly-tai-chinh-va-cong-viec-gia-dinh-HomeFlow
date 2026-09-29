import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Transaction } from '../types';
import { ShoppingBag, Landmark, Baby, CreditCard, Tag } from 'lucide-react-native';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewHistory?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onViewHistory,
}) => {
  const formatMoney = (val: number) => {
    const isIncome = val > 0;
    const absVal = Math.abs(val).toLocaleString('vi-VN');
    return `${isIncome ? '+' : '-'}${absVal} đ`;
  };

  const getIcon = (type: Transaction['iconType']) => {
    switch (type) {
      case 'shopping':
        return {
          icon: ShoppingBag,
          bg: '#FFEDD5',
          color: '#EA580C',
        };
      case 'salary':
        return {
          icon: Landmark,
          bg: '#D1FAE5',
          color: '#059669',
        };
      case 'baby':
        return {
          icon: Baby,
          bg: '#CFFAFE',
          color: '#0891B2',
        };
      default:
        return {
          icon: CreditCard,
          bg: '#F3E8FF',
          color: '#9333EA',
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
        <TouchableOpacity onPress={onViewHistory} activeOpacity={0.7}>
          <Text style={styles.viewHistoryText}>Lịch sử ›</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Items */}
      <View style={styles.txList}>
        {transactions.map((tx) => {
          const iconConfig = getIcon(tx.iconType);
          const IconComp = iconConfig.icon;
          const isIncome = tx.amount > 0;

          return (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txLeft}>
                {/* Category Icon */}
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: iconConfig.bg },
                  ]}
                >
                  <IconComp size={22} color={iconConfig.color} strokeWidth={2.2} />
                </View>

                {/* Details */}
                <View style={styles.txDetails}>
                  <Text style={styles.txTitle} numberOfLines={1}>
                    {tx.title}
                  </Text>
                  <View style={styles.txSubDetails}>
                    <Text style={styles.txUser}>{tx.user}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.txTime}>{tx.time}</Text>
                  </View>
                </View>
              </View>

              {/* Amount & Category label */}
              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: isIncome ? '#059669' : '#0F172A' },
                  ]}
                >
                  {formatMoney(tx.amount)}
                </Text>
                <View style={styles.categoryRow}>
                  <Tag size={12} color="#94A3B8" />
                  <Text style={styles.categoryText}>{tx.category}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    marginBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  viewHistoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  txList: {
    gap: 10,
  },
  txCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  txSubDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  txUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  txTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  txRight: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
