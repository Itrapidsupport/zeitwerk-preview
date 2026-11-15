import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type ScrubSceneProps = {
  children: ReactNode
  /** Scroll length of the scene in svh (on top of one screen). Default 200 */
  length?: number
  /**
   * Build the scrubbed timeline. `q` is a selector scoped to the scene. Use only transforms,
   * opacity, clip-path, stroke-dashoffset. Total duration is normalised to the scroll length.
   *   timeline={(tl, q) => tl.from(q('.gear'), { yPercent: 40 }).to(q('.title'), { autoAlpha: 0 })}
   */
  timeline?: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void
  /** Progress callback 0..1 (also exposed as CSS var --mk-p on the stage). */
  onProgress?: (p: number) => void
  /** Scrub smoothing seconds (true = locked). Default 0.8 */
  scrub?: number | true
  className?: string
  stageClassName?: string
  /** Accessible name. */
  label?: string
}

/**
 * Pinned, scroll-scrubbed scene: CSS-sticky full-height stage (under --mk-header-h) inside a
 * tall section; one GSAP timeline is scrubbed by scroll. Works on iOS (sticky, no pin-spacer
 * jumps). Reduced motion / SSR / JS off: section collapses to one screen and shows the stage in
 * its natural (final) markup state - author the markup as the END state and animate FROM.
 */
export function ScrubScene({ children, length = 200, timeline, onProgress, scrub = 0.8, className = '', stageClassName = '', label }: ScrubSceneProps) {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useIsoLayoutEffect(() => setOn(!prefersReduced()), [])
  useIsoLayoutEffect(() => {
    const r = root.current
    const s = stage.current
    if (!on || !r || !s) return
    const ctx = gsap.context(() => {
      const top = parseFloat(getComputedStyle(r).getPropertyValue('--mk-header-h')) || 72
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: r,
          start: `top top+=${top}`,
          end: 'bottom bottom',
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            s.style.setProperty('--mk-p', self.progress.toFixed(4))
            onProgress?.(self.progress)
          },
        },
      })
      timeline?.(tl, gsap.utils.selector(s))
      if (tl.duration() === 0) tl.to({}, { duration: 1 })
    }, r)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [on])
  return (
    <section ref={root} className={`mk-scene ${className}`} aria-label={label} data-mk="scene" data-mode={on ? 'scrub' : 'static'}
      style={on ? ({ height: `calc(${length}svh + 100svh - var(--mk-header-h, 72px))` } as CSSProperties) : undefined}>
      <div ref={stage} className={`mk-scene-stage ${stageClassName}`} style={{ '--mk-p': on ? 0 : 1 } as CSSProperties}>
        {children}
      </div>
    </section>
  )
}
