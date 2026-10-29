
import React, { memo, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, VIDEO_COUNT, VIDEO_MUTED } from '../config';
import { tintFor, videoFor } from '../videos';

type Props = {
  index: number;
  height: number;
  width: number;
  active: boolean;
  onVideoStarted: (index: number) => void;
};

const DOUBLE_TAP_MS = 280;

function FeedItemBase({
  index,
  height,
  width,
  active,
  onVideoStarted,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [paused, setPaused] = useState(false);

  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const player = useVideoPlayer(videoFor(index), (p) => {
    p.loop = true;
    p.muted = VIDEO_MUTED;
  });

  // Subscribe once per player. Count only its first actual playback start.
  useEffect(() => {
    const subscription = player.addListener(
      'playingChange',
      ({ isPlaying }) => {
        if (isPlaying && active && !paused && !startedRef.current) {
          startedRef.current = true;
          onVideoStarted(index);
        }
      },
    );

    return () => subscription.remove();
  }, [player, index, active, paused, onVideoStarted]);

  // Start immediately when this item becomes active.
  useEffect(() => {
    if (active && !paused) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, paused, player]);

  // Reset inactive videos so they start from the beginning next time.
  useEffect(() => {
    if (!active) {
      player.currentTime = 0;
      setPaused(false);
    }
  }, [active, player]);

  useEffect(() => {
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, []);

  const onPress = () => {
    const now = Date.now();

    if (now - lastTap.current < DOUBLE_TAP_MS) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = 0;
      setLiked(true);
    } else {
      lastTap.current = now;
      tapTimer.current = setTimeout(() => {
        setPaused((previous) => !previous);
      }, DOUBLE_TAP_MS);
    }
  };

  const n = (index % VIDEO_COUNT) + 1;
  const likes = 1200 + ((n * 7919) % 90000) + (liked ? 1 : 0);

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: tintFor(index),
      }}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </Pressable>

      {paused && active && (
        <View pointerEvents="none" style={styles.pauseWrap}>
          <Text style={styles.pauseGlyph}>▶</Text>
        </View>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.gradient}
      />

      <View style={styles.rail}>
        <Pressable
          style={styles.railBtn}
          onPress={() => setLiked((previous) => !previous)}
          hitSlop={8}
        >
          <Text
            style={[
              styles.railIcon,
              liked && { color: COLORS.coral },
            ]}
          >
            ♥
          </Text>
          <Text style={styles.railCount}>{formatCount(likes)}</Text>
        </Pressable>

        <View style={styles.railBtn}>
          <Text style={styles.railIcon}>💬</Text>
          <Text style={styles.railCount}>
            {formatCount(40 + ((n * 313) % 4000))}
          </Text>
        </View>

        <View style={styles.railBtn}>
          <Text style={styles.railIcon}>↗</Text>
          <Text style={styles.railCount}>Share</Text>
        </View>
      </View>

      <View pointerEvents="none" style={styles.caption}>
        <Text style={styles.user}>
          @placeholder_{String(n).padStart(2, '0')}
        </Text>
        <Text style={styles.text}>
          Placeholder video {n} · swipe up for the next one
        </Text>
      </View>
    </View>
  );
}

function formatCount(n: number) {
  return n >= 1000
    ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    : String(n);
}

export const FeedItem = memo(FeedItemBase);

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
  },
  pauseWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseGlyph: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 72,
  },
  rail: {
    position: 'absolute',
    right: 10,
    bottom: 110,
    alignItems: 'center',
    gap: 18,
  },
  railBtn: {
    alignItems: 'center',
    gap: 2,
  },
  railIcon: {
    color: COLORS.text,
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
  },
  railCount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    position: 'absolute',
    left: 14,
    right: 84,
    bottom: 40,
    gap: 4,
  },
  user: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    opacity: 0.9,
  },
});
