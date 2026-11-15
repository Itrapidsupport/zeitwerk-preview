import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type MaskRevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** 'rise' = slides up out of an overflow mask (labels, numbers, one-liners, buttons).
   *  'fade' = opacity + 24px rise, no mask (paragraphs, blocks). Default 'rise' */
  variant?: 'rise' | 'fade'
  delay?: number
  duration?: number
  immediate?: boolean
  start?: string
}

/** Straight reveal for any block. Outer element keeps its size from the first paint (CLS 0). */
export function MaskReveal({ children, as: Tag = 'div', className = '', variant = 'rise', delay = 0, duration = 1, immediate = false, start = 'top 90%' }: MaskRevealProps) {
  const outer = useRef<HTMLElement>(null)
  const inner = useRef<HTMLSpanElement>(null)
  useIsoLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    o.removeAttribute('data-mk-pending')
    if (prefersReduced()) return
    const from = variant === 'rise' ? { yPercent: 105 } : { y: 24, autoAlpha: 0 }
    const tw = gsap.from(i, { ...from, duration, delay, ease: 'expo.out', scrollTrigger: immediate ? undefined : { trigger: o, start, once: true } })
    return () => {
      tw.scrollTrigger?.kill()
      tw.revert()
    }
  }, [variant, delay, duration, immediate, start])
  return (
    <Tag ref={outer} className={`${variant === 'rise' ? 'mk-mask' : ''} ${className}`} data-mk="mask-reveal" data-mk-pending="">
      <span ref={inner} className="mk-mask-inner">
        {children}
      </span>
    </Tag>
  )
}
