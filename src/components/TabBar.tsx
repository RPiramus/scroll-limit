import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TAB_BAR_HEIGHT, TYPE } from '../config';

export type Tab = 'feed' | 'saved' | 'you';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'feed', label: 'Feed', icon: '▶︎' },
  { key: 'saved', label: 'Saved', icon: '★' },
  { key: 'you', label: 'You', icon: '●' },
];

export function TabBar({ tab, onChange, disabled }: { tab: Tab; onChange: (t: Tab) => void; disabled: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      pointerEvents={disabled ? 'none' : 'auto'}
      style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }, disabled && { opacity: 0.45 }]}
    >
      {TABS.map((t) => {
        const on = t.key === tab;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            onPress={() => onChange(t.key)}
            style={styles.tab}
          >
            <Text style={[styles.icon, { color: on ? COLORS.text : COLORS.textMute }]}>{t.icon}</Text>
            <Text style={[styles.label, { color: on ? COLORS.text : COLORS.textMute }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.stroke,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 44 },
  icon: { fontSize: 18 },
  label: { fontSize: TYPE.tab, fontWeight: '600' },
});
