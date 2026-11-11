import type { VideoSource } from 'expo-video';

/**
 * The feed catalogue.
 *
 * The old assets/videos folder held other people's TikTok clips (faces, logos, captions), which
 * we can't ship in a submitted prototype (handover §5). Until the team's own campus clips are in,
 * each clip renders as a styled placeholder card. To use a real clip:
 *
 *   1. Put a short vertical MP4 in assets/clips/, e.g. assets/clips/food-stall.mp4
 *   2. Add `source: require('../assets/clips/food-stall.mp4')` to that clip below
 *   3. Set `duration` to the clip's length in seconds
 *
 * Feed position i shows CLIPS[i % CLIPS.length]. The tutorial is 10th, so a 10-clip break
 * started from the top of the feed ends on it (flow T3: "break ends mid-tutorial").
 */
export type Clip = {
  id: number;
  user: string;
  caption: string;
  topic: string; // short noun phrase used in task names and finish cards
  kind: 'short' | 'tutorial';
  duration: number; // seconds
  colors: readonly [string, string];
  glyph: string;
  overlay?: string; // large text on the placeholder art
  source?: VideoSource;
};

const BASE_CLIPS: Clip[] = [
  {
    id: 1,
    user: '@north_gate_eats',
    caption: 'Late-night jianbing at the north gate stall',
    topic: 'food stall clip',
    kind: 'short',
    duration: 14,
    colors: ['#5A2A12', '#1C0D07'],
    glyph: '🥞',
  },
  {
    id: 2,
    user: '@lower_pitch_fc',
    caption: 'Last-minute winner on the lower pitch',
    topic: 'football clip',
    kind: 'short',
    duration: 18,
    colors: ['#14502E', '#07150D'],
    glyph: '⚽️',
  },
  {
    id: 3,
    user: '@cutcraft',
    caption: 'J-cut vs L-cut in 30 seconds · editing example',
    topic: 'editing example',
    kind: 'short',
    duration: 30,
    colors: ['#1F2A6B', '#0A0D22'],
    glyph: '🎬',
    overlay: 'J-CUT / L-CUT',
  },
  {
    id: 4,
    user: '@desk_diary',
    caption: 'Dorm desk reset before finals week',
    topic: 'desk setup',
    kind: 'short',
    duration: 16,
    colors: ['#4A3B2A', '#15110C'],
    glyph: '🪴',
  },
  {
    id: 5,
    user: '@after_rain',
    caption: 'Rainy evening walk down the main street',
    topic: 'street walk',
    kind: 'short',
    duration: 22,
    colors: ['#203A4E', '#0A1219'],
    glyph: '🌧️',
  },
  {
    id: 6,
    user: '@library_cat',
    caption: 'The library cat has claimed a new chair',
    topic: 'cat clip',
    kind: 'short',
    duration: 12,
    colors: ['#4E3A55', '#160F18'],
    glyph: '🐈',
  },
  {
    id: 7,
    user: '@frame_by_frame',
    caption: 'How I edit a speed-ramp transition',
    topic: 'editing example',
    kind: 'short',
    duration: 26,
    colors: ['#3B1F66', '#100820'],
    glyph: '🎞️',
    overlay: 'SPEED RAMP',
  },
  {
    id: 8,
    user: '@one_pan_dorm',
    caption: 'Five-minute tomato egg noodles, one pan',
    topic: 'recipe',
    kind: 'short',
    duration: 20,
    colors: ['#6B2A1F', '#1F0B08'],
    glyph: '🍜',
  },
  {
    id: 9,
    user: '@lakeside_evenings',
    caption: 'Sunset over the lake behind the teaching building',
    topic: 'sunset clip',
    kind: 'short',
    duration: 15,
    colors: ['#7A4A1C', '#24120A'],
    glyph: '🌅',
  },
  {
    id: 10,
    user: '@design_lab',
    caption: 'Figma auto-layout tutorial · part 2 (3:00)',
    topic: 'auto-layout tutorial',
    kind: 'tutorial',
    duration: 180,
    colors: ['#18324A', '#081018'],
    glyph: '💻',
    overlay: 'AUTO-LAYOUT · PART 2',
  },
  {
    id: 11,
    user: '@court_side',
    caption: 'Pickup game, sunset run',
    topic: 'basketball clip',
    kind: 'short',
    duration: 17,
    colors: ['#5C3A10', '#1A1005'],
    glyph: '🏀',
  },
  {
    id: 12,
    user: '@practice_room',
    caption: 'Piano cover in the practice room',
    topic: 'piano cover',
    kind: 'short',
    duration: 24,
    colors: ['#2B2B33', '#0C0C10'],
    glyph: '🎹',
  },
];

// Optional local test pack (src/testVideos.local.ts, gitignored). If the file isn't there,
// Metro skips this optional require and every clip stays a placeholder card.
let TEST_VIDEOS: Record<number, { source: VideoSource; duration: number }> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional file, must stay a require
  TEST_VIDEOS = require('./testVideos.local').TEST_VIDEOS;
} catch {
  // no test pack: placeholders
}

export const CLIPS: Clip[] = BASE_CLIPS.map((c) => (TEST_VIDEOS[c.id] ? { ...c, ...TEST_VIDEOS[c.id] } : c));

export const clipAt = (index: number): Clip => CLIPS[((index % CLIPS.length) + CLIPS.length) % CLIPS.length];

export const clipById = (id: number): Clip | undefined => CLIPS.find((c) => c.id === id);
