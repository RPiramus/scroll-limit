import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Clip } from '../clips';
import { COLORS, TASK_MINUTES, TYPE } from '../config';
import type { TaskEnd } from '../session';
import { formatClock } from '../time';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/ui';

type Props = {
  clip: Clip;
  remaining: number;
  onContinue: (task: string, end: TaskEnd) => void;
  onBack: () => void;
};

/** Name the task (T3-03). Task mode is amber and ends with the video. */
export function TaskSheet({ clip, remaining, onContinue, onBack }: Props) {
  const [name, setName] = useState(clip.topic);
  const [end, setEnd] = useState<TaskEnd>('video');
  const task = name.trim();

  return (
    <Sheet title="Finish this video" subtitle="What do you need it for? The bar turns amber until it ends." onDismiss={onBack}>
      <Text style={styles.label}>Task</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. auto-layout tutorial"
        placeholderTextColor={COLORS.textMute}
        style={styles.input}
        maxLength={50}
        accessibilityLabel="Task name"
      />

      <Text style={styles.label}>Ends</Text>
      <Radio
        selected={end === 'video'}
        title="When the video ends"
        sub={`${formatClock(remaining)} left`}
        onPress={() => setEnd('video')}
      />
      {/* M33: the second option is real, not decorative */}
      <Radio
        selected={end === 'minutes'}
        title={`After ${TASK_MINUTES} more minutes`}
        sub="For tutorials you pause and follow along"
        onPress={() => setEnd('minutes')}
      />

      <View style={styles.actions}>
        {!task && <Text style={styles.hint}>Give the task a name</Text>}
        <Button label="Continue" onPress={() => task && onContinue(task, end)} disabled={!task} />
        <Button variant="ghost" label="Back" onPress={onBack} />
      </View>
    </Sheet>
  );
}

function Radio({ selected, title, sub, onPress }: { selected: boolean; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.radio, selected && styles.radioOn]}
    >
      <View style={[styles.dot, selected && styles.dotOn]}>{selected && <View style={styles.dotInner} />}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.radioTitle}>{title}</Text>
        <Text style={styles.radioSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.text, fontSize: TYPE.subhead, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHi,
    borderWidth: 1,
    borderColor: COLORS.amber,
    color: COLORS.text,
    fontSize: TYPE.body,
    paddingHorizontal: 14,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    marginBottom: 8,
  },
  radioOn: { borderColor: COLORS.amber, backgroundColor: 'rgba(255,176,32,0.08)' },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.textMute, alignItems: 'center', justifyContent: 'center' },
  dotOn: { borderColor: COLORS.amber },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.amber },
  radioTitle: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '600' },
  radioSub: { color: COLORS.textDim, fontSize: TYPE.footnote, marginTop: 2 },
  actions: { marginTop: 16, gap: 8 },
  hint: { color: COLORS.textDim, fontSize: TYPE.footnote, textAlign: 'center' },
});
