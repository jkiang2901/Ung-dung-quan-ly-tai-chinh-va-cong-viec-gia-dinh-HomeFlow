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
  Switch,
} from 'react-native';
import {
  X,
  User,
  Phone,
  Image as ImageIcon,
  Check,
  Globe,
  Shield,
  Sliders,
  EyeOff,
  Wallet as WalletIcon,
  Palette,
  BellRing,
  CheckSquare,
} from 'lucide-react-native';
import type { AuthUser, Wallet, UserPreferences, ThemeColor } from '../../types';
import { DEFAULT_USER_PREFERENCES } from '../../types';
import { api } from '../../services/api';
import { useTheme, THEMES } from '../../context/ThemeContext';

interface EditProfileModalProps {
  visible: boolean;
  currentUser: AuthUser | null;
  wallets?: Wallet[];
  preferences?: UserPreferences;
  onClose: () => void;
  onProfileUpdated: (updatedUser: AuthUser) => void;
  onPreferencesUpdated?: (prefs: UserPreferences) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

const THEME_OPTIONS: { id: ThemeColor; name: string; color: string; desc: string }[] = [
  { id: 'green', name: 'Xanh Emerald', color: '#056839', desc: 'Thịnh vượng & Gắn kết' },
  { id: 'blue', name: 'Xanh Sapphire', color: '#2563EB', desc: 'Hiện đại & Thanh lịch' },
  { id: 'orange', name: 'Cam Hoàng Hôn', color: '#EA580C', desc: 'Ấm áp & Tươi sáng' },
  { id: 'purple', name: 'Tím Thạch Anh', color: '#7C3AED', desc: 'Sang trọng & Tinh tế' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentUser,
  wallets = [],
  preferences = DEFAULT_USER_PREFERENCES,
  onClose,
  onProfileUpdated,
  onPreferencesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  // Preferences States
  const [hideBalanceDefault, setHideBalanceDefault] = useState(preferences.hideBalanceDefault);
  const [selectedWalletId, setSelectedWalletId] = useState(preferences.defaultWalletId || '');
  const [themeColor, setThemeColor] = useState<ThemeColor>(preferences.themeColor || 'green');
  const [budgetAlerts, setBudgetAlerts] = useState(preferences.budgetAlerts);
  const [notifyDailyTasks, setNotifyDailyTasks] = useState(preferences.notifyDailyTasks);
  const [taskFilterMyOnly, setTaskFilterMyOnly] = useState(preferences.taskFilterMyOnly);

  const { colors: ctxColors } = useTheme();
  // Use locally-selected theme for live preview; fall back to context colors
  const previewColors = THEMES[themeColor] || ctxColors;

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

  useEffect(() => {
    if (preferences) {
      setHideBalanceDefault(preferences.hideBalanceDefault);
      setSelectedWalletId(preferences.defaultWalletId || '');
      setThemeColor(preferences.themeColor || 'green');
      setBudgetAlerts(preferences.budgetAlerts);
      setNotifyDailyTasks(preferences.notifyDailyTasks);
      setTaskFilterMyOnly(preferences.taskFilterMyOnly);
    }
  }, [preferences, visible]);

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

        // Update preferences
        const updatedPrefs: UserPreferences = {
          hideBalanceDefault,
          defaultWalletId: selectedWalletId || undefined,
          themeColor,
          currency: 'VND',
          notifyDailyTasks,
          taskFilterMyOnly,
          budgetAlerts,
        };
        if (onPreferencesUpdated) {
          onPreferencesUpdated(updatedPrefs);
        }

        onClose();
      } else {
        setErrorMsg(res.message || 'Cập nhật thông tin thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const activeWallets = wallets.filter((w) => w.active);

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
                    <User size={20} color={previewColors.primary} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.headerTitle}>Hồ sơ & Cá nhân hóa</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Navigation Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  onPress={() => setActiveTab('profile')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'profile' && {
                      borderBottomColor: previewColors.primary,
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                >
                  <User size={16} color={activeTab === 'profile' ? previewColors.primary : '#64748B'} />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'profile' && { color: previewColors.primary },
                    ]}
                  >
                    Hồ sơ cá nhân
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab('preferences')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'preferences' && {
                      borderBottomColor: previewColors.primary,
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                >
                  <Sliders size={16} color={activeTab === 'preferences' ? previewColors.primary : '#64748B'} />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'preferences' && { color: previewColors.primary },
                    ]}
                  >
                    Cài đặt cá nhân hóa
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                  </View>
                )}

                {/* TAB 1: PROFILE */}
                {activeTab === 'profile' ? (
                  <View style={styles.tabContent}>
                    {/* Avatar Preview & Preset Selection */}
                    <View style={styles.avatarSection}>
              <Image
                source={{ uri: avatarUrl || PRESET_AVATARS[0] }}
                style={[styles.avatarPreview, { borderColor: previewColors.primary }]}
              />
                      <Text style={styles.sectionLabel}>Chọn ảnh đại diện</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetList}>
                        {PRESET_AVATARS.map((uri, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => setAvatarUrl(uri)}
                            activeOpacity={0.8}
                            style={[
                              styles.presetItem,
                              avatarUrl === uri && { borderColor: previewColors.primary },
                            ]}
                          >
                            <Image source={{ uri }} style={styles.presetImg} />
                            {avatarUrl === uri && (
                              <View style={[styles.checkBadge, { backgroundColor: previewColors.primary }]}>
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
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Tên hiển thị (*)</Text>
                      <View style={styles.inputWrapper}>
                        <User size={18} color={previewColors.primary} />
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
                        <Phone size={18} color={previewColors.primary} />
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
                        <Globe size={18} color={previewColors.primary} />
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
                        <ImageIcon size={18} color={previewColors.primary} />
                        <TextInput
                          value={avatarUrl}
                          onChangeText={setAvatarUrl}
                          placeholder="https://..."
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  /* TAB 2: PREFERENCES */
                  <View style={styles.tabContent}>
                    {/* Privacy Section */}
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeaderRow}>
                        <EyeOff size={18} color={previewColors.primary} />
                        <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
                      </View>
                      <View style={styles.preferenceRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={styles.prefTitle}>Mặc định ẩn số tiền</Text>
                          <Text style={styles.prefDesc}>
                            Tự động ẩn số dư (•••••• đ) khi mở app để bảo mật ở nơi đông người
                          </Text>
                        </View>
                        <Switch
                          value={hideBalanceDefault}
                          onValueChange={setHideBalanceDefault}
                          trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                          thumbColor={hideBalanceDefault ? previewColors.primary : '#CBD5E1'}
                        />
                      </View>
                    </View>

                    {/* Default Wallet Section */}
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeaderRow}>
                        <WalletIcon size={18} color={previewColors.primary} />
                        <Text style={styles.sectionTitle}>Ví thanh toán ưu tiên</Text>
                      </View>
                      <Text style={styles.prefDesc}>
                        Tự động chọn sẵn ví này khi thêm chi tiêu hoặc thu nhập mới
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                        {activeWallets.map((w) => (
                          <TouchableOpacity
                            key={w.id}
                            onPress={() => setSelectedWalletId(w.id === selectedWalletId ? '' : w.id)}
                            style={[
                              styles.walletChip,
                              selectedWalletId === w.id && {
                                backgroundColor: previewColors.primary,
                                borderColor: previewColors.primary,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.walletChipText,
                                selectedWalletId === w.id && styles.walletChipTextActive,
                              ]}
                            >
                              {w.name}
                            </Text>
                            {selectedWalletId === w.id && (
                              <Check size={14} color="#FFFFFF" strokeWidth={3} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Theme Color Section */}
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeaderRow}>
                        <Palette size={18} color={previewColors.primary} />
                        <Text style={styles.sectionTitle}>Màu sắc chủ đạo</Text>
                      </View>
                      <View style={styles.themeGrid}>
                        {THEME_OPTIONS.map((t) => (
                          <TouchableOpacity
                            key={t.id}
                            onPress={() => setThemeColor(t.id)}
                            style={[
                              styles.themeCard,
                              themeColor === t.id && { borderColor: t.color, backgroundColor: `${t.color}08` },
                            ]}
                          >
                            <View style={[styles.colorDot, { backgroundColor: t.color }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.themeName, themeColor === t.id && { color: t.color }]}>
                                {t.name}
                              </Text>
                            </View>
                            {themeColor === t.id && (
                              <Check size={16} color={t.color} strokeWidth={3} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Notifications & Tasks Section */}
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeaderRow}>
                        <BellRing size={18} color={previewColors.primary} />
                        <Text style={styles.sectionTitle}>Thông báo & Việc nhà</Text>
                      </View>

                      <View style={styles.preferenceRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={styles.prefTitle}>Cảnh báo hạn mức ngân sách</Text>
                          <Text style={styles.prefDesc}>
                            Cảnh báo khi chi tiêu danh mục chạm mốc ngân sách tháng
                          </Text>
                        </View>
                        <Switch
                          value={budgetAlerts}
                          onValueChange={setBudgetAlerts}
                          trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                          thumbColor={budgetAlerts ? previewColors.primary : '#CBD5E1'}
                        />
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.preferenceRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={styles.prefTitle}>Nhắc việc nhà mỗi ngày</Text>
                          <Text style={styles.prefDesc}>
                            Gửi lời nhắc nhiệm vụ việc nhà cần hoàn thành
                          </Text>
                        </View>
                        <Switch
                          value={notifyDailyTasks}
                          onValueChange={setNotifyDailyTasks}
                          trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                          thumbColor={notifyDailyTasks ? previewColors.primary : '#CBD5E1'}
                        />
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.preferenceRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={styles.prefTitle}>Chỉ hiện việc của tôi</Text>
                          <Text style={styles.prefDesc}>
                            Lọc danh sách việc nhà ưu tiên hiển thị công việc được giao cho bạn
                          </Text>
                        </View>
                        <Switch
                          value={taskFilterMyOnly}
                          onValueChange={setTaskFilterMyOnly}
                          trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                          thumbColor={taskFilterMyOnly ? previewColors.primary : '#CBD5E1'}
                        />
                      </View>
                    </View>
                  </View>
                )}

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
                    style={[
                      styles.saveBtn,
                      { backgroundColor: previewColors.primary, shadowColor: previewColors.primary },
                      loading && { opacity: 0.8 },
                    ]}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveBtnText}>Lưu cài đặt</Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
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
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 30,
  },
  tabContent: {
    gap: 16,
  },
  errorBox: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  avatarSection: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetList: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  presetItem: {
    position: 'relative',
    borderRadius: 20,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetItemActive: {
    borderColor: '#10B981',
  },
  presetImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    gap: 10,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  prefDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  chipScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  walletChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  walletChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  walletChipTextActive: {
    color: '#FFFFFF',
  },
  themeGrid: {
    gap: 8,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
