import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { Button, Divider, OptionRow, SwitchRow } from '../components/ui';

type Props = {
  status: string; // M6: built from the running session, e.g. "Looking for: … · 1 saved · 4 min"
  savedCount: number;
  showSaved: boolean;
  askOnSave: boolean;
  onToggleAsk: (v: boolean) => void;
  onChange: () => void;
  onSaved: () => void;
  onHow: () => void;
  onEnd: () => void;
  onClose: () => void;
};

/** Session options (X-01), opened by tapping the Purpose Bar. */
export function SessionOptionsSheet({
  status,
  savedCount,
  showSaved,
  askOnSave,
  onToggleAsk,
  onChange,
  onSaved,
  onHow,
  onEnd,
  onClose,
}: Props) {
  return (
    <Sheet title="This session" subtitle={status} onDismiss={onClose}>
      <View style={styles.list}>
        <OptionRow title="Change what I'm doing" sub="Break, purpose or just browse" onPress={onChange} />
        {showSaved && (
          <OptionRow title="Saved clips" sub={`${savedCount} saved this session`} onPress={onSaved} />
        )}
        <SwitchRow
          title="Ask me each time I save"
          value={askOnSave}
          onChange={onToggleAsk}
          onText="On – saving asks “Is this what you came for?”"
          offText="Off – saving just saves"
        />
        <OptionRow title="How it works" sub="Breaks, purposes and tasks" onPress={onHow} />
        <Divider />
        <OptionRow title="End session" sub="See a short summary" onPress={onEnd} />
      </View>
      <Button variant="secondary" label="Close" onPress={onClose} style={{ marginTop: 12 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 12, marginHorizontal: -12 },
});
