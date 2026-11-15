import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  balanceShape,
  bridgeShape,
  ringShape,
  extrude,
  gearGeometry,
  hairspringGeometry,
  meshAngle,
  minuteTrackGeometry,
  palletForkShapes,
  palletStoneShape,
  pitchRadius,
} from './geometry'

/* ------------------------------------------------------------------ layout */
// One shared module per meshing pair so the teeth really interlock.
const M1 = 0.08 // A <-> B
const M2 = 0.08 // C <-> D
const NA = 60
const NB = 10
const NC = 40
const ND = 8
const NE = 15 // escape wheel (30 beats / rev)
const TAU = Math.PI * 2

const deg = (d: number) => (d * Math.PI) / 180
const PHI_AB = deg(-20)
const PHI_CD = deg(-100)
const PHI_EF = deg(20)

const A = new THREE.Vector2(-1.2, 0.6)
const B = A.clone().add(new THREE.Vector2(Math.cos(PHI_AB), Math.sin(PHI_AB)).multiplyScalar(pitchRadius(NA, M1) + pitchRadius(NB, M1)))
const D = B.clone().add(new THREE.Vector2(Math.cos(PHI_CD), Math.sin(PHI_CD)).multiplyScalar(pitchRadius(NC, M2) + pitchRadius(ND, M2)))
const E = D
const R_E = 0.9
const PIVOT_DIST = 1.45
const F = E.clone().add(new THREE.Vector2(Math.cos(PHI_EF), Math.sin(PHI_EF)).multiplyScalar(PIVOT_DIST))
const BAL_DIST = 2.0
const BAL = F.clone().add(new THREE.Vector2(Math.cos(PHI_EF), Math.sin(PHI_EF)).multiplyScalar(BAL_DIST))
const BAL_R = 1.1
const TRACK_R = 2.9

/** Framing box (world units, 4:3) shared with the poster so the crossfade is pixel-aligned. */
export const FRAME = { w: 10.8, h: 8.1, cx: 0.7, cy: 0.12 }
const FOV = 26

/* layer z + exploded-view offset (scroll) */
const L = {
  track: [-0.62, -1.5],
  A: [0, 0],
  C: [-0.34, -1.05],
  E: [0.04, 0.55],
  fork: [0.3, 1.15],
  bal: [0.44, 1.75],
  spring: [0.54, 2.15],
  bridge: [0.42, 2.7],
} as const

/* intro order (seconds) */
const INTRO = { bridge: 0.7, track: 0.0, A: 0.08, C: 0.22, B: 0.3, E: 0.42, bal: 0.56, fork: 0.86 } as const
const INTRO_DUR = 1.25

const IDLE_TICKS_PER_S = 1.6
const SCROLL_TICKS = 42

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
function easeOutBack(t: number) {
  const c1 = 1.9
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
/** Escapement beat: the train is locked most of the time and snaps forward with a small recoil. */
const beat = (f: number) => (f < 0.26 ? easeOutBack(f / 0.26) : 1)

export type Tone = 'light' | 'dark'

export type SceneProps = {
  tone: Tone
  align: 'center' | 'end' | 'start'
  active: boolean
  progress: MutableRefObject<number>
  pointer: MutableRefObject<{ x: number; y: number }>
  posterMode?: boolean
  intro?: boolean
  stats?: boolean
  maxDpr?: number
  onReady?: () => void
  onPerfFail?: () => void
  /** Tiled offscreen render (poster master): full virtual size + this tile's window. */
  view?: { fullW: number; fullH: number; x: number; y: number; w: number; h: number }
}

type Palette = { metal: string; metalness: number; roughness: number; line: string; lineOpacity: number; env: number; red: string }
const PALETTES: Record<Tone, Palette> = {
  light: { metal: '#262626', metalness: 0.82, roughness: 0.3, line: '#171717', lineOpacity: 0.3, env: 0.9, red: '#E2000F' },
  dark: { metal: '#5a5a5a', metalness: 0.95, roughness: 0.26, line: '#fafafa', lineOpacity: 0.22, env: 1.3, red: '#E2000F' },
}

/** Studio "HDRI": near-black room lit by long softbox strips + a warm kicker (Lightformer-style). Only reflected, never visible. */
function studioScene() {
  const sc = new THREE.Scene()
  sc.background = new THREE.Color('#050505')
  const panel = (w: number, h: number, c: string, i: number, pos: [number, number, number], rot: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }))
    m.position.set(...pos)
    m.rotation.set(...rot)
    sc.add(m)
  }
  panel(14, 1.2, '#ffffff', 4.2, [0, 6, 2], [Math.PI / 2, 0, 0])         // top strip (key)
  panel(1.4, 10, '#f3f5f8', 2.6, [-8, 0, 2], [0, Math.PI / 2, 0])        // left strip
  panel(1.0, 10, '#ffe2b8', 1.6, [8, 1, -1], [0, -Math.PI / 2, 0])       // warm right kicker
  panel(10, 10, '#20242a', 1.0, [0, 0, -9], [0, 0, 0])                   // soft back fill
  panel(6, 0.5, '#ffffff', 3.0, [3, -5, 4], [-Math.PI / 2, 0, 0])        // under rim
  return sc
}

function useEnvironment(intensity: number) {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(studioScene(), 0.02).texture
    scene.environment = env
    scene.environmentIntensity = intensity
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, intensity])
}

function Mechanism(props: SceneProps) {
  const { tone, align, progress, pointer, posterMode, intro = true, stats, onReady, onPerfFail, view } = props
  const pal = PALETTES[tone]
  useEnvironment(pal.env)

  const geo = useMemo(() => {
    const forkShapes = palletForkShapes(1.25, BAL_DIST - 0.2)
    const bal = balanceShape(BAL_R, 0.13)
    return {
      A: gearGeometry({ teeth: NA, module: M1, spokes: 5, bore: 0.07, hub: 0.36 }, 0.16),
      B: gearGeometry({ teeth: NB, module: M1, bore: 0.05 }, 0.24),
      C: gearGeometry({ teeth: NC, module: M2, spokes: 4, bore: 0.06, hub: 0.26 }, 0.13),
      D: gearGeometry({ teeth: ND, module: M2, bore: 0.045 }, 0.2),
      E: gearGeometry({ teeth: NE, module: (R_E * 2) / NE, spokes: 4, style: 'escape', bore: 0.045, hub: 0.17, rim: 0.09 }, 0.1),
      forkBar: extrude(forkShapes[0], 0.1, 0.01),
      forkLever: extrude(forkShapes[1], 0.07, 0.008),
      stone: extrude(palletStoneShape(0.36, 0.11), 0.12, 0.006),
      bal: extrude(bal, 0.11, 0.012, 32),
      screw: new THREE.CylinderGeometry(0.045, 0.045, 0.1, 10).rotateX(Math.PI / 2),
      arbor: new THREE.CylinderGeometry(0.04, 0.04, 1, 12).rotateX(Math.PI / 2),
      jewel: new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20).rotateX(Math.PI / 2),
      spring: hairspringGeometry(0.12, 0.62, 11),
      bridge: extrude(bridgeShape(A, B, 0.36), 0.09, 0.014),
      ringA: extrude(ringShape(pitchRadius(NA, M1) - 1.25 * M1 - 0.2, pitchRadius(NA, M1) - 1.25 * M1 - 0.05), 0.24, 0.012, 64),
      ringC: extrude(ringShape(pitchRadius(NC, M2) - 1.25 * M2 - 0.16, pitchRadius(NC, M2) - 1.25 * M2 - 0.04), 0.19, 0.01, 48),
      boss: new THREE.CylinderGeometry(0.2, 0.24, 0.26, 32).rotateX(Math.PI / 2),
      bossS: new THREE.CylinderGeometry(0.13, 0.15, 0.2, 24).rotateX(Math.PI / 2),
      track: minuteTrackGeometry(TRACK_R),
      trackE: minuteTrackGeometry(R_E + 0.32, 0.009),
    }
  }, [])

  const mats = useMemo(() => {
    const dark = tone === 'dark'
    // polished steel (bridges, escape wheel) - anisotropic brushing reads as Côtes-style finishing
    const metal = new THREE.MeshPhysicalMaterial({ color: dark ? '#8f959d' : '#3a3d42', metalness: 1, roughness: 0.3, anisotropy: 0.55, anisotropyRotation: Math.PI / 2, clearcoat: 0.25, clearcoatRoughness: 0.2, envMapIntensity: 1 })
    // warm brass (gear train wheels, rings, screws)
    const metalSoft = new THREE.MeshPhysicalMaterial({ color: dark ? '#c7a16a' : '#7a5f36', metalness: 1, roughness: 0.32, anisotropy: 0.4, clearcoat: 0.15, clearcoatRoughness: 0.3, envMapIntensity: 0.95 })
    // the single red part: lacquered pallet fork (clearcoat), saturated, no emissive glow
    const red = new THREE.MeshPhysicalMaterial({ color: pal.red, metalness: 0.0, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.9 })
    const line = new THREE.MeshBasicMaterial({ color: pal.line, transparent: true, opacity: pal.lineOpacity, depthWrite: false, side: THREE.DoubleSide })
    const spring = new THREE.MeshPhysicalMaterial({ color: dark ? '#9aa3ae' : '#2a2d31', metalness: 1, roughness: 0.18, envMapIntensity: 1.1 })
    // synthetic ruby jewel bearings: deep, glassy, small
    const jewel = new THREE.MeshPhysicalMaterial({ color: '#5a0008', metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.77, specularIntensity: 1, envMapIntensity: 1.4 })
    return { metal, metalSoft, red, line, spring, jewel }
  }, [pal, tone])

  const springLine = useMemo(() => new THREE.Mesh(geo.spring, mats.spring), [geo, mats])

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(mats).forEach((m) => m.dispose())
    },
    [geo, mats],
  )

  const root = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const n = {
    track: useRef<THREE.Group>(null),
    A: useRef<THREE.Group>(null),
    gA: useRef<THREE.Mesh>(null),
    BC: useRef<THREE.Group>(null),
    gB: useRef<THREE.Mesh>(null),
    gC: useRef<THREE.Mesh>(null),
    DE: useRef<THREE.Group>(null),
    gD: useRef<THREE.Mesh>(null),
    gE: useRef<THREE.Mesh>(null),
    eTrack: useRef<THREE.Mesh>(null),
    fork: useRef<THREE.Group>(null),
    forkRot: useRef<THREE.Group>(null),
    bal: useRef<THREE.Group>(null),
    balRot: useRef<THREE.Group>(null),
    spring: useRef<THREE.Mesh>(null),
    bridge: useRef<THREE.Group>(null),
  }

  const sim = useRef({ t0: -1, idle: 0, scrollTicks: 0, prog: 0, tx: 0, ty: 0, frames: 0, ready: false, perfAcc: 0, perfN: 0, failed: false })
  const { camera, size } = useThree()

  // contain-fit framing identical to the poster (object-fit: contain)
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = view ? view.fullW / view.fullH : size.width / Math.max(1, size.height)
    const tan = Math.tan(deg(FOV / 2))
    const dist = Math.max(FRAME.h / 2 / tan, FRAME.w / 2 / (tan * aspect))
    cam.fov = FOV
    cam.near = 0.1
    cam.far = 100
    cam.position.set(0, 0, dist)
    cam.aspect = aspect
    if (view) cam.setViewOffset(view.fullW, view.fullH, view.x, view.y, view.w, view.h)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()
    cam.lookAt(0, 0, 0)
    const viewW = 2 * dist * tan * aspect
    const slack = Math.max(0, (viewW - FRAME.w) / 2)
    if (root.current) root.current.position.x = align === 'end' ? slack : align === 'start' ? -slack : 0
  }, [camera, size, align, view])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const s = sim.current
    const t = state.clock.elapsedTime
    if (s.t0 < 0) s.t0 = t
    const since = t - s.t0

    // frame timing (demo/QA) + adaptive fallback
    if (stats) {
      const w = window as unknown as { __heroFrames?: number[] }
      ;(w.__heroFrames ||= []).push(rawDt * 1000)
    }
    s.frames++
    if (!s.ready && s.frames === 2) {
      s.ready = true
      onReady?.()
    }
    if (!posterMode && s.frames > 40 && s.frames <= 160 && !s.failed) {
      s.perfAcc += rawDt
      s.perfN++
      if (s.perfN === 120 && s.perfAcc / s.perfN > 1 / 22) {
        s.failed = true
        onPerfFail?.()
      }
    }

    // inputs
    const targetProg = posterMode ? 0 : clamp01(progress.current)
    s.prog += (targetProg - s.prog) * Math.min(1, dt * 5)
    const prog = s.prog
    const pe = easeInOut(prog)
    if (!posterMode) {
      s.idle += dt * IDLE_TICKS_PER_S
      s.scrollTicks += (targetProg * SCROLL_TICKS - s.scrollTicks) * Math.min(1, dt * 4)
    }

    // escapement: d counts beats; the train advances in snapped beats
    const d = posterMode ? 3 : s.idle + s.scrollTicks
    const k = Math.floor(d)
    const f = d - k
    const b = beat(f)
    const units = k + b
    const aA = (-units * (TAU / (NE * 2))) / ((NA / NB) * (NC / ND))
    const aB = meshAngle(aA, NA, NB, PHI_AB)
    const aD = meshAngle(aB, NC, ND, PHI_CD)

    if (n.gA.current) n.gA.current.rotation.z = aA
    if (n.gB.current) n.gB.current.rotation.z = aB
    if (n.gC.current) n.gC.current.rotation.z = aB
    if (n.gD.current) n.gD.current.rotation.z = aD
    if (n.gE.current) n.gE.current.rotation.z = aD

    const side = k % 2 === 0 ? 1 : -1
    const forkA = 0.085 * (-side + 2 * side * b)
    if (n.forkRot.current) n.forkRot.current.rotation.z = forkA
    const balA = 2.35 * Math.sin(Math.PI * (k + Math.min(1, f * 1.0))) * (posterMode ? 0 : 1) + (posterMode ? 0.6 : 0)
    if (n.balRot.current) n.balRot.current.rotation.z = balA
    if (n.spring.current) {
      n.spring.current.rotation.z = balA * 0.35
      const br = 1 + 0.035 * Math.sin(Math.PI * d)
      n.spring.current.scale.set(br, br, 1)
    }

    // intro assembly: parts rise from depth, staggered; the red fork lands last
    const introAt = (delay: number) => (posterMode || !intro ? 1 : clamp01((since - delay) / INTRO_DUR))
    const place = (g: THREE.Object3D | null, layer: readonly [number, number], delay: number, spin = 0) => {
      if (!g) return
      const p = easeOutCubic(introAt(delay))
      g.position.z = layer[0] + layer[1] * pe * 1.0 - (1 - p) * 7
      const sc = 0.82 + 0.18 * p
      g.scale.set(sc, sc, sc)
      g.rotation.z = (1 - p) * spin
      g.visible = p > 0.001
    }
    place(n.track.current, L.track, INTRO.track, -0.6)
    place(n.A.current, L.A, INTRO.A, 1.2)
    place(n.BC.current, L.C, INTRO.C, -1.4)
    place(n.DE.current, L.E, INTRO.E, 1.8)
    place(n.bal.current, L.bal, INTRO.bal, -2.2)
    place(n.fork.current, L.fork, INTRO.fork, 0.9)
    place(n.bridge.current, L.bridge, INTRO.bridge, 0)
    if (n.spring.current) n.spring.current.position.z = L.spring[0] - L.bal[0] + (L.spring[1] - L.bal[1]) * pe
    if (n.eTrack.current) n.eTrack.current.position.z = -0.1 - 0.5 * pe

    // B pinion lives in A's plane while C explodes backwards on the same arbor
    if (n.gB.current) n.gB.current.position.z = -(L.C[0] + L.C[1] * pe) + L.A[0]
    // D pinion lives in C's plane while the escape wheel explodes forwards
    if (n.gD.current) n.gD.current.position.z = L.C[0] + L.C[1] * pe - (L.E[0] + L.E[1] * pe)

    // whole-mechanism pose: scroll swings to a 3/4 exploded view; cursor adds a damped tilt
    const px = posterMode ? 0 : pointer.current.x
    const py = posterMode ? 0 : pointer.current.y
    s.tx += (px - s.tx) * Math.min(1, dt * 2.2)
    s.ty += (py - s.ty) * Math.min(1, dt * 2.2)
    if (tilt.current) {
      const sway = posterMode ? 0 : Math.sin(t * 0.13) * 0.06 + Math.sin(t * 0.051) * 0.03
      tilt.current.rotation.y = -0.2 + s.tx * 0.2 - pe * 0.5 + sway
      tilt.current.rotation.x = 0.14 - s.ty * 0.14 + pe * 0.3 + (posterMode ? 0 : Math.sin(t * 0.09) * 0.03)
      tilt.current.rotation.z = -pe * 0.08
      tilt.current.position.y = pe * 0.35
      const zoom = 1 + pe * 0.1
      tilt.current.scale.set(zoom, zoom, zoom)
    }
  })

  const z = (v: number) => v
  return (
    <group ref={root}>
      <group ref={tilt}>
        <group position={[-FRAME.cx, -FRAME.cy, 0]}>
          {/* hairline minute track concentric with the main wheel */}
          <group ref={n.track} position={[A.x, A.y, z(L.track[0])]}>
            <mesh geometry={geo.track} material={mats.line} />
          </group>

          {/* A: main wheel */}
          <group ref={n.A} position={[A.x, A.y, z(L.A[0])]}>
            <mesh ref={n.gA} geometry={geo.A} material={mats.metalSoft}>
              <mesh geometry={geo.ringA} material={mats.metal} />
              <mesh geometry={geo.boss} material={mats.metal} />
            </mesh>
            <mesh geometry={geo.jewel} material={mats.jewel} position={[0, 0, 0.11]} />
            <mesh geometry={geo.arbor} material={mats.metalSoft} scale={[1, 1, 1.4]} />
          </group>

          {/* B pinion (A plane) + C wheel (behind) on one arbor */}
          <group ref={n.BC} position={[B.x, B.y, z(L.C[0])]}>
            <mesh ref={n.gC} geometry={geo.C} material={mats.metalSoft}>
              <mesh geometry={geo.ringC} material={mats.metal} />
              <mesh geometry={geo.bossS} material={mats.metal} />
            </mesh>
            <mesh ref={n.gB} geometry={geo.B} material={mats.metal} />
            <mesh geometry={geo.arbor} material={mats.metalSoft} scale={[1, 1, 3.2]} />
          </group>

          {/* D pinion + escape wheel on one arbor */}
          <group ref={n.DE} position={[D.x, D.y, z(L.E[0])]}>
            <mesh ref={n.gE} geometry={geo.E} material={mats.metal} />
            <mesh ref={n.gD} geometry={geo.D} material={mats.metalSoft} />
            <mesh geometry={geo.arbor} material={mats.metalSoft} scale={[1, 1, 2.2]} />
            <mesh ref={n.eTrack} geometry={geo.trackE} material={mats.line} />
          </group>

          {/* bridge: slanted-end plate (mark's parallelogram ends) holding the A and B/C arbors */}
          <group ref={n.bridge} position={[0, 0, z(L.bridge[0])]}>
            <mesh geometry={geo.bridge} material={mats.metal} />
            <mesh geometry={geo.jewel} material={mats.jewel} position={[A.x, A.y, 0.07]} />
            <mesh geometry={geo.jewel} material={mats.jewel} position={[B.x, B.y, 0.07]} />
          </group>

          {/* pallet fork: the single red element (Zeitwerk mark's red parallelogram) */}
          <group ref={n.fork} position={[F.x, F.y, z(L.fork[0])]}>
            <group rotation={[0, 0, PHI_EF]}>
              <group ref={n.forkRot}>
                <mesh geometry={geo.forkBar} material={mats.red} rotation={[0, 0, Math.PI / 2]} />
                <mesh geometry={geo.forkLever} material={mats.red} position={[0, 0, -0.01]} />
                <mesh geometry={geo.stone} material={mats.red} position={[-0.12, 0.5, 0]} rotation={[0, 0, -Math.PI / 2 + 0.22]} />
                <mesh geometry={geo.stone} material={mats.red} position={[-0.12, -0.5, 0]} rotation={[0, 0, -Math.PI / 2 - 0.22]} />
              </group>
              <mesh geometry={geo.arbor} material={mats.metalSoft} scale={[1.2, 1.2, 0.7]} />
            </group>
          </group>

          {/* balance wheel + hairspring */}
          <group ref={n.bal} position={[BAL.x, BAL.y, z(L.bal[0])]}>
            <group ref={n.balRot}>
              <mesh geometry={geo.bal} material={mats.metalSoft} />
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * TAU
                return <mesh key={i} geometry={geo.screw} material={mats.metal} position={[Math.cos(a) * (BAL_R + 0.02), Math.sin(a) * (BAL_R + 0.02), 0]} />
              })}
            </group>
            <primitive ref={n.spring} object={springLine} />
            <mesh geometry={geo.arbor} material={mats.metalSoft} scale={[1, 1, 1.6]} />
          </group>
        </group>
      </group>
      <ambientLight intensity={0.05} />
      <directionalLight position={[-4, 6, 8]} intensity={tone === 'light' ? 1.4 : 2.2} />
      <directionalLight position={[6, -3, 4]} intensity={0.6} color={'#ffd9a8'} />
    </group>
  )
}

export default function MechanismScene(props: SceneProps) {
  const dprMax = props.maxDpr ?? 2
  return (
    <Canvas
      dpr={[1, dprMax]}
      frameloop={props.active || props.posterMode ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!props.posterMode }}
      camera={{ fov: FOV, position: [0, 0, 30] }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
    >
      <Mechanism {...props} />
    </Canvas>
  )
}
