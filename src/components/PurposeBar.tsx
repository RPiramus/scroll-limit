import React, { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPE } from '../config';
import type { Segment } from '../session';
import { formatClock } from '../time';

type Props = {
  segment: Segment;
  savedCount: number;
  /** Break reached its target, purpose marked as found, or a finish card is open. */
  complete: boolean;
  /** Task mode only: seconds left and how far through the video / time box. */
  task?: { remaining: number; progress: number };
  interactive: boolean;
  onPress: () => void; // session options (X-01)
  onGotIt: () => void;
  onTaskDone: () => void;
  onSavedPress: () => void;
};

/**
 * The Purpose Bar, one component with four modes (Figma: Purpose Bar Break / Purpose / Task /
 * Complete). Break fills from the clip count (M1). Purpose never fills by itself. Task is amber.
 */
export function PurposeBar({
  segment,
  savedCount,
  complete,
  task,
  interactive,
  onPress,
  onGotIt,
  onTaskDone,
  onSavedPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { mode } = segment;
  const isTask = mode === 'task';

  const count = segment.seen.length;
  const target = segment.target ?? 1;
  const ratio =
    mode === 'break' ? Math.min(1, count / target) : isTask ? Math.min(1, task?.progress ?? 0) : 0;

  const [fill] = useState(() => new Animated.Value(ratio));
  useEffect(() => {
    Animated.timing(fill, {
      toValue: ratio,
      duration: isTask ? 240 : 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animating width
    }).start();
  }, [ratio, isTask, fill]);
  const width = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  let kicker = '';
  let title = '';
  let a11y = '';
  switch (mode) {
    case 'break':
      kicker = complete ? 'BREAK DONE ✓' : `${target}-CLIP BREAK`;
      title = `${count} of ${target} clips`;
      a11y = `Break: ${count} of ${target} clips`;
      break;
    case 'purpose':
      kicker = complete ? 'FOUND ✓' : 'LOOKING FOR';
      title = segment.purpose ?? '';
      a11y = `Looking for ${title}, ${savedCount} saved`;
      break;
    case 'task':
      kicker = complete ? 'TASK DONE ✓' : 'TASK';
      title = segment.task ?? '';
      a11y = `Task: ${title}, ${formatClock(task?.remaining ?? 0)} left`;
      break;
    case 'browse':
      kicker = 'JUST BROWSING';
      title = 'Tap to set a purpose';
      a11y = 'Just browsing. Tap to set a purpose';
      break;
  }

  const kickerColor = complete ? COLORS.mint : isTask ? COLORS.amber : COLORS.textDim;

  return (
    <View
      pointerEvents={interactive ? 'box-none' : 'none'}
      style={[styles.wrap, { paddingTop: insets.top + 6 }]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityHint="Opens session options"
        style={({ pressed }) => [styles.bar, isTask && styles.barTask, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={[styles.kicker, { color: kickerColor }]}>{kicker}</Text>
            <Text
              style={[styles.title, mode === 'browse' && { color: COLORS.textDim, fontWeight: '500' }]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>

          {isTask && !complete && (
            <Text style={styles.timeLeft} accessibilityElementsHidden>
              {formatClock(task?.remaining ?? 0)} left
            </Text>
          )}

          {mode === 'purpose' && !complete && <Pill label="Got it" onPress={onGotIt} />}
          {isTask && !complete && <Pill label="Done" onPress={onTaskDone} />}

          <Text style={styles.chevron}>⌄</Text>
        </View>

        {(mode === 'break' || isTask) && (
          <View style={styles.track}>
            <Animated.View
              style={[styles.fill, { width, backgroundColor: isTask && !complete ? COLORS.amber : COLORS.mint }]}
            />
          </View>
        )}

        {mode === 'purpose' && (
          <Pressable onPress={onSavedPress} hitSlop={8} accessibilityRole="button" style={styles.metaRow}>
            <Text style={styles.meta}>
              {savedCount} saved{savedCount > 0 ? '  ›' : ''}
            </Text>
          </Pressable>
        )}

        {isTask && !complete && (
          <Text style={styles.hint}>Recommendations paused until the tutorial ends</Text>
        )}
      </Pressable>
    </View>
  );
}

function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12, zIndex: 50 },
  bar: {
    borderRadius: 16,
    backgroundColor: 'rgba(23,23,29,0.9)',
    borderWidth: 1,
    borderColor: COLORS.stroke,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  barTask: { borderColor: 'rgba(255,176,32,0.55)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  textCol: { flex: 1 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '600', marginTop: 2 },
  timeLeft: {
    color: COLORS.amber,
    fontSize: TYPE.subhead,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  chevron: { color: COLORS.textDim, fontSize: 18, marginTop: -6 },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { color: COLORS.mintInk, fontSize: TYPE.subhead, fontWeight: '700' },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.stroke,
    overflow: 'hidden',
    marginTop: 10,
  },
  fill: { height: '100%', borderRadius: 3 },
  metaRow: { marginTop: 6, alignSelf: 'flex-start' },
  meta: { color: COLORS.mint, fontSize: TYPE.footnote, fontWeight: '600' },
  hint: { color: COLORS.textDim, fontSize: TYPE.footnote, marginTop: 8 },
});
