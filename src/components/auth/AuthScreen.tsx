import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Home,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from 'lucide-react-native';
import type { AuthUser } from '../../types';

export type AuthMode = 'login' | 'register' | 'forgot' | 'recover';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const DEMO_ACCOUNTS: AuthUser[] = [
  {
    id: 'm1',
    name: 'Bố Minh',
    email: 'owner@test.com',
    phone: '0901234567',
    role: 'OWNER',
    roleLabel: 'Quản trị viên gia đình',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    personalBalance: 18500000,
  },
  {
    id: 'm2',
    name: 'Mẹ Lan',
    email: 'member@test.com',
    phone: '0912345678',
    role: 'MEMBER',
    roleLabel: 'Quản lý thu chi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    personalBalance: 12800000,
  },
  {
    id: 'm3',
    name: 'Bé Bi',
    email: 'viewer@test.com',
    phone: '0923456789',
    role: 'VIEWER',
    roleLabel: 'Thành viên (Chỉ xem)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    personalBalance: 2000000,
  },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('owner@test.com');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('Bố (Chủ hộ)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot & Recover password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Message & Toast
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    clearMessages();
    setMode(newMode);
  };

  // 1. Xử lý Đăng nhập
  const handleLogin = () => {
    clearMessages();
    if (!loginEmail.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    // Kiểm tra tài khoản mẫu hoặc tài khoản tuỳ ý
    const matched = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    const userToLogin: AuthUser = matched || {
      id: 'user_' + Date.now(),
      name: loginEmail.includes('@') ? loginEmail.split('@')[0] : 'Thành viên',
      email: loginEmail.trim(),
      role: 'MEMBER',
      roleLabel: 'Thành viên gia đình',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      personalBalance: 15000000,
    };

    onLoginSuccess(userToLogin);
  };

  // 2. Xử lý Đăng ký
  const handleRegister = () => {
    clearMessages();
    if (!regName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Vui lòng nhập Email');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    const newUser: AuthUser = {
      id: 'reg_' + Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || undefined,
      role: regRole.includes('Bố') ? 'OWNER' : 'MEMBER',
      roleLabel: regRole,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      personalBalance: 10000000,
    };

    setSuccessMessage('Đăng ký thành công! Đang đăng nhập...');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 800);
  };

  // 3. Xử lý Quên mật khẩu -> Gửi OTP
  const handleForgotSubmit = () => {
    clearMessages();
    if (!forgotEmail.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại để nhận mã OTP');
      return;
    }

    setSuccessMessage(`Mã xác thực đã được gửi tới ${forgotEmail.trim()}`);
    setMode('recover');
  };

  // 4. Xử lý Khôi phục mật khẩu mới
  const handleRecoverSubmit = () => {
    clearMessages();
    if (!otpCode.trim()) {
      setErrorMessage('Vui lòng nhập mã OTP xác thực (Mã thử nghiệm: 123456)');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setSuccessMessage('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
    setTimeout(() => {
      setLoginEmail(forgotEmail || 'minh.nguyen@homeflow.vn');
      setLoginPassword(newPassword);
      setMode('login');
      clearMessages();
    }, 1200);
  };

  const roles = ['Bố (Chủ hộ)', 'Mẹ (Nội trợ)', 'Con cái', 'Ông / Bà', 'Thành viên'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Home size={34} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.brandName}>HomeFlow</Text>
          <Text style={styles.brandTagline}>
            Quản lý tài chính & Công việc gia đình
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.authCard}>
          {/* Notification Messages */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {successMessage}</Text>
            </View>
          )}

          {/* SCREEN: 1. ĐĂNG NHẬP */}
          {mode === 'login' && (
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Đăng nhập</Text>
                <Text style={styles.cardSubtitle}>
                  Chào mừng bạn quay lại với ngôi nhà HomeFlow
                </Text>
              </View>

              {/* Input: Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Email hoặc Số điện thoại</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="VD: minh.nguyen@homeflow.vn"
                    placeholderTextColor="#94A3B8"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Input: Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Nhập mật khẩu..."
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showLoginPassword}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowLoginPassword(!showLoginPassword)}
                    style={styles.eyeIcon}
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.rememberRow}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <CheckCircle2 size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Ghi nhớ tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setForgotEmail(loginEmail);
                    handleSwitchMode('forgot');
                  }}
                >
                  <Text style={styles.linkText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Quick Demo Access */}
              <View style={styles.demoSection}>
                <View style={styles.demoDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.demoDividerText}>ĐĂNG NHẬP NHANH BẰNG TÀI KHOẢN MẪU</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.demoPillsRow}>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={styles.demoPill}
                      onPress={() => onLoginSuccess(acc)}
                      activeOpacity={0.7}
                    >
                      <Sparkles size={14} color="#056839" />
                      <Text style={styles.demoPillText}>{acc.name} ({acc.role.split(' ')[0]})</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Switch to Register */}
              <View style={styles.switchAuthRow}>
                <Text style={styles.switchPromptText}>Chưa có tài khoản?</Text>
                <TouchableOpacity onPress={() => handleSwitchMode('register')}>
                  <Text style={styles.switchActionText}> Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SCREEN: 2. ĐĂNG KÝ */}
          {mode === 'register' && (
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Tạo tài khoản</Text>
                <Text style={styles.cardSubtitle}>
                  Tham gia HomeFlow để cùng chăm sóc tài chính gia đình
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Họ và tên</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Nguyễn Văn Minh"
                    placeholderTextColor="#94A3B8"
                    value={regName}
                    onChangeText={setRegName}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="VD: minh@gmail.com"
                    placeholderTextColor="#94A3B8"
                    value={regEmail}
                    onChangeText={setRegEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Số điện thoại (tùy chọn)</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 0901234567"
                    placeholderTextColor="#94A3B8"
                    value={regPhone}
                    onChangeText={setRegPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Vai trò trong gia đình</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScrollView}>
                  {roles.map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRegRole(r)}
                      style={[styles.roleChip, regRole === r && styles.roleChipActive]}
                    >
                      <Text style={[styles.roleChipText, regRole === r && styles.roleChipTextActive]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Ít nhất 6 ký tự"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showRegPassword}
                    value={regPassword}
                    onChangeText={setRegPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowRegPassword(!showRegPassword)}
                    style={styles.eyeIcon}
                  >
                    {showRegPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <ShieldCheck size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showRegPassword}
                    value={regConfirmPassword}
                    onChangeText={setRegConfirmPassword}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Đăng ký tài khoản</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.switchAuthRow}>
                <Text style={styles.switchPromptText}>Đã có tài khoản?</Text>
                <TouchableOpacity onPress={() => handleSwitchMode('login')}>
                  <Text style={styles.switchActionText}> Đăng nhập ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SCREEN: 3. QUÊN MẬT KHẨU */}
          {mode === 'forgot' && (
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => handleSwitchMode('login')}
              >
                <ArrowLeft size={16} color="#056839" />
                <Text style={styles.backButtonText}>Quay lại Đăng nhập</Text>
              </TouchableOpacity>

              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Quên mật khẩu?</Text>
                <Text style={styles.cardSubtitle}>
                  Đừng lo lắng! Hãy nhập Email đăng ký tài khoản của bạn để nhận mã khôi phục.
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Email hoặc Số điện thoại</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="VD: minh.nguyen@homeflow.vn"
                    placeholderTextColor="#94A3B8"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleForgotSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Gửi mã xác thực OTP</Text>
                <KeyRound size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* SCREEN: 4. KHÔI PHỤC MẬT KHẨU (OTP & ĐẶT LẠI MẬT KHẨU) */}
          {mode === 'recover' && (
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => handleSwitchMode('forgot')}
              >
                <ArrowLeft size={16} color="#056839" />
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>

              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Khôi phục mật khẩu</Text>
                <Text style={styles.cardSubtitle}>
                  Nhập mã OTP 6 số đã gửi và đặt mật khẩu mới cho tài khoản của bạn.
                </Text>
              </View>

              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  💡 Mã OTP mẫu để kiểm tra nhanh: <Text style={styles.boldText}>123456</Text>
                </Text>
              </View>

              {/* Input OTP */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mã xác thực OTP (6 chữ số)</Text>
                <View style={styles.inputWrapper}>
                  <KeyRound size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.input, { letterSpacing: 4, fontWeight: '700' }]}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* Input New Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Ít nhất 6 ký tự"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    {showNewPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Input Confirm New Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View style={styles.inputWrapper}>
                  <ShieldCheck size={18} color="#056839" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showNewPassword}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRecoverSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Đổi mật khẩu & Đăng nhập</Text>
                <CheckCircle2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer info */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            HomeFlow • An toàn, minh bạch cho tài chính mọi nhà
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#056839',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: '#A7F3D0',
    marginTop: 4,
    fontWeight: '500',
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  titleRow: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#056839',
    fontSize: 12,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeIcon: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#056839',
    borderColor: '#056839',
  },
  rememberText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 12,
    color: '#056839',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#056839',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchPromptText: {
    fontSize: 13,
    color: '#64748B',
  },
  switchActionText: {
    fontSize: 13,
    color: '#056839',
    fontWeight: '800',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 13,
    color: '#056839',
    fontWeight: '700',
  },
  infoBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#166534',
  },
  boldText: {
    fontWeight: '800',
  },
  roleScrollView: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#056839',
  },
  roleChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: '#056839',
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 22,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  demoDividerText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    borderRadius: 12,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#056839',
  },
  footerNote: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#A7F3D0',
    fontWeight: '500',
  },
});
