import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff, User, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react-native';

interface PersonalWalletCardProps {
  userName?: string;
  balance: number;
  familyFundBalance: number;
  onGoToFamilyFund?: () => void;
  onDepositToFund?: () => void;
}

export const PersonalWalletCard: React.FC<PersonalWalletCardProps> = ({
  userName = 'Cá nhân',
  balance,
  familyFundBalance,
  onGoToFamilyFund,
  onDepositToFund,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  return (
    <View style={styles.cardContainer}>
      {/* Decorative background watermark */}
      <View style={styles.watermark}>
        <Wallet size={130} color="#FFFFFF" opacity={0.08} />
      </View>

      {/* Top section: Title badge & Hide/Show toggle */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.userBadge}>
            <User size={13} color="#056839" strokeWidth={2.5} />
            <Text style={styles.userBadgeText}>VÍ CÁ NHÂN • {userName.toUpperCase()}</Text>
          </View>
          <View style={styles.officialTag}>
            <Text style={styles.officialText}>Tài khoản riêng</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowBalance(!showBalance)}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          {showBalance ? (
            <Eye size={16} color="#A7F3D0" />
          ) : (
            <EyeOff size={16} color="#A7F3D0" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Balance Display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {showBalance ? formatMoney(balance) : '••••••••'}
          </Text>
          <Text style={styles.currencySymbol}>đ</Text>
        </View>
      </View>

      {/* Action & Family Fund linkage */}
      <View style={styles.bottomRow}>
        {/* Link to Family Fund */}
        <TouchableOpacity
          onPress={onGoToFamilyFund}
          activeOpacity={0.8}
          style={styles.fundPill}
        >
          <View style={styles.fundIconCircle}>
            <ShieldCheck size={13} color="#056839" />
          </View>
          <View>
            <Text style={styles.fundSubLabel}>Quỹ chung gia đình</Text>
            <Text style={styles.fundAmountText}>
              {formatMoney(familyFundBalance)} đ
            </Text>
          </View>
          <ArrowUpRight size={14} color="#6EE7B7" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Quick Deposit to Fund */}
        {onDepositToFund && (
          <TouchableOpacity
            onPress={onDepositToFund}
            activeOpacity={0.8}
            style={styles.depositButton}
          >
            <Text style={styles.depositButtonText}>+ Góp quỹ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 24,
    backgroundColor: '#056839',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  watermark: {
    position: 'absolute',
    right: -15,
    top: -15,
    pointerEvents: 'none',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#056839',
    letterSpacing: 0.5,
  },
  officialTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  officialText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  eyeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  balanceContainer: {
    marginTop: 14,
    marginBottom: 16,
    zIndex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A7F3D0',
    textDecorationLine: 'underline',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },
  fundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  fundIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundSubLabel: {
    fontSize: 10,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  fundAmountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  depositButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  depositButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#056839',
  },
});
