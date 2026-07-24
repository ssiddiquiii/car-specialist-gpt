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
import { useMobileChatStore } from '../store/mobileChatStore';

export default function AuthModal() {
  const insets = useSafeAreaInsets();
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

        <View style={[styles.card, { paddingBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <Text style={styles.title}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignup 
              ? 'Sign up to sync your car chat preferences' 
              : 'Sign in to access your saved Car Specialist profile'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {isSignup && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. Sameer Siddiqui"
                  placeholderTextColor="#71706B"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input}
                placeholder="user@example.com"
                placeholderTextColor="#71706B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#71706B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.submitBtn}
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
              <Text style={styles.switchText}>
                {isSignup 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Guest Access Button */}
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.guestBtn}
              onPress={toggleAuthModal}
            >
              <Text style={styles.guestText}>Continue as Guest (Offline Mode)</Text>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  backdrop: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1C1C1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: '#383632',
    borderWidth: 1,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ECECEC',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#9F9D96',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#3B1717',
    borderColor: '#991B1B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  inputGroup: {},
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1CFCA',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#141413',
    borderColor: '#383632',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#ECECEC',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#DA7756', // Terracotta accent
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
    color: '#DA7756',
    fontSize: 12.5,
    fontWeight: '600',
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: '#2E2C28',
    marginTop: 6,
    paddingTop: 12,
  },
  guestText: {
    color: '#9F9D96',
    fontSize: 12,
  }
});
