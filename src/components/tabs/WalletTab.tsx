import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import {
  ArrowLeftRight,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  Home,
  Plus,
  PiggyBank,
  Eye,
  EyeOff,
  Landmark,
  Banknote,
  Smartphone,
  CreditCard,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import type { FamilyMember, Wallet, Transaction, RoleType } from '../../types';

interface WalletTabProps {
  fundBalance: number;
  wallets: Wallet[];
  transactions: Transaction[];
  members: FamilyMember[];
  userRole: RoleType;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
  onOpenAddWallet: () => void;
  onOpenEditWallet: (wallet: Wallet) => void;
  onOpenDeleteWallet: (wallet: Wallet) => void;
  onOpenStatement: () => void;
  onOpenBudgetLimits: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  fundBalance,
  wallets,
  transactions,
  members,
  userRole,
  onOpenDeposit,
  onOpenTransfer,
  onOpenAddWallet,
  onOpenEditWallet,
  onOpenDeleteWallet,
  onOpenStatement,
  onOpenBudgetLimits,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  // 1. Tính toán thực tế Nguồn đóng góp vào Quỹ chung từ các giao dịch type = 'contribution'
  const contributorMap = new Map<string, number>();

  transactions.forEach((tx) => {
    if (tx.type === 'contribution') {
      const contributorName = tx.user || 'Thành viên';
      const current = contributorMap.get(contributorName) || 0;
      contributorMap.set(contributorName, current + Math.abs(tx.amount));
    }
  });

  let totalContribAmount = Array.from(contributorMap.values()).reduce((a, b) => a + b, 0);
  if (totalContribAmount === 0) totalContribAmount = fundBalance > 0 ? fundBalance : 1;

  const contributorColors = ['#056839', '#10B981', '#F59E0B', '#2563EB', '#8B5CF6'];

  const dynamicContributions = Array.from(contributorMap.entries()).map(([name, amount], index) => {
    const percentNum = Math.round((amount / totalContribAmount) * 100);
    const matchedMember = members.find(
      (m) => m.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(m.name.toLowerCase())
    );
    return {
      id: `contrib-${index}`,
      name,
      role: matchedMember?.roleLabel || 'Nguồn đóng góp gia đình',
      amount,
      percent: `${percentNum}%`,
      percentValue: percentNum,
      color: contributorColors[index % contributorColors.length],
      avatar: matchedMember?.avatar || null,
    };
  });

  const activeWallets = wallets.filter((w) => w.active);
  const totalWalletBalance = activeWallets.reduce((sum, w) => sum + w.balance, 0);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'Ngân hàng':
        return { icon: Landmark, color: '#2563EB', bg: '#EFF6FF' };
      case 'Tiền mặt':
        return { icon: Banknote, color: '#056839', bg: '#ECFDF5' };
      case 'Ví điện tử':
        return { icon: Smartphone, color: '#EA580C', bg: '#FFF7ED' };
      case 'Tiết kiệm':
        return { icon: PiggyBank, color: '#D97706', bg: '#FEF3C7' };
      case 'Quỹ chung':
        return { icon: Home, color: '#056839', bg: '#D1FAE5' };
      default:
        return { icon: CreditCard, color: '#9333EA', bg: '#F3E8FF' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Hero Card: QUỸ GIA ĐÌNH CHUNG (GIỮ NGUYÊN STYLE) */}
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
              <Text style={styles.growthSub}>so với tháng trước</Text>
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
          onPress={onOpenBudgetLimits}
          activeOpacity={0.8}
          style={styles.actionCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED', borderColor: '#FFD8A8' }]}>
            <SlidersHorizontal size={20} color="#EA580C" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Cài đặt hạn mức</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenStatement}
          activeOpacity={0.8}
          style={styles.actionCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <FileText size={20} color="#2563EB" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Sao kê chi tiết</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Cơ cấu đóng góp Quỹ chung (TÍNH TỶ LỆ THỰC TẾ) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nguồn đóng góp vào Quỹ chung</Text>
          <Text style={styles.sectionSubtitle}>Tháng 10/2026</Text>
        </View>

        {/* Progress Bar of contributions */}
        <View style={styles.stackedBar}>
          {dynamicContributions.map((c) => (
            <View
              key={c.id}
              style={[
                styles.barSegment,
                { flex: Math.max(1, c.percentValue), backgroundColor: c.color },
              ]}
            />
          ))}
        </View>

        {/* List of contributors */}
        <View style={styles.contributorList}>
          {dynamicContributions.map((c) => (
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

      {/* 4. Quản lý hệ thống các Ví tiền */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Danh sách ví tiền ({activeWallets.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Tổng tiền khả dụng: {formatMoney(totalWalletBalance)} đ
            </Text>
          </View>
          {userRole !== 'VIEWER' && (
            <TouchableOpacity onPress={onOpenAddWallet} style={styles.addWalletBtn}>
              <Plus size={14} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.addWalletBtnText}>Thêm ví</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.subWalletList}>
          {activeWallets.map((w) => {
            const iconConfig = getWalletIcon(w.type);
            const IconComp = iconConfig.icon;

            return (
              <View key={w.id} style={styles.walletItemCard}>
                <View style={[styles.subWalletIconBox, { backgroundColor: iconConfig.bg }]}>
                  <IconComp size={20} color={iconConfig.color} strokeWidth={2.2} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.walletTitleRow}>
                    <Text style={styles.subWalletTitle}>{w.name}</Text>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>{w.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.subWalletBalance}>{formatMoney(w.balance)} đ</Text>
                  <Text style={styles.subWalletOwner}>Chủ sở hữu: {w.ownerName}</Text>
                </View>

                {/* Actions: Edit & Delete */}
                {userRole !== 'VIEWER' && (
                  <View style={styles.actionButtonsCol}>
                    <TouchableOpacity
                      onPress={() => onOpenEditWallet(w)}
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                    >
                      <Edit2 size={16} color="#056839" />
                    </TouchableOpacity>

                    {w.type !== 'Quỹ chung' && (
                      <TouchableOpacity
                        onPress={() => onOpenDeleteWallet(w)}
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
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
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  addWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#056839',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addWalletBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
  walletItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subWalletIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subWalletTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  typeTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  subWalletBalance: {
    fontSize: 15,
    fontWeight: '900',
    color: '#056839',
    marginTop: 2,
  },
  subWalletOwner: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
