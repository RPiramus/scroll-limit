import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/config';
import { isLimitReached } from './src/limit';
import { FeedScreen } from './src/screens/FeedScreen';
import { LockedScreen } from './src/screens/LockedScreen';
import { PromptScreen } from './src/screens/PromptScreen';
import { clearSession, createSession, loadSession, saveSession, type Session } from './src/storage';

type Phase = 'loading' | 'prompt' | 'feed' | 'locked';

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const apply = useCallback((s: Session | null) => {
    sessionRef.current = s;
    setSession(s);
    if (!s) setPhase('prompt');
    else setPhase(isLimitReached(s.count, s.limit) ? 'locked' : 'feed');
  }, []);

  // Cold start: restore today's session, if the 24h window is still open.
  useEffect(() => {
    loadSession().then(apply);
  }, [apply]);

  // 24h reset: fire at resetAt, and re-check whenever the app returns to the foreground
  // (timers don't run while the app is suspended).
  useEffect(() => {
    if (!session) return;
    const expire = async () => {
      await clearSession();
      apply(null);
    };
    const check = () => {
      const s = sessionRef.current;
      if (s && Date.now() >= s.resetAt) expire();
    };
    const timer = setTimeout(check, Math.max(0, session.resetAt - Date.now()) + 50);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [session?.resetAt, apply]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSession = useCallback(
    (limit: number) => {
      const s = createSession(limit);
      saveSession(s);
      apply(s);
    },
    [apply],
  );

  const onCount = useCallback((count: number) => {
    const cur = sessionRef.current;
    if (!cur) return;
    const next = { ...cur, count };
    sessionRef.current = next; // no re-render: the feed owns the live count
    saveSession(next);
  }, []);

  const onLimitReached = useCallback(() => {
    const cur = sessionRef.current;
    if (cur) apply({ ...cur, count: cur.limit });
  }, [apply]);

  const devReset = useCallback(async () => {
    await clearSession();
    apply(null);
  }, [apply]);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {phase === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.mint} />
          </View>
        )}
        {phase === 'prompt' && <PromptScreen onStart={startSession} />}
        {phase === 'feed' && session && (
          <FeedScreen session={session} onCount={onCount} onLimitReached={onLimitReached} />
        )}
        {phase === 'locked' && session && <LockedScreen session={session} onDevReset={devReset} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
