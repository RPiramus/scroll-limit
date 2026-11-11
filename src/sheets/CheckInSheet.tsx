import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Clip } from '../clips';
import { lowerFirst } from '../session';
import { ClipRow } from '../components/ClipArt';
import { Sheet } from '../components/Sheet';
import { Button, SwitchRow } from '../components/ui';

type Props = {
  clip: Clip;
  purpose: string;
  askOnSave: boolean;
  onToggleAsk: (v: boolean) => void;
  onYes: () => void;
  onNotYet: () => void;
};

/** "Is this what you came for?" after saving in purpose mode (T2-04). Saving alone never ends it. */
export function CheckInSheet({ clip, purpose, askOnSave, onToggleAsk, onYes, onNotYet }: Props) {
  return (
    <Sheet
      title="Is this what you came for?"
      subtitle={`Looking for: ${lowerFirst(purpose)}`}
      onDismiss={onNotYet}
    >
      <View style={{ marginTop: 16 }}>
        <ClipRow clip={clip} note="Saved" />
      </View>
      <View style={styles.choices}>
        <Button variant="choice" label="Not yet" onPress={onNotYet} style={styles.choice} />
        <Button variant="primary" label="Yes, got it" onPress={onYes} style={styles.choice} />
      </View>
      <View style={{ marginTop: 12, marginHorizontal: -12 }}>
        <SwitchRow
          title="Ask me each time I save"
          value={askOnSave}
          onChange={onToggleAsk}
          onText="On – we'll check in when you save"
          offText="Off – saving won't ask. Use Got it on the bar."
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  choices: { flexDirection: 'row', gap: 12, marginTop: 16 },
  choice: { flex: 1 },
});
