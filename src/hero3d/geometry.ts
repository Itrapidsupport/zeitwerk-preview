import * as THREE from 'three'

/**
 * Procedural clockwork geometry for the Zeitwerk hero.
 * Everything is generated at runtime (no model files) so the scene ships as code only.
 * Units: world units; module (tooth size) shared by every meshing pair so teeth really interlock.
 */

const TAU = Math.PI * 2

export type GearSpec = {
  teeth: number
  module: number
  spokes?: number // 0 = solid disc
  rim?: number // rim width inside the root circle
  hub?: number // hub radius
  bore?: number // axle hole radius
  style?: 'spur' | 'escape'
}

const polar = (r: number, a: number) => new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)

function arcPoints(r: number, a0: number, a1: number, steps: number) {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= steps; i++) pts.push(polar(r, a0 + ((a1 - a0) * i) / steps))
  return pts
}

export function pitchRadius(teeth: number, module: number) {
  return (teeth * module) / 2
}

/** 2D outline of a gear (teeth + spoke windows + bore). */
export function gearShape(spec: GearSpec): THREE.Shape {
  const { teeth: N, module: m, spokes = 0, style = 'spur' } = spec
  const r = pitchRadius(N, m)
  const ro = r + m
  const rr = r - 1.25 * m
  const p = TAU / N
  const outline: THREE.Vector2[] = []

  for (let i = 0; i < N; i++) {
    const c = i * p
    if (style === 'escape') {
      const rr = r - 0.55 * m
      // Swiss-lever style club teeth: long raked flank, short flat club, steep back
      outline.push(polar(rr, c - 0.5 * p))
      outline.push(polar(rr, c - 0.28 * p))
      outline.push(polar(ro + 0.35 * m, c + 0.06 * p))
      outline.push(polar(ro + 0.35 * m, c + 0.2 * p))
      outline.push(polar(ro - 0.2 * m, c + 0.24 * p))
      outline.push(polar(rr, c + 0.1 * p))
    } else {
      outline.push(polar(rr, c - 0.5 * p))
      outline.push(polar(rr, c - 0.33 * p))
      outline.push(polar(r - 0.2 * m, c - 0.27 * p))
      outline.push(polar(r + 0.45 * m, c - 0.2 * p))
      outline.push(polar(ro, c - 0.12 * p))
      outline.push(polar(ro, c + 0.12 * p))
      outline.push(polar(r + 0.45 * m, c + 0.2 * p))
      outline.push(polar(r - 0.2 * m, c + 0.27 * p))
      outline.push(polar(rr, c + 0.33 * p))
    }
  }
  const shape = new THREE.Shape(outline)

  const bore = spec.bore ?? Math.max(0.035, r * 0.06)
  const hub = spec.hub ?? Math.max(bore * 2.6, r * 0.2)
  const rim = spec.rim ?? Math.max(m * 1.6, r * 0.12)

  if (spokes > 0) {
    const ri = hub
    const rOut = rr - rim
    const spokeW = Math.max(m * 1.1, r * 0.075)
    for (let s = 0; s < spokes; s++) {
      const a0 = (s / spokes) * TAU
      const a1 = ((s + 1) / spokes) * TAU
      const dOut = Math.asin(Math.min(0.9, spokeW / 2 / rOut))
      const dIn = Math.asin(Math.min(0.9, spokeW / 2 / ri))
      const outer = arcPoints(rOut, a0 + dOut, a1 - dOut, 18)
      const inner = arcPoints(ri, a1 - dIn, a0 + dIn, 8)
      shape.holes.push(new THREE.Path([...outer, ...inner]))
    }
  } else if (rr - rim - hub > 0.12) {
    // solid gears get a recessed-look ring of lightening holes
    const holes = Math.max(4, Math.round(N / 6))
    const rc = (hub + rr - rim) / 2
    const hr = Math.min((rr - rim - hub) * 0.32, (rc * Math.PI) / holes * 0.45)
    for (let h = 0; h < holes; h++) {
      const cpt = polar(rc, (h / holes) * TAU + p / 2)
      const path = new THREE.Path()
      path.absarc(cpt.x, cpt.y, hr, 0, TAU, true)
      shape.holes.push(path)
    }
  }

  const b = new THREE.Path()
  b.absarc(0, 0, bore, 0, TAU, true)
  shape.holes.push(b)
  return shape
}

export function extrude(shape: THREE.Shape, depth: number, bevel = 0.012, curveSegments = 10) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments,
  })
  g.translate(0, 0, -depth / 2)
  g.computeVertexNormals()
  return g
}

export function gearGeometry(spec: GearSpec, depth: number) {
  return extrude(gearShape(spec), depth)
}

/** Balance wheel: rim ring + 3 crossing arms + bore. */
export function balanceShape(R: number, rimW: number, arms = 3): THREE.Shape {
  const s = new THREE.Shape()
  s.absarc(0, 0, R, 0, TAU, false)
  const rIn = R - rimW
  const hub = R * 0.14
  const armW = R * 0.09
  for (let k = 0; k < arms; k++) {
    const a0 = (k / arms) * TAU + Math.PI / 2
    const a1 = ((k + 1) / arms) * TAU + Math.PI / 2
    const dOut = Math.asin(armW / 2 / rIn)
    const dIn = Math.asin(Math.min(0.9, armW / 2 / hub))
    s.holes.push(new THREE.Path([...arcPoints(rIn, a0 + dOut, a1 - dOut, 28), ...arcPoints(hub, a1 - dIn, a0 + dIn, 6)]))
  }
  const b = new THREE.Path()
  b.absarc(0, 0, R * 0.045, 0, TAU, true)
  s.holes.push(b)
  return s
}

/** Archimedean hairspring as a thin tube (world-space width, so it scales with any render size). */
export function hairspringGeometry(r0: number, r1: number, turns: number, width = 0.007) {
  const pts: THREE.Vector3[] = []
  const steps = Math.round(turns * 64)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * TAU
    const r = r0 + (r1 - r0) * t
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps, width, 4, false)
}

/** Minute track: hairline ring + 60 graduations (12 long), flat mesh with world-space line width. */
export function minuteTrackGeometry(R: number, w = 0.012) {
  const shapes: THREE.Shape[] = [ringShape(R - w / 2, R + w / 2)]
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU
    const len = i % 5 === 0 ? 0.26 : 0.11
    const lw = i % 5 === 0 ? w * 1.6 : w
    const d = new THREE.Vector2(Math.cos(a), Math.sin(a))
    const nn = new THREE.Vector2(-d.y, d.x).multiplyScalar(lw / 2)
    const o = d.clone().multiplyScalar(R)
    const ii = d.clone().multiplyScalar(R - len)
    shapes.push(new THREE.Shape([o.clone().add(nn), ii.clone().add(nn), ii.clone().sub(nn), o.clone().sub(nn)]))
  }
  return new THREE.ShapeGeometry(shapes, 64)
}

/**
 * Pallet fork (the single red element). Its crossbar is the red parallelogram of the
 * Zeitwerk mark (M50 60 H90 L80 80 H40 Z), the lever runs to the balance.
 * Built in local space with the pivot at the origin; the lever points along +X.
 */
export function palletForkShapes(span: number, lever: number) {
  const shapes: THREE.Shape[] = []
  // Crossbar: logo parallelogram, normalised. Original 50x20 box with 10 slant.
  const w = span
  const h = span * 0.4
  const sl = span * 0.2
  const bar = new THREE.Shape([
    new THREE.Vector2(-w / 2 + sl / 2, h / 2),
    new THREE.Vector2(w / 2 + sl / 2, h / 2),
    new THREE.Vector2(w / 2 - sl / 2, -h / 2),
    new THREE.Vector2(-w / 2 - sl / 2, -h / 2),
  ])
  const pivotHole = new THREE.Path()
  pivotHole.absarc(0, 0, h * 0.16, 0, TAU, true)
  bar.holes.push(pivotHole)
  shapes.push(bar)

  // Lever: slim tapered arm along +X ending in the fork horns
  const t0 = h * 0.2
  const t1 = h * 0.11
  const end = lever
  const horn = h * 0.32
  const notch = h * 0.12
  shapes.push(
    new THREE.Shape([
      new THREE.Vector2(w * 0.2, t0),
      new THREE.Vector2(end - horn * 0.9, t1),
      new THREE.Vector2(end, horn),
      new THREE.Vector2(end + horn * 0.45, horn * 0.9),
      new THREE.Vector2(end + horn * 0.1, notch),
      new THREE.Vector2(end - horn * 0.25, notch),
      new THREE.Vector2(end - horn * 0.25, -notch),
      new THREE.Vector2(end + horn * 0.1, -notch),
      new THREE.Vector2(end + horn * 0.45, -horn * 0.9),
      new THREE.Vector2(end, -horn),
      new THREE.Vector2(end - horn * 0.9, -t1),
      new THREE.Vector2(w * 0.2, -t0),
    ]),
  )
  return shapes
}

/** Pallet stones: two small slanted blocks hanging from the crossbar ends toward the escape wheel. */
export function palletStoneShape(len: number, thick: number) {
  return new THREE.Shape([
    new THREE.Vector2(-thick / 2, 0),
    new THREE.Vector2(thick / 2, 0),
    new THREE.Vector2(thick / 2 + thick * 0.35, -len),
    new THREE.Vector2(-thick / 2 + thick * 0.35, -len),
  ])
}

/**
 * Angle of a driven gear so its teeth sit in the driver's gaps.
 * a1: driver angle, n1/n2 teeth, phi: direction from driver centre to driven centre.
 */
export function meshAngle(a1: number, n1: number, n2: number, phi: number) {
  return -(n1 / n2) * (a1 - phi) + phi + Math.PI + Math.PI / n2
}

/** Flat annulus. */
export function ringShape(r0: number, r1: number) {
  const s = new THREE.Shape()
  s.absarc(0, 0, r1, 0, TAU, false)
  const h = new THREE.Path()
  h.absarc(0, 0, r0, 0, TAU, true)
  s.holes.push(h)
  return s
}

/**
 * Bridge plate between two arbors, ends cut on the Zeitwerk mark's slant (the logo's
 * parallelograms lean 26.6deg), with jewel holes at both arbors. World-space coordinates.
 */
export function bridgeShape(a: THREE.Vector2, b: THREE.Vector2, width: number) {
  const dir = b.clone().sub(a).normalize()
  const nrm = new THREE.Vector2(-dir.y, dir.x)
  const ext = 0.55
  const slant = width * 0.5
  const p0 = a.clone().addScaledVector(dir, -ext)
  const p1 = b.clone().addScaledVector(dir, ext)
  const w = width / 2
  const s = new THREE.Shape([
    p0.clone().addScaledVector(nrm, w).addScaledVector(dir, slant / 2),
    p1.clone().addScaledVector(nrm, w).addScaledVector(dir, slant / 2),
    p1.clone().addScaledVector(nrm, -w).addScaledVector(dir, -slant / 2),
    p0.clone().addScaledVector(nrm, -w).addScaledVector(dir, -slant / 2),
  ])
  for (const c of [a, b]) {
    const h = new THREE.Path()
    h.absarc(c.x, c.y, 0.05, 0, TAU, true)
    s.holes.push(h)
  }
  return s
}
