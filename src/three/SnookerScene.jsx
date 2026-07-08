/*
 * SnookerScene — scroll-driven cinematic.
 * Timeline (p = scroll progress of the pinned hero stage, 0→1):
 *   0.00–0.16  high orbit over the neon hall
 *   0.16–0.34  swoop down behind the cue
 *   0.34–0.385 cue draws back, then strikes
 *   0.385–0.55 cue ball breaks the pack, reds scatter
 *   0.50–0.75  camera tracks the black ball rolling clear
 *   0.75–0.92  black ball rolls into the lens (fills the frame)
 *   0.85–1.00  DOM crossfade: ball silhouette becomes the "O" of ONE47 (in Home.jsx)
 */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BALL_R = 0.052;
const BED_Y = 0.82;
const BALL_Y = BED_Y + BALL_R;

/* piecewise vector keyframes with smooth local easing */
function track(p, stops, out) {
  if (p <= stops[0][0]) return out.set(...stops[0][1]);
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, a] = stops[i];
    const [t1, b] = stops[i + 1];
    if (p >= t0 && p <= t1) {
      let k = (p - t0) / (t1 - t0);
      k = k * k * (3 - 2 * k); // smoothstep
      return out.set(
        a[0] + (b[0] - a[0]) * k,
        a[1] + (b[1] - a[1]) * k,
        a[2] + (b[2] - a[2]) * k
      );
    }
  }
  return out.set(...stops[stops.length - 1][1]);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (k) => 1 - Math.pow(1 - k, 3);

/* seeded pseudo-random so the break is identical every scroll */
function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- table ---------------- */
function Table() {
  const wood = { color: '#1d1410', roughness: 0.55, metalness: 0.25 };
  const goldTrim = { color: '#a1114f', roughness: 0.3, metalness: 0.9 };
  return (
    <group>
      {/* cloth bed */}
      <mesh position={[0, BED_Y - 0.05, 0]} receiveShadow>
        <boxGeometry args={[3.6, 0.1, 1.8]} />
        <meshStandardMaterial color="#3f1583" roughness={0.92} />
      </mesh>
      {/* cushions */}
      {[
        [0, 0.97, [3.6, 0.09, 0.12]], [0, -0.97, [3.6, 0.09, 0.12]],
      ].map(([x, z, s], i) => (
        <mesh key={'ch' + i} position={[x, BED_Y + 0.02, z * 0.93]}>
          <boxGeometry args={s} />
          <meshStandardMaterial color="#2c0e63" roughness={0.9} />
        </mesh>
      ))}
      {[[-1.86, 0], [1.86, 0]].map(([x], i) => (
        <mesh key={'cv' + i} position={[x * 0.985, BED_Y + 0.02, 0]}>
          <boxGeometry args={[0.12, 0.09, 1.8]} />
          <meshStandardMaterial color="#2c0e63" roughness={0.9} />
        </mesh>
      ))}
      {/* wooden rails */}
      <mesh position={[0, BED_Y - 0.02, 1.02]}><boxGeometry args={[3.94, 0.16, 0.14]} /><meshStandardMaterial {...wood} /></mesh>
      <mesh position={[0, BED_Y - 0.02, -1.02]}><boxGeometry args={[3.94, 0.16, 0.14]} /><meshStandardMaterial {...wood} /></mesh>
      <mesh position={[1.9, BED_Y - 0.02, 0]}><boxGeometry args={[0.14, 0.16, 2.18]} /><meshStandardMaterial {...wood} /></mesh>
      <mesh position={[-1.9, BED_Y - 0.02, 0]}><boxGeometry args={[0.14, 0.16, 2.18]} /><meshStandardMaterial {...wood} /></mesh>
      {/* gold corner trim */}
      {[[1.9, 1.02], [1.9, -1.02], [-1.9, 1.02], [-1.9, -1.02]].map(([x, z], i) => (
        <mesh key={'g' + i} position={[x, BED_Y + 0.055, z]}>
          <boxGeometry args={[0.15, 0.02, 0.15]} />
          <meshStandardMaterial {...goldTrim} />
        </mesh>
      ))}
      {/* pockets */}
      {[[-1.82, -0.94], [-1.82, 0.94], [1.82, -0.94], [1.82, 0.94], [0, -0.99], [0, 0.99]].map(([x, z], i) => (
        <mesh key={'p' + i} position={[x, BED_Y + 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 24]} />
          <meshBasicMaterial color="#020204" />
        </mesh>
      ))}
      {/* apron */}
      <mesh position={[0, BED_Y - 0.22, 0]}>
        <boxGeometry args={[3.9, 0.3, 2.14]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      {/* legs */}
      {[[-1.65, -0.85], [-1.65, 0.85], [0, -0.85], [0, 0.85], [1.65, -0.85], [1.65, 0.85]].map(([x, z], i) => (
        <mesh key={'l' + i} position={[x, BED_Y / 2 - 0.2, z]}>
          <cylinderGeometry args={[0.075, 0.1, BED_Y - 0.06, 12]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
      {/* baulk line (x = 1.0, brown spot on it) */}
      <mesh position={[1.0, BED_Y + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.012, 1.8]} />
        <meshBasicMaterial color="#e3d5ff" transparent opacity={0.35} />
      </mesh>
      {/* the D — semicircle on the baulk side of the line */}
      <mesh position={[1.0, BED_Y + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.283, 0.295, 48, 1, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#e3d5ff" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* spots: yellow, green, brown, blue, pink, black */}
      {[[1.0, 0.29], [1.0, -0.29], [1.0, 0], [0, 0], [-0.9, 0], [-1.48, 0]].map(([x, z], i) => (
        <mesh key={'sp' + i} position={[x, BED_Y + 0.0015, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.009, 12]} />
          <meshBasicMaterial color="#f4f8ff" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- dust motes drifting in the lamp light ---------------- */
function Dust() {
  const ref = useRef();
  const positions = useMemo(() => {
    const rnd = mulberry(47);
    const arr = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      arr[i * 3] = (rnd() - 0.5) * 7;
      arr[i * 3 + 1] = 0.9 + rnd() * 1.9;
      arr[i * 3 + 2] = (rnd() - 0.5) * 5;
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.016;
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.18) * 0.06;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.014} color="#9fc6ff" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ---------------- environment ---------------- */
function Room() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* walls */}
      <mesh position={[0, 4, -7]}><planeGeometry args={[40, 10]} /><meshStandardMaterial color="#0c0c13" roughness={0.9} /></mesh>
      <mesh position={[-9, 4, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[30, 10]} /><meshStandardMaterial color="#0a0718" roughness={0.9} /></mesh>
      <mesh position={[9, 4, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[30, 10]} /><meshStandardMaterial color="#0a0718" roughness={0.9} /></mesh>

      {/* neon strips — magenta + cyan */}
      {[
        { p: [0, 5.2, -6.95], s: [16, 0.05, 0.05], c: '#2f7dff' },
        { p: [0, 4.7, -6.95], s: [13, 0.03, 0.03], c: '#4da3ff' },
        { p: [-8.95, 4.9, 0], s: [0.05, 0.05, 14], c: '#4da3ff' },
        { p: [8.95, 4.6, 0], s: [0.05, 0.05, 14], c: '#2f7dff' },
        { p: [-5.5, 2.2, -6.95], s: [0.04, 3.4, 0.04], c: '#2f7dff' },
        { p: [5.5, 2.2, -6.95], s: [0.04, 3.4, 0.04], c: '#22d3ee' },
      ].map((n, i) => (
        <mesh key={i} position={n.p}>
          <boxGeometry args={n.s} />
          <meshBasicMaterial color={n.c} toneMapped={false} />
        </mesh>
      ))}
      {/* neon ring sign on back wall */}
      <mesh position={[3.4, 3.4, -6.9]}>
        <torusGeometry args={[0.9, 0.03, 12, 60]} />
        <meshBasicMaterial color="#3d8bff" toneMapped={false} />
      </mesh>
      <mesh position={[3.4, 3.4, -6.9]}>
        <torusGeometry args={[0.72, 0.015, 12, 60]} />
        <meshBasicMaterial color="#d8b4fe" toneMapped={false} />
      </mesh>

      {/* overhead lamp row */}
      {[-1.1, 0, 1.1].map((x, i) => (
        <group key={i} position={[x, 2.6, 0]}>
          <mesh><cylinderGeometry args={[0.02, 0.02, 1.3, 6]} /><meshStandardMaterial color="#151515" /></mesh>
          <mesh position={[0, -0.65, 0]}><coneGeometry args={[0.28, 0.3, 24, 1, true]} /><meshStandardMaterial color="#1d0f3d" side={THREE.DoubleSide} metalness={0.4} roughness={0.4} /></mesh>
          <mesh position={[0, -0.78, 0]}><sphereGeometry args={[0.09, 12, 12]} /><meshBasicMaterial color="#dcebff" toneMapped={false} /></mesh>
        </group>
      ))}

      {/* colored light sources */}
      <pointLight position={[-6, 3.5, -5]} color="#2f7dff" intensity={30} distance={16} />
      <pointLight position={[6, 3.5, 3]} color="#4da3ff" intensity={24} distance={16} />
      <pointLight position={[3.4, 3.4, -6]} color="#2f7dff" intensity={14} distance={10} />
    </group>
  );
}

/* ---------------- balls + cue + camera choreography ---------------- */
/* True snooker layout: baulk line x=1.0 with the D (r=0.29) opening toward the
   baulk cushion; yellow/green on the D corners, brown on the line, blue on the
   centre spot, pink on the mid spot (-0.9), reds racked behind the pink with
   the black on its own spot (-1.48) behind the pack. The cue ball breaks from
   inside the D, so the cue points AWAY from the table over the baulk cushion
   and never crosses another ball. */
const CB_START = [1.18, 0.1];   // cue ball in the D
const PACK_APEX = -0.98;        // apex red, touching distance behind pink
const BLACK_SPOT = -1.48;

function Choreography({ progressRef }) {
  const camState = useRef({ look: new THREE.Vector3(0, BED_Y, 0) });
  const cueBall = useRef();
  const blackBall = useRef();
  const cue = useRef();
  const redsGroup = useRef();
  const ringFx = useRef();
  const flash = useRef();

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), look: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  /* red pack: 15 balls, apex toward baulk, rows packed toward the black */
  const reds = useMemo(() => {
    const rnd = mulberry(147);
    const out = [];
    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let k = 0; k <= row; k++) {
        const home = [
          PACK_APEX - row * (BALL_R * 1.78),
          (k - row / 2) * (BALL_R * 2.06),
        ];
        const ang = Math.atan2(home[1], -0.4) + (rnd() - 0.5) * 2.2;
        const dist = 0.35 + rnd() * 1.05;
        const target = [
          THREE.MathUtils.clamp(home[0] - Math.cos(ang) * dist, -1.6, 1.55),
          THREE.MathUtils.clamp(home[1] + Math.sin(ang) * dist * 1.6, -0.78, 0.78),
        ];
        out.push({ home, target, delay: rnd() * 0.035, spin: (rnd() - 0.5) * 14, i: i++ });
      }
    }
    return out;
  }, []);

  /* colours on their real spots */
  const colors = useMemo(() => ([
    { c: '#f5c518', p: [1.0, 0.29] },    // yellow — right corner of the D
    { c: '#1b7f3a', p: [1.0, -0.29] },   // green — left corner of the D
    { c: '#7a4a21', p: [1.0, 0] },       // brown — centre of the baulk line
    { c: '#1e4fd6', p: [0, 0] },         // blue — centre spot
    { c: '#ff9ec4', p: [-0.9, 0] },      // pink — mid spot, pack racks behind it
  ]), []);

  useFrame(({ camera, clock }) => {
    const p = progressRef.current;
    const t = clock.elapsedTime;

    /* ----- cue ball: D → pack, then a touch of screw-back ----- */
    const strike = clamp01((p - 0.385) / 0.05);
    const post = clamp01((p - 0.44) / 0.12);
    const cbX = CB_START[0] - easeOut(strike) * (CB_START[0] - (PACK_APEX + BALL_R * 2.2)) + easeOut(post) * 0.22;
    const cbZ = CB_START[1] * (1 - easeOut(strike));
    if (cueBall.current) {
      cueBall.current.position.set(cbX, BALL_Y, cbZ);
      cueBall.current.rotation.z = -cbX * 20;
    }

    /* ----- red pack scatter ----- */
    const brk = clamp01((p - 0.41) / 0.17);
    if (redsGroup.current) {
      redsGroup.current.children.forEach((m, idx) => {
        const r = reds[idx];
        const k = easeOut(clamp01((brk - r.delay) / (1 - r.delay)));
        m.position.set(
          r.home[0] + (r.target[0] - r.home[0]) * k,
          BALL_Y,
          r.home[1] + (r.target[1] - r.home[1]) * k
        );
        m.rotation.x = k * r.spin;
      });
    }

    /* ----- black ball: rolls clear, then into the lens ----- */
    const roll = clamp01((p - 0.46) / 0.27);
    const bx = BLACK_SPOT + easeOut(roll) * (0.88 - BLACK_SPOT); // → 0.88
    const bz = easeOut(roll) * 1.15;                             // → 1.15
    if (blackBall.current) {
      if (p < 0.75) {
        blackBall.current.position.set(bx, BALL_Y, bz);
        blackBall.current.rotation.x = roll * 9;
      } else {
        // fly toward a point right in front of the camera
        const k = easeOut(clamp01((p - 0.75) / 0.16));
        camera.getWorldDirection(tmp.dir);
        tmp.v.copy(camera.position).addScaledVector(tmp.dir, 0.35 - k * 0.16);
        blackBall.current.position.set(
          bx + (tmp.v.x - bx) * k,
          BALL_Y + (tmp.v.y - BALL_Y) * k,
          bz + (tmp.v.z - bz) * k
        );
        blackBall.current.rotation.x += 0.06;
      }
    }

    /* ----- cue stick: behind the cue ball in the D, butt raised, aimed at the
       pack apex; draws back, thrusts, then lifts away — never crosses a ball ----- */
    if (cue.current && cueBall.current) {
      const aim = clamp01((p - 0.18) / 0.1);
      const draw = clamp01((p - 0.29) / 0.08);
      const lunge = clamp01((p - 0.375) / 0.015);
      const gone = clamp01((p - 0.45) / 0.1);
      const cb = cueBall.current.position;
      // local +x points from the ball AWAY from the pack (over the baulk cushion)
      const dx = cb.x - PACK_APEX, dz = cb.z - 0;
      cue.current.position.set(cb.x, cb.y + 0.012 + gone * 0.35, cb.z);
      cue.current.rotation.set(0, Math.atan2(-dz, dx), 0.095 + gone * 0.45);
      const tipGap = BALL_R + 0.012 + draw * 0.26 - easeOut(lunge) * 0.255;
      cue.current.translateX(Math.max(tipGap, BALL_R + 0.006));
      cue.current.visible = aim > 0.02 && gone < 0.98;
      cue.current.traverse((o) => {
        if (o.material) { o.material.opacity = aim * (1 - gone); o.material.transparent = true; }
      });
    }

    /* ----- break impact FX: shockwave ring + light flash + FOV punch ----- */
    const fx = clamp01((p - 0.4) / 0.1);
    if (ringFx.current) {
      ringFx.current.visible = fx > 0 && fx < 1;
      const s = 0.25 + easeOut(fx) * 3.4;
      ringFx.current.scale.set(s, s, s);
      ringFx.current.material.opacity = (1 - fx) * 0.7;
    }
    if (flash.current) {
      flash.current.intensity = fx > 0 && fx < 1 ? Math.sin(Math.min(fx * 2.5, 1) * Math.PI) * 70 * (1 - fx) : 0;
    }
    const punch = clamp01((p - 0.395) / 0.1);
    // portrait phones need a wider lens to keep the table in frame
    const baseFov = camera.aspect < 0.75 ? 62 : camera.aspect < 1 ? 52 : 40;
    const targetFov = baseFov + (punch > 0 && punch < 1 ? Math.sin(punch * Math.PI) * 7 : 0);
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    /* ----- camera path ----- */
    track(p, [
      [0.00, [7.0, 4.8, 7.0]],
      [0.16, [4.8, 2.4, 4.6]],
      [0.34, [3.35, 1.16, 1.0]],
      [0.50, [1.9, 1.6, 2.3]],
      [0.68, [2.1, 1.05, 2.7]],
      [0.92, [2.1, 1.0, 2.7]],
      [1.00, [2.1, 1.0, 2.7]],
    ], camera.position);

    /* look target follows the story */
    const lookStops = [
      [0.00, [0, BED_Y, 0]],
      [0.30, [0.9, BALL_Y, 0.07]],
      [0.42, [PACK_APEX + 0.1, BALL_Y, 0]],
      [0.55, [bx, BALL_Y, bz]],
      [1.00, [bx, BALL_Y, bz]],
    ];
    if (p > 0.55 && blackBall.current) {
      camState.current.look.copy(blackBall.current.position);
    } else {
      track(p, lookStops, camState.current.look);
    }
    tmp.look.lerp(camState.current.look, 0.35);
    if (tmp.look.lengthSq() === 0) tmp.look.copy(camState.current.look);

    /* impact shake */
    const shakeK = p > 0.39 && p < 0.47 ? (1 - (p - 0.39) / 0.08) * 0.03 : 0;
    camera.position.x += Math.sin(t * 60) * shakeK;
    camera.position.y += Math.cos(t * 47) * shakeK;

    /* idle drift at the very top so the hall feels alive */
    if (p < 0.05) {
      camera.position.x += Math.sin(t * 0.3) * 0.15;
      camera.position.z += Math.cos(t * 0.25) * 0.15;
    }

    camera.lookAt(tmp.look);
  });

  return (
    <group>
      {/* cue ball */}
      <mesh ref={cueBall} castShadow>
        <sphereGeometry args={[BALL_R, 24, 24]} />
        <meshStandardMaterial color="#f5f2e8" roughness={0.16} metalness={0.05} />
      </mesh>

      {/* reds */}
      <group ref={redsGroup}>
        {reds.map((r) => (
          <mesh key={r.i} castShadow position={[r.home[0], BALL_Y, r.home[1]]}>
            <sphereGeometry args={[BALL_R, 20, 20]} />
            <meshStandardMaterial color="#c01420" roughness={0.18} />
          </mesh>
        ))}
      </group>

      {/* colours */}
      {colors.map((b, i) => (
        <mesh key={i} castShadow position={[b.p[0], BALL_Y, b.p[1]]}>
          <sphereGeometry args={[BALL_R, 20, 20]} />
          <meshStandardMaterial color={b.c} roughness={0.18} />
        </mesh>
      ))}

      {/* the black — on its spot behind the pack; becomes the O of ONE47 */}
      <mesh ref={blackBall} castShadow position={[BLACK_SPOT, BALL_Y, 0]}>
        <sphereGeometry args={[BALL_R * 1.02, 28, 28]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.12} metalness={0.15} />
      </mesh>

      {/* cue stick — built along local +x with the tip at the origin;
          the group is positioned at the cue ball and yawed away from the pack */}
      <group ref={cue} visible={false}>
        <mesh position={[0.005, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.03, 10]} />
          <meshStandardMaterial color="#2a6fdb" roughness={0.6} />
        </mesh>
        <mesh position={[0.76, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.017, 0.008, 1.5, 10]} />
          <meshStandardMaterial color="#c9954f" roughness={0.5} />
        </mesh>
        <mesh position={[1.68, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.017, 0.34, 10]} />
          <meshStandardMaterial color="#171310" roughness={0.5} />
        </mesh>
      </group>

      {/* break shockwave ring + impact flash */}
      <mesh ref={ringFx} visible={false} position={[PACK_APEX + 0.1, BED_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.115, 40]} />
        <meshBasicMaterial color="#7fb8ff" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={flash} position={[PACK_APEX, BALL_Y + 0.25, 0]} color="#bfe0ff" intensity={0} distance={4} />
    </group>
  );
}

export default function SnookerScene({ progressRef, active = true }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 40, position: [7, 4.8, 7], near: 0.05, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#04030a']} />
      <fog attach="fog" args={['#04030a', 9, 26]} />
      <ambientLight intensity={0.22} />
      <spotLight
        position={[0, 3.4, 0]} angle={0.95} penumbra={0.55} intensity={60}
        color="#f0eaff" castShadow shadow-mapSize={[512, 512]}
      />
      <Room />
      <Table />
      <Dust />
      <Choreography progressRef={progressRef} />
    </Canvas>
  );
}
