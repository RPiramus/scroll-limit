import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { clipAt } from '../clips';
import { COLORS, FEED_LENGTH, LAST_CLIP_MAX_S, TASK_MINUTES } from '../config';
import { isBreakFull, type Segment } from '../session';
import { FeedItem } from '../components/FeedItem';
import { PurposeBar } from '../components/PurposeBar';
import { useNow } from '../time';

export type Playback = { index: number; elapsed: number };

type Props = {
  segment: Segment | null; // null while the opening sheet is up (no session yet)
  savedClipIds: number[];
  sessionSavedCount: number;
  startIndex: number;
  paused: boolean; // a sheet is open, another tab is showing, …
  complete: boolean;
  barInteractive: boolean;
  playbackRef: MutableRefObject<Playback>;
  onClipStart: (index: number) => void;
  onBreakOver: () => void;
  onTaskOver: () => void;
  onSave: (index: number) => void;
  onBarPress: () => void;
  onGotIt: () => void;
  onTaskDone: () => void;
  onSavedPress: () => void;
  children?: React.ReactNode; // sheets: drawn above the feed, below the Purpose Bar (M22)
};

const TICK_MS = 250;

export function FeedScreen({
  segment,
  savedClipIds,
  sessionSavedCount,
  startIndex,
  paused,
  complete,
  barInteractive,
  playbackRef,
  onClipStart,
  onBreakOver,
  onTaskOver,
  onSave,
  onBarPress,
  onGotIt,
  onTaskDone,
  onSavedPress,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [elapsed, setElapsed] = useState(0); // seconds into the active clip
  const [userPaused, setUserPaused] = useState(false);

  const listRef = useRef<FlatList<number>>(null);
  const activeRef = useRef(startIndex);

  const breakFull = isBreakFull(segment);
  const taskLocked = segment?.mode === 'task' && !complete;
  const clip = clipAt(activeIndex);
  const running = !!segment && !paused && !userPaused;

  const now = useNow(TICK_MS);

  // Latest values for scroll handlers, so the FlatList callbacks can stay stable.
  const live = useRef({ breakFull, taskLocked, hasSegment: !!segment, onBreakOver, onClipStart, size });
  useLayoutEffect(() => {
    live.current = { breakFull, taskLocked, hasSegment: !!segment, onBreakOver, onClipStart, size };
    playbackRef.current = { index: activeIndex, elapsed };
  });

  const data = useMemo(() => Array.from({ length: FEED_LENGTH }, (_, i) => i), []);

  // Switch the playing clip (during a swipe, so the next one starts without waiting).
  const activate = useCallback((i: number) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    setActiveIndex(i);
    setElapsed(0);
    setUserPaused(false);
  }, []);

  // Last feed index that was counted. Counting happens as soon as a clip is mostly on screen,
  // not when scrolling stops: fast repeated swipes interrupt momentum, and iOS then never sends
  // onMomentumScrollEnd for the clips in between, so they were never counted.
  const countedRef = useRef(startIndex);

  const count = useCallback((i: number) => {
    const last = countedRef.current;
    if (i === last) return;
    countedRef.current = i;
    if (!live.current.hasSegment) return;
    // A very fast flick can cross more than one page between two scroll events: count the
    // clips it passed through too (forward only; App ignores clips already counted).
    const from = i > last + 1 && i - last <= 5 ? last + 1 : i;
    for (let k = from; k <= i; k++) live.current.onClipStart(k);
  }, []);

  const settle = useCallback(
    (i: number) => {
      activate(i);
      count(i);
    },
    [activate, count],
  );

  // Resuming a session: the clip on screen counts.
  useEffect(() => {
    if (live.current.hasSegment) live.current.onClipStart(activeRef.current);
  }, []);

  // Playback clock for the active clip.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  // Break: the last clip plays to its end (max LAST_CLIP_MAX_S), then the finish card.
  useEffect(() => {
    if (breakFull && !paused && elapsed >= Math.min(clip.duration, LAST_CLIP_MAX_S)) onBreakOver();
  }, [breakFull, paused, elapsed, clip.duration, onBreakOver]);

  // Task: ends with the video, or after TASK_MINUTES.
  let task: { remaining: number; progress: number } | undefined;
  if (segment?.mode === 'task') {
    if (segment.taskEnd === 'minutes' && segment.taskEndsAt) {
      const total = TASK_MINUTES * 60;
      const remaining = Math.max(0, (segment.taskEndsAt - now) / 1000);
      task = { remaining, progress: 1 - remaining / total };
    } else {
      const remaining = Math.max(0, clip.duration - elapsed);
      task = { remaining, progress: Math.min(1, elapsed / clip.duration) };
    }
  }
  const taskOver = !!task && task.remaining <= 0;
  useEffect(() => {
    if (taskOver && !paused && !complete) onTaskOver();
  }, [taskOver, paused, complete, onTaskOver]);

  const indexAt = (y: number, h: number) => Math.max(0, Math.min(FEED_LENGTH - 1, Math.round(y / h)));
  // "Mostly on screen": within a quarter page of clip i. A small peek at the next clip and
  // back (under ~75% of the way) doesn't count.
  const isOnPage = (y: number, h: number, i: number) => Math.abs(y - i * h) < h * 0.25;

  const snapBack = useCallback(() => {
    const s = live.current.size;
    if (s) listRef.current?.scrollToOffset({ offset: activeRef.current * s.h, animated: true });
  }, []);

  // A sheet can open mid-drag (e.g. the finish card); settle back on the clip that's playing.
  useEffect(() => {
    if (paused) snapBack();
  }, [paused, snapBack]);

  const onScrollBeginDrag = useCallback(() => {
    // Trying to go past the last clip of a break pauses the feed on the finish card.
    if (live.current.breakFull) live.current.onBreakOver();
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const s = live.current.size;
      if (!s || live.current.breakFull) return;
      const y = e.nativeEvent.contentOffset.y;
      const i = indexAt(y, s.h);
      activate(i); // past halfway: the next clip starts playing
      if (isOnPage(y, s.h, i)) count(i);
    },
    [activate, count],
  );

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const s = live.current.size;
      if (!s) return;
      const y = e.nativeEvent.contentOffset.y;
      const i = indexAt(y, s.h);
      if (live.current.breakFull && i !== activeRef.current) return snapBack();
      if (isOnPage(y, s.h, i)) settle(i);
    },
    [settle, snapBack],
  );

  // Accessibility action "Next clip" (M16).
  const goNext = useCallback(() => {
    const s = live.current.size;
    if (!s || live.current.taskLocked) return;
    if (live.current.breakFull) return live.current.onBreakOver();
    const i = Math.min(FEED_LENGTH - 1, activeRef.current + 1);
    listRef.current?.scrollToOffset({ offset: i * s.h, animated: true });
    settle(i);
  }, [settle]);

  const togglePause = useCallback(() => setUserPaused((p) => !p), []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev?.w === width && prev?.h === height ? prev : { w: width, h: height }));
  }, []);

  const playing = !paused && !userPaused;
  const activeProgress = taskLocked && task
    ? Math.min(1, elapsed / clip.duration)
    : (elapsed % clip.duration) / clip.duration;

  return (
    <View style={styles.root} onLayout={onLayout}>
      {size && (
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(i) => String(i)}
          extraData={`${activeIndex}|${playing}|${activeProgress}|${savedClipIds.join(',')}`}
          renderItem={({ item }) => {
            const isActive = item === activeIndex;
            const c = clipAt(item);
            return (
              <FeedItem
                index={item}
                clip={c}
                width={size.w}
                height={size.h}
                active={isActive}
                playing={isActive && playing}
                saved={savedClipIds.includes(c.id)}
                progress={isActive ? activeProgress : 0}
                topInset={insets.top}
                onTogglePause={togglePause}
                onSave={onSave}
                onNext={goNext}
              />
            );
          }}
          getItemLayout={(_, index) => ({ length: size.h, offset: size.h * index, index })}
          initialScrollIndex={startIndex}
          snapToInterval={size.h}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          scrollEnabled={!paused && !taskLocked}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEnd}
          onMomentumScrollEnd={onScrollEnd}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={false}
        />
      )}

      {children}

      {segment && (
        <PurposeBar
          segment={segment}
          savedCount={sessionSavedCount}
          complete={complete}
          task={task}
          interactive={barInteractive}
          onPress={onBarPress}
          onGotIt={onGotIt}
          onTaskDone={onTaskDone}
          onSavedPress={onSavedPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
});
