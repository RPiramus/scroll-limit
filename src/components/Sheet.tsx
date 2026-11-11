import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, SPACE, TYPE } from '../config';

type Props = {
  title?: string;
  subtitle?: string;
  /** If set, the sheet closes on a tap outside or a swipe down (M7, M23). Omit for decision cards. */
  onDismiss?: () => void;
  children: React.ReactNode;
};

/**
 * Bottom sheet over a dimmed backdrop. Slides up from the bottom (300 ms, ease-out), so moving
 * from one sheet to the next never cross-fades two cards on top of each other (M35).
 */
export function Sheet({ title, subtitle, onDismiss, children }: Props) {
  const [y] = useState(() => new Animated.Value(500));
  const [fade] = useState(() => new Animated.Value(0));
  const dismissRef = useRef(onDismiss);
  useLayoutEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [y, fade]);

  const close = useCallback(() => {
    const done = dismissRef.current;
    if (!done) return;
    Animated.parallel([
      Animated.timing(y, { toValue: 500, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => done());
  }, [y, fade]);

  const dismissible = !!onDismiss;
  const pan = useMemo(
    () =>
      // PanResponder only stores these callbacks; the ref inside `close` is read on gesture, not render.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          dismissible && g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
        onPanResponderMove: (_, g) => y.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy > 110 || g.vy > 0.9) close();
          else Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        },
        onPanResponderTerminate: () =>
          Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start(),
      }),
    [y, close, dismissible],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: fade }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          disabled={!onDismiss}
          accessible={!!onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View
          {...pan.panHandlers}
          accessibilityViewIsModal
          style={[styles.sheet, { transform: [{ translateY: y }] }]}
        >
          <View style={[styles.handle, !onDismiss && { opacity: 0 }]} />
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: COLORS.scrim },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACE.sheet,
    paddingTop: 8,
    paddingBottom: SPACE.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.stroke,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.stroke,
    marginBottom: 14,
  },
  title: { color: COLORS.text, fontSize: TYPE.title2, fontWeight: '700' },
  subtitle: { color: COLORS.textDim, fontSize: TYPE.subhead, marginTop: 4, lineHeight: 20 },
});
