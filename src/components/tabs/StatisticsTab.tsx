import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import {
  Coffee,
  Droplets,
  House,
  Car,
  Sparkles,
  CalendarDays,
  CircleDot,
  PiggyBank,
  Landmark,
  BriefcaseBusiness,
  TrendingUp,
  CircleDollarSign,
  Users,
} from 'lucide-react-native';

type StatMode = 'expense' | 'income';
type DataScope = 'family' | 'personal';

interface StatCategory {
  name: string;
  subtitle: string;
  amount: number;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
}

export const StatisticsTab: React.FC = () => {
  const [statMode, setStatMode] = useState<StatMode>('expense');
  const [dataScope, setDataScope] = useState<DataScope>('family');
  const [showDataScopeModal, setShowDataScopeModal] = useState(false);

  const familyExpenseCategories: StatCategory[] = [
    { name: 'Ăn uống', subtitle: 'Không có kế hoạch', amount: 1200000, icon: Coffee, iconColor: '#A16207', bgColor: '#F7E6A3' },
    { name: 'Sinh hoạt', subtitle: 'Không có kế hoạch', amount: 550000, icon: Droplets, iconColor: '#0369A1', bgColor: '#DDEEFF' },
    { name: 'Con cái', subtitle: 'Không có kế hoạch', amount: 600000, icon: Users, iconColor: '#7C3AED', bgColor: '#E9D5FF' },
    { name: 'Nhà cửa', subtitle: 'Không có kế hoạch', amount: 2400000, icon: House, iconColor: '#A16207', bgColor: '#F7E6A3' },
    { name: 'Khác', subtitle: 'Không có kế hoạch', amount: 700000, icon: CircleDollarSign, iconColor: '#0F766E', bgColor: '#CCFBF1' },
  ];

  const familyIncomeCategories: StatCategory[] = [
    { name: 'Lương', subtitle: 'Không có kế hoạch', amount: 24000000, icon: BriefcaseBusiness, iconColor: '#0F766E', bgColor: '#D1FAE5' },
    { name: 'Khác', subtitle: 'Không có kế hoạch', amount: 3500000, icon: CircleDollarSign, iconColor: '#A16207', bgColor: '#FDE68A' },
  ];

  const personalExpenseCategories: StatCategory[] = [
    { name: 'Ăn uống', subtitle: 'Không có kế hoạch', amount: 480000, icon: Coffee, iconColor: '#A16207', bgColor: '#F7E6A3' },
    { name: 'Sinh hoạt', subtitle: 'Không có kế hoạch', amount: 300000, icon: Droplets, iconColor: '#0369A1', bgColor: '#DDEEFF' },
    { name: 'Nhà cửa', subtitle: 'Không có kế hoạch', amount: 900000, icon: House, iconColor: '#A16207', bgColor: '#F7E6A3' },
    { name: 'Bản thân', subtitle: 'Không có kế hoạch', amount: 450000, icon: Sparkles, iconColor: '#A16207', bgColor: '#F7E6A3' },
    { name: 'Đi lại', subtitle: 'Không có kế hoạch', amount: 520000, icon: Car, iconColor: '#0F766E', bgColor: '#CCFBF1' },
    { name: 'Sức khoẻ', subtitle: 'Không có kế hoạch', amount: 350000, icon: CircleDot, iconColor: '#E11D48', bgColor: '#FFE4E6' },
    { name: 'Con cái', subtitle: 'Không có kế hoạch', amount: 650000, icon: Users, iconColor: '#7C3AED', bgColor: '#E9D5FF' },
    { name: 'Giải trí', subtitle: 'Không có kế hoạch', amount: 280000, icon: Sparkles, iconColor: '#D97706', bgColor: '#FEF3C7' },
    { name: 'Khác', subtitle: 'Không có kế hoạch', amount: 180000, icon: CircleDollarSign, iconColor: '#475569', bgColor: '#E2E8F0' },
  ];

  const personalIncomeCategories: StatCategory[] = [
    { name: 'Lương', subtitle: 'Không có kế hoạch', amount: 12000000, icon: BriefcaseBusiness, iconColor: '#0F766E', bgColor: '#D1FAE5' },
    { name: 'Thưởng', subtitle: 'Không có kế hoạch', amount: 1800000, icon: CircleDollarSign, iconColor: '#A16207', bgColor: '#FDE68A' },
    { name: 'Đầu tư', subtitle: 'Không có kế hoạch', amount: 2500000, icon: TrendingUp, iconColor: '#1D4ED8', bgColor: '#DBEAFE' },
    { name: 'Lãi', subtitle: 'Không có kế hoạch', amount: 300000, icon: PiggyBank, iconColor: '#0F766E', bgColor: '#CCFBF1' },
    { name: 'Kinh doanh', subtitle: 'Không có kế hoạch', amount: 1500000, icon: Landmark, iconColor: '#7C3AED', bgColor: '#E9D5FF' },
    { name: 'Trợ cấp', subtitle: 'Không có kế hoạch', amount: 800000, icon: CircleDollarSign, iconColor: '#0369A1', bgColor: '#DDEEFF' },
    { name: 'Khác', subtitle: 'Không có kế hoạch', amount: 500000, icon: Sparkles, iconColor: '#475569', bgColor: '#E2E8F0' },
  ];

  const categories = useMemo(() => {
    if (dataScope === 'family') {
      return statMode === 'expense' ? familyExpenseCategories : familyIncomeCategories;
    }
    return statMode === 'expense' ? personalExpenseCategories : personalIncomeCategories;
  }, [dataScope, statMode]);

  const totalLabel = statMode === 'expense' ? 'Tổng chi tiêu' : 'Tổng thu nhập';
  const totalValue = categories.reduce((sum, item) => sum + item.amount, 0);
  const totalValueLabel = totalValue.toLocaleString('vi-VN');
  const scopeColor = dataScope === 'personal' ? '#056839' : '#D9468F';
  const scopeTint = dataScope === 'personal' ? '#EAF7F0' : '#FCE7F3';
  const scopeBorder = dataScope === 'personal' ? '#CDEAD9' : '#FBCFE8';

  const chartCols = [0, 20, 40, 60, 80, 100];
  const chartRows = [0, 20, 40, 60, 80, 100];

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Thống kê</Text>
            <Text style={styles.range}>Kỳ: 01/10/26 - 31/10/26</Text>
          </View>

          <View style={styles.scopeControl}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.scopeIconButton, { backgroundColor: scopeTint, borderColor: scopeBorder }]}
              onPress={() => setShowDataScopeModal(true)}
            >
              <Users
                size={22}
                color={scopeColor}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            <Text style={[styles.scopeLabel, { color: scopeColor }]}>
              {dataScope === 'personal' ? 'Cá nhân' : 'Gia đình'}
            </Text>
          </View>
        </View>

        <View style={styles.toggleWrap}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toggleButton, statMode === 'expense' && { backgroundColor: scopeColor }]}
            onPress={() => setStatMode('expense')}
          >
            <Text style={[styles.toggleText, statMode === 'expense' && styles.toggleTextActive]}>
              Chi tiêu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toggleButton, statMode === 'income' && { backgroundColor: scopeColor }]}
            onPress={() => setStatMode('income')}
          >
            <Text style={[styles.toggleText, statMode === 'income' && styles.toggleTextActive]}>
              Thu nhập
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <CircleDot size={12} color="#058A42" fill="#058A42" />
            <Text style={styles.legendText}>Đúng kế hoạch</Text>
          </View>
          <View style={styles.legendItem}>
            <CircleDot size={12} color="#E11D48" fill="#E11D48" />
            <Text style={styles.legendText}>Vượt kế hoạch</Text>
          </View>
          <View style={styles.legendItem}>
            <CircleDot size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.legendText}>Còn lại</Text>
          </View>
        </View>

        <View style={[styles.chartCard, { borderColor: scopeBorder }]}>
          <View style={styles.chartGrid}>
            {chartRows.map((row) => (
              <View key={row} style={styles.gridRow}>
                {chartCols.map((col) => (
                  <View key={`${row}-${col}`} style={styles.gridCell} />
                ))}
              </View>
            ))}

            <View style={styles.chartAxisRow}>
              {[100, 80, 60, 40, 20, 0].map((value) => (
                <Text key={value} style={styles.yAxisLabel}>{value}</Text>
              ))}
            </View>

            <View style={[styles.chartBaseline, { backgroundColor: scopeColor }]} />
            <View style={[styles.chartArea, { backgroundColor: dataScope === 'personal' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(217, 70, 143, 0.10)' }]} />
          </View>

          <View style={styles.xAxisRow}>
            {[1, 8, 16, 24, 31].map((day) => (
              <Text key={day} style={styles.xAxisLabel}>{day}</Text>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: statMode === 'expense' ? '#111827' : scopeColor }]}>{totalLabel}</Text>
            <Text style={[styles.totalValue, { color: statMode === 'expense' ? '#111827' : scopeColor }]}>{totalValueLabel}</Text>
          </View>
        </View>

        <View style={styles.categoryList}>
          {categories.map(({ name, subtitle, amount, icon: Icon, iconColor, bgColor }) => (
            <View key={`${dataScope}-${statMode}-${name}`} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: bgColor }]}>
                  <Icon size={22} color={iconColor} strokeWidth={2.2} />
                </View>
                <View style={styles.categoryTextWrap}>
                  <Text style={styles.categoryName}>{name}</Text>
                  <Text style={styles.categorySub}>{subtitle}</Text>
                </View>
              </View>
              <Text style={styles.categoryAmount}>{amount.toLocaleString('vi-VN')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerActionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.footerAction, { backgroundColor: scopeColor }]}
          >
            <CalendarDays size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.footerActionText}>Xem lịch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showDataScopeModal}
        animationType="fade"
        onRequestClose={() => setShowDataScopeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackdrop}
            onPress={() => setShowDataScopeModal(false)}
          />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Không gian dữ liệu</Text>
            <Text style={styles.modalSubtitle}>
              Đang dùng dữ liệu {dataScope === 'family' ? 'Gia đình' : 'Cá nhân'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.modalMemberCard, dataScope === 'personal' && { backgroundColor: scopeTint, borderColor: scopeBorder }]}
              onPress={() => {
                setDataScope('personal');
                setShowDataScopeModal(false);
              }}
            >
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>C</Text>
              </View>
              <View style={styles.modalMemberInfo}>
                <Text style={styles.modalMemberTitle}>Cá nhân</Text>
                <Text style={styles.modalMemberSubtitle}>Chỉ mình bạn thấy và sử dụng</Text>
              </View>
              {dataScope === 'personal' && <Text style={[styles.modalCheck, { color: scopeColor }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.modalMemberCard, dataScope === 'family' && { backgroundColor: scopeTint, borderColor: scopeBorder }]}
              onPress={() => {
                setDataScope('family');
                setShowDataScopeModal(false);
              }}
            >
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>G</Text>
              </View>
              <View style={styles.modalMemberInfo}>
                <Text style={styles.modalMemberTitle}>Gia đình</Text>
                <Text style={styles.modalMemberSubtitle}>Mọi thành viên cùng sử dụng</Text>
              </View>
              {dataScope === 'family' && <Text style={[styles.modalCheck, { color: scopeColor }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalCloseButton}
              onPress={() => setShowDataScopeModal(false)}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scopeIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF7F0',
    borderWidth: 1,
    borderColor: '#CDEAD9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  scopeControl: {
    alignItems: 'center',
    minWidth: 58,
  },
  scopeLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#2b1d13',
    letterSpacing: -0.7,
  },
  range: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7b6a59',
    marginTop: 4,
  },
  memberControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 20,
    color: '#5B3A28',
    fontWeight: '700',
  },
  memberBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#D6D3D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  switchWrap: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 22,
    padding: 6,
    marginBottom: 12,
  },
  switchButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#056839',
  },
  switchText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
  switchTextActive: {
    color: '#FFFFFF',
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 22,
    padding: 6,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#056839',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  legendText: {
    fontSize: 11,
    color: '#5B6575',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#F5F5F4',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D7DCE3',
    overflow: 'hidden',
  },
  chartCardIncome: {
    borderColor: '#A7F3D0',
  },
  chartGrid: {
    position: 'relative',
    height: 180,
    borderWidth: 1,
    borderColor: '#C7D2D9',
    borderTopWidth: 0,
    borderRightWidth: 0,
    backgroundColor: '#F1F5F9',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C8D0D8',
  },
  gridCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#C8D0D8',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chartAxisRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  chartBaseline: {
    position: 'absolute',
    left: 30,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: '#059669',
  },
  chartArea: {
    position: 'absolute',
    left: 30,
    right: 0,
    bottom: 0,
    top: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 32,
    paddingTop: 10,
    paddingBottom: 4,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B3A28',
  },
  totalLabelIncome: {
    color: '#056839',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  totalValueIncome: {
    color: '#056839',
  },
  categoryList: {
    marginTop: 18,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextWrap: {
    flexShrink: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  categorySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerActionRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#056839',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  footerActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#5B6575',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  modalOptionRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalOptionPill: {
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalInfoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B6575',
    letterSpacing: 0.8,
  },
  modalInfoAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5B3A28',
  },
  modalMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalMemberCardSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F3F0',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#B6D7CB',
  },
  modalAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7E6A3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B3A28',
  },
  modalMemberInfo: {
    flex: 1,
  },
  modalMemberTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalMemberSubtitle: {
    fontSize: 12,
    color: '#5B6575',
    marginTop: 2,
  },
  modalCheck: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F9D5A',
  },
  modalCloseButton: {
    marginTop: 18,
    backgroundColor: '#5B3A28',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
