import { useEffect, useLayoutEffect, useState } from 'react'

/** SSR-safe layout effect. */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const mq = (q: string) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null)

/** True when the OS asks for reduced motion, or the URL carries ?reduce (QA switch). */
export function prefersReduced(): boolean {
  if (typeof window === 'undefined') return false
  if (/[?&]reduce\b/.test(window.location.search)) return true
  return !!mq('(prefers-reduced-motion: reduce)')?.matches
}

export function isFinePointer(): boolean {
  return !!mq('(hover: hover) and (pointer: fine)')?.matches
}

/** Media-query hook. SSR + first client render return `ssrDefault` so hydration matches. */
export function useMedia(query: string, ssrDefault = false): boolean {
  const [v, setV] = useState(ssrDefault)
  useIsoLayoutEffect(() => {
    const m = mq(query)
    if (!m) return
    const on = () => setV(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return v
}

/** Reduced-motion hook (OS setting or ?reduce). SSR default = false. */
export function useReducedMotion(): boolean {
  const os = useMedia('(prefers-reduced-motion: reduce)')
  const [q, setQ] = useState(false)
  useIsoLayoutEffect(() => setQ(/[?&]reduce\b/.test(window.location.search)), [])
  return os || q
}

export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')

/** Brand easing (expo-out), shared by GSAP + framer-motion. */
export const EASE = [0.16, 1, 0.3, 1] as const
export const GSAP_EASE = 'expo.out'
