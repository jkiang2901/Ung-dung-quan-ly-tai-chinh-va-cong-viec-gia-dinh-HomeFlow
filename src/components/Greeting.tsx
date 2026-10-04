import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface GreetingProps {
  userName?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ userName = 'bạn' }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          Chào {userName}! 👋
        </Text>
        <Text style={styles.subtitle}>
          Gia đình Hạnh Phúc <Text style={styles.dot}>•</Text> Tháng 10 ấm no
        </Text>
      </View>

      {/* Pill with family photos preview */}
      <View style={styles.pillContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120' }}
          style={styles.avatar}
        />
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' }}
          style={[styles.avatar, styles.avatarOverlap]}
        />
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>+1</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  dot: {
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarOverlap: {
    marginLeft: -8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tagBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#056839',
  },
});
