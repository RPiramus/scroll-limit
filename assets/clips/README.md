# Team clips

Put the team's own short vertical clips here (film them on campus: food stall, football, a laptop
tutorial, a dorm desk, a street). No other people's videos, no identifiable faces, no brand logos.

Then wire each one up in `src/clips.ts`:

```ts
{
  id: 1,
  ...
  duration: 14, // the clip's length in seconds
  source: require('../assets/clips/food-stall.mp4'),
},
```

Keep the tutorial (id 10) as a real ~3-minute clip if you have one; flow T3 relies on it being long.
