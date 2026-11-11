import React, { memo, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

import type { Clip } from '../clips';
import { COLORS, TYPE, VIDEO_MUTED } from '../config';
import { ClipArt } from './ClipArt';

type Props = {
  index: number;
  clip: Clip;
  width: number;
  height: number;
  active: boolean;
  playing: boolean;
  saved: boolean;
  /** 0..1 through the current play of the clip (active item only). */
  progress: number;
  topInset: number;
  onTogglePause: () => void;
  onSave: (index: number) => void;
  onNext: () => void;
};

const DOUBLE_TAP_MS = 280;

function FeedItemBase({
  index,
  clip,
  width,
  height,
  active,
  playing,
  saved,
  progress,
  topInset,
  onTogglePause,
  onSave,
  onNext,
}: Props) {
  const [liked, setLiked] = useState(false);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    },
    [],
  );

  // Single tap pauses, double tap likes.
  const onPress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = 0;
      setLiked(true);
    } else {
      lastTap.current = now;
      tapTimer.current = setTimeout(onTogglePause, DOUBLE_TAP_MS);
    }
  };

  const likes = 1200 + ((clip.id * 7919) % 90000) + (liked ? 1 : 0);

  return (
    <View
      style={{ width, height, backgroundColor: COLORS.bg }}
      // M16: swipe isn't the only way on. VoiceOver users get "Next clip" and "Save".
      accessible
      accessibilityLabel={`${clip.user}. ${clip.caption}`}
      accessibilityActions={[
        { name: 'next', label: 'Next clip' },
        { name: 'save', label: saved ? 'Remove from Saved' : 'Save' },
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'next') onNext();
        if (e.nativeEvent.actionName === 'save') onSave(index);
      }}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
        {clip.source ? (
          <ClipVideo source={clip.source} active={active} playing={playing} />
        ) : (
          <ClipArt clip={clip} size="full" />
        )}
      </Pressable>

      {active && !playing && (
        <View pointerEvents="none" style={styles.pauseWrap}>
          <Text style={styles.pauseGlyph}>▶</Text>
        </View>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.gradient}
      />

      <View style={styles.rail}>
        <RailButton
          icon="♥"
          label={formatCount(likes)}
          color={liked ? COLORS.like : COLORS.text}
          onPress={() => setLiked((v) => !v)}
          a11y={liked ? 'Unlike' : 'Like'}
        />
        <RailButton icon="💬" label={formatCount(40 + ((clip.id * 313) % 4000))} a11y="Comments" />
        <RailButton
          icon={saved ? '★' : '☆'}
          label={saved ? 'Saved' : 'Save'}
          color={saved ? COLORS.mint : COLORS.text}
          onPress={() => onSave(index)}
          a11y={saved ? 'Remove from Saved' : 'Save'}
        />
        <RailButton icon="↗" label="Share" a11y="Share" />
      </View>

      <View pointerEvents="none" style={styles.caption}>
        {/* M5: a thin progress line for the video, above the caption */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 1000) / 10}%` }]} />
        </View>
        <Text style={styles.user}>{clip.user}</Text>
        <Text style={styles.text} numberOfLines={2}>
          {clip.caption}
        </Text>
      </View>

      {/* keep the bar area readable over bright clips */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.45)', 'transparent']}
        style={[styles.topShade, { height: topInset + 110 }]}
      />
    </View>
  );
}

function RailButton({
  icon,
  label,
  color = COLORS.text,
  onPress,
  a11y,
}: {
  icon: string;
  label: string;
  color?: string;
  onPress?: () => void;
  a11y: string;
}) {
  return (
    <Pressable
      style={styles.railBtn}
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <Text style={[styles.railIcon, { color }]}>{icon}</Text>
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}

/** Real clip playback, used once a clip in src/clips.ts has a `source`. */
function ClipVideo({ source, active, playing }: { source: VideoSource; active: boolean; playing: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = VIDEO_MUTED;
  });

  useEffect(() => {
    if (playing) player.play();
    else player.pause();
  }, [playing, player]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- expo-video exposes seeking as a settable property
    if (!active) player.currentTime = 0;
  }, [active, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
}

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);
}

export const FeedItem = memo(FeedItemBase);

const styles = StyleSheet.create({
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
  topShade: { position: 'absolute', left: 0, right: 0, top: 0 },
  pauseWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseGlyph: { color: 'rgba(255,255,255,0.85)', fontSize: 72 },
  rail: { position: 'absolute', right: 8, bottom: 96, alignItems: 'center', gap: 16 },
  railBtn: { alignItems: 'center', minWidth: 52, minHeight: 44, gap: 2 },
  railIcon: {
    fontSize: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
  },
  railLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  caption: { position: 'absolute', left: 16, right: 84, bottom: 20, gap: 4 },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.9)' },
  user: { color: COLORS.text, fontSize: TYPE.headline, fontWeight: '700' },
  text: { color: COLORS.text, fontSize: TYPE.subhead, opacity: 0.92 },
});
