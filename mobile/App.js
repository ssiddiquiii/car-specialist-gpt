import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMobileChatStore } from './src/store/mobileChatStore';
import { useThemeStore } from './src/store/themeStore';
import ModelSetupWizard from './src/components/ModelSetupWizard';
import ChatScreen from './src/components/ChatScreen';
import { ChatSkeletonLoader } from './src/components/SkeletonLoader';

export default function App() {
  const { isModelReady, isCheckingModel, checkModelStatus } = useMobileChatStore();
  const { themeMode, colors, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkModelStatus();
  }, []);

  if (isCheckingModel) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          <View style={styles.skeletonWrapper}>
            <ChatSkeletonLoader />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Initializing Car Specialist Engine...</Text>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        {!isModelReady ? <ModelSetupWizard /> : <ChatScreen />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonWrapper: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  }
});
