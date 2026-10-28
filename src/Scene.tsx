// Scene.tsx — Spirit Animal Reveal: cover your face with your hands, pull
// them away, and you're a fox, cat, bunny, owl, tiger or panda, with a baby
// on your shoulder. See PLAN.md.
import { lazy, Suspense } from "react";
import { HandCutout, HandTracker } from "@vincentt-xr/sdk/tracking";

import { CoverInput } from "./spirit/CoverInput";
import { Hud } from "./spirit/Hud";
import { SpiritScene } from "./spirit/SpiritScene";

// Dev-only helpers for previewing without a camera. Lazy and behind a
// constant esbuild folds to false in production. Two rules:
// `process.env.NODE_ENV`, not `import.meta.env.DEV` (vincentt-xr/v2-template#112);
// and write the check INSIDE the ternary — hoisted into a `const`, esbuild
// keeps the dead branch.
const DevMediaSwitcher =
  process.env.NODE_ENV !== "production"
    ? lazy(() => import("./DevMediaSwitcher"))
    : null;
const DevKeys =
  process.env.NODE_ENV !== "production"
    ? lazy(() => import("./spirit/DevKeys"))
    : null;

export const Scene = () => (
  <>
    <SpiritScene />
    <CoverInput />
    <Hud />
    {/* Hands stay in front of the masks. */}
    <HandTracker targetFps={12}>
      <HandCutout />
    </HandTracker>
    {DevMediaSwitcher && DevKeys ? (
      <Suspense fallback={null}>
        <DevMediaSwitcher />
        <DevKeys />
      </Suspense>
    ) : null}
  </>
);
