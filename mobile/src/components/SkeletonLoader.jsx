import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export function SkeletonItem({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
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
      {/* Fake AI Message Skeleton */}
      <View style={[styles.bubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, alignSelf: 'flex-start' }]}>
        <SkeletonItem width={120} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonItem width={220} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonItem width={180} height={14} borderRadius={6} />
      </View>

      {/* Fake User Message Skeleton */}
      <View style={[styles.bubble, { backgroundColor: colors.accent, alignSelf: 'flex-end', opacity: 0.8 }]}>
        <SkeletonItem width={90} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonItem width={160} height={14} borderRadius={6} />
      </View>

      {/* Fake Dual Response Card Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <SkeletonItem width={140} height={14} borderRadius={6} style={{ marginBottom: 12 }} />
        <View style={styles.row}>
          <SkeletonItem width="48%" height={32} borderRadius={10} />
          <SkeletonItem width="48%" height={32} borderRadius={10} />
        </View>
        <SkeletonItem width="100%" height={120} borderRadius={12} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  bubble: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    maxWidth: '85%',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
