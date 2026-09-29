import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

interface MonthlySummaryProps {
  totalIncome: number;
  totalExpense: number;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ totalIncome, totalExpense }) => {
  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  return (
    <View style={styles.gridContainer}>
      {/* Monthly Income Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Tổng thu tháng</Text>
          <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
            <ArrowDownLeft size={16} color="#059669" strokeWidth={2.5} />
          </View>
        </View>
        <View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountText, { color: '#056839' }]}>
              {formatMoney(totalIncome)}
            </Text>
            <Text style={[styles.currencyText, { color: '#056839' }]}>đ</Text>
          </View>
          <View style={styles.subtextRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.subtext, { color: '#047857' }]}>2 khoản đã vào</Text>
          </View>
        </View>
      </View>

      {/* Monthly Expense Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Chi tiêu tháng</Text>
          <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
            <ArrowUpRight size={16} color="#EA580C" strokeWidth={2.5} />
          </View>
        </View>
        <View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountText, { color: '#EA580C' }]}>
              {formatMoney(totalExpense)}
            </Text>
            <Text style={[styles.currencyText, { color: '#EA580C' }]}>đ</Text>
          </View>
          <View style={styles.subtextRow}>
            <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
            <Text style={[styles.subtext, { color: '#C2410C' }]}>58% kế hoạch</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  amountText: {
    fontSize: 17,
    fontWeight: '800',
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtext: {
    fontSize: 11,
    fontWeight: '600',
  },
});
