import React, { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, FOLLOW_UP_BREAK, PRESETS, PURPOSE_SUGGESTIONS, TYPE } from '../config';
import { Sheet } from '../components/Sheet';
import { Button, Chip } from '../components/ui';

export type PromptVariant = 'open' | 'break' | 'purpose';

type Choice = { kind: 'break'; n: number } | { kind: 'purpose' } | null;

type Props = {
  variant: PromptVariant; // open = "What are you here for?" (T1-01/T2-01); break = "Another break" (T3-07)
  defaultBreak: number;
  lastBreak?: number;
  onStartBreak: (n: number) => void;
  onStartPurpose: (purpose: string) => void;
  onBrowse: () => void;
  onDismiss: () => void;
};

export function PromptSheet({
  variant,
  defaultBreak,
  lastBreak,
  onStartBreak,
  onStartPurpose,
  onBrowse,
  onDismiss,
}: Props) {
  // M14: the usual (or last-used) length is pre-selected, so a break is one tap.
  const preselect = variant === 'break' ? FOLLOW_UP_BREAK : lastBreak ?? defaultBreak;
  const [choice, setChoice] = useState<Choice>(
    variant === 'purpose' ? { kind: 'purpose' } : { kind: 'break', n: preselect },
  );
  const [text, setText] = useState('');

  const pickBreak = (n: number) => {
    Keyboard.dismiss();
    // M4: every chip responds; tapping the selected one clears the choice.
    setChoice((c) => (c?.kind === 'break' && c.n === n ? null : { kind: 'break', n }));
  };

  const purpose = text.trim();
  const ready = (choice?.kind === 'break') || (choice?.kind === 'purpose' && purpose.length > 0);

  const start = () => {
    if (choice?.kind === 'break') onStartBreak(choice.n);
    else if (choice?.kind === 'purpose' && purpose) onStartPurpose(purpose);
  };

  const label =
    choice?.kind === 'break' ? `Start ${choice.n}-clip break` : choice?.kind === 'purpose' && purpose ? 'Start looking' : 'Start';

  const caption =
    choice?.kind === 'break'
      ? variant === 'open' && choice.n === lastBreak && lastBreak !== defaultBreak
        ? 'Same as last time'
        : choice.n === defaultBreak && variant === 'open'
          ? 'Your usual'
          : ''
      : '';

  const title =
    variant === 'open' ? 'What are you here for?' : variant === 'break' ? 'Another break' : 'Look for something';
  const subtitle =
    variant === 'open'
      ? 'A short break, or something specific. No time limits, no lock-outs.'
      : variant === 'break'
        ? 'The bar counts clips, not minutes.'
        : 'Name what you came for. Only you decide when it’s found.';

  return (
    <Sheet title={title} subtitle={subtitle} onDismiss={onDismiss}>
      {variant !== 'purpose' && (
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>A short break</Text>
            {!!caption && <Text style={styles.caption}>{caption}</Text>}
          </View>
          {/* M34: "clips" once, so the four chips fit on one row */}
          <View style={styles.chips}>
            {PRESETS.map((n) => (
              <Chip
                key={n}
                label={String(n)}
                accessibilityLabel={`${n} clips`}
                selected={choice?.kind === 'break' && choice.n === n}
                onPress={() => pickBreak(n)}
              />
            ))}
            <Text style={styles.unit}>clips</Text>
          </View>
        </View>
      )}

      {variant !== 'break' && (
        <View style={styles.section}>
          <Text style={styles.label}>Something specific</Text>
          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              setChoice({ kind: 'purpose' });
            }}
            onFocus={() => setChoice({ kind: 'purpose' })}
            placeholder="e.g. one editing example"
            placeholderTextColor={COLORS.textMute}
            style={[styles.input, choice?.kind === 'purpose' && styles.inputActive]}
            returnKeyType="go"
            onSubmitEditing={start}
            maxLength={60}
            accessibilityLabel="What are you looking for?"
          />
          <View style={styles.chips}>
            {PURPOSE_SUGGESTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={choice?.kind === 'purpose' && purpose === s}
                onPress={() => {
                  setText(s);
                  setChoice({ kind: 'purpose' });
                }}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {/* M27: readable hint above a plain "Start" instead of faint text inside the button */}
        {!ready && (
          <Text style={styles.hint}>
            {variant === 'open' ? 'Choose a break or a purpose' : variant === 'break' ? 'Choose a length' : 'Type what you’re looking for'}
          </Text>
        )}
        <Button label={label} onPress={start} disabled={!ready} />
        {variant === 'open' && (
          <Button
            variant="ghost"
            label="Just browse – no goal"
            onPress={onBrowse}
            accessibilityHint="Opens the feed without a break or purpose"
          />
        )}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 20, gap: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { color: COLORS.text, fontSize: TYPE.subhead, fontWeight: '600' },
  caption: { color: COLORS.mint, fontSize: TYPE.footnote, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  unit: { color: COLORS.textDim, fontSize: TYPE.subhead, marginLeft: 4 },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHi,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    color: COLORS.text,
    fontSize: TYPE.body,
    paddingHorizontal: 14,
  },
  inputActive: { borderColor: COLORS.mint },
  actions: { marginTop: 24, gap: 8 },
  hint: { color: COLORS.textDim, fontSize: TYPE.footnote, textAlign: 'center' },
});
