import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export function SkeletonItem({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.skeletonBg,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ChatSkeletonLoader() {
  const { colors } = useThemeStore();
  return (
    <View style={styles.container}>
      {/* Telemetry Header Skeleton Pill */}
      <View style={[styles.pillHeader, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <SkeletonItem width={14} height={14} borderRadius={7} />
        <SkeletonItem width={160} height={12} borderRadius={6} />
      </View>

      {/* Fake AI Message Skeleton Card */}
      <View style={[styles.bubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, alignSelf: 'flex-start' }]}>
        <View style={styles.row}>
          <SkeletonItem width={20} height={20} borderRadius={6} />
          <SkeletonItem width={120} height={12} borderRadius={6} />
        </View>
        <SkeletonItem width={240} height={14} borderRadius={6} style={{ marginTop: 10, marginBottom: 6 }} />
        <SkeletonItem width={190} height={14} borderRadius={6} />
      </View>

      {/* Fake Dual Response Segmented Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.spaceBetween}>
          <SkeletonItem width={130} height={14} borderRadius={6} />
          <SkeletonItem width={60} height={18} borderRadius={9} />
        </View>
        <View style={[styles.row, { marginTop: 12 }]}>
          <SkeletonItem width="48%" height={34} borderRadius={10} />
          <SkeletonItem width="48%" height={34} borderRadius={10} />
        </View>
        <SkeletonItem width="100%" height={110} borderRadius={12} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 14,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    maxWidth: '88%',
    width: '85%',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
