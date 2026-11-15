import { useRef, type ReactNode } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type DrawLineProps = {
  /** An inline <svg>. Stroked shapes (path, line, polyline, polygon, circle, rect, ellipse) are drawn. */
  children: ReactNode
  /** 'scrub' ties drawing to scroll; 'once' plays when scrolled into view. Default 'scrub' */
  mode?: 'scrub' | 'once'
  /** Only draw shapes matching this selector (e.g. '[data-draw]'). Default: every stroked shape */
  selector?: string
  /** Seconds between shapes ('once') or stagger share ('scrub'). Default 0.08 */
  stagger?: number
  duration?: number
  start?: string
  end?: string
  className?: string
}

/**
 * SVG line drawing via stroke-dasharray/offset (no plugin). JS off / reduced motion: the drawing
 * is shown complete. Shapes need a stroke and vector-effect is respected.
 */
export function DrawLine({ children, mode = 'scrub', selector, stagger = 0.08, duration = 1.6, start = 'top 85%', end = 'bottom 45%', className = '' }: DrawLineProps) {
  const root = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const r = root.current
    if (!r || prefersReduced()) return
    const shapes = Array.from(r.querySelectorAll<SVGGeometryElement>(selector || 'path,line,polyline,polygon,circle,rect,ellipse')).filter(
      (s) => typeof s.getTotalLength === 'function' && getComputedStyle(s).stroke !== 'none',
    )
    if (!shapes.length) return
    const ctx = gsap.context(() => {
      shapes.forEach((s) => {
        const len = Math.ceil(s.getTotalLength()) + 1
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len })
      })
      gsap.to(shapes, {
        strokeDashoffset: 0,
        ease: mode === 'scrub' ? 'none' : 'power2.inOut',
        duration,
        stagger,
        scrollTrigger: mode === 'scrub' ? { trigger: r, start, end, scrub: true } : { trigger: r, start, once: true },
      })
    }, r)
    return () => ctx.revert()
  }, [mode, selector, stagger, duration, start, end])
  return (
    <div ref={root} className={`mk-draw ${className}`} data-mk="draw">
      {children}
    </div>
  )
}
