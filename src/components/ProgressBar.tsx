import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../config';
import { formatShort, useNow } from '../time';

type Props = {
  count: number;
  limit: number;
  resetAt: number;
};

/**
 * Thin progress bar pinned to the top of the screen.
 * Colour shifts mint -> amber -> coral as the limit nears, and it pulses near the end.
 */
export function ProgressBar({ count, limit, resetAt }: Props) {
  const insets = useSafeAreaInsets();
  const ratio = Math.min(1, count / limit);

  const progress = useRef(new Animated.Value(ratio)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animating width/colour
    }).start();
  }, [ratio, progress]);

  const nearEnd = ratio >= 0.85;
  useEffect(() => {
    if (!nearEnd) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 520, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 520, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [nearEnd, pulse]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const color = progress.interpolate({
    inputRange: [0, 0.55, 0.8, 1],
    outputRange: [COLORS.mint, COLORS.mint, COLORS.amber, COLORS.coral],
  });

  const now = useNow(1000);

  return (
    <View pointerEvents="none" style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.track}>
<Animated.View style={{ opacity: pulse }}>
  <Animated.View
    style={[styles.fill, { width, backgroundColor: color }]}
  />
</Animated.View>      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>
          <Text style={styles.strong}>{count}</Text> / {limit} scrolls
        </Text>
        <Text style={styles.label}>resets in {formatShort(resetAt - now)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 14,
    zIndex: 10,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  strong: { color: COLORS.text },
});
