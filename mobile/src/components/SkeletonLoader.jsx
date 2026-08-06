import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeStore } from '../store/themeStore';

function SkeletonItem({ width, height, borderRadius = 8 }) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.skeletonBg,
        opacity,
      }}
    />
  );
}

export function ChatSkeletonLoader() {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.skeletonRow, { backgroundColor: colors.aiBubble, borderColor: colors.aiBubbleBorder }]}>
      <View style={styles.skeletonLabel}>
        <SkeletonItem width={12} height={12} borderRadius={6} />
        <SkeletonItem width={48} height={10} borderRadius={5} />
      </View>
      <View style={styles.skeletonLines}>
        <SkeletonItem width="92%" height={12} borderRadius={6} />
        <SkeletonItem width="75%" height={12} borderRadius={6} />
        <SkeletonItem width="60%" height={12} borderRadius={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonRow: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    maxWidth: '88%',
    alignSelf: 'flex-start',
  },
  skeletonLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  skeletonLines: {
    gap: 8,
  },
});
