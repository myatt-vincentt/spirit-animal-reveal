// The animal you've become: its face parts on the filtered head
// (FilteredHead.tsx: the SDK's canonical head fit through a spring, with the
// depth-only head occluder in the same group), and its baby on your
// shoulder (body tracking: the SDK's canonical torso frame).
//
// The models are in metres in the Spark AR face frame; FRAME turns them
// into canonical centimetres. The pets are authored sitting on the crown,
// so on the shoulder their crown contact point (CROWN) goes to SHOULDER_SEAT.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
// eslint-disable-next-line import/extensions
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  BodyTracker,
  CanonicalTorsoFrame,
  useFaceInfo,
  useGesture,
} from "@vincentt-xr/sdk/tracking";

import { ANIMALS, CROWN, FRAME, SHOULDER_SEAT } from "./animals";
import { FACE_FPS, FilteredHead } from "./FilteredHead";
import { live } from "./live";
import { Part } from "./Part";
import { useSpirit } from "./state";

/** The blendshapes the models' face_triggers read (see rig.ts). */
const FACE_INPUTS = [
  "jawOpen",
  "mouthSmileLeft",
  "mouthSmileRight",
  "eyeBlinkLeft",
  "eyeBlinkRight",
  "browInnerUp",
  "browDownLeft",
];
/** Per-second easing of the readings (higher = snappier, noisier). */
const FACE_EASE = 14;

/** Copies the face's blendshapes into `live` and counts head shakes. */
const FaceSignals = () => {
  // Same options as FilteredHead's FaceTracker: the first consumer of the
  // shared face model sets its face count and rate.
  const face = useFaceInfo({ active: true, numFaces: 1, targetFps: FACE_FPS });
  const raw = useRef<Readonly<Record<string, number | undefined>>>({});
  raw.current = face?.blendshapes ?? {};
  // Raw blendshapes flicker a few percent frame to frame; ease toward them.
  const smooth = useRef<Record<string, number>>({});
  useFrame((_st, dt) => {
    const k = 1 - Math.exp(-FACE_EASE * Math.min(dt, 0.1));
    const out = smooth.current;
    FACE_INPUTS.forEach((name) => {
      const v = raw.current[name] ?? 0;
      out[name] = (out[name] ?? v) + (v - (out[name] ?? v)) * k;
    });
    live.blendshapes = out;
  }, -1);
  useGesture("headShake", {
    onBegin: () => {
      live.shakes += 1;
    },
  });
  return null;
};

/** Soft studio reflections, so fur sheen and gloss read on camera. */
const useStudioLight = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    const before = scene.environment;
    scene.environment = tex;
    return () => {
      scene.environment = before;
      tex.dispose();
    };
  }, [gl, scene]);
};

const NEG_CROWN: [number, number, number] = [-CROWN[0], -CROWN[1], -CROWN[2]];

export const SpiritScene = () => {
  const { animal } = useSpirit();
  useStudioLight();
  const a = animal >= 0 ? ANIMALS[animal] : null;
  return (
    <>
      <FaceSignals />
      <FilteredHead>
        <group
          name="spirit-frame"
          scale={FRAME.scale}
          position={FRAME.position}
        >
          {a?.face.map((p) => <Part key={`${a.id}:${p.id}`} part={p} />)}
        </group>
      </FilteredHead>
      {/* Body tracking only while a pet is out. */}
      {a ? (
        <BodyTracker bodyIndex={0}>
          <CanonicalTorsoFrame>
            <group position={SHOULDER_SEAT}>
              <group position={NEG_CROWN}>
                <group scale={FRAME.scale} position={FRAME.position}>
                  <Part key={`${a.id}:${a.pet.id}`} part={a.pet} />
                </group>
              </group>
            </group>
          </CanonicalTorsoFrame>
        </BodyTracker>
      ) : null}
    </>
  );
};
