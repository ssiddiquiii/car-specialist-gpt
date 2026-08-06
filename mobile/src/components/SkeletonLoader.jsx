import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { SPACING, RADIUS } from '../theme';

function SkeletonLine({ width, height = 10 }) {
  const { colors } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9,  duration: 650, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={{ width, height, borderRadius: RADIUS.sm, backgroundColor: colors.skeleton, opacity }} />
  );
}

export function ChatSkeletonLoader() {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.bubble, { backgroundColor: colors.aiBubble }]}>
      <SkeletonLine width={42} height={8} />
      <View style={styles.lines}>
        <SkeletonLine width="90%" />
        <SkeletonLine width="70%" />
        <SkeletonLine width="55%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 20,
    borderBottomLeftRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  lines: { gap: SPACING.sm },
});
