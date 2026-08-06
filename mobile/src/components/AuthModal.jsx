import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';
import { SPACING, TYPE, RADIUS } from '../theme';

export default function AuthModal() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const [isSignup, setIsSignup] = useState(false);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const { isAuthModalOpen, toggleAuthModal, loginUser } = useMobileChatStore();

  if (!isAuthModalOpen) return null;

  const submit = () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (isSignup && !name.trim())           { setError('Please enter your name.');          return; }
    loginUser(email, password, isSignup ? name : undefined);
    setName(''); setEmail(''); setPassword('');
  };

  const Field = ({ label, value, onChange, secure, keyboardType, autoCapitalize }) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: colors.bgSoft, borderColor: colors.border, color: colors.textPrimary }]}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={toggleAuthModal}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleAuthModal} />
        <View style={[styles.sheet, { backgroundColor: colors.bg, borderTopColor: colors.border, paddingBottom: insets.bottom + SPACING.lg }]}>

          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.textPrimary }]}>{isSignup ? 'Create account' : 'Welcome back'}</Text>
          <Text style={[styles.sub, { color: colors.textSub }]}>
            {isSignup ? 'Sign up to sync your chats across devices' : 'Sign in to access your saved conversations'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isSignup && <Field label="Full name" value={name} onChange={setName} autoCapitalize="words" />}
          <Field label="Email" value={email} onChange={setEmail} keyboardType="email-address" />
          <Field label="Password" value={password} onChange={setPassword} secure />

          <TouchableOpacity activeOpacity={0.85} style={[styles.cta, { backgroundColor: colors.accent }]} onPress={submit}>
            <Text style={styles.ctaText}>{isSignup ? 'Create account' : 'Sign in'}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.toggle} onPress={() => setIsSignup(!isSignup)}>
            <Text style={[styles.toggleText, { color: colors.accent }]}>
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={toggleAuthModal} style={styles.guest}>
            <Text style={[styles.guestText, { color: colors.textMuted }]}>Continue without account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    padding: SPACING.lg,
  },
  handle:  { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  title:   { ...TYPE.title, marginBottom: SPACING.xs },
  sub:     { ...TYPE.body, marginBottom: SPACING.lg },
  error:   { ...TYPE.small, color: '#EF4444', marginBottom: SPACING.md },

  field:       { marginBottom: SPACING.md },
  fieldLabel:  { ...TYPE.label, marginBottom: SPACING.xs },
  fieldInput:  { ...TYPE.body, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: 12 },

  cta:     { borderRadius: RADIUS.pill, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.sm },
  ctaText: { color: '#FFF', ...TYPE.heading },

  toggle:     { alignItems: 'center', paddingVertical: SPACING.sm },
  toggleText: { ...TYPE.small },

  guest:     { alignItems: 'center', paddingVertical: SPACING.xs },
  guestText: { ...TYPE.small },
});
