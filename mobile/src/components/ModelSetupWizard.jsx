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
          
          {/* App Brand Icon Wrapper */}
          <View style={[styles.iconWrapper, { borderColor: colors.accent }]}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.appIcon} 
              resizeMode="cover"
            />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Car AI Setup</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your personal automotive assistant. Works 100% offline on your phone without internet.
          </Text>

          {/* User-Friendly Info Specs Grid */}
          <View style={[styles.specsGrid, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
            <View style={styles.specItem}>
              <Text style={[styles.specValue, { color: colors.accent }]}>Offline AI</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>Engine</Text>
            </View>
            <View style={[styles.specDivider, { backgroundColor: colors.subCardBorder }]} />
            <View style={styles.specItem}>
              <Text style={[styles.specValue, { color: colors.textPrimary }]}>1.68 GB</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>File Size</Text>
            </View>
            <View style={[styles.specDivider, { backgroundColor: colors.subCardBorder }]} />
            <View style={styles.specItem}>
              <Text style={[styles.specValue, { color: colors.offlineGreenText }]}>No Internet</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>Required</Text>
            </View>
          </View>

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
              <TouchableOpacity 
                activeOpacity={0.85}
                style={[styles.downloadBtn, { backgroundColor: colors.accent }]}
                onPress={() => startModelDownload()}
              >
                <Feather name="download" size={18} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download Car AI (1.68 GB)</Text>
              </TouchableOpacity>

              <Text style={[styles.footerNotice, { color: colors.textMuted }]}>
                Downloads once onto your device so you can get car help anywhere.
              </Text>
            </View>
          ) : (
            <View style={styles.progressBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>Downloading Car AI...</Text>
              <Text style={[styles.progressPercent, { color: colors.accent }]}>{downloadProgress.progressPercent}%</Text>

              <View style={[styles.progressBarBg, { backgroundColor: colors.subCardBg }]}>
                <View style={[styles.progressBarFill, { width: `${downloadProgress.progressPercent}%`, backgroundColor: colors.accent }]} />
              </View>

              <Text style={[styles.progressDetails, { color: colors.textSecondary }]}>
                {downloadProgress.writtenMB} MB / {downloadProgress.totalMB} MB
              </Text>
              
              <View style={[styles.infoBadgeContainer, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                <Text style={[styles.notice, { color: colors.badgeText }]}>
                  <Feather name="zap" size={13} color={colors.badgeText} /> Download runs in the background. You can use your phone normally while downloading.
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
    borderRadius: 12,
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
    marginBottom: 22, 
    lineHeight: 20,
    maxWidth: 340,
  },
  specsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  specItem: {
    alignItems: 'center',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  specLabel: {
    fontSize: 11,
  },
  specDivider: {
    width: 1,
    height: 24,
  },
  singleOptionContainer: { 
    width: '100%', 
    gap: 12 
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
  footerNotice: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
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
