// Which animal you are (or none), and whether hands cover the face. One
// small store for the scene and the HUD.
import { useSyncExternalStore } from "react";

import { ANIMALS } from "./animals";
import { pickNext } from "./cover";

export type Spirit = {
  /** Index into ANIMALS, −1 = not showing. */
  animal: number;
  /** The last animal shown (so the next one is different). */
  last: number;
  /** Bumps on every reveal (the puff plays once per reveal). */
  reveals: number;
  /** Hands are over the face right now. */
  covering: boolean;
};

let spirit: Spirit = { animal: -1, last: -1, reveals: 0, covering: false };
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
  /** Become animal `i`. */
  reveal(i: number) {
    set({ ...spirit, animal: i, last: i, reveals: spirit.reveals + 1 });
  },
  /** Become a random animal, never the one just shown. */
  revealNext() {
    spiritActions.reveal(pickNext(spirit.last, ANIMALS.length, Math.random));
  },
  /** Hands over the face: nothing shows until the next reveal. */
  hide() {
    if (spirit.animal >= 0) set({ ...spirit, animal: -1 });
  },
  setCovering(covering: boolean) {
    if (covering !== spirit.covering) set({ ...spirit, covering });
  },
};
