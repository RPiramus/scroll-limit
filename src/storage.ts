import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_BREAK, PRESETS } from './config';
import type { Session } from './session';

export type { Session } from './session';

export type Settings = {
  defaultBreak: number; // "Your usual", set on the You tab
  lastBreak?: number; // pre-selected next time ("Same as last time", M14)
  askOnOpen: boolean; // "Ask what I'm here for when I open the app" (M29)
  askOnSave: boolean; // "Ask me each time I save" (M21)
  position: number; // feed index, so your place in the feed is kept
  library: number[]; // saved clip ids, most recent first (Saved tab)
};

export const DEFAULT_SETTINGS: Settings = {
  defaultBreak: DEFAULT_BREAK,
  askOnOpen: true,
  askOnSave: true,
  position: 0,
  library: [],
};

const SESSION_KEY = 'purposeBar.session.v1';
const SETTINGS_KEY = 'purposeBar.settings.v1';

function isSession(s: any): s is Session {
  return (
    s &&
    typeof s.id === 'string' &&
    Number.isFinite(s.startedAt) &&
    Array.isArray(s.segments) &&
    Array.isArray(s.watched) &&
    Array.isArray(s.saved)
  );
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Best effort: the in-memory session still works for this run.
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {}
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw);
    return {
      defaultBreak: PRESETS.includes(p.defaultBreak) ? p.defaultBreak : DEFAULT_BREAK,
      lastBreak: PRESETS.includes(p.lastBreak) ? p.lastBreak : undefined,
      askOnOpen: typeof p.askOnOpen === 'boolean' ? p.askOnOpen : true,
      askOnSave: typeof p.askOnSave === 'boolean' ? p.askOnSave : true,
      position: Number.isInteger(p.position) && p.position >= 0 ? p.position : 0,
      library: Array.isArray(p.library) ? p.library.filter(Number.isInteger) : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
