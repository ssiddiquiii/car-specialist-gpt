import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileChatStore } from './src/store/mobileChatStore';
import { useThemeStore } from './src/store/themeStore';
import ModelSetupWizard from './src/components/ModelSetupWizard';
import ChatScreen from './src/components/ChatScreen';

/** Minimal animated splash shown while model status is being checked */
function SplashLoader({ colors }) {
  const scale   = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.92, duration: 900, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <View style={[splash.container, { backgroundColor: colors.bg }]}>
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        {/* Pulsing ring */}
        <Animated.View style={[
          splash.ring,
          { borderColor: colors.accent, transform: [{ scale }] }
        ]} />
        {/* Icon centered inside ring */}
        <View style={[splash.iconBadge, { backgroundColor: colors.accent }]}>
          <MaterialCommunityIcons name="steering" size={32} color="#FFFFFF" />
        </View>
        <View style={[splash.trackLine, { backgroundColor: colors.border }]} />
        <Text style={[splash.label, { color: colors.textMuted }]}>Starting up</Text>
      </Animated.View>
    </View>
  );
}

const splash = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    opacity: 0.25,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  trackLine: { width: 80, height: 1.5, borderRadius: 1, marginBottom: 14 },
  label:     { fontSize: 12, letterSpacing: 0.4 },
});

export default function App() {
  const { isModelReady, isCheckingModel, checkModelStatus } = useMobileChatStore();
  const { themeMode, colors, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkModelStatus();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {isCheckingModel
          ? <SplashLoader colors={colors} />
          : !isModelReady
            ? <ModelSetupWizard />
            : <ChatScreen />
        }
      </View>
    </SafeAreaProvider>
  );
}
