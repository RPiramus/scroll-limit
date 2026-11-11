// Pure session rules for Purpose Bar. No React / native imports so they're easy to test.

export type Mode = 'break' | 'purpose' | 'task' | 'browse';
export type TaskEnd = 'video' | 'minutes';

/** One "finish line". Keep going always starts a new segment. */
export type Segment = {
  mode: Mode;
  label: string;
  target?: number; // break: clips
  purpose?: string; // purpose: what the student came for
  task?: string; // task: what the extension is for
  taskClip?: number; // task: feed index of the video being finished
  taskEnd?: TaskEnd;
  taskEndsAt?: number; // task with taskEnd 'minutes'
  seen: number[]; // feed indices started during this segment (count = seen.length)
  startedAt: number;
  endedAt?: number;
};

export type Session = {
  id: string;
  startedAt: number;
  endedAt?: number;
  segments: Segment[]; // last one is the current segment
  watched: number[]; // unique feed indices started in the whole session
  saved: number[]; // clip ids saved during this session
  found?: number; // clip id the student confirmed as "found"
};

export const newSession = (now = Date.now()): Session => ({
  id: now.toString(36),
  startedAt: now,
  segments: [],
  watched: [],
  saved: [],
});

export const current = (s: Session | null | undefined): Segment | null =>
  s && s.segments.length ? s.segments[s.segments.length - 1] : null;

const uniqPush = (xs: number[], x: number) => (xs.includes(x) ? xs : [...xs, x]);

/** Close the current segment and start the next one. */
export function pushSegment(s: Session, seg: Segment, now = Date.now()): Session {
  const last = s.segments.length - 1;
  const segments = s.segments.map((x, i) => (i === last && !x.endedAt ? { ...x, endedAt: now } : x));
  let watched = s.watched;
  for (const i of seg.seen) watched = uniqPush(watched, i);
  return { ...s, segments: [...segments, seg], watched };
}

/** A clip started playing at feed index `index`. */
export function addClip(s: Session, index: number): Session {
  const seg = current(s);
  if (!seg || s.endedAt) return s;
  // A full break doesn't count further (the feed pauses on the finish card instead).
  if (seg.mode === 'break' && seg.target && seg.seen.length >= seg.target) return s;
  const seen = uniqPush(seg.seen, index);
  const watched = uniqPush(s.watched, index);
  if (seen === seg.seen && watched === s.watched) return s;
  return { ...s, segments: [...s.segments.slice(0, -1), { ...seg, seen }], watched };
}

export function toggleSaved(s: Session, clipId: number): Session {
  const saved = s.saved.includes(clipId) ? s.saved.filter((x) => x !== clipId) : [...s.saved, clipId];
  return { ...s, saved };
}

export function endSession(s: Session, now = Date.now()): Session {
  const last = s.segments.length - 1;
  return {
    ...s,
    endedAt: now,
    segments: s.segments.map((x, i) => (i === last && !x.endedAt ? { ...x, endedAt: now } : x)),
  };
}

/** Undo endSession, used by "Back to the finish card" on the summary (M9). */
export function reopen(s: Session): Session {
  const last = s.segments.length - 1;
  return {
    ...s,
    endedAt: undefined,
    segments: s.segments.map((x, i) => (i === last ? { ...x, endedAt: undefined } : x)),
  };
}

// ---- segment factories ----

export const breakSegment = (target: number, seen: number[], now = Date.now()): Segment => ({
  mode: 'break',
  label: `${target}-clip break`,
  target,
  seen,
  startedAt: now,
});

export const purposeSegment = (purpose: string, seen: number[], now = Date.now()): Segment => ({
  mode: 'purpose',
  label: purpose,
  purpose,
  seen,
  startedAt: now,
});

export const browseSegment = (seen: number[], now = Date.now()): Segment => ({
  mode: 'browse',
  label: 'Just browsing',
  seen,
  startedAt: now,
});

export const taskSegment = (
  task: string,
  clipIndex: number,
  end: TaskEnd,
  minutes: number,
  now = Date.now(),
): Segment => ({
  mode: 'task',
  label: task,
  task,
  taskClip: clipIndex,
  taskEnd: end,
  taskEndsAt: end === 'minutes' ? now + minutes * 60_000 : undefined,
  seen: [clipIndex],
  startedAt: now,
});

// ---- wording ----

export const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

export const isBreakFull = (seg: Segment | null) =>
  !!seg && seg.mode === 'break' && !!seg.target && seg.seen.length >= seg.target;

/** One line per segment for the summary's "Came for" row. */
export function describeSegment(seg: Segment): string {
  switch (seg.mode) {
    case 'break':
      return `${seg.target}-clip break`;
    case 'purpose':
      return `Looking for: ${lowerFirst(seg.purpose ?? '')}`;
    case 'task':
      return `Task: ${seg.task}`;
    case 'browse':
      return 'Just browsing';
  }
}

export const minutesBetween = (a: number, b: number) => Math.max(1, Math.round((b - a) / 60_000));
