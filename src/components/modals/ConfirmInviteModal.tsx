import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Home, ShieldCheck, UserCheck, X, Check, Users } from 'lucide-react-native';

export interface InvitationInfo {
  token: string;
  household_id: string;
  household_name: string;
  currency?: string;
  members_count?: number;
  invited_by_name: string;
  role: string;
  role_label: string;
  expires_at?: string;
}

interface ConfirmInviteModalProps {
  visible: boolean;
  loading?: boolean;
  invitationInfo: InvitationInfo | null;
  onConfirm: () => void;
  onReject: () => void;
}

export const ConfirmInviteModal: React.FC<ConfirmInviteModalProps> = ({
  visible,
  loading = false,
  invitationInfo,
  onConfirm,
  onReject,
}) => {
  if (!visible || !invitationInfo) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onReject}>
      <TouchableWithoutFeedback onPress={onReject}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.card}>
              {/* Header Icon */}
              <View style={styles.topIconBox}>
                <View style={styles.iconCircle}>
                  <Users size={32} color="#056839" strokeWidth={2.2} />
                </View>
              </View>

              <Text style={styles.title}>Lời mời gia nhập gia đình</Text>

              {/* Household Detail Box */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gia đình:</Text>
                  <Text style={styles.householdName}>{invitationInfo.household_name}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Người mời:</Text>
                  <Text style={styles.infoValue}>{invitationInfo.invited_by_name}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vai trò được cấp:</Text>
                  <View style={styles.roleBadge}>
                    <ShieldCheck size={14} color="#056839" />
                    <Text style={styles.roleBadgeText}>{invitationInfo.role_label}</Text>
                  </View>
                </View>
              </View>

              {/* Confirmation Prompt */}
              <View style={styles.promptBox}>
                <Text style={styles.promptQuestion}>
                  Bạn có đồng ý tham gia vào gia đình này không?
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={onReject}
                  style={styles.rejectBtn}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rejectBtnText}>Từ chối</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={styles.confirmBtn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                      <Text style={styles.confirmBtnText}>Đồng ý tham gia</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  topIconBox: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  householdName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#056839',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#056839',
  },
  promptBox: {
    marginBottom: 20,
    width: '100%',
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#056839',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
