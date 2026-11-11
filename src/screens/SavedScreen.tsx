import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clipById } from '../clips';
import { COLORS, SPACE, TYPE } from '../config';
import { ClipArt } from '../components/ClipArt';

type Props = { library: number[]; onRemove: (clipId: number) => void };

/** Saved tab (X-02). */
export function SavedScreen({ library, onRemove }: Props) {
  const insets = useSafeAreaInsets();
  const clips = library.map(clipById).filter((c) => !!c);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title} accessibilityRole="header">
        Saved
      </Text>
      {clips.length === 0 ? (
        <Text style={styles.empty}>Nothing saved yet. Tap Save on a clip to keep it here.</Text>
      ) : (
        <FlatList
          data={clips}
          keyExtractor={(c) => String(c.id)}
          numColumns={3}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.cell}
              onLongPress={() => onRemove(item.id)}
              accessibilityLabel={`${item.caption}. Long-press to remove`}
            >
              <ClipArt clip={item} size="thumb" style={styles.thumb} />
              <Text style={styles.caption} numberOfLines={2}>
                {item.caption}
              </Text>
            </Pressable>
          )}
        />
      )}
      {clips.length > 0 && <Text style={styles.footnote}>Long-press a clip to remove it.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.bg, paddingHorizontal: SPACE.margin },
  title: { color: COLORS.text, fontSize: TYPE.largeTitle, fontWeight: '700', marginBottom: 16 },
  empty: { color: COLORS.textDim, fontSize: TYPE.subhead, marginTop: 8 },
  cell: { flex: 1 / 3, maxWidth: '32%' },
  thumb: { width: '100%', height: undefined, aspectRatio: 9 / 16, borderRadius: 12 },
  caption: { color: COLORS.textDim, fontSize: 12, marginTop: 6 },
  footnote: { color: COLORS.textMute, fontSize: TYPE.footnote, textAlign: 'center', paddingVertical: 8 },
});
