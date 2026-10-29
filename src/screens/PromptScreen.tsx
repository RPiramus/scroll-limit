import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT, PRESETS } from '../config';

type Props = { onStart: (limit: number) => void };

export function PromptScreen({ onStart }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(String(DEFAULT_LIMIT));

  const parsed = parseInt(text, 10);
  const valid = Number.isFinite(parsed) && parsed >= MIN_LIMIT && parsed <= MAX_LIMIT;

  const setClamped = (n: number) =>
    setText(String(Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, n))));
  const step = (d: number) => setClamped((Number.isFinite(parsed) ? parsed : 0) + d);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.head}>
        <Text style={styles.kicker}>NEW DAY</Text>
        <Text style={styles.title}>How many scrolls today?</Text>
        <Text style={styles.sub}>
          Pick a number. A bar at the top of the feed fills as you scroll, and when it's full the
          app locks until your 24 hours are up.
        </Text>
      </View>

      <View style={styles.center}>
        <View style={styles.stepper}>
          <Pressable
            accessibilityLabel="Decrease"
            style={styles.stepBtn}
            onPress={() => step(-1)}
            hitSlop={8}
          >
            <Text style={styles.stepGlyph}>−</Text>
          </Pressable>

          <TextInput
            value={text}
            onChangeText={(t) => setText(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            maxLength={3}
            selectTextOnFocus
            style={styles.number}
            accessibilityLabel="Scrolls for today"
          />

          <Pressable
            accessibilityLabel="Increase"
            style={styles.stepBtn}
            onPress={() => step(1)}
            hitSlop={8}
          >
            <Text style={styles.stepGlyph}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.unit}>scrolls</Text>

        <View style={styles.chips}>
          {PRESETS.map((p) => {
            const active = parsed === p;
            return (
              <Pressable
                key={p}
                onPress={() => setClamped(p)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text style={styles.fine}>
          Locked in for 24 hours from now. You can't change it once you start.
        </Text>
        <Pressable
          disabled={!valid}
          onPress={() => valid && onStart(parsed)}
          style={({ pressed }) => [
            styles.cta,
            !valid && styles.ctaDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.ctaText}>
            {valid ? `Start with ${parsed} scroll${parsed === 1 ? '' : 's'}` : `Enter ${MIN_LIMIT}–${MAX_LIMIT}`}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24, justifyContent: 'space-between' },
  head: { gap: 10 },
  kicker: { color: COLORS.mint, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: COLORS.text, fontSize: 34, fontWeight: '800', lineHeight: 40 },
  sub: { color: COLORS.textDim, fontSize: 16, lineHeight: 23 },
  center: { alignItems: 'center', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepGlyph: { color: COLORS.text, fontSize: 30, fontWeight: '500', marginTop: -3 },
  number: {
    color: COLORS.text,
    fontSize: 96,
    fontWeight: '800',
    minWidth: 150,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  unit: { color: COLORS.textDim, fontSize: 16, fontWeight: '600', letterSpacing: 1, marginTop: -6 },
  chips: { flexDirection: 'row', gap: 10, marginTop: 28 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceHi,
  },
  chipActive: { backgroundColor: COLORS.mint, borderColor: COLORS.mint },
  chipText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  chipTextActive: { color: '#06150E' },
  fine: { color: COLORS.textDim, fontSize: 13, textAlign: 'center', marginBottom: 14 },
  cta: {
    backgroundColor: COLORS.mint,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: COLORS.surfaceHi },
  ctaText: { color: '#06150E', fontSize: 17, fontWeight: '800' },
});
