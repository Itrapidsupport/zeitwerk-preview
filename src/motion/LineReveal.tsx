import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, ScrollTrigger, SplitText } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type LineRevealProps = {
  children: ReactNode
  /** Element to render. Default 'h2' */
  as?: ElementType
  className?: string
  /** Split granularity. 'lines' (default) or 'words'. Always masked, always straight (translateY only). */
  by?: 'lines' | 'words'
  /** Seconds before the first line starts. Default 0 */
  delay?: number
  /** Seconds between lines/words. Default 0.08 */
  stagger?: number
  /** Seconds per line. Default 1.05 */
  duration?: number
  /** Play on mount instead of on scroll (hero headlines). Default false */
  immediate?: boolean
  /** ScrollTrigger start. Default 'top 88%' */
  start?: string
  id?: string
}

/**
 * Masked line reveal: GSAP SplitText (mask + autoSplit), each line rises 100% -> 0 inside its own
 * overflow mask. Never rotates or skews. Re-splits on resize/font load. Screen readers get the
 * original text (SplitText aria:auto). JS off / reduced motion: plain static text.
 */
export function LineReveal({ children, as: Tag = 'h2', className = '', by = 'lines', delay = 0, stagger = 0.08, duration = 1.05, immediate = false, start = 'top 88%', id }: LineRevealProps) {
  const ref = useRef<HTMLElement>(null)
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReduced()) {
      el?.removeAttribute('data-mk-pending')
      return
    }
    let split: SplitText | null = null
    const run = () => {
      split = SplitText.create(el, {
        type: by === 'words' ? 'words,lines' : 'lines',
        mask: by,
        linesClass: 'mk-line',
        autoSplit: true,
        onSplit(self) {
          const targets = by === 'words' ? self.words : self.lines
          el.removeAttribute('data-mk-pending')
          return gsap.from(targets, {
            yPercent: 105,
            duration,
            delay,
            stagger,
            ease: 'expo.out',
            scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
          })
        },
      })
    }
    // wait for the webfont so line breaks are final; keep hidden meanwhile via data-mk-pending
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => el.isConnected && run())
    else run()
    return () => {
      split?.revert()
      ScrollTrigger.refresh()
    }
  }, [by, delay, stagger, duration, immediate, start])
  return (
    <Tag ref={ref} id={id} className={`mk-text ${className}`} data-mk="line-reveal" data-mk-pending="">
      {children}
    </Tag>
  )
}
