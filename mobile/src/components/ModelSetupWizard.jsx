import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';

export default function ModelSetupWizard() {
  const insets = useSafeAreaInsets();
  const { isDownloading, downloadProgress, startModelDownload, downloadError } = useMobileChatStore();
  const { colors, themeMode, toggleTheme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Compact top bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.topBarTitle, { color: colors.textPrimary }]}>Car AI</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.themeBtn}
          onPress={toggleTheme}
        >
          <Ionicons
            name={themeMode === 'dark' ? 'sunny' : 'moon'}
            size={18}
            color={themeMode === 'dark' ? '#F59E0B' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* App Icon */}
        <View style={[styles.iconWrapper, { borderColor: colors.cardBorder }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.appIcon}
            resizeMode="cover"
          />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Set Up Car AI</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Download once and get instant car help anywhere — no internet needed after setup.
        </Text>

        {/* Info strips */}
        <View style={[styles.infoStrip, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.infoItem}>
            <Ionicons name="car-sport" size={18} color={colors.accent} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Offline AI</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.infoItem}>
            <Feather name="download" size={16} color={colors.accent} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>1.68 GB</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.infoItem}>
            <Ionicons name="wifi-outline" size={18} color={colors.offlineGreenText} />
            <Text style={[styles.infoLabel, { color: colors.offlineGreenText }]}>No internet</Text>
          </View>
        </View>

        {/* Error box */}
        {downloadError && (
          <View style={styles.errorBox}>
            <Feather name="alert-triangle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{downloadError}</Text>
          </View>
        )}

        {/* Download / Progress */}
        {!isDownloading ? (
          <>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.downloadBtn, { backgroundColor: colors.accent }]}
              onPress={() => startModelDownload()}
            >
              <Feather name="download" size={18} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Download Car AI</Text>
            </TouchableOpacity>
            <Text style={[styles.footerNote, { color: colors.textMuted }]}>
              Downloads once to your device. You can use the app normally while it downloads.
            </Text>
          </>
        ) : (
          <View style={[styles.progressCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>Downloading Car AI...</Text>
            <Text style={[styles.progressPercent, { color: colors.accent }]}>{downloadProgress.progressPercent}%</Text>

            <View style={[styles.progressBarBg, { backgroundColor: colors.subCardBg }]}>
              <View style={[styles.progressBarFill, { width: `${downloadProgress.progressPercent}%`, backgroundColor: colors.accent }]} />
            </View>

            <Text style={[styles.progressMeta, { color: colors.textSecondary }]}>
              {downloadProgress.writtenMB} MB / {downloadProgress.totalMB} MB
            </Text>

            <Text style={[styles.progressNotice, { color: colors.textMuted }]}>
              You can lock your screen or use other apps — the download continues in the background.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  themeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 320,
  },
  infoStrip: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 28,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
    gap: 5,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoDivider: {
    width: 1,
    height: 28,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  downloadBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  progressCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 36,
    fontWeight: '800',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressNotice: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
  },
});
