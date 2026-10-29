import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALLOW_DEV_RESET, COLORS } from '../config';
import type { Session } from '../storage';
import { formatClock, useNow } from '../time';

type Props = {
  session: Session;
  onDevReset: () => void;
};

export function LockedScreen({ session, onDevReset }: Props) {
  const insets = useSafeAreaInsets();
  const now = useNow(1000);
  const remaining = session.resetAt - now;
  const resetTime = new Date(session.resetAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.ring}>
        <Text style={styles.lock}>🔒</Text>
      </View>

      <Text style={styles.title}>You're done for today</Text>
      <Text style={styles.body}>
        You used all {session.limit} of your scrolls. The feed unlocks again in
      </Text>

      <Pressable
        onLongPress={ALLOW_DEV_RESET ? onDevReset : undefined}
        delayLongPress={2000}
        accessibilityRole="timer"
      >
        <Text style={styles.clock}>{formatClock(remaining)}</Text>
      </Pressable>

      <Text style={styles.meta}>Resets around {resetTime}. Go do something else.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  ring: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lock: { fontSize: 44 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  body: { color: COLORS.textDim, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  clock: {
    color: COLORS.text,
    fontSize: 52,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginVertical: 6,
  },
  meta: { color: COLORS.textDim, fontSize: 14, textAlign: 'center' },
});
