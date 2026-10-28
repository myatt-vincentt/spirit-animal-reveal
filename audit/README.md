# Look and cover checks

Dev tooling, not part of the app. Headless Chrome (GPU on) against the running dev server
(`PORT=5192 pnpm dev`) with a fake webcam fed from a `.y4m` clip; reads the dev-only
`window.__spirit` (`src/spirit/DevKeys.tsx`). Needs `@playwright/test` and Chrome:
`PLAYWRIGHT_FROM=<folder whose node_modules has it>`.

- `animals.cjs <out-dir> <clip.y4m> …` — every animal on every clip (head and shoulders), one
  sheet: rows = animals, columns = clips. Used with the SDK's sample videos
  (`cdn.vincentt.studio/assets/sdk/debug-ui/v1/videos/*.mp4`).
- `cover.cjs <clip.y4m> <out-dir> [seconds]` — logs every covering / animal change with its time
  and screenshots the reveals.

Clips (not committed): `ffmpeg -i in.mp4 -t 10 -r 30 -vf "scale=540:960,format=yuv420p" out.y4m`.
The cover clip used on 2026-10-28: `person_shaking_head.mp4` with one hand from the SDK example's
`hand_palms_waving.mp4` keyed over the face:

```
ffmpeg -i person_shaking_head.mp4 -i hand_palms_waving.mp4 -filter_complex "[1:v]crop=330:470:390:405,scale=300:428,colorkey=0x8d9e5a:0.09:0.0[h];[0:v]scale=540:960[b];[b][h]overlay=x=110:y=40:enable='between(t,3,5)+between(t,7,8.5)'" -t 10 -r 30 -an -pix_fmt yuv420p cover.y4m
```
