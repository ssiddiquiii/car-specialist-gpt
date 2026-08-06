import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';
import { SPACING, TYPE, RADIUS } from '../theme';


export default function ModelSetupWizard() {
  const insets = useSafeAreaInsets();
  const { isDownloading, downloadProgress, startModelDownload, downloadError } = useMobileChatStore();
  const { colors, themeMode, toggleTheme } = useThemeStore();

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (downloadProgress.progressPercent || 0) / 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [downloadProgress.progressPercent]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Minimal top row */}
      <View style={styles.topBar}>
        <Text style={[styles.appName, { color: colors.textPrimary }]}>Car AI</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn} activeOpacity={0.6}>
          <Ionicons
            name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Content — fully centered */}
      <View style={styles.body}>

        {/* App icon badge — premium rounded square */}
        <View style={[styles.iconBadge, { borderColor: colors.border }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.iconImage}
            resizeMode="cover"
          />
        </View>

        {!isDownloading ? (
          /* ─── IDLE STATE ─── */
          <>
            <Text style={[styles.hero, { color: colors.textPrimary }]}>Set up Car AI</Text>
            <Text style={[styles.sub, { color: colors.textSub }]}>
              Download once. Works offline, everywhere.
            </Text>

            {/* Small metadata row */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="download" size={12} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>1.68 GB</Text>
              </View>
              <Text style={[styles.metaDot, { color: colors.border }]}>·</Text>
              <View style={styles.metaItem}>
                <Ionicons name="wifi-outline" size={12} color={colors.accentGreen} />
                <Text style={[styles.metaText, { color: colors.accentGreen }]}>No internet after setup</Text>
              </View>
            </View>

            {downloadError && (
              <Text style={styles.errorText}>{downloadError}</Text>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.cta, { backgroundColor: colors.accent }]}
              onPress={() => startModelDownload()}
            >
              <Text style={styles.ctaText}>Download now</Text>
            </TouchableOpacity>

            <Text style={[styles.caption, { color: colors.textMuted }]}>
              You can use other apps while it downloads
            </Text>
          </>
        ) : (
          /* ─── DOWNLOADING STATE ─── */
          <>
            <Text style={[styles.hero, { color: colors.textPrimary }]}>
              {downloadProgress.progressPercent}%
            </Text>
            <Text style={[styles.sub, { color: colors.textSub }]}>Setting up Car AI</Text>

            {/* Thin progress track */}
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    backgroundColor: colors.accent,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={[styles.metaText, { color: colors.textMuted, marginTop: SPACING.sm }]}>
              {downloadProgress.writtenMB} MB / {downloadProgress.totalMB} MB
            </Text>

            <Text style={[styles.caption, { color: colors.textMuted, marginTop: SPACING.lg }]}>
              Keep the app open or lock your screen — the download continues automatically.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  appName: {
    ...TYPE.heading,
  },
  themeBtn: {
    padding: SPACING.xs,
  },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  carEmoji: {
    fontSize: 48,
    marginBottom: SPACING.xl,
  },

  hero: {
    ...TYPE.hero,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sub: {
    ...TYPE.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPE.small,
  },
  metaDot: {
    fontSize: 14,
  },

  errorText: {
    ...TYPE.small,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  cta: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ctaText: {
    color: '#FFFFFF',
    ...TYPE.heading,
  },

  caption: {
    ...TYPE.small,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Progress bar
  track: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  fill: {
    height: '100%',
    borderRadius: 1,
  },

  // App icon badge
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
});
