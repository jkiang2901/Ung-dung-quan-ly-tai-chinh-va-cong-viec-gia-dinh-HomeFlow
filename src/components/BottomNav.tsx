import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  LayoutGrid,
  Wallet,
  BarChart3,
  CheckSquare,
  Plus,
  Users,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export type TabType = 'home' | 'wallet' | 'statistics' | 'tasks' | 'family';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAdd,
}) => {
  const { colors } = useTheme();

  const leftTabs = [
    { id: 'home' as TabType, label: 'Trang chủ', icon: LayoutGrid },
    { id: 'wallet' as TabType, label: 'Ví tiền', icon: Wallet },
  ];

  const rightTabs = [
    { id: 'statistics' as TabType, label: 'Thống kê', icon: BarChart3 },
    { id: 'tasks' as TabType, label: 'Công việc', icon: CheckSquare },
    { id: 'family' as TabType, label: 'Gia đình', icon: Users },
  ];

  const renderTab = (tab: (typeof leftTabs)[number]) => {
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
          size={20}
          color={isActive ? '#FFFFFF' : '#94A3B8'}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.barContent}>
        <View style={styles.floatingCenter}>
          <TouchableOpacity
            onPress={onOpenQuickAdd}
            activeOpacity={0.8}
            style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
          >
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <View style={styles.tabGroup}>{leftTabs.map(renderTab)}</View>
          <View style={styles.centerSpacer} />
          <View style={styles.tabGroup}>{rightTabs.map(renderTab)}</View>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  floatingCenter: {
    position: 'absolute',
    top: -24,
    left: '50%',
    transform: [{ translateX: -28 }],
    zIndex: 40,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#056839',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F8FAFC',
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  centerSpacer: {
    width: 56,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3,
    paddingVertical: 8,
    borderRadius: 14,
  },
  tabItemActive: {
    backgroundColor: '#056839',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
