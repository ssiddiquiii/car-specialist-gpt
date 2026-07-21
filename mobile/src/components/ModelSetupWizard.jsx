import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMobileChatStore } from '../store/mobileChatStore';
import { MODEL_CONFIGS } from '../services/llamaService';

export default function ModelSetupWizard() {
  const { isDownloading, downloadProgress, startModelDownload, selectedModelKey } = useMobileChatStore();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📱🚗</Text>
        <Text style={styles.title}>Car Specialist AI Setup</Text>
        <Text style={styles.subtitle}>
          This app runs 100% offline on your phone! To get started, download the AI model weights.
        </Text>

        {!isDownloading ? (
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionBtn, selectedModelKey === 'gemma2b' && styles.optionSelected]}
              onPress={() => startModelDownload('gemma2b')}
            >
              <Text style={styles.optionTitle}>{MODEL_CONFIGS.gemma2b.name}</Text>
              <Text style={styles.optionDesc}>Size: ~1.6 GB • Best Quality (Recommended for 6GB+ RAM)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionBtn, selectedModelKey === 'llama1b' && styles.optionSelected]}
              onPress={() => startModelDownload('llama1b')}
            >
              <Text style={styles.optionTitle}>{MODEL_CONFIGS.llama1b.name}</Text>
              <Text style={styles.optionDesc}>Size: ~0.88 GB • Ultra Fast (For 4GB RAM phones)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.progressBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.progressTitle}>Downloading AI Model...</Text>
            <Text style={styles.progressPercent}>{downloadProgress.progressPercent}%</Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${downloadProgress.progressPercent}%` }]} />
            </View>

            <Text style={styles.progressDetails}>
              {downloadProgress.writtenMB} MB / {downloadProgress.totalMB} MB
            </Text>
            <Text style={styles.notice}>Please keep the app open and connected to Wi-Fi.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 18 },
  optionsContainer: { width: '100%', gap: 12 },
  optionBtn: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
  },
  optionSelected: { borderColor: '#4F46E5', backgroundColor: '#1E1B4B' },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#F8FAFC', marginBottom: 4 },
  optionDesc: { fontSize: 12, color: '#94A3B8' },
  progressBox: { width: '100%', alignItems: 'center' },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginTop: 12 },
  progressPercent: { fontSize: 32, fontWeight: '800', color: '#6366F1', marginVertical: 8 },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#334155', borderRadius: 5, overflow: 'hidden', marginVertical: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#6366F1' },
  progressDetails: { fontSize: 13, color: '#CBD5E1', marginBottom: 6 },
  notice: { fontSize: 11, color: '#64748B', fontStyle: 'italic', textAlign: 'center' }
});
