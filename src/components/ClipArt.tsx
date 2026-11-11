import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Clip } from '../clips';
import { COLORS, TYPE } from '../config';

/** Placeholder art for a clip (full-screen in the feed, or a small vertical thumbnail). */
export function ClipArt({ clip, size, style }: { clip: Clip; size: 'full' | 'thumb'; style?: StyleProp<ViewStyle> }) {
  const full = size === 'full';
  return (
    <LinearGradient
      colors={clip.colors}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[full ? StyleSheet.absoluteFill : styles.thumb, styles.center, style]}
    >
      <Text style={{ fontSize: full ? 112 : 26 }}>{clip.glyph}</Text>
      {full && !!clip.overlay && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{clip.overlay}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

/** Thumbnail + caption row used on the check-in sheet, finish cards and summary. */
export function ClipRow({ clip, note }: { clip: Clip; note?: string }) {
  return (
    <View style={styles.row}>
      <ClipArt clip={clip} size="thumb" />
      <View style={{ flex: 1 }}>
        <Text style={styles.user}>{clip.user}</Text>
        <Text style={styles.caption} numberOfLines={2}>
          {clip.caption}
        </Text>
        {!!note && <Text style={styles.note}>{note}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 54, height: 80, borderRadius: 10, overflow: 'hidden' },
  overlay: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayText: { color: COLORS.text, fontSize: TYPE.footnote, fontWeight: '800', letterSpacing: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHi,
  },
  user: { color: COLORS.text, fontSize: TYPE.footnote, fontWeight: '700' },
  caption: { color: COLORS.textDim, fontSize: TYPE.footnote, marginTop: 2 },
  note: { color: COLORS.mint, fontSize: TYPE.footnote, marginTop: 4, fontWeight: '600' },
});
