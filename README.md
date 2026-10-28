# Spirit Animal Reveal

Cover your face with your hands, pull them away, and you're your spirit animal: a fox, a cat, a
bunny, an owl, a tiger or a panda, with a magic puff of sparkles in its colours and its baby
sitting on your shoulder. Cover again for another one (never the same twice in a row). No text on
screen: a 🙈 hint asks you to cover up, 🫣 while you're covered. A tap reveals one too.

- The masks, noses and ears are vincentt.studio head accessories on the SDK's canonical head fit,
  steadied by a speed-adaptive spring (`src/spirit/headFilter.ts`) with the head occluder in the
  same group, and they react as their author built them (ears flick, whiskers twitch, a head
  shake wobbles). Tiger and panda are completed by recolouring: the kitten's tabby coat tinted
  into a tiger cub, the bear ears in their panda preset.
- The babies ride on your right shoulder (body tracking, the SDK's canonical torso frame), 1.3×
  their crown size. Body tracking is loaded at the start but only runs while an animal shows.
- Cover detection (`src/spirit/cover.ts`): one or two hands over the face, held a third of a
  second; it keeps the last face box when your hands hide your face.
- Thumbnails: `public/images/spirit-animal-reveal-thumbnail.jpg` (the owl before / after; the share
  image) and `spirit-animal-reveal-thumbnail-2.jpg` (the panda).
- Models: `public/models/vincentt-*.glb`; credits in `CREDITS.md`. To change an animal, edit
  `src/spirit/animals.ts`.
- Dev preview without a camera: the media switcher (☰) starts on the SDK's "Person Shaking Head"
  video; keys 1–6 become an animal, 0 hides it; `?occ` draws the head occluder. Checks in
  `audit/` (look sheets on the SDK's sample videos, and the cover loop on a clip). How it works:
  `PLAN.md`.

---

# v2-template

The Vincentt starter app: a real React + R3F + Vincentt XR SDK (`@vincentt-xr/sdk`)
WebXR app, bundled by esbuild.

## Shape

```
src/
  main.tsx            mount — never edited
  App.tsx             protected shell: XRProvider + AspectRatioContainer +
                      XRScene + media-source binding, camera, lighting,
                      VideoBackground, PreviewAnchors — never edited
  Scene.tsx           the agent's surface: add SDK components and R3F
                      primitives here
  PreviewAnchors.tsx  editor-preview integration — never edited
```

See `AGENTS.md` and `GROUNDING.md` for the API reference and how to author scenes.

## Develop

```
pnpm install
pnpm dev          # esbuild dev server on localhost:5173 (output in .dev/)
pnpm preview      # on-device preview over a secure tunnel (needs `vincentt login`)
pnpm typecheck
pnpm build        # production bundle to dist/
```

## Release

`vincentt init` scaffolds from the **`latest` tag**, not from `main`. Merging to `main` does
not ship a template to creators — cutting a release does.

```
git tag 1.1.0 <sha>      # bare semver, no `v` prefix
git push origin 1.1.0    # the Release workflow verifies the tag, then moves `latest`
```

The Release workflow (`.github/workflows/release.yml`) installs from the frozen lockfile,
builds, and typechecks **the tagged tree** before force-updating `latest` to it. A tag that
fails leaves `latest` where it was, so a broken release cannot reach a new creator.

The job runs in the `release` environment, which accepts bare-semver tags only. To re-run it by
hand, dispatch it from the tag itself ("Use workflow from: 1.1.0"); a dispatch from `main` is
refused.

**Never move `latest` by hand.** It is force-updated by that workflow and nowhere else; moving
it manually decouples the pointer from the version it claims to be.

Creators can pin a specific version — `vincentt init --template 1.0.0` — which is the escape
hatch when a release turns out to be bad. That is why the version tags are immutable and only
`latest` moves.

### `MIGRATION.md` and the platform release row

Root `MIGRATION.md` carries one entry per released tag, newest first, authored in the same
PR as the change: `required: true|false`, a one-line summary, and optional notes bullets.
`required: false` means no consumer action is needed, never that the entry was skipped. The
Release workflow refuses to move `latest` for a tag with no valid entry, then — once `latest`
has moved — posts that entry as this release's row to the platform (`POST
/platform/releases`, component `template`), via `scripts/release-row.mjs`. Both steps read
`MIGRATION.md` from `main`, not from the tagged tree: the note is reviewed via PR into `main`
and is append-only per version, so `main`'s copy is the reviewed source for any tag, including
one cut before this file existed. That row is what `vincentt outdated` reads back to tell a
creator's agent what changed and what to do about it.
