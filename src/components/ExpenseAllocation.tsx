import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MONTHLY_EXPENSES, WEEKLY_EXPENSES } from '../mockData';

export const ExpenseAllocation: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const data = period === 'month' ? MONTHLY_EXPENSES : WEEKLY_EXPENSES;

  let cumulativePercent = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.card}>
      {/* Top Header & Toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Phân bổ chi tiêu</Text>
          <Text style={styles.subtitle}>
            {period === 'month' ? 'Tháng 10/2023' : 'Tuần này'}
          </Text>
        </View>

        {/* Toggle Pill */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setPeriod('month')}
            activeOpacity={0.7}
            style={[
              styles.toggleButton,
              period === 'month' && styles.toggleActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                period === 'month' && styles.toggleTextActive,
              ]}
            >
              Tháng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPeriod('week')}
            activeOpacity={0.7}
            style={[
              styles.toggleButton,
              period === 'week' && styles.toggleActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                period === 'week' && styles.toggleTextActive,
              ]}
            >
              Tuần
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Grid: Chart Left, Legend Right */}
      <View style={styles.body}>
        {/* Left: Donut Chart */}
        <View style={styles.chartWrapper}>
          <Svg width={120} height={120} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
            {data.map((cat, idx) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;

              return (
                <Circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={14}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </Svg>
          {/* Inner Donut Center Label */}
          <View style={styles.chartCenter}>
            <Text style={styles.centerSubtext}>Hạng mục</Text>
            <Text style={styles.centerMainText}>{data.length} mục</Text>
          </View>
        </View>

        {/* Right: Legend Breakdown List */}
        <View style={styles.legendList}>
          {data.map((cat, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>
                  {cat.name}
                </Text>
              </View>
              <Text style={styles.legendPercent}>{cat.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#0F172A',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chartWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  centerMainText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  legendList: {
    flex: 1,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
});
