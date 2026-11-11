import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FINISH_VIDEO_MIN_S } from '../config';
import { formatClock } from '../time';
import { Sheet } from '../components/Sheet';
import { Button, Divider, OptionRow } from '../components/ui';

type Props = {
  remaining: number; // seconds left in the clip on screen
  onFinishVideo: () => void;
  onAnotherBreak: () => void;
  onNewPurpose: () => void;
  onBrowse: () => void;
  onLeave: () => void;
  onCancel: () => void;
};

/** "What's next?" (T3-02 / T3-06). Keep going always starts a new finish line. */
export function WhatsNextSheet({ remaining, onFinishVideo, onAnotherBreak, onNewPurpose, onBrowse, onLeave, onCancel }: Props) {
  return (
    // M23: tap outside or swipe down returns to the finish card, same as Cancel (M3).
    <Sheet title="What's next?" subtitle="Every extension gets its own finish line." onDismiss={onCancel}>
      <View style={styles.list}>
        {remaining >= FINISH_VIDEO_MIN_S && (
          // M13: say how much is left
          <OptionRow
            accent="amber"
            title="Finish this video"
            sub={`${formatClock(remaining)} left · ends with the video`}
            onPress={onFinishVideo}
          />
        )}
        <OptionRow title="Another break" sub="5, 10, 15 or 20 clips" onPress={onAnotherBreak} />
        <OptionRow title="Look for something" sub="Name a purpose; you decide when it's found" onPress={onNewPurpose} />
        <OptionRow title="Just browse" sub="No goal – tap the bar any time to set one" onPress={onBrowse} />
        <Divider />
        {/* M8: Leave is always an option */}
        <OptionRow title="Leave" sub="End the session" onPress={onLeave} />
      </View>
      <Button variant="secondary" label="Cancel" onPress={onCancel} style={{ marginTop: 12 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 12, marginHorizontal: -12 },
});
