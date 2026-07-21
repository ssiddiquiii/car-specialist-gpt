import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useMobileChatStore } from './src/store/mobileChatStore';
import ModelSetupWizard from './src/components/ModelSetupWizard';
import ChatScreen from './src/components/ChatScreen';

export default function App() {
  const { isModelReady, checkModelStatus } = useMobileChatStore();

  useEffect(() => {
    checkModelStatus();
  }, []);

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
    backgroundColor: '#0F172A',
  },
});
