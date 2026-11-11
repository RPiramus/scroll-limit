import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Clip } from '../clips';
import { COLORS, FINISH_VIDEO_MIN_S, FOLLOW_UP_BREAK, TASK_MINUTES, TYPE } from '../config';
import { lowerFirst, type Segment } from '../session';
import { formatClock } from '../time';
import { ClipRow } from '../components/ClipArt';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/ui';

export type FinishReason = 'break' | 'found' | 'task';

type Props = {
  reason: FinishReason;
  segment: Segment | null;
  clip: Clip; // the clip on screen (break/task) or the one marked as found
  remaining: number; // seconds left in that clip
  onLeave: () => void;
  onKeepGoing: () => void;
  onQuickBreak: () => void;
  /** Found card only: take back a mistaken "Got it" / "Yes, got it" (M2). */
  onUndo?: () => void;
};

/**
 * Finish card (T1-06, T2-07, T3-01, T3-05). Leave and Keep going are always the same size,
 * colour and weight (design rule 2), and every completed state is mint (M31).
 */
export function FinishCard({ reason, segment, clip, remaining, onLeave, onKeepGoing, onQuickBreak, onUndo }: Props) {
  // "Gentle vibration" when the card appears (the haptic idea from the smartwatch design).
  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  let title = '';
  let body = '';
  let row: React.ReactNode = null;

  if (reason === 'break') {
    const t = segment?.target ?? 0;
    title = 'Break done';
    body = `That was ${t} of ${t} clips.`;
    // M20: name and show the video that's still running behind the card.
    if (remaining >= FINISH_VIDEO_MIN_S) {
      row = <ClipRow clip={clip} note={`The ${clip.topic} you're on has ${formatClock(remaining)} left`} />;
    }
  } else if (reason === 'found') {
    title = 'Found it';
    body = `You were looking for ${lowerFirst(segment?.purpose ?? 'something')}. It's in your Saved tab.`;
    row = <ClipRow clip={clip} note="Saved" />;
  } else {
    title = 'Task done';
    body =
      segment?.taskEnd === 'minutes'
        ? `Your ${TASK_MINUTES} minutes for the ${segment?.task ?? 'task'} are up.`
        : `You finished the ${segment?.task ?? 'video'}.`;
  }

  return (
    <Sheet>
      <View style={styles.badge} accessibilityElementsHidden>
        <Text style={styles.badgeGlyph}>✓</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
      {row && <View style={{ marginTop: 16 }}>{row}</View>}
      {onUndo && (
        <View style={styles.undo}>
          <Text style={styles.undoText}>Marked as found</Text>
          <Pressable onPress={onUndo} hitSlop={12} accessibilityRole="button" accessibilityLabel="Undo, not found yet">
            <Text style={styles.undoAction}>Undo</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.note}>Your place in the feed is kept either way.</Text>

      <View style={styles.choices}>
        <Button variant="choice" label="Leave" onPress={onLeave} style={styles.choice} />
        <Button variant="choice" label="Keep going" onPress={onKeepGoing} style={styles.choice} />
      </View>

      {/* M25: one tap to a short follow-up break after a task */}
      {reason === 'task' && (
        <Button variant="ghost" label={`Or start a ${FOLLOW_UP_BREAK}-clip break`} onPress={onQuickBreak} style={{ marginTop: 6 }} />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(61,220,151,0.15)',
    borderWidth: 2,
    borderColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  badgeGlyph: { color: COLORS.mint, fontSize: 26, fontWeight: '800' },
  title: { color: COLORS.text, fontSize: TYPE.title2, fontWeight: '700', textAlign: 'center' },
  body: { color: COLORS.textDim, fontSize: TYPE.subhead, textAlign: 'center', marginTop: 6, lineHeight: 21 },
  note: { color: COLORS.textMute, fontSize: TYPE.footnote, textAlign: 'center', marginTop: 16 },
  choices: { flexDirection: 'row', gap: 12, marginTop: 16 },
  undo: {
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.snackbar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  undoText: { color: COLORS.text, fontSize: TYPE.subhead },
  undoAction: { color: COLORS.mint, fontSize: TYPE.subhead, fontWeight: '700' },
  choice: { flex: 1 },
});
