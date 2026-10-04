import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  LayoutGrid,
  Wallet,
  BarChart3,
  CheckSquare,
  Plus,
} from 'lucide-react-native';

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
  const tabs = [
    { id: 'home' as TabType, label: 'Trang chủ', icon: LayoutGrid },
    { id: 'wallet' as TabType, label: 'Ví tiền', icon: Wallet },
    { id: 'statistics' as TabType, label: 'Thống kê', icon: BarChart3 },
    { id: 'tasks' as TabType, label: 'Công việc', icon: CheckSquare },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.barContent}>
        <View style={styles.floatingCenter}>
          <TouchableOpacity
            onPress={onOpenQuickAdd}
            activeOpacity={0.8}
            style={styles.addButton}
          >
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((t) => {
            const IconComp = t.icon;
            const isActive = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => onChangeTab(t.id)}
                activeOpacity={0.7}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <IconComp
                  size={20}
                  color={isActive ? '#FFFFFF' : '#94A3B8'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {t.label}
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
    gap: 6,
    paddingLeft: 6,
    paddingRight: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flex: 1,
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
