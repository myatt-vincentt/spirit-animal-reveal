// The magic puff at a reveal: soft clouds and four-point sparkles in the
// animal's two colours, bursting out from the face and fading — strict
// ease-out, about a second. Lives on the filtered head (canonical cm), so
// it bursts where the face is. Additive and drawn last: it glows over the
// camera image and the new mask.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";

import { ANIMALS } from "./animals";
import { useSpirit } from "./state";

const PUFF = {
  clouds: 12,
  sparks: 28,
  /** Seconds. */
  time: 0.9,
  /** Glow strength (additive, so this is how bright it can get). */
  cloudGain: 0.55,
  /** Where it bursts from: the middle of the face (canonical cm). */
  centre: [0, 2, 7] as const,
  renderOrder: 20,
};

/* eslint-disable no-param-reassign -- drawing into a fresh canvas */
const texture = (draw: (g: CanvasRenderingContext2D, s: number) => void) => {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  draw(c.getContext("2d") as CanvasRenderingContext2D, s);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
};

const softDot = () =>
  texture((g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.45, "rgba(255,255,255,0.55)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, s, s);
  });

const star = () =>
  texture((g, s) => {
    const m = s / 2;
    g.fillStyle = "#fff";
    g.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      const r = i % 2 ? m * 0.18 : m * 0.95;
      g.lineTo(m + Math.cos(a) * r, m + Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
  });

/* eslint-enable no-param-reassign */

type Particle = {
  /** Direction (unit, in the face plane) and speed (cm/s). */
  dx: number;
  dy: number;
  speed: number;
  size: number;
  /** 0 = first colour, 1 = second. */
  mix: number;
  spin: number;
  delay: number;
};

const make = (n: number, speed: [number, number], size: [number, number]) =>
  Array.from({ length: n }, (): Particle => {
    const a = Math.random() * Math.PI * 2;
    return {
      dx: Math.cos(a),
      dy: Math.sin(a) * 1.15,
      speed: speed[0] + Math.random() * (speed[1] - speed[0]),
      size: size[0] + Math.random() * (size[1] - size[0]),
      mix: Math.random(),
      spin: (Math.random() - 0.5) * 6,
      delay: Math.random() * 0.12,
    };
  });

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export const Puff = () => {
  const { animal, reveals } = useSpirit();
  const clouds = useRef<InstancedMesh>(null);
  const sparks = useRef<InstancedMesh>(null);
  const start = useRef(-1);
  const colours = useRef<[Color, Color]>([new Color(), new Color()]);

  const parts = useMemo(
    () => ({
      clouds: make(PUFF.clouds, [5, 11], [3, 5]),
      sparks: make(PUFF.sparks, [14, 26], [1, 2]),
      geo: new PlaneGeometry(1, 1),
      cloudMat: new MeshBasicMaterial({
        map: softDot(),
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
      sparkMat: new MeshBasicMaterial({
        map: star(),
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
    }),
    [],
  );

  // A new reveal: new colours, start again.
  useEffect(() => {
    if (!reveals || animal < 0) return;
    const [a, b] = ANIMALS[animal].colors;
    colours.current[0].set(a);
    colours.current[1].set(b);
    start.current = -2; // set on the next frame's clock
  }, [reveals, animal]);

  const dummy = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (start.current === -2) start.current = now;
    const age = start.current < 0 ? Infinity : now - start.current;
    const [c0, c1] = colours.current;
    const layer = (
      mesh: InstancedMesh | null,
      list: Particle[],
      grow: number,
      twinkle: boolean,
      gain: number,
    ) => {
      if (!mesh) return;
      // eslint-disable-next-line no-param-reassign
      mesh.visible = age < PUFF.time + 0.2;
      if (!mesh.visible) return;
      list.forEach((p, i) => {
        const k = Math.min(1, Math.max(0, (age - p.delay) / PUFF.time));
        const e = easeOut(k);
        const d = p.speed * PUFF.time * e;
        dummy.position.set(
          PUFF.centre[0] + p.dx * d,
          PUFF.centre[1] + p.dy * d,
          PUFF.centre[2] + 2 * e,
        );
        dummy.rotation.set(0, 0, p.spin * e);
        let s = p.size * (1 + grow * e);
        if (twinkle) s *= 0.75 + 0.25 * Math.sin(age * 30 + i);
        dummy.scale.setScalar(k <= 0 ? 0.0001 : s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        // Additive: fading to black fades it out.
        tint
          .copy(c0)
          .lerp(c1, p.mix)
          .multiplyScalar(gain * (1 - e) * (k > 0 ? 1 : 0));
        mesh.setColorAt(i, tint);
      });
      // eslint-disable-next-line no-param-reassign
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        // eslint-disable-next-line no-param-reassign
        mesh.instanceColor.needsUpdate = true;
      }
    };
    layer(clouds.current, parts.clouds, 0.8, false, PUFF.cloudGain);
    layer(sparks.current, parts.sparks, 0.3, true, 1);
  });

  return (
    <>
      <instancedMesh
        ref={clouds}
        args={[parts.geo, parts.cloudMat, PUFF.clouds]}
        frustumCulled={false}
        renderOrder={PUFF.renderOrder}
        visible={false}
      />
      <instancedMesh
        ref={sparks}
        args={[parts.geo, parts.sparkMat, PUFF.sparks]}
        frustumCulled={false}
        renderOrder={PUFF.renderOrder}
        visible={false}
      />
    </>
  );
};
