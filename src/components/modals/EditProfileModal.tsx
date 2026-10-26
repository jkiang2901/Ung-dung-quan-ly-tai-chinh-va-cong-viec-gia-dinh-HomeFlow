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
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, User, Phone, Image as ImageIcon, Check, Globe, Shield } from 'lucide-react-native';
import type { AuthUser } from '../../types';
import { api } from '../../services/api';

interface EditProfileModalProps {
  visible: boolean;
  currentUser: AuthUser | null;
  onClose: () => void;
  onProfileUpdated: (updatedUser: AuthUser) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentUser,
  onClose,
  onProfileUpdated,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatar || PRESET_AVATARS[0]);
      setTimezone(currentUser.timezone || 'Asia/Ho_Chi_Minh');
      setErrorMsg(null);
    }
  }, [currentUser, visible]);

  if (!visible || !currentUser) return null;

  const handleSave = async () => {
    setErrorMsg(null);
    if (!displayName.trim()) {
      setErrorMsg('Tên hiển thị không được để trống.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.updateProfile({
        display_name: displayName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        timezone: timezone.trim() || 'Asia/Ho_Chi_Minh',
      });

      if (res.success && res.user) {
        const updated: AuthUser = {
          ...currentUser,
          name: res.user.display_name,
          phone: res.user.phone || undefined,
          avatar: res.user.avatar_url || currentUser.avatar,
          timezone: res.user.timezone || 'Asia/Ho_Chi_Minh',
        };
        onProfileUpdated(updated);
        onClose();
      } else {
        setErrorMsg(res.message || 'Cập nhật thông tin thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối tới máy chủ MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconBox}>
                    <User size={20} color="#056839" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Cập nhật thông tin cá nhân</Text>
                    <Text style={styles.headerSubtitle}>Lưu trữ trên MongoDB Atlas</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                  </View>
                )}

                {/* Avatar Preview & Preset Selection */}
                <View style={styles.avatarSection}>
                  <Image source={{ uri: avatarUrl || PRESET_AVATARS[0] }} style={styles.avatarPreview} />
                  <Text style={styles.sectionLabel}>Chọn ảnh đại diện</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetList}>
                    {PRESET_AVATARS.map((uri, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setAvatarUrl(uri)}
                        activeOpacity={0.8}
                        style={[
                          styles.presetItem,
                          avatarUrl === uri && styles.presetItemActive,
                        ]}
                      >
                        <Image source={{ uri }} style={styles.presetImg} />
                        {avatarUrl === uri && (
                          <View style={styles.checkBadge}>
                            <Check size={10} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Form Fields */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email tài khoản</Text>
                  <View style={[styles.inputWrapper, styles.inputDisabled]}>
                    <Shield size={18} color="#94A3B8" />
                    <TextInput
                      value={currentUser.email}
                      editable={false}
                      style={[styles.input, { color: '#64748B' }]}
                    />
                  </View>
                  <Text style={styles.helperText}>Email dùng để đăng nhập và không thể thay đổi.</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Tên hiển thị <Text style={styles.req}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#056839" />
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Nhập họ và tên hoặc biệt danh"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={18} color="#056839" />
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="09xx xxx xxx"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Múi giờ</Text>
                  <View style={styles.inputWrapper}>
                    <Globe size={18} color="#056839" />
                    <TextInput
                      value={timezone}
                      onChangeText={setTimezone}
                      placeholder="Asia/Ho_Chi_Minh"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Đường dẫn ảnh đại diện (Tùy chọn)</Text>
                  <View style={styles.inputWrapper}>
                    <ImageIcon size={18} color="#056839" />
                    <TextInput
                      value={avatarUrl}
                      onChangeText={setAvatarUrl}
                      placeholder="https://..."
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.cancelBtn}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveBtn, loading && { opacity: 0.8 }]}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                    )}
                  </TouchableOpacity>
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
    maxHeight: '90%',
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
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#056839',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#056839',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetList: {
    gap: 10,
    paddingVertical: 4,
  },
  presetItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  presetItemActive: {
    borderColor: '#056839',
  },
  presetImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#056839',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  req: {
    color: '#DC2626',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    paddingLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#056839',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
