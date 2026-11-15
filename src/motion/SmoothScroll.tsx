import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { MotionConfig } from 'framer-motion'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReduced } from './env'

const Ctx = createContext<Lenis | null>(null)
/** Current Lenis instance (null when reduced-motion, touch-native, or SSR). */
export const useLenis = () => useContext(Ctx)

declare global {
  interface Window {
    __mkReady?: boolean
    __lenis?: Lenis
  }
}

export type SmoothScrollProps = {
  children: ReactNode
  /** Lenis lerp duration in seconds. Default 1.1 */
  duration?: number
  /** Smooth wheel only; touch keeps native momentum (recommended). Default false */
  smoothTouch?: boolean
  /** Pixel offset for anchor jumps (e.g. sticky header height, negative). Default -72 */
  anchorOffset?: number
}

/**
 * App-root provider: Lenis smooth scroll driven by the GSAP ticker, synced with ScrollTrigger,
 * plus framer-motion MotionConfig(reducedMotion="user"). Marks <html> with .mk-ready when mounted
 * and keeps .mk-js only when motion is allowed. Reduced motion => no Lenis, native scroll.
 */
export function SmoothScroll({ children, duration = 1.1, smoothTouch = false, anchorOffset = -72 }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  useEffect(() => {
    const d = document.documentElement
    window.__mkReady = true
    d.classList.add('mk-ready')
    if (prefersReduced()) {
      d.classList.remove('mk-js')
      d.classList.add('mk-reduced')
      return
    }
    d.classList.add('mk-js')
    const l = new Lenis({
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      syncTouch: smoothTouch,
      anchors: { offset: anchorOffset },
    })
    window.__lenis = l
    l.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    // fonts change line breaks -> re-measure triggers once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      gsap.ticker.remove(tick)
      l.destroy()
      window.__lenis = undefined
      setLenis(null)
    }
  }, [duration, smoothTouch, anchorOffset])
  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={lenis}>{children}</Ctx.Provider>
    </MotionConfig>
  )
}

/** Scroll to top/element through Lenis when present, else native. */
export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  const l = typeof window !== 'undefined' ? window.__lenis : undefined
  if (l) return l.scrollTo(target, { immediate, force: true })
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
  }
}
