import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useMobileChatStore } from './src/store/mobileChatStore';
import ModelSetupWizard from './src/components/ModelSetupWizard';
import ChatScreen from './src/components/ChatScreen';

export default function App() {
  const { isModelReady, isCheckingModel, checkModelStatus } = useMobileChatStore();

  useEffect(() => {
    checkModelStatus();
  }, []);

  if (isCheckingModel) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#DA7756" />
        <Text style={styles.loadingText}>Initializing Gemma 2B Engine...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!isModelReady ? <ModelSetupWizard /> : <ChatScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141413',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#141413',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#9F9D96',
    fontSize: 14,
    fontWeight: '500',
  }
});
