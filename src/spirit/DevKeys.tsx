// Dev-only: keys 1–6 become an animal, 0 hides it; window.__spirit exposes
// the store and the live face readings for checks. Scene.tsx lazy-imports
// this behind an inline NODE_ENV check, so it never reaches production.
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

import { ANIMALS } from "./animals";
import { live } from "./live";
import { getSpirit, spiritActions } from "./state";

const DevKeys = () => {
  const scene = useThree((st) => st.scene);
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__spirit = {
      actions: spiritActions,
      get: getSpirit,
      animals: ANIMALS,
      live,
      scene,
    };
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (e.key === "0") spiritActions.hide();
      else if (n >= 1 && n <= ANIMALS.length) spiritActions.reveal(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene]);
  return null;
};

export default DevKeys;
