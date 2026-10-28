# Plan — Spirit Animal Reveal

Cover your face, pull your hands away, become a random animal with its baby on your shoulder.
Built on SDK 2.0.0-alpha.9 with the vincentt.studio head accessories.

## Design

- Six animals: fox, cat, bunny, owl, tiger, panda. Tiger and panda are thin in the library, so
  they're completed by recolouring existing parts (no new models).
- Random reveal, never the same animal twice in a row.
- The baby pet sits on the right shoulder (screen right), 1.3× its crown size.
- One or two hands over the face trigger it; a tap works too.
- At the reveal: a magic puff in the animal's colours and a quick pop. No sound, no text.

## How it works

- `animals.ts`: each animal's face parts and pet. Parts can swap to the file's own preset
  materials (`materials`) and tint (`colors`).
- `Part.tsx`: loads a model (shared cache), applies its default preset's finish (the fox kit's red
  coat, the panda's classic coat — not baked into the files) by loading the spare materials by
  name, then the part's own swaps and tints; plays its autoplay loops, follows its face triggers
  (`rig.ts`), wobbles on a head shake and pops in about its middle.
- `FilteredHead.tsx` + `headFilter.ts` (tested): the SDK's canonical head fit through a
  speed-adaptive critically damped spring; the depth-only v3 head occluder and the face parts
  share the filtered group. The SDK's `NeckOccluder` sits in the face tracker.
- `SpiritScene.tsx`: the face parts on the head; the pet in `CanonicalTorsoFrame` (body tracking,
  `active` only while an animal shows), its crown contact point moved to the shoulder seat.
- `cover.ts` (tested) + `CoverInput.tsx`: a hand covers the face when its palm is on the face box
  (padded 15 %) and it's big next to the face; the last face box is kept 2 s when the hands hide
  the face. Covered 0.35 s hides, hands away 0.15 s reveals; a 0.12 s grace and the SDK's held hand
  poses bridge dropped hand frames. Hand model 12 Hz, face 20 Hz.
- `Puff.tsx`: clouds and four-point sparkles (instanced, additive), strict ease-out, about a
  second, on the filtered head.
- `Hud.tsx`: the only cue — 🙈 (cover up) until the first reveal and again after 8 s, 🫣 while
  covered.
- Dev only: `DevKeys.tsx` (keys 1–6 / 0, `window.__spirit`), `DevMediaSwitcher.tsx`, `?occ`.
