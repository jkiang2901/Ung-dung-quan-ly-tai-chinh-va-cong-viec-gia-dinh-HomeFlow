import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import type { FamilyMember, RoleType } from '../../types';
import { UserPlus, ShieldCheck, Heart, UserCheck } from 'lucide-react-native';

interface FamilyTabProps {
  members: FamilyMember[];
  userRole?: RoleType;
  onOpenInviteModal?: () => void;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  members,
  userRole = 'OWNER',
  onOpenInviteModal,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Thành Viên Gia Đình</Text>
          <Text style={styles.subtitle}>
            Tổ ấm: Gia đình Hạnh Phúc ({members.length} người)
          </Text>
        </View>
        <TouchableOpacity
          onPress={onOpenInviteModal}
          style={styles.inviteButton}
          activeOpacity={0.8}
        >
          <UserPlus size={14} color="#FFFFFF" />
          <Text style={styles.inviteText}>Mời người thân</Text>
        </TouchableOpacity>
      </View>

      {/* Family Banner Card */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerIconBox}>
          <Heart size={24} color="#FDA4AF" fill="#FDA4AF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Gia Đình Hạnh Phúc</Text>
          <Text style={styles.bannerSubtitle}>
            Đồng hành tài chính & sẻ chia việc nhà mỗi ngày
          </Text>
        </View>
      </View>

      {/* Members List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danh sách thành viên ({members.length})</Text>
        <View style={styles.memberList}>
          {members.map((m) => (
            <View key={m.id} style={styles.memberCard}>
              <View style={styles.memberLeft}>
                <Image source={{ uri: m.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  {m.email && <Text style={styles.memberEmail}>{m.email}</Text>}
                  <View style={styles.roleRow}>
                    <ShieldCheck size={14} color="#056839" />
                    <Text style={styles.roleText}>{m.roleLabel || m.role}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.roleTagBox}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        m.role === 'OWNER'
                          ? '#ECFDF5'
                          : m.role === 'MEMBER'
                          ? '#EFF6FF'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      {
                        color:
                          m.role === 'OWNER'
                            ? '#056839'
                            : m.role === 'MEMBER'
                            ? '#2563EB'
                            : '#D97706',
                      },
                    ]}
                  >
                    {m.role}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Rules & Roles Info */}
      <View style={styles.infoBox}>
        <View style={styles.infoTitleRow}>
          <ShieldCheck size={16} color="#056839" />
          <Text style={styles.infoTitle}>Phân quyền theo vai trò (Role Permission)</Text>
        </View>
        <Text style={styles.infoBullet}>
          • <Text style={{ fontWeight: '800', color: '#056839' }}>OWNER (Bố Minh)</Text>: Toàn quyền quản lý ví, thêm/sửa/xóa ví, nạp quỹ, chuyển tiền, cài đặt hạn mức, mời người thân và xem sao kê.
        </Text>
        <Text style={styles.infoBullet}>
          • <Text style={{ fontWeight: '800', color: '#2563EB' }}>MEMBER (Mẹ Lan)</Text>: Được xem ví, tạo thu chi, thực hiện chuyển tiền nếu được cấp quyền. Không quản lý ví hay phân quyền.
        </Text>
        <Text style={styles.infoBullet}>
          • <Text style={{ fontWeight: '800', color: '#D97706' }}>VIEWER (Bé Bi)</Text>: Chỉ xem thông tin ví và sao kê. Không thể tạo hay chỉnh sửa bất kỳ ví hay giao dịch nào.
        </Text>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#056839',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#056839',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerIconBox: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D1FAE5',
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  memberList: {
    gap: 10,
  },
  memberCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  memberEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTagBox: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  infoBullet: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});
