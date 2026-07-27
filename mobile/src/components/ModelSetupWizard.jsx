import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';

export default function ModelSetupWizard() {
  const insets = useSafeAreaInsets();
  const { isDownloading, downloadProgress, startModelDownload, downloadError } = useMobileChatStore();
  const { colors, themeMode, toggleTheme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      
      {/* Top Bar with Theme Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={[styles.themeBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={themeMode === 'dark' ? 'sunny' : 'moon'} 
            size={18} 
            color={themeMode === 'dark' ? '#F59E0B' : '#6366F1'} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {/* Realistic App Icon */}
          <View style={[styles.iconWrapper, { borderColor: colors.cardBorder }]}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.appIcon} 
              resizeMode="cover"
            />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Car Specialist AI Setup</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your personal automotive assistant. Works 100% offline on your phone without internet.
          </Text>

          {downloadError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                <Feather name="alert-triangle" size={14} color="#FCA5A5" /> Setup Notice
              </Text>
              <Text style={styles.errorText}>{downloadError}</Text>
            </View>
          )}

          {!isDownloading ? (
            <View style={styles.singleOptionContainer}>
              <View style={[styles.modelDetailCard, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                <View style={styles.modelHeader}>
                  <Text style={[styles.modelName, { color: colors.textPrimary }]}>Offline AI Engine</Text>
                  <View style={[styles.badge, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                    <Text style={[styles.badgeText, { color: colors.badgeText }]}>1.68 GB</Text>
                  </View>
                </View>
                <Text style={[styles.modelDesc, { color: colors.textSecondary }]}>
                  Downloads once onto your device so you can diagnose car issues and get advice anywhere without Wi-Fi.
                </Text>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.downloadBtn, { backgroundColor: colors.accent }]}
                onPress={() => startModelDownload()}
              >
                <Feather name="download" size={18} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download AI Engine (1.68 GB)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.progressBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>Downloading AI Engine...</Text>
              <Text style={[styles.progressPercent, { color: colors.accent }]}>{downloadProgress.progressPercent}%</Text>

              <View style={[styles.progressBarBg, { backgroundColor: colors.subCardBg }]}>
                <View style={[styles.progressBarFill, { width: `${downloadProgress.progressPercent}%`, backgroundColor: colors.accent }]} />
              </View>

              <Text style={[styles.progressDetails, { color: colors.textSecondary }]}>
                {downloadProgress.writtenMB} MB / {downloadProgress.totalMB} MB
              </Text>
              
              <View style={[styles.infoBadgeContainer, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                <Text style={[styles.notice, { color: colors.badgeText }]}>
                  <Feather name="zap" size={13} color={colors.badgeText} /> Background download supported. You can switch apps or use your phone while downloading.
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
  },
  topBar: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  title: { 
    fontSize: 23, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: { 
    fontSize: 13.5, 
    textAlign: 'center', 
    marginBottom: 26, 
    lineHeight: 20 
  },
  singleOptionContainer: { 
    width: '100%', 
    gap: 16 
  },
  modelDetailCard: {
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
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modelDesc: { 
    fontSize: 12.5, 
    lineHeight: 18 
  },
  downloadBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    marginTop: 14 
  },
  progressPercent: { 
    fontSize: 34, 
    fontWeight: '800', 
    marginVertical: 6 
  },
  progressBarBg: { 
    width: '100%', 
    height: 10, 
    borderRadius: 5, 
    overflow: 'hidden', 
    marginVertical: 12 
  },
  progressBarFill: { 
    height: '100%', 
  },
  progressDetails: { 
    fontSize: 13, 
    marginBottom: 12,
    fontWeight: '500' 
  },
  infoBadgeContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  notice: { 
    fontSize: 12, 
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
