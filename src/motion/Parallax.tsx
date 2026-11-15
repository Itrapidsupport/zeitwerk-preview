import { useRef, type ReactNode } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type ParallaxProps = {
  children: ReactNode
  /** Travel as % of the frame height across the full viewport pass. Default 14. Negative = opposite. */
  amount?: number
  /** Frame ratio, e.g. '16 / 9'. Reserves space (CLS 0). Omit to size the frame with className. */
  ratio?: string
  className?: string
  /** Disable under this viewport width (px). Default 0 (always on). */
  minWidth?: number
}

/**
 * Overflow-hidden frame; the inner media is oversized (scale so it never shows an edge) and
 * scrubbed on Y with scroll. Transform-only (GPU), no layout. Static when reduced.
 */
export function Parallax({ children, amount = 14, ratio, className = '', minWidth = 0 }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const f = frame.current
    const i = inner.current
    if (!f || !i || prefersReduced()) return
    const mm = gsap.matchMedia()
    mm.add(`(min-width: ${minWidth}px)`, () => {
      const s = 1 + Math.abs(amount) / 100 + 0.02
      gsap.fromTo(i, { yPercent: -amount / 2, scale: s }, { yPercent: amount / 2, scale: s, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    return () => mm.revert()
  }, [amount, minWidth])
  return (
    <div ref={frame} className={`mk-parallax ${className}`} style={ratio ? { aspectRatio: ratio } : undefined} data-mk="parallax">
      <div ref={inner} className="mk-parallax-inner">
        {children}
      </div>
    </div>
  )
}
