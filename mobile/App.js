import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMobileChatStore } from './src/store/mobileChatStore';
import { useThemeStore } from './src/store/themeStore';
import ModelSetupWizard from './src/components/ModelSetupWizard';
import ChatScreen from './src/components/ChatScreen';

/** Minimal animated splash shown while model status is being checked */
function SplashLoader({ colors }) {
  const carX    = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in then slide car across
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(carX, { toValue: 60, duration: 1200, useNativeDriver: true }),
          Animated.timing(carX, { toValue: -60, duration: 0, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <View style={[splash.container, { backgroundColor: colors.bg }]}>
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        {/* Animated car icon sliding across */}
        <Animated.Text style={[splash.car, { transform: [{ translateX: carX }] }]}>
          🚗
        </Animated.Text>
        {/* Thin progress line */}
        <View style={[splash.trackLine, { backgroundColor: colors.border }]} />
        <Text style={[splash.label, { color: colors.textMuted }]}>Starting up</Text>
      </Animated.View>
    </View>
  );
}

const splash = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  car:       { fontSize: 32, marginBottom: 20 },
  trackLine: { width: 120, height: 1.5, borderRadius: 1, marginBottom: 16 },
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
