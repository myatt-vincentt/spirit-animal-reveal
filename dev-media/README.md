# dev-media

Optional dev-only preview media. Nothing here ships: only
`src/DevMediaSwitcher.tsx` reads this folder, and it is stripped from
production builds.

You don't need anything here. Without a webcam, `pnpm dev` starts on the SDK's
built-in "Person Shaking Head" video and lists every SDK sample video and
image. A tap on the scene reveals an animal; in development keys 1–6 become an
animal and 0 hides it.

To preview with your own clip, add a video of a face with a hand covering it
and pulling away at `dev-media/spirit.mp4` (H.264 MP4); it is listed first and
used as the start. Clips here are git-ignored. Restart `pnpm dev` after adding
or removing one.

`models-src/` holds the original downloads from the Drive "Head Accessories"
folder (git-ignored); the shipped copies are in `public/models/`.
