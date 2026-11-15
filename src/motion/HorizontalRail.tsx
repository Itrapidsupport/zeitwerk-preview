import { useRef, useState, type ReactNode } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect, useMedia } from './env'

export type HorizontalRailProps = {
  /** Rail items (project cards etc). Each is wrapped in an <li> sized by `itemWidth`. */
  items: ReactNode[]
  /** Accessible name, e.g. 'Projects'. */
  label: string
  /** CSS width of each item. Default 'min(78vw, 560px)' */
  itemWidth?: string
  /** CSS gap. Default 'clamp(16px, 2.5vw, 40px)' */
  gap?: string
  /** Min viewport width for the pinned (scroll-driven) mode. Default 1024 */
  minWidth?: number
  className?: string
}

/**
 * Desktop + fine pointer: CSS-sticky stage; vertical scroll scrubs the track sideways (GSAP).
 * Touch, narrow screens, reduced motion, SSR, JS off: native horizontal swipe with scroll-snap
 * (keyboard-scrollable region). A hairline shows progress in both modes.
 */
export function HorizontalRail({ items, label, itemWidth = 'min(78vw, 560px)', gap = 'clamp(16px, 2.5vw, 40px)', minWidth = 1024, className = '' }: HorizontalRailProps) {
  const fine = useMedia(`(hover: hover) and (pointer: fine) and (min-width: ${minWidth}px)`)
  const [reduced, setReduced] = useState(false)
  useIsoLayoutEffect(() => setReduced(prefersReduced()), [])
  const pinned = fine && !reduced
  const outer = useRef<HTMLElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [dist, setDist] = useState(0)

  // measure overflow distance (pinned mode)
  useIsoLayoutEffect(() => {
    if (!pinned || !track.current || !viewport.current) return
    const t = track.current
    const v = viewport.current
    const measure = () => setDist(Math.max(0, t.scrollWidth - v.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(t)
    ro.observe(v)
    return () => ro.disconnect()
  }, [pinned, items.length])

  // scrub
  useIsoLayoutEffect(() => {
    if (!pinned || !outer.current || !track.current || dist === 0) return
    const o = outer.current
    const ctx = gsap.context(() => {
      const top = parseFloat(getComputedStyle(o).getPropertyValue('--mk-header-h')) || 72
      gsap.to(track.current, {
        x: -dist,
        ease: 'none',
        scrollTrigger: {
          trigger: o,
          start: `top top+=${top}`,
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
        },
      })
    }, o)
    return () => ctx.revert()
  }, [pinned, dist])

  // native mode progress
  const onScroll = () => {
    const v = viewport.current
    if (!v || pinned || !bar.current) return
    const max = v.scrollWidth - v.clientWidth
    bar.current.style.transform = `scaleX(${max > 0 ? v.scrollLeft / max : 1})`
  }

  return (
    <section ref={outer} className={`mk-rail ${pinned ? 'mk-rail--pinned' : 'mk-rail--native'} ${className}`} aria-label={label} data-mk="rail" data-mode={pinned ? 'pinned' : 'native'}
      style={pinned ? { height: `calc(${dist}px + 100svh - var(--mk-header-h, 72px))` } : undefined}>
      <div className="mk-rail-stage">
        <div ref={viewport} className="mk-rail-viewport" onScroll={onScroll} tabIndex={pinned ? undefined : 0} role={pinned ? undefined : 'region'} aria-label={pinned ? undefined : `${label} (swipe sideways)`}>
          <ul ref={track} className="mk-rail-track" style={{ gap }}>
            {items.map((it, i) => (
              <li key={i} className="mk-rail-item" style={{ width: itemWidth }}>
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div className="mk-rail-progress" aria-hidden>
          <span ref={bar} />
        </div>
      </div>
    </section>
  )
}
