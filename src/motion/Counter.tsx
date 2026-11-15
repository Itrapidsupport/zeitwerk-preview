import { useRef } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type CounterProps = {
  /** Final value. MUST be a real, sourced number (no invented stats). */
  value: number
  /** Where the number comes from (page/URL/document). Required on purpose; rendered as data-source. */
  source: string
  /** Start value. Default 0 */
  from?: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  locale?: string
  className?: string
}

/**
 * Counts up once when scrolled into view. SSR / JS off / reduced motion show the final value.
 * A hidden ghost of the final value reserves width (tabular numerals) so nothing shifts.
 */
export function Counter({ value, source, from = 0, decimals = 0, prefix = '', suffix = '', duration = 1.6, locale = 'en-CA', className = '' }: CounterProps) {
  const live = useRef<HTMLSpanElement>(null)
  const fmt = (n: number) => prefix + n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
  const final = fmt(value)
  useIsoLayoutEffect(() => {
    const el = live.current
    if (!el || prefersReduced()) return
    const o = { v: from }
    el.textContent = fmt(from)
    const tw = gsap.to(o, {
      v: value,
      duration,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt(o.v)),
    })
    return () => {
      tw.scrollTrigger?.kill()
      tw.kill()
      el.textContent = final
    }
  }, [value, from, decimals, prefix, suffix, duration, locale])
  return (
    <span className={`mk-counter ${className}`} data-mk="counter" data-source={source}>
      <span className="mk-sr-only">{final}</span>
      <span className="mk-counter-ghost" aria-hidden>{final}</span>
      <span ref={live} className="mk-counter-live" aria-hidden>{final}</span>
    </span>
  )
}
