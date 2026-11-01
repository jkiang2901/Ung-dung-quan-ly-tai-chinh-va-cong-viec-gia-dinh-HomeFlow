import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Clipboard,
} from 'react-native';
import {
  X,
  UserPlus,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Trash2,
  Link2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import type { FamilyMember, FamilyInvitation, RoleType } from '../../types';
import { api } from '../../services/api';

interface InviteMemberModalProps {
  visible: boolean;
  householdId?: string;
  currentUserEmail: string;
  userRole: RoleType;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  onClose: () => void;
  onSendInvitation: (email: string, role: RoleType) => void;
  onCancelInvitation?: (id: string) => void;
  onInviteLinkGenerated?: (token: string, role: RoleType) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  householdId = 'default-household',
  currentUserEmail,
  userRole,
  members,
  invitations,
  onClose,
  onSendInvitation,
  onCancelInvitation,
  onInviteLinkGenerated,
}) => {
  const [tab, setTab] = useState<'link' | 'email'>('link');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Link invite state
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Reset or create link on open
  useEffect(() => {
    if (visible && userRole === 'OWNER') {
      handleGenerateLink(selectedRole);
    }
  }, [visible, userRole]);

  const handleGenerateLink = async (roleToUse: RoleType) => {
    setIsGenerating(true);
    setError(null);
    setCopied(false);
    try {
      const backendRole = roleToUse === 'VIEWER' ? 'viewer' : 'member';
      const res = await api.households.inviteMember(householdId, {
        role: backendRole,
      });

      if (res.success && res.invite_token) {
        const baseUrl =
          typeof window !== 'undefined' && window.location
            ? `${window.location.origin}${window.location.pathname}`
            : 'https://homeflow.app';
        const fullLink = `${baseUrl}?invite=${res.invite_token}`;
        setGeneratedLink(fullLink);
        if (onInviteLinkGenerated) {
          onInviteLinkGenerated(res.invite_token, roleToUse);
        }
      } else {
        // Fallback token
        const mockToken = `inv_${Date.now()}`;
        const baseUrl =
          typeof window !== 'undefined' && window.location
            ? `${window.location.origin}${window.location.pathname}`
            : 'https://homeflow.app';
        setGeneratedLink(`${baseUrl}?invite=${mockToken}`);
      }
    } catch (err: any) {
      const mockToken = `inv_${Date.now()}`;
      const baseUrl =
        typeof window !== 'undefined' && window.location
          ? `${window.location.origin}${window.location.pathname}`
          : 'https://homeflow.app';
      setGeneratedLink(`${baseUrl}?invite=${mockToken}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(generatedLink);
      } else if (Clipboard && Clipboard.setString) {
        Clipboard.setString(generatedLink);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    if (tab === 'link') {
      handleGenerateLink(role);
    }
  };

  const handleSendEmail = () => {
    setError(null);
    setSuccessMsg(null);

    if (userRole !== 'OWNER') {
      setError('Chỉ Chủ hộ gia đình mới có quyền gửi lời mời.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }

    if (trimmedEmail === currentUserEmail.toLowerCase()) {
      setError('Bạn không thể tự gửi lời mời cho chính mình.');
      return;
    }

    const isAlreadyMember = members.some(
      (m) => m.email && m.email.toLowerCase() === trimmedEmail
    );
    if (isAlreadyMember) {
      setError('Email này đã là thành viên trong gia đình hiện tại.');
      return;
    }

    const isAlreadyPending = invitations.some(
      (inv) => inv.email.toLowerCase() === trimmedEmail && inv.status === 'pending'
    );
    if (isAlreadyPending) {
      setError('Đã có lời mời đang chờ phản hồi cho email này.');
      return;
    }

    onSendInvitation(trimmedEmail, selectedRole);
    setSuccessMsg(`Đã gửi lời mời tới ${trimmedEmail}`);
    setEmail('');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.iconBox}>
                    <UserPlus size={20} color="#056839" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.headerText}>Mời thành viên gia đình</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  onPress={() => setTab('link')}
                  style={[styles.tabBtn, tab === 'link' && styles.tabBtnActive]}
                >
                  <Link2 size={16} color={tab === 'link' ? '#056839' : '#64748B'} />
                  <Text style={[styles.tabText, tab === 'link' && styles.tabTextActive]}>
                    Mời qua liên kết
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTab('email')}
                  style={[styles.tabBtn, tab === 'email' && styles.tabBtnActive]}
                >
                  <Mail size={16} color={tab === 'email' ? '#056839' : '#64748B'} />
                  <Text style={[styles.tabText, tab === 'email' && styles.tabTextActive]}>
                    Mời qua Email
                  </Text>
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

                {userRole !== 'OWNER' ? (
                  <View style={styles.noticeBox}>
                    <ShieldAlert size={16} color="#D97706" />
                    <Text style={styles.noticeText}>
                      Chỉ Chủ Hộ Gia Đình mới có quyền tạo và gửi lời mời thành viên.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.form}>
                    {/* Role Selection */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Vai trò được cấp</Text>
                      <View style={styles.roleChipRow}>
                        <TouchableOpacity
                          onPress={() => handleRoleChange('MEMBER')}
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
                            Thành Viên Gia Đình
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRoleChange('VIEWER')}
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
                            Trẻ Em (Chỉ xem)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Tab 1: Invite Link */}
                    {tab === 'link' ? (
                      <View style={styles.linkContainer}>
                        <Text style={styles.label}>Đường link mời gia nhập</Text>
                        <View style={styles.linkBox}>
                          <TextInput
                            value={generatedLink}
                            editable={false}
                            selectTextOnFocus
                            style={styles.linkInput}
                          />
                          <TouchableOpacity
                            onPress={() => handleGenerateLink(selectedRole)}
                            style={styles.refreshBtn}
                            title="Tạo link mới"
                          >
                            <RefreshCw size={16} color="#64748B" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={handleCopyLink}
                          style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                          activeOpacity={0.8}
                        >
                          {copied ? (
                            <>
                              <Check size={18} color="#FFFFFF" strokeWidth={2.8} />
                              <Text style={styles.copyBtnText}>Đã sao chép liên kết!</Text>
                            </>
                          ) : (
                            <>
                              <Copy size={18} color="#FFFFFF" strokeWidth={2.2} />
                              <Text style={styles.copyBtnText}>Sao chép đường link</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Tab 2: Email Invite */
                      <View style={styles.emailContainer}>
                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>Email người thân (*)</Text>
                          <View style={styles.inputWrapper}>
                            <Mail size={18} color="#056839" style={styles.fieldIcon} />
                            <TextInput
                              placeholder="nhap.email@gmail.com"
                              placeholderTextColor="#94A3B8"
                              value={email}
                              onChangeText={setEmail}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              style={styles.input}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={handleSendEmail}
                          style={styles.sendBtn}
                          activeOpacity={0.8}
                        >
                          <UserPlus size={16} color="#FFFFFF" />
                          <Text style={styles.sendBtnText}>Gửi lời mời</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Invitations List */}
                <View style={styles.invitationSection}>
                  <Text style={styles.sectionTitle}>Lời mời đã gửi</Text>
                  {invitations.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có lời mời nào được gửi.</Text>
                  ) : (
                    invitations.map((inv) => (
                      <View key={inv.id} style={styles.invCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.invEmail}>{inv.email}</Text>
                          <Text style={styles.invMeta}>
                            Vai trò: {inv.role === 'OWNER' ? 'Chủ Hộ' : inv.role === 'MEMBER' ? 'Thành Viên' : 'Trẻ Em'}
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
    backgroundColor: '#ECFDF5',
  },
  headerText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#056839',
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#056839',
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
  roleChipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#056839',
  },
  roleChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  roleChipTitleActive: {
    color: '#056839',
    fontWeight: '800',
  },
  linkContainer: {
    gap: 10,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  linkInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  refreshBtn: {
    padding: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#056839',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  copyBtnSuccess: {
    backgroundColor: '#16A34A',
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emailContainer: {
    gap: 14,
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnText: {
    fontSize: 14,
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
    fontSize: 11,
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
