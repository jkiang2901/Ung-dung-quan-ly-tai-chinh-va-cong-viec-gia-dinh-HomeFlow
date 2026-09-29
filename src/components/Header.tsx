import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Bell, Home } from 'lucide-react-native';
import type { FamilyMember } from '../types';

interface HeaderProps {
  members: FamilyMember[];
  subtitle?: string;
  onOpenNotifications?: () => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  members,
  subtitle = 'Trang Chủ',
  onOpenNotifications,
  onLogoClick,
}) => {
  return (
    <View style={styles.header}>
      {/* Brand & Logo */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onLogoClick}
        style={styles.brandContainer}
      >
        <View style={styles.logoBox}>
          <Home size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View>
          <Text style={styles.brandTitle}>HomeFlow</Text>
          <Text style={styles.brandSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>

      {/* Right Actions: Notifications & Avatars */}
      <View style={styles.rightActions}>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onOpenNotifications}
          style={styles.bellButton}
          activeOpacity={0.7}
        >
          <Bell size={20} color="#334155" />
          <View style={styles.unreadDot} />
        </TouchableOpacity>

        {/* Member Avatars Stack */}
        <View style={styles.avatarStack}>
          {members.slice(0, 2).map((member, index) => (
            <Image
              key={member.id}
              source={{ uri: member.avatar }}
              style={[
                styles.avatar,
                index > 0 && { marginLeft: -8 },
              ]}
            />
          ))}
          {members.length > 2 && (
            <View style={[styles.avatarMore, { marginLeft: -8 }]}>
              <Text style={styles.avatarMoreText}>+{members.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#056839',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#056839',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: -2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#056839',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
