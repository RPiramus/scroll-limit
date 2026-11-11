import { useEffect, useState } from 'react';

/** Re-renders on an interval and returns the current time in ms. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 2:30 — remaining video / task time. */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad(s)}`;
}

/** "4 min" — session length. */
export function formatMinutes(ms: number): string {
  return `${Math.max(1, Math.round(ms / 60_000))} min`;
}
