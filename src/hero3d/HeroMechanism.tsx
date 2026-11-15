import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode } from 'react'
import { canRun3D, hasWebGL, isCoarse, useActive, useReducedMotion } from './env'
import type { Tone } from './MechanismScene'
import { POSTERS } from './posters'

// The scene (three + r3f) is a separate chunk, fetched only when it will actually run.
const MechanismScene = lazy(() => import('./MechanismScene'))

export type HeroMechanismProps = {
  /** 'light' = ink steel on #fafafa/white; 'dark' = polished steel on ink or over a dark video. */
  tone?: Tone
  /** Where the mechanism sits inside its box when the box is wider than 4:3. */
  align?: 'center' | 'end' | 'start'
  /** 'auto' = 3D when the device can afford it, else poster. 'poster' forces the still. */
  mode?: 'auto' | '3d' | 'poster'
  /** Rendered BEHIND the transparent canvas, e.g. the lane-11 hero <video>. */
  underlay?: ReactNode
  /** CSS mix-blend-mode for the mechanism layer when layered over video (e.g. 'normal' | 'screen' | 'multiply'). */
  blend?: CSSProperties['mixBlendMode']
  /** Opacity of the mechanism layer (0-1). */
  opacity?: number
  /**
   * Scroll drive. Default: progress 0->1 while the hero box scrolls out of view.
   * Pass a ref (0..1) to drive it yourself, e.g. from a GSAP ScrollTrigger pinned scrub.
   */
  progressRef?: MutableRefObject<number>
  /** Pixels of scroll for progress 0->1 when self-driven. Default = hero box height. */
  scrollDistance?: number
  /** Assemble-from-depth intro on first frame (default true). */
  intro?: boolean
  /** Push per-frame ms into window.__heroFrames (QA only). */
  stats?: boolean
  className?: string
  style?: CSSProperties
  /** Override the poster image (must be the same 4:3 framing). */
  posterSrc?: string
  /** `sizes` for the poster srcset (default assumes the hero box is ~60vw desktop / 100vw mobile). */
  posterSizes?: string
  onModeChange?: (m: '3d' | 'poster') => void
}

const POS: Record<NonNullable<HeroMechanismProps['align']>, string> = { center: '50% 50%', end: '100% 50%', start: '0% 50%' }

export default function HeroMechanism({
  tone = 'light',
  align = 'center',
  mode = 'auto',
  underlay,
  blend = 'normal',
  opacity = 1,
  progressRef,
  scrollDistance,
  intro = true,
  stats,
  className,
  style,
  posterSrc,
  posterSizes = '(max-width: 820px) 100vw, 60vw',
  onModeChange,
}: HeroMechanismProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const { inView, active } = useActive(root)
  const [eligible, setEligible] = useState(false)
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [perfFail, setPerfFail] = useState(false)
  const ownProgress = useRef(0)
  const progress = progressRef ?? ownProgress
  const pointer = useRef({ x: 0, y: 0 })

  // eligibility is decided client-side only (SSR/first paint = poster, so no CLS and no mismatch)
  useEffect(() => {
    const ok = mode === 'poster' ? false : mode === '3d' ? hasWebGL() : canRun3D()
    setEligible(ok && !reduced)
  }, [mode, reduced])

  const run3D = eligible && !perfFail
  useEffect(() => onModeChange?.(run3D ? '3d' : 'poster'), [run3D, onModeChange])

  // Fetch the scene chunk on the first user signal (pointer/touch/scroll/key) or after 6 s idle, so the
  // 250 KB three chunk + shader compile never land inside the load window (TBT / Lighthouse). Poster = same frame.
  useEffect(() => {
    if (!run3D || load || !inView) return
    const go = () => setLoad(true)
    const evs = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const
    evs.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    const id = window.setTimeout(go, 6000)
    return () => {
      evs.forEach((e) => window.removeEventListener(e, go))
      window.clearTimeout(id)
    }
  }, [run3D, load, inView])

  // self-driven scroll progress (skipped when a progressRef is supplied)
  useEffect(() => {
    if (progressRef || !root || !run3D) return
    let raf = 0
    const read = () => {
      raf = 0
      const r = root.getBoundingClientRect()
      const span = scrollDistance ?? Math.max(1, r.height)
      ownProgress.current = Math.min(1, Math.max(0, -r.top / span))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [progressRef, root, run3D, scrollDistance])

  // cursor tilt: fine pointers only (touch gets the scroll choreography)
  useEffect(() => {
    if (!run3D || isCoarse()) return
    const on = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [run3D])

  const onReady = useCallback(() => setReady(true), [])
  const onPerfFail = useCallback(() => {
    setPerfFail(true)
    setReady(false)
  }, [])

  const showCanvas = run3D && load
  const poster = POSTERS[tone]
  // During the intro the parts fly in, so the poster leaves immediately; without intro it crossfades.
  const posterHidden = showCanvas && ready

  return (
    <div
      ref={setRoot}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', isolation: 'isolate', ...style }}
      aria-hidden="true"
      data-hero3d={showCanvas && ready ? '3d' : 'poster'}
    >
      {underlay ? <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>{underlay}</div> : null}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, mixBlendMode: blend, opacity }}>
        <img
          src={posterSrc ?? poster.src}
          srcSet={posterSrc ? undefined : poster.srcSet}
          sizes={posterSizes}
          width={1600}
          height={1200}
          alt=""
          decoding="async"
          draggable={false}
          // @ts-expect-error - fetchpriority is valid HTML, React 19 accepts it lowercase
          fetchpriority="high"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: POS[align],
            opacity: posterHidden ? 0 : 1,
            transition: intro ? 'opacity 120ms linear' : 'opacity 600ms ease',
            userSelect: 'none',
          }}
        />
        {showCanvas ? (
          <div style={{ position: 'absolute', inset: 0, opacity: ready ? 1 : 0, transition: intro ? 'none' : 'opacity 600ms ease' }}>
            <Suspense fallback={null}>
              <MechanismScene
                tone={tone}
                align={align}
                active={active}
                progress={progress}
                pointer={pointer}
                intro={intro}
                stats={stats}
                maxDpr={isCoarse() ? 1.75 : 2}
                onReady={onReady}
                onPerfFail={onPerfFail}
              />
            </Suspense>
          </div>
        ) : null}
      </div>
    </div>
  )
}
