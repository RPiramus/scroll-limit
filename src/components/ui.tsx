// Design-system primitives matching the Figma components on page 0:
// Button (Primary / Choice / Secondary / Ghost / Disabled), Chip, option and switch rows.
import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';
import { COLORS, SPACE, TYPE } from '../config';

type ButtonVariant = 'primary' | 'choice' | 'secondary' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        disabled ? styles.btn_disabled : styles[`btn_${variant}`],
        pressed && !disabled && { opacity: 0.8 },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.btnText, disabled ? styles.btnText_disabled : styles[`btnText_${variant}`]]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function OptionRow({
  title,
  sub,
  onPress,
  accent,
}: {
  title: string;
  sub?: string;
  onPress: () => void;
  accent?: 'amber' | 'mint';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: COLORS.surfaceHi }]}
    >
      {accent && <View style={[styles.dot, { backgroundColor: COLORS[accent] }]} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </Pressable>
  );
}

/** A switch that confirms what it just did in its subtitle (M21). */
export function SwitchRow({
  title,
  value,
  onChange,
  onText,
  offText,
}: {
  title: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onText: string;
  offText: string;
}) {
  const [touched, setTouched] = useState(false);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={[styles.rowSub, touched && { color: COLORS.mint }]}>{value ? onText : offText}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={(v) => {
          setTouched(true);
          onChange(v);
        }}
        trackColor={{ false: COLORS.stroke, true: COLORS.mint }}
        thumbColor={COLORS.text}
        ios_backgroundColor={COLORS.stroke}
      />
    </View>
  );
}

export const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  btn: {
    height: SPACE.button,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btn_primary: { backgroundColor: COLORS.mint },
  btn_choice: { backgroundColor: COLORS.surfaceHi, borderWidth: 1, borderColor: COLORS.stroke },
  btn_secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.stroke },
  btn_ghost: { backgroundColor: 'transparent', height: SPACE.touch },
  btn_disabled: { backgroundColor: COLORS.surfaceHi },
  btnText: { fontSize: TYPE.headline, fontWeight: '600' },
  btnText_primary: { color: COLORS.mintInk },
  btnText_choice: { color: COLORS.text },
  btnText_secondary: { color: COLORS.text },
  btnText_ghost: { color: COLORS.textDim, fontSize: TYPE.subhead },
  btnText_disabled: { color: COLORS.textDim },

  chip: {
    minWidth: 52,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceHi,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: COLORS.mint, borderColor: COLORS.mint },
  chipText: { color: COLORS.text, fontSize: TYPE.subhead, fontWeight: '600' },
  chipTextSelected: { color: COLORS.mintInk },

  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowTitle: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '600' },
  rowSub: { color: COLORS.textDim, fontSize: TYPE.footnote, marginTop: 2 },
  rowChevron: { color: COLORS.textMute, fontSize: 24, marginTop: -2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.stroke, marginVertical: 4 },
});
