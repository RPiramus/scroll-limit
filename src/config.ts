// Central place for the knobs you're most likely to tweak.
// Colours, type and spacing mirror the Figma design system (page 0).

export const COLORS = {
  bg: '#0B0B0F', // screen background
  surface: '#17171D', // sheets, cards
  surfaceHi: '#23232B', // controls, Choice buttons
  stroke: '#2E2E38', // dividers, outlines
  text: '#FFFFFF', // primary
  textDim: '#A3A3AD', // secondary (also disabled labels, ~4.9:1 on surfaceHi, M27)
  textMute: '#8E8E99', // inactive
  mint: '#3DDC97', // primary action, progress, completed states
  mintInk: '#06150E', // text on mint
  amber: '#FFB020', // task mode only
  amberInk: '#1A1200',
  like: '#FF5C8A', // social heart only, never a failure state
  scrim: 'rgba(0,0,0,0.62)',
  snackbar: '#2A2A33',
};

export const TYPE = {
  largeTitle: 34,
  title2: 22,
  headline: 17,
  body: 17,
  subhead: 15,
  footnote: 13,
  tab: 10,
};

export const SPACE = {
  margin: 16, // screen margins
  sheet: 24, // sheet padding
  button: 52, // button height
  touch: 44, // minimum touch target
};

// Break lengths offered on the opening sheet. DEFAULT_BREAK is pre-selected (M14).
export const PRESETS = [5, 10, 15, 20];
export const DEFAULT_BREAK = 15;
export const FOLLOW_UP_BREAK = 5; // pre-selected for "Another break" and the one-tap option on Task done (M25)

export const PURPOSE_SUGGESTIONS = ['One editing example', 'A recipe', 'News explainer'];

// The last clip of a break plays to its end, but never longer than this before the finish card.
// A 3:00 tutorial as the last clip therefore ends the break with 2:30 left (flow T3).
export const LAST_CLIP_MAX_S = 30;

// Option on the task sheet: "After 10 more minutes" (M33 – wired, not decorative).
export const TASK_MINUTES = 10;

// "Finish this video" is only offered when at least this much of the clip is left.
export const FINISH_VIDEO_MIN_S = 20;

// Reopening the app within this window resumes the running session.
export const RESUME_WINDOW_MS = 3 * 60 * 60 * 1000;

export const FEED_LENGTH = 600; // feed positions; clips repeat from the catalogue
export const VIDEO_MUTED = false;
export const TAB_BAR_HEIGHT = 52;
