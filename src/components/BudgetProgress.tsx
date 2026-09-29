import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target } from 'lucide-react-native';

interface BudgetProgressProps {
  spent: number;
  totalBudget: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ spent, totalBudget }) => {
  const percentage = Math.round((spent / totalBudget) * 100);
  const remaining = totalBudget - spent;

  const formatShort = (val: number) => {
    return (val / 1000000).toFixed(2) + 'M';
  };

  const formatFull = (val: number) => val.toLocaleString('vi-VN');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Target size={16} color="#056839" />
          </View>
          <Text style={styles.title}>Tiến độ ngân sách chi tiêu</Text>
        </View>
        <Text style={styles.amountText}>
          {formatShort(spent)} / {formatShort(totalBudget)} đ
        </Text>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(percentage, 100)}%` },
          ]}
        />
      </View>

      {/* Footer statistics */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Đã dùng {percentage}% tháng này</Text>
        <Text style={styles.remainingText}>
          Còn {formatFull(remaining)} đ
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarBackground: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    padding: 2,
  },
  progressBarFill: {
    backgroundColor: '#056839',
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
