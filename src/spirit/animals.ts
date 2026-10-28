// The six spirit animals: what goes on the face and which baby rides on the
// shoulder. Every model is a vincentt.studio head accessory
// (public/models/vincentt-*.glb), authored in metres in the "Complete 3D
// Reference - Spark AR" face frame (origin at the front of the face, +Y up,
// +Z out of the face) — see FRAME.

export type Part = {
  /** File name in public/models without `vincentt-` / `.glb`. */
  id: string;
  /**
   * Material swaps by name, to another material in the same file: the
   * models carry their colour presets as spare materials (`mat_outer` →
   * `mat_outer__panda`). The default preset's finish (e.g. the fox kit's
   * red coat) is applied first, on every part.
   */
  materials?: Record<string, string>;
  /** Tints by material name (on this part's own copy of the material). */
  colors?: Record<string, string>;
  /** Fine placement: `y` / `z` canonical cm, `scale` about its middle. */
  fit?: { y?: number; z?: number; scale?: number };
};

export type Animal = {
  id: string;
  /** The puff's colours at the reveal. */
  colors: [string, string];
  /** On the head, in canonical centimetres. */
  face: Part[];
  /** The baby on the shoulder. */
  pet: Part;
};

export const ANIMALS: readonly Animal[] = [
  {
    id: "fox",
    colors: ["#f08a2c", "#fff3e0"],
    face: [{ id: "mask-fox" }],
    pet: { id: "pet-fox-kit" },
  },
  {
    id: "cat",
    colors: ["#e8893a", "#f6b8c4"],
    face: [{ id: "mask-cat" }, { id: "nose-cat" }],
    pet: { id: "pet-sleepy-kitten" },
  },
  {
    id: "bunny",
    colors: ["#ffffff", "#f6b8c4"],
    face: [
      { id: "mask-bunny" },
      { id: "nose-bunny" },
      { id: "mouth-bunny-teeth" },
    ],
    pet: { id: "pet-bunny" },
  },
  {
    id: "owl",
    colors: ["#8a6a4a", "#ffd84d"],
    face: [{ id: "mask-owl" }, { id: "nose-bird-beak" }],
    pet: { id: "pet-baby-owl" },
  },
  {
    id: "tiger",
    colors: ["#f07a1c", "#1e1c20"],
    face: [{ id: "mask-tiger" }],
    // The kitten's tabby coat, tinted a deeper orange: a tiger cub.
    pet: { id: "pet-sleepy-kitten", colors: { mat_fur_tabby: "#f07a1c" } },
  },
  {
    id: "panda",
    colors: ["#ffffff", "#1b1a1b"],
    // The bear ears in their panda colours.
    face: [
      {
        id: "ears-bear",
        materials: {
          mat_outer: "mat_outer__panda",
          mat_inner: "mat_inner__panda",
          mat_tips: "mat_tips__panda",
          mat_fur: "mat_fur__panda",
          mat_band: "mat_band__panda",
        },
      },
    ],
    pet: { id: "pet-panda-cub" },
  },
];

export const modelUrl = (id: string) => `/models/vincentt-${id}.glb`;

/** The SDK's v3 head occluder, hosted here until the SDK CDN serves it. */
export const OCCLUDER_URL = "/models/head-occluder-v3.glb";

/** The SDK's neck-and-shoulders bust occluder (same story). */
export const NECK_OCCLUDER_URL = "/models/neck-occluder-bust-v1.glb";

/**
 * The models' frame → the SDK's canonical head frame (centimetres): ×100,
 * then the same shift the SDK used to move the Spark AR reference into the
 * canonical frame (chins and nose tips aligned; vincentt-xr-sdk
 * assets-src/head-occluder/README.md).
 */
export const FRAME = {
  scale: 100,
  position: [0, -1.03, 7.3] as const,
};

/**
 * The pets are authored sitting on the crown; this is that contact point in
 * canonical cm (the top of the SDK's v3 skull), so a pet can be moved onto a
 * shoulder by putting this point there.
 */
export const CROWN: [number, number, number] = [0, 13.26, -3.76];

/**
 * Where a pet sits in the SDK's canonical torso frame (cm: origin between
 * the shoulder joints, +X the screen's right, +Y up, +Z toward the camera):
 * on top of the shoulder on the screen's right, a little in from the joint.
 */
export const SHOULDER_SEAT: [number, number, number] = [14, 6, 0];
