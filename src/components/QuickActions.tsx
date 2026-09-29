import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PiggyBank, ReceiptText, ArrowLeftRight, QrCode } from 'lucide-react-native';

interface QuickActionsProps {
  onDeposit: () => void;
  onAddExpense: () => void;
  onTransfer: () => void;
  onScanQR: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onDeposit,
  onAddExpense,
  onTransfer,
  onScanQR,
}) => {
  const actions = [
    {
      id: 'deposit',
      label: 'Nộp quỹ',
      icon: PiggyBank,
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      iconColor: '#056839',
      onClick: onDeposit,
    },
    {
      id: 'add_expense',
      label: 'Thêm chi',
      icon: ReceiptText,
      bgColor: '#FFF7ED',
      borderColor: '#FFD8A8',
      iconColor: '#EA580C',
      onClick: onAddExpense,
    },
    {
      id: 'transfer',
      label: 'Chuyển ví',
      icon: ArrowLeftRight,
      bgColor: '#ECFEFF',
      borderColor: '#A5F3FC',
      iconColor: '#0891B2',
      onClick: onTransfer,
    },
    {
      id: 'scan_qr',
      label: 'Quét mã',
      icon: QrCode,
      bgColor: '#F3E8FF',
      borderColor: '#E9D5FF',
      iconColor: '#9333EA',
      onClick: onScanQR,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
      <View style={styles.grid}>
        {actions.map((act) => {
          const IconComponent = act.icon;
          return (
            <TouchableOpacity
              key={act.id}
              onPress={act.onClick}
              activeOpacity={0.7}
              style={styles.actionCard}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: act.bgColor, borderColor: act.borderColor },
                ]}
              >
                <IconComponent size={24} color={act.iconColor} strokeWidth={2.2} />
              </View>
              <Text style={styles.actionLabel}>{act.label}</Text>
            </TouchableOpacity>
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
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
});
