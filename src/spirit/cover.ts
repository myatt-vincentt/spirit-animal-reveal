// Hands over the face — pure, unit-tested (cover.test.ts).
//
// A hand covers the face when its palm is over the face box (a little
// grown) and it's close to the camera (big next to the face — a hand far
// behind, waving, doesn't count). While a hand covers it the face tracker
// often loses the face, so the last face box is kept for a while.
//
// The machine: a cover held for `hold` hides the animal; the hands away
// for `release` reveals the next one. A hand passing in front of the face
// does neither.

export type Pt = { x: number; y: number };

/** Normalised, top-left origin (the tracker's image space). */
export type Box = { minX: number; minY: number; maxX: number; maxY: number };

export type HandSample = {
  /** Palm centre (middle-finger knuckle). */
  palm: Pt;
  /** Wrist to middle-finger tip: how big the hand looks. */
  size: number;
};

export const COVER = {
  /** The face box grows by this share of its width on each side. */
  pad: 0.15,
  /** A covering hand is at least this big next to the face's height. */
  minSize: 0.35,
  /** Covered this long hides the animal (s). */
  hold: 0.35,
  /** Hands away this long reveals the next one (s). */
  release: 0.15,
  /**
   * A hand still counts as covering this long after it was last seen over
   * the face: hand tracking drops a frame or two, mostly while the hand is
   * right in front of the face.
   */
  grace: 0.12,
  /** The last face box stays usable this long after the face is lost (s). */
  faceMemory: 2,
};

export const handOverFace = (h: HandSample, face: Box, cfg = COVER) => {
  const w = face.maxX - face.minX;
  const ht = face.maxY - face.minY;
  const p = w * cfg.pad;
  return (
    h.palm.x > face.minX - p &&
    h.palm.x < face.maxX + p &&
    h.palm.y > face.minY - p &&
    h.palm.y < face.maxY + p &&
    h.size >= ht * cfg.minSize
  );
};

export type CoverPhase = "open" | "covering" | "covered" | "releasing";
export type CoverState = {
  phase: CoverPhase;
  since: number;
  /** When a hand was last over the face (−∞ = never). */
  seen: number;
};
export type CoverEvent = "hide" | "reveal" | null;

export const coverState = (): CoverState => ({
  phase: "open",
  since: 0,
  seen: -Infinity,
});

/** One tick: `hand` = a hand is over the face now. `t` in seconds. */
export const stepCover = (
  s: CoverState,
  t: number,
  hand: boolean,
  cfg = COVER,
): { state: CoverState; event: CoverEvent } => {
  const seen = hand ? t : s.seen;
  const covered = t - seen <= cfg.grace;
  const at = (phase: CoverPhase) => ({ phase, since: t, seen });
  const stay = { ...s, seen };
  switch (s.phase) {
    case "open":
      return { state: covered ? at("covering") : stay, event: null };
    case "covering":
      if (!covered) return { state: at("open"), event: null };
      if (t - s.since >= cfg.hold)
        return { state: at("covered"), event: "hide" };
      return { state: stay, event: null };
    case "covered":
      return { state: covered ? stay : at("releasing"), event: null };
    default:
      // releasing
      if (covered) return { state: at("covered"), event: null };
      if (t - s.since >= cfg.release)
        return { state: at("open"), event: "reveal" };
      return { state: stay, event: null };
  }
};

/** A random animal index other than `prev` (any, when `prev` < 0). */
export const pickNext = (prev: number, n: number, random: () => number) => {
  if (n <= 1) return 0;
  if (prev < 0) return Math.floor(random() * n);
  // One of the other n − 1, evenly.
  const i = Math.floor(random() * (n - 1));
  return i >= prev ? i + 1 : i;
};
