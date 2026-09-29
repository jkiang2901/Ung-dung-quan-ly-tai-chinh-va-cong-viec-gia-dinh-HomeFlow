import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LayoutGrid, Wallet, CheckSquare, Users, Plus } from 'lucide-react-native';

export type TabType = 'home' | 'wallet' | 'tasks' | 'family';

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
    { id: 'tasks' as TabType, label: 'Công việc', icon: CheckSquare },
    { id: 'family' as TabType, label: 'Gia đình', icon: Users },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.barContent}>
        {/* Floating Center (+) Action Button */}
        <View style={styles.floatingCenter}>
          <TouchableOpacity
            onPress={onOpenQuickAdd}
            activeOpacity={0.8}
            style={styles.addButton}
          >
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Left Tabs: Home & Wallet */}
        <View style={styles.tabGroup}>
          {tabs.slice(0, 2).map((t) => {
            const IconComp = t.icon;
            const isActive = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => onChangeTab(t.id)}
                activeOpacity={0.7}
                style={styles.tabItem}
              >
                <IconComp
                  size={20}
                  color={isActive ? '#056839' : '#94A3B8'}
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

        {/* Right Tabs: Tasks & Family */}
        <View style={styles.tabGroup}>
          {tabs.slice(2, 4).map((t) => {
            const IconComp = t.icon;
            const isActive = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => onChangeTab(t.id)}
                activeOpacity={0.7}
                style={styles.tabItem}
              >
                <IconComp
                  size={20}
                  color={isActive ? '#056839' : '#94A3B8'}
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
  tabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    fontWeight: '800',
    color: '#056839',
  },
});
