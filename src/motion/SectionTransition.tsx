import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type SectionTransitionProps = {
  children: ReactNode
  /**
   * 'expand'  - section enters as an inset block and grows to full bleed (clip-path, scrubbed).
   * 'curtain' - a solid colour block covering the section lifts away upward (scaleY, scrubbed).
   * 'recede'  - as the section LEAVES, its content sinks + dims (y, opacity) so the next one takes over.
   * Default 'expand'
   */
  variant?: 'expand' | 'curtain' | 'recede'
  /** Curtain colour. Default brand red */
  color?: string
  as?: ElementType
  className?: string
  id?: string
}

/** Section-to-section transitions. Scrubbed, transform/clip-path only, straight. Static when reduced. */
export function SectionTransition({ children, variant = 'expand', color = '#E2000F', as: Tag = 'section', className = '', id }: SectionTransitionProps) {
  const root = useRef<HTMLElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const curtain = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const r = root.current
    const i = inner.current
    if (!r || !i || prefersReduced()) return
    const ctx = gsap.context(() => {
      if (variant === 'expand')
        gsap.fromTo(r, { clipPath: 'inset(6% 5% 0% 5%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'top 35%', scrub: true } })
      if (variant === 'curtain' && curtain.current)
        gsap.fromTo(curtain.current, { scaleY: 1 }, { scaleY: 0, ease: 'none', scrollTrigger: { trigger: r, start: 'top 95%', end: 'top 30%', scrub: true } })
      if (variant === 'recede')
        gsap.to(i, { y: 80, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: r, start: 'bottom 85%', end: 'bottom 15%', scrub: true } })
    }, r)
    return () => ctx.revert()
  }, [variant])
  return (
    <Tag ref={root} id={id} className={`mk-section mk-section--${variant} ${className}`} data-mk="section" data-variant={variant}>
      <div ref={inner} className="mk-section-inner">
        {children}
      </div>
      {variant === 'curtain' && <div ref={curtain} className="mk-section-curtain mk-js-only" style={{ background: color }} aria-hidden />}
    </Tag>
  )
}
