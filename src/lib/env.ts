import { useEffect, useState } from 'react'

export const BASE = import.meta.env.BASE_URL // '/zeitwerk-preview/'
/** Prefix a public/ asset path with the deploy base. asset('img/x.webp') */
export const asset = (p: string) => BASE + p.replace(/^\//, '')

const mq = (q: string) => (typeof window !== 'undefined' ? window.matchMedia(q) : null)

/** ?reduce in the URL forces reduced motion (handy for QA screenshots). */
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

export function useMedia(q: string) {
  const [v, setV] = useState(() => !!mq(q)?.matches)
  useEffect(() => {
    const m = mq(q)
    if (!m) return
    const on = () => setV(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [q])
  return v
}
