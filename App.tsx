import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { clipAt, clipById, type Clip } from './src/clips';
import { COLORS, RESUME_WINDOW_MS, TAB_BAR_HEIGHT, TASK_MINUTES, FOLLOW_UP_BREAK } from './src/config';
import {
  addClip,
  breakSegment,
  browseSegment,
  current,
  endSession,
  isBreakFull,
  lowerFirst,
  newSession,
  purposeSegment,
  pushSegment,
  reopen,
  taskSegment,
  toggleSaved,
  type Segment,
  type Session,
  type TaskEnd,
} from './src/session';
import {
  clearSession,
  DEFAULT_SETTINGS,
  loadSession,
  loadSettings,
  saveSession,
  saveSettings,
  type Settings,
} from './src/storage';
import { formatClock, formatMinutes } from './src/time';

import { FeedScreen, type Playback } from './src/screens/FeedScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { YouScreen } from './src/screens/YouScreen';
import { TabBar, type Tab } from './src/components/TabBar';
import { Toast, type ToastAction } from './src/components/Toast';
import { PromptSheet, type PromptVariant } from './src/sheets/PromptSheet';
import { FinishCard, type FinishReason } from './src/sheets/FinishCard';
import { WhatsNextSheet } from './src/sheets/WhatsNextSheet';
import { TaskSheet } from './src/sheets/TaskSheet';
import { CheckInSheet } from './src/sheets/CheckInSheet';
import { SessionOptionsSheet } from './src/sheets/SessionOptionsSheet';
import { HowItWorksSheet } from './src/sheets/HowItWorks';

/**
 * App state machine (handover §6, "Flow map"):
 *
 *   prompt ─► feed ─► finish card ─┬─► Leave ─────────► summary
 *                                  └─► Keep going ─► What's next ─┬─► another break / purpose ─► feed
 *                                                                 ├─► finish this video (task) ─► feed (amber)
 *                                                                 ├─► just browse ─► feed
 *                                                                 └─► Leave ─► summary
 *
 * The feed stays mounted underneath everything so your place (and the clip on screen) is kept.
 */
type Overlay =
  | { kind: 'prompt'; variant: PromptVariant; back: Overlay | null }
  | { kind: 'finish'; reason: FinishReason; clipId: number; remaining: number }
  | { kind: 'next'; back: Overlay | null }
  | { kind: 'task'; back: Overlay | null }
  | { kind: 'checkin'; clipId: number }
  | { kind: 'options' }
  | { kind: 'how'; back: Overlay | null };

type ToastState = { id: number; message: string; action?: ToastAction };

const remainingOf = (pb: Playback) => {
  const c = clipAt(pb.index);
  return Math.max(0, c.duration - (pb.elapsed % c.duration));
};

/** The finish card this overlay chain started from, if any. */
const finishIn = (o: Overlay | null): Overlay | null => {
  if (!o) return null;
  if (o.kind === 'finish') return o;
  return 'back' in o ? finishIn(o.back) : null;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [session, setSession] = useState<Session | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [screen, setScreen] = useState<'main' | 'summary'>('main');
  const [summaryBack, setSummaryBack] = useState<Overlay | null>(null);
  const [tab, setTab] = useState<Tab>('feed');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [feedKey, setFeedKey] = useState(0);

  const playbackRef = useRef<Playback>({ index: 0, elapsed: 0 });
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- load & persist ----------

  useEffect(() => {
    (async () => {
      const [st, saved] = await Promise.all([loadSettings(), loadSession()]);
      setSettings(st);
      playbackRef.current = { index: st.position, elapsed: 0 };
      const resumable =
        saved && !saved.endedAt && saved.segments.length > 0 && Date.now() - saved.startedAt < RESUME_WINDOW_MS;
      if (resumable) {
        setSession(saved);
      } else {
        await clearSession();
        if (st.askOnOpen) setOverlay({ kind: 'prompt', variant: 'open', back: null });
        else setSession(pushSegment(newSession(), browseSegment([st.position])));
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (session) saveSession(session);
    else clearSession();
  }, [session, ready]);

  useEffect(() => {
    if (ready) saveSettings(settings);
  }, [settings, ready]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // ---------- toast ----------

  const showToast = useCallback((message: string, action?: ToastAction, ms = 2400) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, action });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  // ---------- starting a finish line ----------

  /** Start a new segment. `fresh`: the clip on screen hasn't been watched yet, so it counts. */
  const begin = useCallback((make: (seen: number[]) => Segment, fresh: boolean) => {
    const idx = playbackRef.current.index;
    setSession((prev) => pushSegment(prev && !prev.endedAt ? prev : newSession(), make(fresh ? [idx] : [])));
    setOverlay(null);
  }, []);

  const startBreak = useCallback(
    (n: number, fresh: boolean) => {
      begin((seen) => breakSegment(n, seen), fresh);
      if (fresh) setSettings((st) => ({ ...st, lastBreak: n }));
    },
    [begin],
  );

  const startPurpose = useCallback(
    (p: string, fresh: boolean) => begin((seen) => purposeSegment(p, seen), fresh),
    [begin],
  );

  const startBrowse = useCallback((fresh: boolean) => begin((seen) => browseSegment(seen), fresh), [begin]);

  const startTask = useCallback((task: string, end: TaskEnd) => {
    const idx = playbackRef.current.index;
    setSession((prev) => prev && pushSegment(prev, taskSegment(task, idx, end, TASK_MINUTES)));
    setOverlay(null);
  }, []);

  // ---------- feed events ----------

  const onClipStart = useCallback((index: number) => {
    setSession((prev) => (prev && !prev.endedAt ? addClip(prev, index) : prev));
    setSettings((st) => (st.position === index ? st : { ...st, position: index }));
  }, []);

  const onBreakOver = useCallback(() => {
    const pb = playbackRef.current;
    setOverlay(
      (o) => o ?? { kind: 'finish', reason: 'break', clipId: clipAt(pb.index).id, remaining: remainingOf(pb) },
    );
  }, []);

  const onTaskOver = useCallback(() => {
    const pb = playbackRef.current;
    setOverlay((o) => o ?? { kind: 'finish', reason: 'task', clipId: clipAt(pb.index).id, remaining: 0 });
  }, []);

  // ---------- found (+ Undo, M2) ----------

  // M2: the Found it card appears straight away and carries its own Undo, so a mistaken tap
  // can still be taken back without making everyone wait for a snackbar first.
  const undoFound = useCallback(() => {
    setSession((prev) => prev && { ...prev, found: undefined });
    setOverlay(null);
    showToast('Not found yet. Keep looking.');
  }, [showToast]);

  const markFound = useCallback(
    (clipId: number) => {
      setSettings((st) => (st.library.includes(clipId) ? st : { ...st, library: [clipId, ...st.library] }));
      setSession((prev) => (prev && !prev.saved.includes(clipId) ? { ...prev, saved: [...prev.saved, clipId] } : prev));
      setSession((prev) => prev && { ...prev, found: clipId });
      hideToast();
      setOverlay({ kind: 'finish', reason: 'found', clipId, remaining: 0 });
    },
    [hideToast],
  );

  const onGotIt = useCallback(() => {
    markFound(clipAt(playbackRef.current.index).id);
  }, [markFound]);

  // ---------- saving ----------

  const onSave = useCallback(
    (index: number) => {
      const clip = clipAt(index);
      const was = settingsRef.current.library.includes(clip.id);
      setSettings((st) => ({
        ...st,
        library: was ? st.library.filter((id) => id !== clip.id) : [clip.id, ...st.library],
      }));
      setSession((prev) =>
        prev && !prev.endedAt && prev.saved.includes(clip.id) === was ? toggleSaved(prev, clip.id) : prev,
      );
      Haptics.selectionAsync().catch(() => {});

      const seg = current(sessionRef.current);
      if (!was && seg?.mode === 'purpose' && settingsRef.current.askOnSave) {
        setOverlay({ kind: 'checkin', clipId: clip.id });
      } else {
        showToast(was ? 'Removed from Saved' : 'Saved');
      }
    },
    [showToast],
  );

  const removeSaved = useCallback(
    (clipId: number) => {
      setSettings((st) => ({ ...st, library: st.library.filter((id) => id !== clipId) }));
      setSession((prev) => (prev ? { ...prev, saved: prev.saved.filter((id) => id !== clipId) } : prev));
      showToast('Removed from Saved');
    },
    [showToast],
  );

  // ---------- leaving ----------

  const leave = useCallback((back: Overlay | null) => {
    setSession((prev) => prev && endSession(prev));
    setSummaryBack(finishIn(back));
    setOverlay(null);
    setScreen('summary');
  }, []);

  const summaryBackPress = useCallback(() => {
    setSession((prev) => prev && reopen(prev));
    setScreen('main');
    setOverlay(summaryBack);
  }, [summaryBack]);

  const summaryDone = useCallback(() => {
    setSession(null);
    setScreen('main');
    setTab('feed');
    setSummaryBack(null);
    if (settingsRef.current.askOnOpen) setOverlay({ kind: 'prompt', variant: 'open', back: null });
    else startBrowse(true);
  }, [startBrowse]);

  const openEditor = useCallback(
    async (clip: Clip) => {
      // M15: hand the clip to the system share sheet, which lists installed editors.
      try {
        await Share.share({ message: `${clip.caption} – ${clip.user} (saved with Purpose Bar)` });
      } catch {
        showToast("Couldn't open an editor. The clip is in your Saved tab.");
      }
    },
    [showToast],
  );

  const restartFeed = useCallback(() => {
    playbackRef.current = { index: 0, elapsed: 0 };
    setSettings((st) => ({ ...st, position: 0 }));
    setFeedKey((k) => k + 1);
    setTab('feed');
    showToast('Feed restarted from the first clip');
  }, [showToast]);

  // ---------- render ----------

  if (!ready) {
    return (
      <View style={[styles.root, styles.center]}>
        <StatusBar style="light" />
        <ActivityIndicator color={COLORS.mint} />
      </View>
    );
  }

  const ended = !!session?.endedAt;
  const seg = session && !ended ? current(session) : null;
  const complete = !!finishIn(overlay) || isBreakFull(seg);
  const paused = !seg || overlay != null || tab !== 'feed' || screen !== 'main';
  const pb = playbackRef.current;

  const statusLine = (): string => {
    if (!seg || !session) return '';
    const mins = formatMinutes(Date.now() - session.startedAt);
    switch (seg.mode) {
      case 'break':
        return `${seg.target}-clip break · ${seg.seen.length} of ${seg.target} clips · ${mins}`;
      case 'purpose':
        return `Looking for: ${lowerFirst(seg.purpose ?? '')} · ${session.saved.length} saved · ${mins}`;
      case 'task': {
        const left =
          seg.taskEnd === 'minutes' && seg.taskEndsAt ? (seg.taskEndsAt - Date.now()) / 1000 : remainingOf(pb);
        return `Task: ${seg.task} · ${formatClock(left)} left`;
      }
      case 'browse':
        return `Just browsing · ${mins}`;
    }
  };

  const renderOverlay = () => {
    if (!overlay) return null;
    switch (overlay.kind) {
      case 'prompt': {
        const fresh = overlay.variant === 'open';
        return (
          <PromptSheet
            variant={overlay.variant}
            defaultBreak={settings.defaultBreak}
            lastBreak={settings.lastBreak}
            onStartBreak={(n) => startBreak(n, fresh)}
            onStartPurpose={(p) => startPurpose(p, fresh)}
            onBrowse={() => startBrowse(true)}
            onDismiss={() => {
              if (fresh) {
                // M7: closing the opening sheet = "Not now": feed without a goal.
                startBrowse(true);
                showToast('Just browsing. Tap the bar any time to set a purpose.');
              } else {
                setOverlay(overlay.back);
              }
            }}
          />
        );
      }
      case 'finish':
        return (
          <FinishCard
            reason={overlay.reason}
            segment={seg}
            clip={clipById(overlay.clipId) ?? clipAt(pb.index)}
            remaining={overlay.remaining}
            onLeave={() => leave(overlay)}
            onKeepGoing={() => setOverlay({ kind: 'next', back: overlay })}
            onQuickBreak={() => startBreak(FOLLOW_UP_BREAK, false)}
            onUndo={overlay.reason === 'found' ? undoFound : undefined}
          />
        );
      case 'next':
        return (
          <WhatsNextSheet
            remaining={seg?.mode === 'task' ? 0 : remainingOf(pb)}
            onFinishVideo={() => setOverlay({ kind: 'task', back: overlay })}
            onAnotherBreak={() => setOverlay({ kind: 'prompt', variant: 'break', back: overlay })}
            onNewPurpose={() => setOverlay({ kind: 'prompt', variant: 'purpose', back: overlay })}
            onBrowse={() => startBrowse(false)}
            onLeave={() => leave(overlay.back)}
            onCancel={() => setOverlay(overlay.back)}
          />
        );
      case 'task':
        return (
          <TaskSheet
            clip={clipAt(pb.index)}
            remaining={remainingOf(pb)}
            onContinue={startTask}
            onBack={() => setOverlay(overlay.back)}
          />
        );
      case 'checkin': {
        const clip = clipById(overlay.clipId) ?? clipAt(pb.index);
        return (
          <CheckInSheet
            clip={clip}
            purpose={seg?.purpose ?? ''}
            askOnSave={settings.askOnSave}
            onToggleAsk={(v) => setSettings((st) => ({ ...st, askOnSave: v }))}
            onYes={() => markFound(clip.id)}
            onNotYet={() => {
              setOverlay(null);
              showToast('Saved. Keep looking.');
            }}
          />
        );
      }
      case 'options':
        return (
          <SessionOptionsSheet
            status={statusLine()}
            savedCount={session?.saved.length ?? 0}
            showSaved={seg?.mode === 'purpose'}
            askOnSave={settings.askOnSave}
            onToggleAsk={(v) => setSettings((st) => ({ ...st, askOnSave: v }))}
            onChange={() => setOverlay({ kind: 'next', back: overlay })}
            onSaved={() => {
              setOverlay(null);
              setTab('saved');
            }}
            onHow={() => setOverlay({ kind: 'how', back: overlay })}
            onEnd={() => leave(null)}
            onClose={() => setOverlay(null)}
          />
        );
      case 'how':
        return <HowItWorksSheet onClose={() => setOverlay(overlay.back)} />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={{ flex: 1 }}>
        <FeedScreen
          key={feedKey}
          segment={seg}
          savedClipIds={settings.library}
          sessionSavedCount={session?.saved.length ?? 0}
          startIndex={settings.position}
          paused={paused}
          complete={complete}
          barInteractive={overlay == null && tab === 'feed'}
          playbackRef={playbackRef}
          onClipStart={onClipStart}
          onBreakOver={onBreakOver}
          onTaskOver={onTaskOver}
          onSave={onSave}
          onBarPress={() => setOverlay({ kind: 'options' })}
          onGotIt={onGotIt}
          onTaskDone={onTaskOver}
          onSavedPress={() => setTab('saved')}
        >
          {tab === 'feed' && renderOverlay()}
        </FeedScreen>

        {tab === 'saved' && <SavedScreen library={settings.library} onRemove={removeSaved} />}
        {tab === 'you' && (
          <YouScreen
            settings={settings}
            onChange={(patch) => setSettings((st) => ({ ...st, ...patch }))}
            onRestartFeed={restartFeed}
          />
        )}
      </View>

      <TabBar tab={tab} onChange={setTab} disabled={overlay != null && tab === 'feed'} />

      {screen === 'summary' && session && (
        <View style={StyleSheet.absoluteFill}>
          <SummaryScreen
            session={session}
            backLabel={summaryBack ? 'Back to the finish card' : 'Back to the feed'}
            onDone={summaryDone}
            onBack={summaryBackPress}
            onOpenEditor={openEditor}
          />
        </View>
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          action={toast.action}
          bottom={screen === 'summary' ? insets.bottom + 140 : TAB_BAR_HEIGHT + insets.bottom + 12}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
});
