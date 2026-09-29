import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff, TrendingUp, Home } from 'lucide-react-native';

interface FamilyFundCardProps {
  balance: number;
}

export const FamilyFundCard: React.FC<FamilyFundCardProps> = ({ balance }) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  return (
    <View style={styles.cardContainer}>
      {/* Decorative background watermark */}
      <View style={styles.watermark}>
        <Home size={140} color="#FFFFFF" opacity={0.08} />
      </View>

      {/* Top section: Title badge & Hide/Show toggle */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeTitle}>QUỸ GIA ĐÌNH CHUNG</Text>
          <View style={styles.officialTag}>
            <Text style={styles.officialText}>Chính thức</Text>
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
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {showBalance ? formatMoney(balance) : '••••••••'}
          </Text>
          <Text style={styles.currencySymbol}>đ</Text>
        </View>
      </View>

      {/* Bottom info stats pills */}
      <View style={styles.bottomRow}>
        <View style={styles.statPill}>
          <TrendingUp size={14} color="#6EE7B7" />
          <Text style={styles.statHighlight}>+12.4%</Text>
          <Text style={styles.statSubtext}>so với tháng 09</Text>
        </View>

        <View style={styles.statPill}>
          <Text style={styles.statSubtext}>3 nguồn đóng góp</Text>
        </View>
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
    right: -20,
    top: -20,
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
  badgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#A7F3D0',
  },
  officialTag: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
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
    marginTop: 16,
    marginBottom: 20,
    zIndex: 1,
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
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6EE7B7',
  },
  statSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#D1FAE5',
  },
});
