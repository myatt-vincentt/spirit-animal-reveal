// Live face readings, written every frame by FaceSignals (no re-renders).
export const live = {
  blendshapes: {} as Readonly<Record<string, number | undefined>>,
  /** Bumps on each head shake: worn parts play their wobble. */
  shakes: 0,
  /** Dev checks only (window.__spirit): stands in for the face's readings. */
  override: null as Readonly<Record<string, number | undefined>> | null,
};
