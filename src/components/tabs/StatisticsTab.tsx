import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  Tag,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDot,
  CheckCircle2,
} from 'lucide-react-native';
import { api, type TransactionStatistics } from '../../services/api';

type StatMode = 'expense' | 'income';
type TimeRangeKey = 'this_month' | 'last_month' | 'all_time';

export const StatisticsTab: React.FC = () => {
  const [statMode, setStatMode] = useState<StatMode>('expense');
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('this_month');
  const [loading, setLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<TransactionStatistics | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getDateRangeParams = useCallback((): { start_date?: string; end_date?: string } => {
    const now = new Date();
    if (timeRange === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
      };
    } else if (timeRange === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
      };
    }
    // all_time
    return {};
  }, [timeRange]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const dates = getDateRangeParams();
      const res = await api.transactions.statistics({
        start_date: dates.start_date,
        end_date: dates.end_date,
        group_by: timeRange === 'all_time' ? 'month' : 'day',
      });

      if (res.success && res.data) {
        setStatsData(res.data);
      } else {
        setErrorMsg('Không thể tải dữ liệu thống kê từ MongoDB Atlas.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  }, [getDateRangeParams, timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const summary = statsData?.summary || {
    total_income: 0,
    total_expense: 0,
    net_income: 0,
    transaction_count: 0,
  };

  const categories =
    statMode === 'expense'
      ? statsData?.by_category || []
      : statsData?.by_income_category || [];

  const totalValue = statMode === 'expense' ? summary.total_expense : summary.total_income;
  const breakdown = statsData?.breakdown || [];

  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header & Live Indicator */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Thống kê tài chính</Text>
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>MongoDB Atlas Trực tuyến</Text>
          </View>
        </View>

        <TouchableOpacity onPress={fetchStats} style={styles.refreshBtn} activeOpacity={0.7}>
          <RefreshCw size={16} color="#056839" />
          <Text style={styles.refreshText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Time Range Selector */}
      <View style={styles.timeRangeBar}>
        <Calendar size={15} color="#64748B" />
        <View style={styles.timeChipsWrapper}>
          {[
            { key: 'this_month', label: 'Tháng này' },
            { key: 'last_month', label: 'Tháng trước' },
            { key: 'all_time', label: 'Toàn bộ thời gian' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setTimeRange(item.key as TimeRangeKey)}
              style={[
                styles.timeChip,
                timeRange === item.key && styles.timeChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeChipText,
                  timeRange === item.key && styles.timeChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. Summary Overview Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryCardLabel}>Tổng thu</Text>
            <View style={[styles.summaryIconBox, { backgroundColor: '#DCFCE7' }]}>
              <ArrowDownLeft size={16} color="#16A34A" strokeWidth={2.5} />
            </View>
          </View>
          <Text style={[styles.summaryAmount, { color: '#16A34A' }]}>
            +{formatMoney(summary.total_income)} đ
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryCardLabel}>Tổng chi</Text>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FEE2E2' }]}>
              <ArrowUpRight size={16} color="#DC2626" strokeWidth={2.5} />
            </View>
          </View>
          <Text style={[styles.summaryAmount, { color: '#DC2626' }]}>
            -{formatMoney(summary.total_expense)} đ
          </Text>
        </View>
      </View>

      {/* Net Income Banner */}
      <View style={styles.netBanner}>
        <View style={styles.netLeft}>
          <Text style={styles.netLabel}>Số dư ròng (Thu - Chi)</Text>
          <Text
            style={[
              styles.netAmount,
              { color: summary.net_income >= 0 ? '#056839' : '#DC2626' },
            ]}
          >
            {summary.net_income >= 0 ? '+' : ''}
            {formatMoney(summary.net_income)} đ
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{summary.transaction_count} giao dịch</Text>
        </View>
      </View>

      {/* 4. Tab Mode Toggle: Chi tiêu vs Thu nhập */}
      <View style={styles.toggleWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toggleBtn, statMode === 'expense' && styles.toggleBtnActiveExpense]}
          onPress={() => setStatMode('expense')}
        >
          <Text style={[styles.toggleText, statMode === 'expense' && styles.toggleTextActive]}>
            💸 Chi tiêu ({categories.length} mục)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toggleBtn, statMode === 'income' && styles.toggleBtnActiveIncome]}
          onPress={() => setStatMode('income')}
        >
          <Text style={[styles.toggleText, statMode === 'income' && styles.toggleTextActive]}>
            💰 Thu nhập ({statMode === 'income' ? categories.length : statsData?.by_income_category?.length || 0} mục)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error notification if any */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      )}

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#056839" />
          <Text style={styles.loadingText}>Đang tải thống kê từ MongoDB Atlas...</Text>
        </View>
      ) : summary.transaction_count === 0 ? (
        /* Empty State */
        <View style={styles.emptyCard}>
          <PieChart size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Chưa có giao dịch thực tế</Text>
          <Text style={styles.emptyDesc}>
            Dữ liệu thống kê được tính toán trực tiếp 100% từ cơ sở dữ liệu MongoDB Atlas. Hãy thực hiện thêm khoản thu chi đầu tiên để thấy báo cáo phân tích tại đây!
          </Text>
        </View>
      ) : (
        <>
          {/* 5. Breakdown Progress Overview */}
          {breakdown.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Diễn biến theo chu kỳ</Text>
                <Text style={styles.sectionSub}>Ghi nhận từ Atlas</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownRow}>
                {breakdown.map((item, idx) => (
                  <View key={idx} style={styles.breakdownCol}>
                    <Text style={styles.breakdownPeriod}>{item.period}</Text>
                    <View style={styles.breakdownBarGroup}>
                      <View
                        style={[
                          styles.barSegment,
                          {
                            height: Math.min(
                              70,
                              Math.max(10, (item.income / (summary.total_income || 1)) * 70)
                            ),
                            backgroundColor: '#16A34A',
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.barSegment,
                          {
                            height: Math.min(
                              70,
                              Math.max(10, (item.expense / (summary.total_expense || 1)) * 70)
                            ),
                            backgroundColor: '#EA580C',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.breakdownCount}>{item.count} GD</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 6. Danh sách phân bổ theo danh mục (Category Breakdown) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {statMode === 'expense' ? 'Cơ cấu chi tiêu' : 'Cơ cấu thu nhập'}
              </Text>
              <Text style={styles.sectionSub}>
                Tổng: {formatMoney(totalValue)} đ
              </Text>
            </View>

            {categories.length === 0 ? (
              <View style={styles.emptyCategoryBox}>
                <Text style={styles.emptyCategoryText}>
                  Chưa có giao dịch {statMode === 'expense' ? 'chi tiêu' : 'thu nhập'} nào trong kỳ này.
                </Text>
              </View>
            ) : (
              <View style={styles.categoryList}>
                {categories.map((cat, idx) => {
                  const barColor = cat.category_color || (statMode === 'expense' ? '#EA580C' : '#056839');
                  return (
                    <View key={cat.category_id || idx} style={styles.catItem}>
                      <View style={styles.catTopRow}>
                        <View style={styles.catNameRow}>
                          <View style={[styles.catColorDot, { backgroundColor: barColor }]} />
                          <Text style={styles.catName}>{cat.category_name}</Text>
                          <Text style={styles.catCount}>({cat.count} lần)</Text>
                        </View>
                        <View style={styles.catAmountRow}>
                          <Text style={styles.catAmount}>{formatMoney(cat.total)} đ</Text>
                          <Text style={styles.catPercentage}>{cat.percentage}%</Text>
                        </View>
                      </View>

                      {/* Percentage Bar */}
                      <View style={styles.percentBarBg}>
                        <View
                          style={[
                            styles.percentBarFill,
                            {
                              width: `${Math.min(100, Math.max(2, cat.percentage))}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#056839',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#056839',
  },
  timeRangeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  timeChipsWrapper: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  timeChipActive: {
    backgroundColor: '#056839',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  summaryIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  netBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  netLeft: {
    gap: 4,
  },
  netLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  netAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 16,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleBtnActiveExpense: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnActiveIncome: {
    backgroundColor: '#056839',
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  loadingBox: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#056839',
  },
  breakdownRow: {
    gap: 16,
    paddingVertical: 8,
  },
  breakdownCol: {
    alignItems: 'center',
    gap: 6,
  },
  breakdownPeriod: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  breakdownBarGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 70,
    width: 28,
    justifyContent: 'center',
  },
  barSegment: {
    width: 10,
    borderRadius: 5,
  },
  breakdownCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryList: {
    gap: 12,
  },
  catItem: {
    gap: 6,
  },
  catTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  catCount: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  catAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  catPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    minWidth: 40,
    textAlign: 'right',
  },
  percentBarBg: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  percentBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyCategoryBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyCategoryText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
