# Purpose Bar (CSC4130 A2 · Team 8 · coded hi-fi)

A short-video feed that asks **what you're here for** when it opens, then keeps that purpose
visible in a bar at the top. This is the coded version of the Figma hi-fi prototype (handover §6,
Track 2). It replaces the earlier "daily scroll budget + 24-hour lock" concept: there are no
lock-outs, and no guilt wording.

## Run it
```bash
npm install
npx expo start      # scan the QR code with Expo Go (SDK 57)
```
Checks: `npx tsc --noEmit` and `npm run lint`.

## The three task flows

| Flow | Steps in the app |
|---|---|
| **T1** 15-clip break | Open app → *What are you here for?* (15 is pre-selected) → **Start 15-clip break** → swipe; the bar fills `1 of 15 … 15 of 15` → the last clip plays to its end (or swipe) → finish card → **Leave** → *Session ended* |
| **T2** one editing example | Opening sheet → tap **One editing example** → **Start looking** → swipe to an editing clip → **Save** → *Is this what you came for?* → **Not yet** → save another → **Yes, got it** → *Found it* card (with *Marked as found · Undo*) → **Leave** → summary → **Open in video editor** |
| **T3** study-task extension | You tab → **Restart the feed** → Feed → **10**-clip break → swipe to clip 10 (the auto-layout tutorial) → after 30 s the break ends with *2:30 left* → **Keep going** → **Finish this video** → name the task → **Continue** → amber task bar counts down (or tap **Done**) → *Task done* → **Keep going** → **Another break** → **Start 5-clip break** → swipe → **Leave** → summary |

Tap the bar any time for **session options** (status that matches the current mode, *Change what
I'm doing*, *Ask me each time I save*, *How it works*, *End session*).

## How it maps to the design

| Screen (Figma) | Code |
|---|---|
| T1-01, T1-02, T2-01, T3-07 opening / break sheets | `src/sheets/PromptSheet.tsx` |
| Purpose Bar (Break / Purpose / Task / Complete) | `src/components/PurposeBar.tsx` |
| T1-03…05, T2-02, T3-04 feed | `src/screens/FeedScreen.tsx`, `src/components/FeedItem.tsx` |
| T1-06, T2-07, T3-01, T3-05 finish cards | `src/sheets/FinishCard.tsx` |
| T2-04 check-in; Undo on the found card | `src/sheets/CheckInSheet.tsx`, `src/sheets/FinishCard.tsx` |
| T3-02 / T3-06 What's next | `src/sheets/WhatsNextSheet.tsx` |
| T3-03 name the task | `src/sheets/TaskSheet.tsx` |
| X-01 session options | `src/sheets/SessionOptionsSheet.tsx` |
| T1-07, T2-08, T3-10 summary | `src/screens/SummaryScreen.tsx` |
| X-02 Saved, X-03 You | `src/screens/SavedScreen.tsx`, `src/screens/YouScreen.tsx` |
| Flow map (state machine) | `App.tsx` |
| Design tokens (page 0) | `src/config.ts` |
| Session rules (pure, testable) | `src/session.ts` |

## Heuristic-evaluation fixes built into the app

M1 bar fill follows the clip count · M2 Undo on the *Found it* card after *Got it* / *Yes, got it* · M3/M8 Cancel
returns to the finish card, Leave is always an option · M4 every chip selects and the button text
follows · M5 live countdown and video-progress line · M6 session options describe the current mode ·
M7/M23 sheets close on tap-outside or swipe-down · M9 one summary layout with Back in the same place
· M10 one wording for *Just browse* · M11 switching modes keeps the current clip · M12 *1 saved* on
the bar, tap to open Saved · M13/M22 remaining time on *Finish this video*, bar stays visible over
sheets · M14 usual / last-used break pre-selected · M15 *Open in video editor* opens the share sheet
· M16 VoiceOver actions *Next clip* and *Save*, labelled rail icons · M17/M19 browse bar shows
*Just browsing · tap to set a purpose*, no unexplained timer · M18 hint written out · M20 finish
card names the tutorial · M21 switches toggle and confirm · M24 *Done* on the task bar · M25 one-tap
5-clip break on *Task done* · M26 *How it works* · M27 readable disabled state · M29 setting uses the
question's words · M31 completed states are mint · M33 *After 10 more minutes* works · M34 chips
fit on one row · M35 sheets slide up instead of cross-fading. Text follows the system text size
(Dynamic Type) and long purposes wrap to two lines (M28, partly).

## Clips

The old `assets/videos` (other people's TikTok clips) were removed: they can't go into a submitted
prototype. Until the team's own clips are added, each clip renders as a styled placeholder card.
To add a real clip, see `assets/clips/README.md` and the comment at the top of `src/clips.ts`.
