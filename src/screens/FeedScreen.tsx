
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, LOCK_DELAY_MS } from '../config';
import { crossedMilestones, isLimitReached, nextCount } from '../limit';
import type { Session } from '../storage';
import { FeedItem } from '../components/FeedItem';
import { ProgressBar } from '../components/ProgressBar';

type Props = {
  session: Session;
  onCount: (count: number) => void;
  onLimitReached: () => void;
};

export function FeedScreen({
  session,
  onCount,
  onLimitReached,
}: Props) {
  const { limit } = session;
  const startIndex = Math.min(session.count, limit);

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [count, setCount] = useState(session.count);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [locking, setLocking] = useState(false);

  const listRef = useRef<FlatList<number>>(null);
  const countRef = useRef(session.count);
  const activeIndexRef = useRef(startIndex);
  const lockingRef = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dim = useRef(new Animated.Value(0)).current;

  const countedVideos = useRef<Set<number>>(
    new Set(Array.from({ length: startIndex }, (_, i) => i)),
  );

  const data = useMemo(
    () => Array.from({ length: limit + 1 }, (_, i) => i),
    [limit],
  );

  useEffect(() => {
    return () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, []);

  const lockFeed = useCallback(() => {
    if (lockingRef.current) return;

    lockingRef.current = true;
    setLocking(true);

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});

    Animated.timing(dim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    lockTimer.current = setTimeout(onLimitReached, LOCK_DELAY_MS);
  }, [dim, onLimitReached]);

  const returnToCurrentVideo = useCallback(() => {
    if (!size) return;

    listRef.current?.scrollToOffset({
      offset: activeIndexRef.current * size.h,
      animated: false,
    });
  }, [size]);

  // Called by FeedItem when its video actually starts playing.
  const onVideoStarted = useCallback(
    (index: number) => {
      if (lockingRef.current || countedVideos.current.has(index)) return;

      countedVideos.current.add(index);

      const previous = countRef.current;
      const next = nextCount(previous, 1, limit);

      countRef.current = next;
      setCount(next);
      onCount(next);

      const milestones = crossedMilestones(previous, next, limit);

      if (milestones.length > 0) {
        const style =
          milestones[milestones.length - 1] >= 0.9
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium;

        Haptics.impactAsync(style).catch(() => {});
      }
    },
    [limit, onCount],
  );

  const onScrollBeginDrag = useCallback(() => {
    if (lockingRef.current) return;

    if (isLimitReached(countRef.current, limit)) {
      lockFeed();
      returnToCurrentVideo();
    }
  }, [limit, lockFeed, returnToCurrentVideo]);

  // Switch the active player during the swipe instead of waiting for
  // momentum to finish. Adjacent FeedItems stay mounted to prepare ahead.
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!size || lockingRef.current) return;

      const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
      const nextIndex = Math.max(
        0,
        Math.min(limit, Math.round(offsetY / size.h)),
      );

      if (nextIndex === activeIndexRef.current) return;

      // If the current video has reached the limit, do not activate
      // another one. The momentum handler will restore the current page.
      if (isLimitReached(countRef.current, limit)) return;

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
    [size, limit],
  );

  const onMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!size) return;

      const settledIndex = Math.max(
        0,
        Math.min(
          limit,
          Math.round(event.nativeEvent.contentOffset.y / size.h),
        ),
      );

      if (lockingRef.current) {
        returnToCurrentVideo();
        return;
      }

      if (
        isLimitReached(countRef.current, limit) &&
        settledIndex !== activeIndexRef.current
      ) {
        lockFeed();
        returnToCurrentVideo();
        return;
      }

      activeIndexRef.current = settledIndex;
      setActiveIndex(settledIndex);
    },
    [size, limit, lockFeed, returnToCurrentVideo],
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setSize((previous) => {
      if (previous?.w === width && previous?.h === height) {
        return previous;
      }
      return { w: width, h: height };
    });
  }, []);

  return (
    <View style={styles.root} onLayout={onLayout}>
      {size && (
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(index) => String(index)}
          extraData={activeIndex}
          renderItem={({ item }) => (
            <FeedItem
              index={item}
              width={size.w}
              height={size.h}
              active={item === activeIndex && !locking}
              onVideoStarted={onVideoStarted}
            />
          )}
          getItemLayout={(_, index) => ({
            length: size.h,
            offset: size.h * index,
            index,
          })}
          initialScrollIndex={startIndex}
          snapToInterval={size.h}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          scrollEnabled={!locking}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onMomentumScrollEnd={onMomentumEnd}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={false}
        />
      )}

      <ProgressBar
        count={count}
        limit={limit}
        resetAt={session.resetAt}
      />

      <Animated.View
        pointerEvents={locking ? 'auto' : 'none'}
        style={[styles.dim, { opacity: dim }]}
      >
        <Text style={styles.dimTitle}>That was your last video</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  dimTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
});
