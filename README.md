# Scroll Limit

A TikTok-style vertical feed (20 local videos from assets/videos) with a daily scroll budget.

## Run it
```bash
npm install
npx expo start
```
Scan the QR code with **Expo Go** (project is on Expo SDK 57). The phone needs internet for the placeholder images (picsum.photos).

## How it behaves
1. First open of the day: a prompt asks how many scrolls you want (1–200).
2. The limit is locked in for **24 hours from that moment**. It can't be changed.
3. A progress bar on top of the feed fills with each scroll (mint → amber → coral, pulses near the end, haptic buzz at 50/75/90%).
4. Reopening before the reset time goes straight back to the feed with your progress.
5. When the bar is full the app locks and shows a countdown. After 24 hours it shows the prompt again.

A "scroll" = one swipe to another video, in either direction.

## Testing the reset without waiting a day
On the lockout screen, **long-press the countdown for 2 seconds** to reset immediately.
Turn this off with `ALLOW_DEV_RESET = false` in `src/config.ts`.

## Where things are
- `src/config.ts` – limits, presets, 24h window, colours
- `src/limit.ts` – pure counting rules
- `src/storage.ts` – saved session (AsyncStorage) and 24h expiry
- `src/screens/` – Prompt, Feed, Locked
- `src/components/` – ProgressBar, FeedItem
