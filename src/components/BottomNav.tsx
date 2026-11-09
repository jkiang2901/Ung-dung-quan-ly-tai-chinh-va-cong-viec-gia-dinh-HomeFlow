import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  LayoutGrid,
  Wallet,
  BadgeDollarSign,
  CheckSquare,
  BarChart3,
  Users,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export type TabType = 'home' | 'wallet' | 'debts' | 'tasks' | 'statistics' | 'family';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAdd?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { colors } = useTheme();

  const tabs = [
    { id: 'home' as TabType, label: 'Trang chủ', icon: LayoutGrid },
    { id: 'wallet' as TabType, label: 'Ví tiền', icon: Wallet },
    { id: 'debts' as TabType, label: 'Công nợ', icon: BadgeDollarSign },
    { id: 'tasks' as TabType, label: 'Công việc', icon: CheckSquare },
    { id: 'statistics' as TabType, label: 'Thống kê', icon: BarChart3 },
    { id: 'family' as TabType, label: 'Gia đình', icon: Users },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.barContent}>
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onChangeTab(tab.id)}
                activeOpacity={0.7}
                style={[
                  styles.tabItem,
                  isActive && [styles.tabItemActive, { backgroundColor: colors.primary }],
                ]}
              >
                <IconComp
                  size={19}
                  color={isActive ? '#FFFFFF' : '#94A3B8'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
  },
  barContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 2,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#056839',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
