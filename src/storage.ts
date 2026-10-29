import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAY_MS, MAX_LIMIT, MIN_LIMIT } from './config';

export type Session = {
  limit: number; // scrolls allowed in this 24h window
  count: number; // scrolls used so far
  startedAt: number; // ms epoch, when the user picked their limit
  resetAt: number; // ms epoch, startedAt + 24h
};

const KEY = 'scrollLimit.session.v1';

export function createSession(limit: number, now = Date.now()): Session {
  return { limit, count: 0, startedAt: now, resetAt: now + DAY_MS };
}

function isValid(s: any): s is Session {
  return (
    s &&
    Number.isInteger(s.limit) &&
    s.limit >= MIN_LIMIT &&
    s.limit <= MAX_LIMIT &&
    Number.isInteger(s.count) &&
    s.count >= 0 &&
    Number.isFinite(s.startedAt) &&
    Number.isFinite(s.resetAt)
  );
}

/** Returns the active session, or null if none exists or the 24h window is over. */
export async function loadSession(now = Date.now()): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed) || parsed.resetAt <= now) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return { ...parsed, count: Math.min(parsed.count, parsed.limit) };
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Best effort: the in-memory session still works for this run.
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
