// The only on-screen cue, wordless, in the lower middle: 🙈 asks you to
// cover your face (until the first reveal, and again after a while), 🫣
// while you're covered (pull your hands away). Night glass: Cypress 64 %
// glass; strict ease-out.
import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";

import { useSpirit } from "./state";

/** After a reveal, the 🙈 hint comes back after this long (ms). */
const AGAIN = 8000;

const CSS = `
.sp-hint { position: absolute; left: 50%; bottom: max(calc(env(safe-area-inset-bottom) + 64px), 80px);
  transform: translateX(-50%) scale(.9); width: 64px; height: 64px; border-radius: 50%;
  display: grid; place-items: center; font-size: 34px; pointer-events: none;
  background: rgb(35 37 40 / .64); backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  opacity: 0; transition: opacity .35s ease-out, transform .35s ease-out; }
.sp-hint.on { opacity: 1; transform: translateX(-50%) scale(1); }
.sp-hint > span { display: inline-block; }
.sp-hint.ask > span { animation: sp-bob 1.6s ease-in-out infinite; }
@keyframes sp-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@media (prefers-reduced-motion: reduce) { .sp-hint.ask > span { animation: none; } }
`;

export const Hud = () => {
  const { reveals, covering } = useSpirit();
  const [again, setAgain] = useState(false);

  useEffect(() => {
    setAgain(false);
    if (!reveals) return undefined;
    const t = window.setTimeout(() => setAgain(true), AGAIN);
    return () => window.clearTimeout(t);
  }, [reveals]);

  const ask = !covering && (reveals === 0 || again);
  return (
    <Html fullscreen zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div
        className={`sp-hint${covering || ask ? " on" : ""}${ask ? " ask" : ""}`}
        aria-hidden="true"
      >
        <span>{covering ? "🫣" : "🙈"}</span>
      </div>
    </Html>
  );
};
