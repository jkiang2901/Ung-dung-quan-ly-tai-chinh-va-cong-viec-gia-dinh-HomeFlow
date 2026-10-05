import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, UserPlus, Mail, ShieldAlert, CheckCircle2, Clock, Trash2 } from 'lucide-react-native';
import type { FamilyMember, FamilyInvitation, RoleType } from '../../types';

interface InviteMemberModalProps {
  visible: boolean;
  currentUserEmail: string;
  userRole: RoleType;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  onClose: () => void;
  onSendInvitation: (email: string, role: RoleType) => void;
  onCancelInvitation?: (id: string) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  currentUserEmail,
  userRole,
  members,
  invitations,
  onClose,
  onSendInvitation,
  onCancelInvitation,
}) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!visible) return null;

  const handleSend = () => {
    setError(null);
    setSuccessMsg(null);

    if (userRole !== 'OWNER') {
      setError('Chỉ Quản trị viên (OWNER) mới có quyền gửi lời mời gia nhập gia đình.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }

    // 1. Không tự mời chính mình
    if (trimmedEmail === currentUserEmail.toLowerCase()) {
      setError('Bạn không thể tự gửi lời mời cho chính mình.');
      return;
    }

    // 2. Không mời người đã là thành viên
    const isAlreadyMember = members.some(
      (m) => m.email && m.email.toLowerCase() === trimmedEmail
    );
    if (isAlreadyMember) {
      setError('Email này đã là thành viên trong gia đình hiện tại.');
      return;
    }

    // 3. Không tạo nhiều invitation pending cho cùng một người
    const isAlreadyPending = invitations.some(
      (inv) => inv.email.toLowerCase() === trimmedEmail && inv.status === 'pending'
    );
    if (isAlreadyPending) {
      setError('Đã có lời mời đang chờ phản hồi (pending) cho email này.');
      return;
    }

    onSendInvitation(trimmedEmail, selectedRole);
    setSuccessMsg(`Đã gửi lời mời tới ${trimmedEmail} thành công!`);
    setEmail('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                    <UserPlus size={20} color="#056839" strokeWidth={2.2} />
                  </View>
                  <View>
                    <Text style={styles.headerText}>Mời người thân gia nhập</Text>
                    <Text style={styles.headerSub}>Gửi lời mời qua Email tới thành viên mới</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {error && (
                  <View style={styles.errorBox}>
                    <ShieldAlert size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {successMsg && (
                  <View style={styles.successBox}>
                    <CheckCircle2 size={16} color="#056839" />
                    <Text style={styles.successText}>{successMsg}</Text>
                  </View>
                )}

                {userRole !== 'OWNER' && (
                  <View style={styles.noticeBox}>
                    <ShieldAlert size={16} color="#D97706" />
                    <Text style={styles.noticeText}>
                      Tài khoản của bạn ({userRole}) không có quyền gửi lời mời. Chỉ Bố Minh (OWNER) mới có quyền mời thành viên mới.
                    </Text>
                  </View>
                )}

                {/* Invite Form */}
                {userRole === 'OWNER' && (
                  <View style={styles.form}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Email người thân (*)</Text>
                      <View style={styles.inputWrapper}>
                        <Mail size={18} color="#056839" style={styles.fieldIcon} />
                        <TextInput
                          placeholder="VD: uncle.nam@gmail.com"
                          placeholderTextColor="#94A3B8"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Vai trò được cấp</Text>
                      <View style={styles.roleChipRow}>
                        <TouchableOpacity
                          onPress={() => setSelectedRole('MEMBER')}
                          style={[
                            styles.roleChip,
                            selectedRole === 'MEMBER' && styles.roleChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleChipTitle,
                              selectedRole === 'MEMBER' && styles.roleChipTitleActive,
                            ]}
                          >
                            MEMBER (Thành viên)
                          </Text>
                          <Text
                            style={[
                              styles.roleChipSub,
                              selectedRole === 'MEMBER' && styles.roleChipSubActive,
                            ]}
                          >
                            Thêm thu chi & chuyển tiền
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setSelectedRole('VIEWER')}
                          style={[
                            styles.roleChip,
                            selectedRole === 'VIEWER' && styles.roleChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleChipTitle,
                              selectedRole === 'VIEWER' && styles.roleChipTitleActive,
                            ]}
                          >
                            VIEWER (Người xem)
                          </Text>
                          <Text
                            style={[
                              styles.roleChipSub,
                              selectedRole === 'VIEWER' && styles.roleChipSubActive,
                            ]}
                          >
                            Chỉ xem thông tin ví
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleSend}
                      style={styles.sendBtn}
                      activeOpacity={0.8}
                    >
                      <UserPlus size={16} color="#FFFFFF" />
                      <Text style={styles.sendBtnText}>Tạo & gửi lời mời</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Invitations List */}
                <View style={styles.invitationSection}>
                  <Text style={styles.sectionTitle}>Danh sách lời mời đã tạo</Text>
                  {invitations.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có lời mời nào được gửi.</Text>
                  ) : (
                    invitations.map((inv) => (
                      <View key={inv.id} style={styles.invCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.invEmail}>{inv.email}</Text>
                          <Text style={styles.invMeta}>
                            Role: <Text style={{ fontWeight: '700' }}>{inv.role}</Text> • Ngày gửi: {inv.createdAt}
                          </Text>
                        </View>

                        <View style={styles.invRight}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  inv.status === 'accepted'
                                    ? '#DCFCE7'
                                    : inv.status === 'rejected'
                                    ? '#FEE2E2'
                                    : '#FEF3C7',
                              },
                            ]}
                          >
                            <Clock size={10} color={inv.status === 'accepted' ? '#15803D' : '#B45309'} />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    inv.status === 'accepted'
                                      ? '#15803D'
                                      : inv.status === 'rejected'
                                      ? '#B91C1C'
                                      : '#B45309',
                                },
                              ]}
                            >
                              {inv.status.toUpperCase()}
                            </Text>
                          </View>

                          {userRole === 'OWNER' && inv.status === 'pending' && onCancelInvitation && (
                            <TouchableOpacity
                              onPress={() => onCancelInvitation(inv.id)}
                              style={styles.cancelInvBtn}
                            >
                              <Trash2 size={14} color="#DC2626" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 30,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#056839',
    flex: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
    flex: 1,
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  roleChipRow: {
    gap: 8,
  },
  roleChip: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#056839',
  },
  roleChipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  roleChipTitleActive: {
    color: '#056839',
  },
  roleChipSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roleChipSubActive: {
    color: '#047857',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#056839',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  invitationSection: {
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  invCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  invMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  invRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cancelInvBtn: {
    padding: 6,
  },
});
