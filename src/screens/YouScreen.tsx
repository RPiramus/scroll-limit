import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, PRESETS, SPACE, TYPE } from '../config';
import type { Settings } from '../storage';
import { HowItWorksCards } from '../sheets/HowItWorks';
import { Button, Chip, SwitchRow } from '../components/ui';

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onRestartFeed: () => void;
};

/** You tab (X-03): defaults and settings. */
export function YouScreen({ settings, onChange, onRestartFeed }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title} accessibilityRole="header">
          You
        </Text>

        <Text style={styles.section}>Usual break</Text>
        <Text style={styles.help}>Pre-selected when the app asks what you’re here for.</Text>
        <View style={styles.chips}>
          {PRESETS.map((n) => (
            <Chip
              key={n}
              label={String(n)}
              accessibilityLabel={`${n} clips`}
              selected={settings.defaultBreak === n}
              onPress={() => onChange({ defaultBreak: n, lastBreak: undefined })}
            />
          ))}
          <Text style={styles.unit}>clips</Text>
        </View>

        <View style={styles.group}>
          {/* M29: same words as the question itself */}
          <SwitchRow
            title="Ask what I'm here for when I open the app"
            value={settings.askOnOpen}
            onChange={(v) => onChange({ askOnOpen: v })}
            onText="On – you'll see “What are you here for?”"
            offText="Off – the feed opens in Just browsing"
          />
          <SwitchRow
            title="Ask me each time I save"
            value={settings.askOnSave}
            onChange={(v) => onChange({ askOnSave: v })}
            onText="On – saving asks “Is this what you came for?”"
            offText="Off – saving just saves"
          />
        </View>

        <Text style={styles.section}>How it works</Text>
        <View style={{ marginTop: 10 }}>
          <HowItWorksCards />
        </View>

        <Text style={styles.section}>Prototype</Text>
        <Text style={styles.help}>Start the feed from the first clip again, e.g. before recording a demo.</Text>
        <Button variant="secondary" label="Restart the feed" onPress={onRestartFeed} style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.bg, paddingHorizontal: SPACE.margin },
  title: { color: COLORS.text, fontSize: TYPE.largeTitle, fontWeight: '700', marginBottom: 8 },
  section: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '600', marginTop: 24 },
  help: { color: COLORS.textDim, fontSize: TYPE.footnote, marginTop: 4 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  unit: { color: COLORS.textDim, fontSize: TYPE.subhead, marginLeft: 4 },
  group: { marginTop: 20, marginHorizontal: -12, borderRadius: 14, backgroundColor: COLORS.surface, paddingVertical: 4 },
});
