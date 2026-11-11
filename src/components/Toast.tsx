import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, TYPE } from '../config';

export type ToastAction = { label: string; onPress: () => void };

/** Dark snackbar above the tab bar, e.g. "Marked as found · Undo" (M2). */
export function Toast({ message, action, bottom }: { message: string; action?: ToastAction; bottom: number }) {
  const [fade] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [fade, message]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.wrap,
        { bottom, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={12} accessibilityRole="button">
          <Text style={styles.action}>{action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: COLORS.snackbar,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: { color: COLORS.text, fontSize: TYPE.subhead, flexShrink: 1 },
  action: { color: COLORS.mint, fontSize: TYPE.subhead, fontWeight: '700' },
});
