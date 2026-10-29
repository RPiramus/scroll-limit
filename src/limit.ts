// Pure scroll-limit rules. No React / native imports so they're easy to test.

/** A scroll is one page crossed in either direction. Count is capped at the limit. */
export function nextCount(count: number, pagesMoved: number, limit: number): number {
  return Math.min(limit, count + Math.abs(pagesMoved));
}

export const MILESTONES = [0.5, 0.75, 0.9] as const;

/** Milestones (as ratios) crossed when going from `prev` to `next` scrolls. */
export function crossedMilestones(prev: number, next: number, limit: number): number[] {
  const a = prev / limit;
  const b = next / limit;
  return MILESTONES.filter((m) => a < m && b >= m);
}

export const isLimitReached = (count: number, limit: number) => count >= limit;
