// Watches for hands over the face (cover.ts): a cover held hides the
// animal, the hands away reveals the next one. A quick tap on the screen
// reveals one too (for a laptop, or a hand that won't track).
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { XRModel } from "@vincentt-xr/sdk";
import {
  useXRModelNode,
  type XRModelNodeHandTracking,
} from "@vincentt-xr/sdk/low-level";
import { useFaceInfo } from "@vincentt-xr/sdk/tracking";

import {
  COVER,
  coverState,
  handOverFace,
  stepCover,
  type Box,
  type HandSample,
} from "./cover";
import { FACE_FPS } from "./FilteredHead";
import { spiritActions } from "./state";

const WRIST = 0;
const PALM = 9;
const MIDDLE_TIP = 12;

const TAP = { time: 300, move: 12 }; // ms, px

export const CoverInput = () => {
  const face = useFaceInfo({ active: true, numFaces: 1, targetFps: FACE_FPS });
  const hands = useXRModelNode<XRModelNodeHandTracking>(XRModel.HAND_TRACKER);
  const lastFace = useRef<{ box: Box; t: number } | null>(null);
  const machine = useRef(coverState());
  const gl = useThree((s) => s.gl);

  // Keep the face box (and when it was seen) for when hands hide the face.
  useEffect(() => {
    if (face?.bounds)
      lastFace.current = { box: face.bounds, t: performance.now() / 1000 };
  }, [face]);

  useFrame(() => {
    const t = performance.now() / 1000;
    const f = lastFace.current;
    const box = f && t - f.t < COVER.faceMemory ? f.box : null;
    let covered = false;
    if (box)
      (["left", "right"] as const).forEach((side) => {
        const h = hands?.poses?.[side];
        // A held pose (the hand just lost) still counts: it bridges the
        // frames hand tracking drops in front of the face.
        if (!h || h.image.length < 21) return;
        // Tracker points (centre origin, y up, mirrored) → the face box's
        // space (0–1, top-left).
        const at = (i: number) => ({
          x: h.image[i].x * 0.5 + 0.5,
          y: 0.5 - h.image[i].y * 0.5,
        });
        const w = at(WRIST);
        const tip = at(MIDDLE_TIP);
        const sample: HandSample = {
          palm: at(PALM),
          size: Math.hypot(tip.x - w.x, tip.y - w.y),
        };
        if (handOverFace(sample, box)) covered = true;
      });
    const { state, event } = stepCover(machine.current, t, covered);
    machine.current = state;
    spiritActions.setCovering(
      state.phase === "covering" ||
        state.phase === "covered" ||
        state.phase === "releasing",
    );
    if (event === "hide") spiritActions.hide();
    if (event === "reveal") spiritActions.revealNext();
  });

  // A quick tap anywhere on the scene reveals one too.
  useEffect(() => {
    const el = gl.domElement;
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const onUp = (e: PointerEvent) => {
      const d = down;
      down = null;
      if (
        d &&
        performance.now() - d.t < TAP.time &&
        Math.hypot(e.clientX - d.x, e.clientY - d.y) < TAP.move
      )
        spiritActions.revealNext();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  return null;
};
