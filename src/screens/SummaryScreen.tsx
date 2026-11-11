import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clipById, type Clip } from '../clips';
import { COLORS, SPACE, TYPE } from '../config';
import { describeSegment, minutesBetween, type Session } from '../session';
import { ClipRow } from '../components/ClipArt';
import { Button } from '../components/ui';

type Props = {
  session: Session;
  backLabel: string;
  onDone: () => void;
  onBack: () => void;
  onOpenEditor: (clip: Clip) => void;
};

/**
 * "Session ended" receipt (T1-07, T2-08, T3-10). One layout for every flow, with Back in the
 * same place (M9). Replaces the old 24-hour lock screen.
 */
export function SummaryScreen({ session, backLabel, onDone, onBack, onOpenEditor }: Props) {
  const insets = useSafeAreaInsets();
  const found = session.found != null ? clipById(session.found) : undefined;
  const minutes = minutesBetween(session.startedAt, session.endedAt ?? session.startedAt);
  const came = session.segments.map(describeSegment);
  const watched = session.watched.length;
  const saved = session.saved.length;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Text style={styles.badgeGlyph}>✓</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Session ended
        </Text>
        <Text style={styles.sub}>Here’s your session. Your place in the feed is saved.</Text>

        <View style={styles.card}>
          <Row label="Came for" value={came.length ? came.join('\n') : 'Just browsing'} />
          <Row label="Watched" value={`${watched} clip${watched === 1 ? '' : 's'}`} />
          <Row label="Time" value={`${minutes} min`} />
          <Row label="Saved" value={`${saved} clip${saved === 1 ? '' : 's'}`} last />
        </View>

        {found && (
          <View style={{ marginTop: 20, gap: 10 }}>
            <Text style={styles.section}>What you found</Text>
            <ClipRow clip={found} note="In your Saved tab" />
            <Button variant="secondary" label="Open in video editor" onPress={() => onOpenEditor(found)} />
          </View>
        )}
      </ScrollView>

      <View style={{ gap: 8 }}>
        <Button label="Done" onPress={onDone} />
        <Button variant="ghost" label={backLabel} onPress={onBack} />
      </View>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACE.margin },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.mint,
    backgroundColor: 'rgba(61,220,151,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeGlyph: { color: COLORS.mint, fontSize: 30, fontWeight: '800' },
  title: { color: COLORS.text, fontSize: TYPE.largeTitle, fontWeight: '700' },
  sub: { color: COLORS.textDim, fontSize: TYPE.subhead, marginTop: 6 },
  card: { marginTop: 24, borderRadius: 16, backgroundColor: COLORS.surface, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.stroke },
  rowLabel: { color: COLORS.textDim, fontSize: TYPE.subhead },
  rowValue: { color: COLORS.text, fontSize: TYPE.subhead, fontWeight: '600', textAlign: 'right', flexShrink: 1, lineHeight: 21 },
  section: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '600' },
});
