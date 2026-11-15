import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type MarqueeProps = {
  children: ReactNode
  /** Pixels per second. Default 60 */
  speed?: number
  /** Travel direction. Default 'left' */
  direction?: 'left' | 'right'
  /** Pause while hovered (desktop). Default true */
  pauseOnHover?: boolean
  /** CSS gap between repeats. Default '3rem' */
  gap?: string
  /** Accessible name for the strip. */
  label?: string
  className?: string
}

/**
 * Seamless CSS-transform marquee: measures one copy, clones enough aria-hidden copies to cover
 * the viewport, animates translateX(-copyWidth) linearly. Paused off-screen (IntersectionObserver).
 * SSR / JS off / reduced motion: one static copy that wraps (all content visible, nothing moves).
 */
export function Marquee({ children, speed = 60, direction = 'left', pauseOnHover = true, gap = '3rem', label, className = '' }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<{ copies: number; w: number } | null>(null)
  const [visible, setVisible] = useState(true)

  useIsoLayoutEffect(() => {
    const r = root.current
    const f = first.current
    if (!r || !f || prefersReduced()) return
    const measure = () => {
      const gapPx = parseFloat(getComputedStyle(f.parentElement!).columnGap) || 0
      const w = f.getBoundingClientRect().width + gapPx
      if (w < 1) return
      setState({ copies: Math.max(1, Math.ceil(r.clientWidth / w)) + 1, w })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(r)
    ro.observe(f)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(r)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  const running = !!state
  const style = running
    ? ({ '--mk-mq-w': `${state.w}px`, '--mk-mq-dur': `${state.w / speed}s`, gap, animationPlayState: visible ? undefined : 'paused' } as CSSProperties)
    : { gap }
  return (
    <div ref={root} className={`mk-marquee ${running ? 'is-running' : 'is-static'} ${pauseOnHover ? 'mk-marquee--hover' : ''} ${className}`} data-mk="marquee" role={label ? 'marquee' : undefined} aria-label={label}>
      <div className={`mk-marquee-track ${direction === 'right' ? 'is-reverse' : ''}`} style={style}>
        <div ref={first} className="mk-marquee-copy" style={{ gap }}>
          {children}
        </div>
        {running &&
          Array.from({ length: state.copies }, (_, i) => (
            <div key={i} className="mk-marquee-copy" style={{ gap }} aria-hidden inert>
              {children}
            </div>
          ))}
      </div>
    </div>
  )
}
