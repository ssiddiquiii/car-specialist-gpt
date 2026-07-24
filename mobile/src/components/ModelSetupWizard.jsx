import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMobileChatStore } from '../store/mobileChatStore';
import { MODEL_CONFIG } from '../services/llamaService';

export default function ModelSetupWizard() {
  const insets = useSafeAreaInsets();
  const { isDownloading, downloadProgress, startModelDownload, downloadError } = useMobileChatStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Realistic App Icon */}
          <View style={styles.iconWrapper}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.appIcon} 
              resizeMode="cover"
            />
          </View>

          <Text style={styles.title}>Car Specialist AI Setup</Text>
          <Text style={styles.subtitle}>
            On-device automotive intelligence powered by Google Gemma 2B. Runs 100% offline with zero server dependencies.
          </Text>

          {downloadError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>⚠️ Setup Notice</Text>
              <Text style={styles.errorText}>{downloadError}</Text>
            </View>
          )}

          {!isDownloading ? (
            <View style={styles.singleOptionContainer}>
              <View style={styles.modelDetailCard}>
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{MODEL_CONFIG.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Gemma 2</Text>
                  </View>
                </View>
                <Text style={styles.modelDesc}>
                  Official 4-bit quantized GGUF weights (~1.68 GB). Optimized for fast ARM CPU/GPU inference.
                </Text>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.downloadBtn}
                onPress={() => startModelDownload()}
              >
                <Text style={styles.downloadBtnText}>Download Gemma 2 (1.68 GB)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.progressBox}>
              <ActivityIndicator size="large" color="#DA7756" />
              <Text style={styles.progressTitle}>Downloading Gemma 2B Model...</Text>
              <Text style={styles.progressPercent}>{downloadProgress.progressPercent}%</Text>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${downloadProgress.progressPercent}%` }]} />
              </View>

              <Text style={styles.progressDetails}>
                {downloadProgress.writtenMB} MB / {downloadProgress.totalMB} MB
              </Text>
              
              <View style={styles.infoBadgeContainer}>
                <Text style={styles.notice}>
                  ⚡ Background download supported. You can switch apps or use your phone while downloading.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141413', // Warm Claude Charcoal
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1F1E1B', // Claude warm card background
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderColor: '#383632',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: '#4A4741',
    borderWidth: 1.5,
    shadowColor: '#DA7756',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  title: { 
    fontSize: 23, 
    fontWeight: '700', 
    color: '#ECECEC', 
    textAlign: 'center', 
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: { 
    fontSize: 13.5, 
    color: '#9F9D96', 
    textAlign: 'center', 
    marginBottom: 26, 
    lineHeight: 20 
  },
  singleOptionContainer: { 
    width: '100%', 
    gap: 16 
  },
  modelDetailCard: {
    backgroundColor: '#171714',
    borderColor: '#383632',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#ECECEC' 
  },
  badge: {
    backgroundColor: 'rgba(218, 119, 86, 0.15)',
    borderColor: 'rgba(218, 119, 86, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#DA7756',
    fontSize: 11,
    fontWeight: '700',
  },
  modelDesc: { 
    fontSize: 12.5, 
    color: '#9F9D96', 
    lineHeight: 18 
  },
  downloadBtn: {
    backgroundColor: '#DA7756', // Terracotta Claude Accent
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DA7756',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  progressBox: { 
    width: '100%', 
    alignItems: 'center' 
  },
  progressTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#ECECEC', 
    marginTop: 14 
  },
  progressPercent: { 
    fontSize: 34, 
    fontWeight: '800', 
    color: '#DA7756', 
    marginVertical: 6 
  },
  progressBarBg: { 
    width: '100%', 
    height: 10, 
    backgroundColor: '#2A2926', 
    borderRadius: 5, 
    overflow: 'hidden', 
    marginVertical: 12 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#DA7756' 
  },
  progressDetails: { 
    fontSize: 13, 
    color: '#D1CFCA', 
    marginBottom: 12,
    fontWeight: '500' 
  },
  infoBadgeContainer: {
    backgroundColor: 'rgba(218, 119, 86, 0.1)',
    borderColor: 'rgba(218, 119, 86, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  notice: { 
    fontSize: 12, 
    color: '#E6A188', 
    textAlign: 'center',
    lineHeight: 17 
  },
  errorBox: { 
    backgroundColor: '#3B1717', 
    borderColor: '#991B1B', 
    borderWidth: 1, 
    borderRadius: 14, 
    padding: 14, 
    marginBottom: 20, 
    width: '100%' 
  },
  errorTitle: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  errorText: { 
    color: '#FECACA', 
    fontSize: 12, 
    lineHeight: 17 
  }
});
