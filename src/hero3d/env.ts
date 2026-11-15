import { useEffect, useState } from 'react'

const mq = (q: string) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null)

export function prefersReduced(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(location.search).has('reduce')) return true
  return !!mq('(prefers-reduced-motion: reduce)')?.matches
}

export function useReducedMotion() {
  const [r, setR] = useState(prefersReduced)
  useEffect(() => {
    const m = mq('(prefers-reduced-motion: reduce)')
    if (!m) return
    const on = () => setR(prefersReduced())
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return r
}

export function isCoarse(): boolean {
  return !!mq('(pointer: coarse)')?.matches
}

let webglCache: boolean | null = null
export function hasWebGL() {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webglCache = false
  }
  return webglCache
}

/** Decide whether to spend on WebGL (reduced motion, data saver, weak device, no WebGL => poster). */
export function canRun3D(): boolean {
  if (typeof window === 'undefined') return false
  if (prefersReduced()) return false
  if (new URLSearchParams(location.search).has('poster')) return false
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  if (nav.connection?.effectiveType && /(^|-)2g/.test(nav.connection.effectiveType)) return false
  if ((nav.hardwareConcurrency || 4) < 4) return false
  if (nav.deviceMemory && nav.deviceMemory < 3) return false
  return hasWebGL()
}

/** Pause the WebGL loop when the container is off-screen or the tab is hidden. */
export function useActive(el: HTMLElement | null) {
  const [inView, setInView] = useState(false)
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState === 'visible')
  useEffect(() => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    const vis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', vis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', vis)
    }
  }, [el])
  return { inView, active: inView && visible }
}
