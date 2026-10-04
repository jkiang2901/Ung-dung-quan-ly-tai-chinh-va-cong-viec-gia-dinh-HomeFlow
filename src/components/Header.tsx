import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Bell, Home, LogOut } from 'lucide-react-native';
import type { FamilyMember, AuthUser } from '../types';

interface HeaderProps {
  members: FamilyMember[];
  currentUser?: AuthUser | null;
  subtitle?: string;
  onOpenNotifications?: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onOpenFamily?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  members,
  currentUser,
  subtitle = 'Trang Chủ',
  onOpenNotifications,
  onLogoClick,
  onLogout,
  onOpenFamily,
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

      {/* Right Actions: Notifications, Current User & Logout */}
      <View style={styles.rightActions}>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onOpenNotifications}
          style={styles.bellButton}
          activeOpacity={0.7}
        >
          <Bell size={19} color="#334155" />
          <View style={styles.unreadDot} />
        </TouchableOpacity>

        {/* Current user avatar — bấm vào để xem màn hình Gia đình */}
        {currentUser ? (
          <View style={styles.userProfilePill}>
            <TouchableOpacity
              onPress={onOpenFamily}
              activeOpacity={0.8}
              style={styles.avatarButton}
            >
              <Image
                source={{ uri: currentUser.avatar }}
                style={styles.userAvatar}
              />
            </TouchableOpacity>
            {onLogout && (
              <TouchableOpacity
                onPress={onLogout}
                style={styles.logoutButton}
                activeOpacity={0.7}
              >
                <LogOut size={15} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
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
          </View>
        )}
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
  userProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 3,
    paddingRight: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#056839',
  },
  logoutButton: {
    padding: 5,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  avatarButton: {
    borderRadius: 16,
  },
});
