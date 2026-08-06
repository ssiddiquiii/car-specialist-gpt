import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';

export default function AuthModal() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { isAuthModalOpen, toggleAuthModal, loginUser } = useMobileChatStore();

  if (!isAuthModalOpen) return null;

  const handleSubmit = () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in email and password.');
      return;
    }
    if (isSignup && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    loginUser(email, password, isSignup ? name : undefined);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <Modal
      visible={isAuthModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={toggleAuthModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={toggleAuthModal} />

        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, paddingBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isSignup 
              ? 'Sign up to sync your car chat preferences' 
              : 'Sign in to access your saved Car Specialist profile'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                <Feather name="alert-circle" size={13} color="#FCA5A5" /> {error}
              </Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {isSignup && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder, color: colors.textPrimary }]}
                  placeholder="e.g. Sameer Siddiqui"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder, color: colors.textPrimary }]}
                placeholder="user@example.com"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder, color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.inputPlaceholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.submitBtn, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>
                {isSignup ? 'Create Free Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Switch Mode Button */}
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.switchBtn}
              onPress={() => setIsSignup(!isSignup)}
            >
              <Text style={[styles.switchText, { color: colors.accent }]}>
                {isSignup 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Guest Access Button */}
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.guestBtn, { borderColor: colors.cardBorder }]}
              onPress={toggleAuthModal}
            >
              <Text style={[styles.guestText, { color: colors.textMuted }]}>Continue as Guest (Offline Mode)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  card: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 19,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    flex: 1,
  },
  form: {
    gap: 14,
  },
  inputGroup: {},
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 12,
  },
  guestText: {
    fontSize: 12,
  }
});
