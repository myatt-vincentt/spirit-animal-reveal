// Which animal you are (or none yet). One small store for the scene and HUD.
import { useSyncExternalStore } from "react";

export type Spirit = {
  /** Index into ANIMALS, −1 = not revealed. */
  animal: number;
  /** Bumps on every reveal (the puff plays once per reveal). */
  reveals: number;
};

let spirit: Spirit = { animal: -1, reveals: 0 };
const listeners = new Set<() => void>();

const set = (next: Spirit) => {
  spirit = next;
  listeners.forEach((l) => l());
};

export const getSpirit = () => spirit;

export const useSpirit = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSpirit,
    getSpirit,
  );

export const spiritActions = {
  /** Become animal `i` (a reveal). */
  reveal(i: number) {
    set({ animal: i, reveals: spirit.reveals + 1 });
  },
  /** Hands over the face: nothing shows until the next reveal. */
  hide() {
    if (spirit.animal >= 0) set({ ...spirit, animal: -1 });
  },
};
