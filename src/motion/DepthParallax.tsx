import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap } from './gsap'
import { isFinePointer, prefersReduced, useIsoLayoutEffect } from './env'

const Ctx = createContext<{ root: React.RefObject<HTMLDivElement | null>; range: number; pointer: number }>({ root: { current: null }, range: 160, pointer: 0 })

export type DepthParallaxProps = {
  children: ReactNode
  /** Max scroll travel in px for a depth-1 layer across the whole pass. Default 160 */
  range?: number
  /** Extra pointer drift in px for a depth-1 layer (fine pointers only). Default 0 (off) */
  pointer?: number
  className?: string
  style?: CSSProperties
}

/** Container for stacked depth layers. Make it position:relative and size it yourself (ratio/height). */
export function DepthParallax({ children, range = 160, pointer = 0, className = '', style }: DepthParallaxProps) {
  const root = useRef<HTMLDivElement>(null)
  return (
    <Ctx.Provider value={{ root, range, pointer }}>
      <div ref={root} className={`mk-depth ${className}`} style={style} data-mk="depth">
        {children}
      </div>
    </Ctx.Provider>
  )
}

export type DepthLayerProps = {
  children: ReactNode
  /** 0 = pinned to the page, 1 = moves `range` px, negative = moves against scroll (foreground). */
  depth: number
  /** Oversize the layer (inset -12%) so moving edges never show. Default true when depth != 0; set false for text layers. */
  bleed?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * One layer inside <DepthParallax>. Translates on Y only (scrubbed) + optional pointer drift.
 * Layers with |depth| > 0 should be oversized by CSS (inset: -10%) so edges never show.
 */
export function DepthLayer({ children, depth, bleed, className = '', style }: DepthLayerProps) {
  const { root, range, pointer } = useContext(Ctx)
  const el = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const e = el.current
    const r = root.current
    if (!e || !r || prefersReduced()) return
    const travel = range * depth
    const tw = gsap.fromTo(e, { y: -travel / 2 }, { y: travel / 2, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: true } })
    let off = () => {}
    if (pointer && isFinePointer()) {
      const qx = gsap.quickTo(e, 'x', { duration: 0.9, ease: 'power3.out' })
      const move = (ev: PointerEvent) => qx(((ev.clientX / window.innerWidth) - 0.5) * pointer * depth * 2)
      window.addEventListener('pointermove', move, { passive: true })
      off = () => window.removeEventListener('pointermove', move)
    }
    return () => {
      off()
      tw.scrollTrigger?.kill()
      tw.revert()
    }
  }, [depth, range, pointer])
  return (
    <div ref={el} className={`mk-depth-layer ${(bleed ?? depth !== 0) ? 'mk-depth-layer--bleed' : ''} ${className}`} style={style} data-depth={depth}>
      {children}
    </div>
  )
}
