import { describe, expect, it } from "vitest";

import {
  COVER,
  coverState,
  handOverFace,
  pickNext,
  stepCover,
  type Box,
  type CoverEvent,
} from "./cover";

const FACE: Box = { minX: 0.35, minY: 0.2, maxX: 0.65, maxY: 0.5 };

/** Run `covered(t)` at 30 fps for `seconds`; returns the events with times. */
const run = (seconds: number, covered: (t: number) => boolean) => {
  let s = coverState();
  const events: [number, CoverEvent][] = [];
  for (let i = 0; i <= seconds * 30; i += 1) {
    const t = i / 30;
    const r = stepCover(s, t, covered(t));
    s = r.state;
    if (r.event) events.push([+t.toFixed(2), r.event]);
  }
  return events;
};

describe("hand over face", () => {
  it("a big hand on the face covers it", () => {
    expect(handOverFace({ palm: { x: 0.5, y: 0.35 }, size: 0.2 }, FACE)).toBe(
      true,
    );
  });
  it("a hand beside the face doesn't", () => {
    expect(handOverFace({ palm: { x: 0.85, y: 0.35 }, size: 0.2 }, FACE)).toBe(
      false,
    );
  });
  it("a small, far-off hand in front of the face doesn't", () => {
    expect(handOverFace({ palm: { x: 0.5, y: 0.35 }, size: 0.05 }, FACE)).toBe(
      false,
    );
  });
  it("just outside the box still counts (the box is padded)", () => {
    expect(handOverFace({ palm: { x: 0.68, y: 0.35 }, size: 0.2 }, FACE)).toBe(
      true,
    );
  });
});

describe("cover → reveal", () => {
  it("cover, hold, pull away: hide then reveal", () => {
    const ev = run(3, (t) => t > 0.5 && t < 1.5);
    expect(ev.map((e) => e[1])).toEqual(["hide", "reveal"]);
    // Within a frame or two of the hold / release times (30 fps samples).
    expect(ev[0][0]).toBeGreaterThanOrEqual(0.5 + COVER.hold);
    expect(ev[0][0]).toBeLessThan(0.5 + COVER.hold + 0.08);
    // The reveal waits out the grace, then the release.
    // (the hand is last seen on the frame before 1.5 s)
    expect(ev[1][0]).toBeGreaterThanOrEqual(
      1.5 - 1 / 30 + COVER.grace + COVER.release - 1e-9,
    );
    expect(ev[1][0]).toBeLessThan(1.5 + COVER.grace + COVER.release + 0.08);
  });

  it("a hand passing in front doesn't hide", () => {
    expect(run(2, (t) => t > 0.5 && t < 0.7)).toEqual([]);
  });

  it("hand tracking dropping frames doesn't break the cover", () => {
    // Seen only on 2 frames out of 3 while over the face.
    const ev = run(
      3,
      (t) => t > 0.5 && t < 1.5 && Math.round(t * 30) % 3 !== 0,
    );
    expect(ev.map((e) => e[1])).toEqual(["hide", "reveal"]);
  });

  it("a flicker while covered doesn't reveal early", () => {
    const ev = run(3, (t) => t > 0.5 && t < 2 && !(t > 1.2 && t < 1.27));
    expect(ev.map((e) => e[1])).toEqual(["hide", "reveal"]);
    expect(ev[1][0]).toBeGreaterThan(2);
  });

  it("covering again reveals again", () => {
    const ev = run(5, (t) => (t > 0.5 && t < 1.5) || (t > 2.5 && t < 3.5));
    expect(ev.map((e) => e[1])).toEqual(["hide", "reveal", "hide", "reveal"]);
  });
});

describe("pick next", () => {
  it("never repeats", () => {
    for (let prev = 0; prev < 6; prev += 1)
      for (let r = 0; r < 1; r += 0.05)
        expect(pickNext(prev, 6, () => r)).not.toBe(prev);
  });
  it("reaches every other animal", () => {
    const seen = new Set<number>();
    for (let r = 0; r < 1; r += 0.01) seen.add(pickNext(2, 6, () => r));
    expect([...seen].sort()).toEqual([0, 1, 3, 4, 5]);
  });
  it("any animal the first time", () => {
    expect(pickNext(-1, 6, () => 0.99)).toBe(5);
  });
});
