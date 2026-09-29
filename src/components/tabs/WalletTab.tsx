import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import {
  ArrowLeftRight,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  Building,
} from 'lucide-react-native';

interface WalletTabProps {
  fundBalance?: number;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  onOpenDeposit,
  onOpenTransfer,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Hero Card: TỔNG GIÁ TRỊ RÒNG TÍCH LŨY */}
      <View style={styles.heroCard}>
        <View style={styles.watermark}>
          <Building size={80} color="#FFFFFF" opacity={0.12} strokeWidth={1.5} />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroSub}>TỔNG GIÁ TRỊ RÒNG TÍCH LŨY</Text>

          <View style={styles.amountRow}>
            <Text style={styles.heroAmount}>128.500.000</Text>
            <Text style={styles.currencySymbol}>đ</Text>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.growthRow}>
              <TrendingUp size={14} color="#6EE7B7" />
              <Text style={styles.growthText}>+4.2%</Text>
              <Text style={styles.growthSub}>so với tháng trước</Text>
            </View>

            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>5 Ví hoạt động</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Quick Action Buttons Row */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          onPress={onOpenTransfer}
          activeOpacity={0.8}
          style={styles.actionCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <ArrowLeftRight size={20} color="#056839" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Chuyển tiền nội bộ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenDeposit}
          activeOpacity={0.8}
          style={styles.actionCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED', borderColor: '#FFD8A8' }]}>
            <SlidersHorizontal size={20} color="#EA580C" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Cài đặt hạn mức</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenDeposit}
          activeOpacity={0.8}
          style={styles.actionCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <FileText size={20} color="#2563EB" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Sao kê chi tiết</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  heroCard: {
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
    right: 10,
    top: 10,
  },
  heroContent: {
    zIndex: 1,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#A7F3D0',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
  },
  heroAmount: {
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
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6EE7B7',
  },
  growthSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#D1FAE5',
  },
  activeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D1FAE5',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
});
