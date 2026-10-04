import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import {
  ArrowLeftRight,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  Home,
  Plus,
  ShieldCheck,
  PiggyBank,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react-native';
import type { FamilyMember } from '../../types';

interface WalletTabProps {
  fundBalance?: number;
  members?: FamilyMember[];
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  fundBalance = 48250000,
  members = [],
  onOpenDeposit,
  onOpenTransfer,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const contributions = [
    {
      id: 'c1',
      name: 'Bố Minh',
      role: 'Quản trị viên',
      amount: 25000000,
      percent: '52%',
      color: '#056839',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    {
      id: 'c2',
      name: 'Mẹ Lan',
      role: 'Quản lý thu chi',
      amount: 20000000,
      percent: '41%',
      color: '#10B981',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    },
    {
      id: 'c3',
      name: 'Quỹ tiết kiệm tích lũy',
      role: 'Quỹ dự phòng chung',
      amount: 3250000,
      percent: '7%',
      color: '#F59E0B',
      avatar: null,
    },
  ];

  const subWallets = [
    {
      id: 'w1',
      title: 'Quỹ chi tiêu gia đình hàng ngày',
      balance: 18500000,
      monthlyLimit: 25000000,
      icon: Home,
      color: '#056839',
    },
    {
      id: 'w2',
      title: 'Quỹ giáo dục & Nuôi dạy con',
      balance: 15200000,
      monthlyLimit: 20000000,
      icon: ShieldCheck,
      color: '#2563EB',
    },
    {
      id: 'w3',
      title: 'Quỹ tiết kiệm khẩn cấp',
      balance: 14550000,
      monthlyLimit: null,
      icon: PiggyBank,
      color: '#EA580C',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Hero Card: QUỸ GIA ĐÌNH CHUNG */}
      <View style={styles.heroCard}>
        <View style={styles.watermark}>
          <Home size={130} color="#FFFFFF" opacity={0.09} strokeWidth={1.5} />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}>
            <View style={styles.badgeRow}>
              <Text style={styles.heroSub}>QUỸ GIA ĐÌNH CHUNG</Text>
              <View style={styles.officialTag}>
                <Text style={styles.officialText}>Quỹ chung chính thức</Text>
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

          <View style={styles.amountRow}>
            <Text style={styles.heroAmount}>
              {showBalance ? formatMoney(fundBalance) : '••••••••'}
            </Text>
            <Text style={styles.currencySymbol}>đ</Text>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.growthRow}>
              <TrendingUp size={14} color="#6EE7B7" />
              <Text style={styles.growthText}>+12.4%</Text>
              <Text style={styles.growthSub}>so với tháng 09</Text>
            </View>

            <TouchableOpacity
              onPress={onOpenDeposit}
              activeOpacity={0.8}
              style={styles.heroDepositBtn}
            >
              <Plus size={14} color="#056839" strokeWidth={3} />
              <Text style={styles.heroDepositBtnText}>Nạp quỹ chung</Text>
            </TouchableOpacity>
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

      {/* 3. Cơ cấu đóng góp Quỹ chung */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nguồn đóng góp vào Quỹ chung</Text>
          <Text style={styles.sectionSubtitle}>Tháng 10/2026</Text>
        </View>

        {/* Progress Bar of contributions */}
        <View style={styles.stackedBar}>
          <View style={[styles.barSegment, { flex: 52, backgroundColor: '#056839' }]} />
          <View style={[styles.barSegment, { flex: 41, backgroundColor: '#10B981' }]} />
          <View style={[styles.barSegment, { flex: 7, backgroundColor: '#F59E0B' }]} />
        </View>

        {/* List of contributors */}
        <View style={styles.contributorList}>
          {contributions.map((c) => (
            <View key={c.id} style={styles.contributorItem}>
              <View style={styles.contributorLeft}>
                {c.avatar ? (
                  <Image source={{ uri: c.avatar }} style={styles.contributorAvatar} />
                ) : (
                  <View style={[styles.contributorAvatarPlaceholder, { backgroundColor: '#FEF3C7' }]}>
                    <PiggyBank size={18} color="#D97706" />
                  </View>
                )}
                <View>
                  <Text style={styles.contributorName}>{c.name}</Text>
                  <Text style={styles.contributorRole}>{c.role}</Text>
                </View>
              </View>

              <View style={styles.contributorRight}>
                <Text style={styles.contributorAmount}>{formatMoney(c.amount)} đ</Text>
                <View style={[styles.percentBadge, { backgroundColor: `${c.color}15` }]}>
                  <Text style={[styles.percentText, { color: c.color }]}>{c.percent}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Các Quỹ & Ví mục đích thành viên */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Các ví mục đích trong nhà</Text>
          <TouchableOpacity onPress={onOpenDeposit}>
            <Text style={styles.seeAllText}>+ Tạo ví mới</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subWalletList}>
          {subWallets.map((w) => {
            const Icon = w.icon;
            return (
              <TouchableOpacity
                key={w.id}
                style={styles.subWalletItem}
                activeOpacity={0.7}
                onPress={onOpenTransfer}
              >
                <View style={[styles.subWalletIconBox, { backgroundColor: `${w.color}15` }]}>
                  <Icon size={20} color={w.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subWalletTitle}>{w.title}</Text>
                  <Text style={styles.subWalletBalance}>{formatMoney(w.balance)} đ</Text>
                  {w.monthlyLimit && (
                    <Text style={styles.subWalletLimit}>
                      Hạn mức: {formatMoney(w.monthlyLimit)} đ/tháng
                    </Text>
                  )}
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingBottom: 110,
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
    right: -15,
    top: -15,
    pointerEvents: 'none',
  },
  heroContent: {
    zIndex: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '800',
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 14,
    marginBottom: 16,
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
  heroDepositBtn: {
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
  heroDepositBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#056839',
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 12,
    color: '#056839',
    fontWeight: '700',
  },
  stackedBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
  },
  barSegment: {
    height: '100%',
  },
  contributorList: {
    gap: 12,
  },
  contributorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  contributorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contributorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contributorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  contributorRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  contributorRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  contributorAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  percentText: {
    fontSize: 10,
    fontWeight: '800',
  },
  subWalletList: {
    gap: 10,
  },
  subWalletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 12,
  },
  subWalletIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subWalletTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  subWalletBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: '#056839',
    marginTop: 2,
  },
  subWalletLimit: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
