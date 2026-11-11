import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPE } from '../config';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/ui';

/** M26: explain break vs purpose mode (also shown on the You tab). */
export function HowItWorksCards() {
  return (
    <View style={{ gap: 10 }}>
      <Card
        color={COLORS.mint}
        title="A short break"
        body="Pick 5, 10, 15 or 20 clips. The bar counts clips, not minutes. When the break is done the feed pauses and you choose: Leave or Keep going."
      />
      <Card
        color={COLORS.mint}
        title="Something specific"
        body="Name what you came for. Saving a clip asks “Is this it?”, and Got it on the bar marks it found. The bar never fills by itself; you decide."
      />
      <Card
        color={COLORS.amber}
        title="Finishing a video"
        body="Need more time for a tutorial? Keep going → Finish this video. The bar turns amber, recommendations pause, and you're asked again when it ends."
      />
    </View>
  );
}

function Card({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{body}</Text>
      </View>
    </View>
  );
}

export function HowItWorksSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="How Purpose Bar works" subtitle="No time limits, no lock-outs." onDismiss={onClose}>
      <View style={{ marginTop: 16 }}>
        <HowItWorksCards />
      </View>
      <Button variant="secondary" label="Close" onPress={onClose} style={{ marginTop: 16 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHi,
  },
  stripe: { width: 4, borderRadius: 2 },
  cardTitle: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '600' },
  cardBody: { color: COLORS.textDim, fontSize: TYPE.footnote, marginTop: 4, lineHeight: 18 },
});
