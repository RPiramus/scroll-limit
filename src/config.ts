// Central place for the knobs you're most likely to tweak.

export const DAY_MS = 24 * 60 * 60 * 1000; // how long a daily limit lasts
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 200;
export const DEFAULT_LIMIT = 20;
export const PRESETS = [10, 20, 30, 50];

export const VIDEO_COUNT = 20; // files in assets/videos (File1.MP4 ... File20.MP4)
export const VIDEO_MUTED = false; // set true to start every video silent
export const LOCK_DELAY_MS = 900; // pause on the full bar before the lockout screen

// Prototype escape hatch so you can test the 24h reset without waiting a day.
// On the lockout screen, long-press the countdown for ~2s to reset immediately.
// Set to false for anything beyond testing.
export const ALLOW_DEV_RESET = true;

export const COLORS = {
  bg: '#000000',
  surface: '#15151A',
  surfaceHi: '#202028',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.62)',
  mint: '#3DDC97',
  amber: '#FFB020',
  coral: '#FF4D5E',
};
