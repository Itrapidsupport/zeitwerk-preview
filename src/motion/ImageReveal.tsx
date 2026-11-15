import { useRef, type ReactNode } from 'react'
import { gsap } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type ImageRevealProps = {
  /** Image URL. Omit and pass children for SVG/canvas/video visuals. */
  src?: string
  alt?: string
  /** Intrinsic ratio, e.g. '4 / 5' or '16 / 9'. Reserves space -> CLS 0. Required. */
  ratio: string
  /** Wipe direction: edge the image grows FROM. Default 'up' (bottom edge -> top) */
  from?: 'up' | 'down' | 'left' | 'right'
  /** Inner settle scale (1.18 -> 1). Default 1.18 */
  scale?: number
  duration?: number
  delay?: number
  className?: string
  /** Solid block colour shown behind the wipe (brand red/ink). Default 'transparent' */
  curtain?: string
  loading?: 'lazy' | 'eager'
  sizes?: string
  srcSet?: string
  children?: ReactNode
}

const START: Record<NonNullable<ImageRevealProps['from']>, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
}

/** Clip-path wipe + inner scale settle, triggered once on scroll. Static image with JS off / reduced. */
export function ImageReveal({ src, alt = '', ratio, from = 'up', scale = 1.18, duration = 1.4, delay = 0, className = '', curtain = 'transparent', loading = 'lazy', sizes, srcSet, children }: ImageRevealProps) {
  const box = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const b = box.current
    const m = media.current
    if (!b || !m) return
    b.removeAttribute('data-mk-pending')
    if (prefersReduced()) return
    const tl = gsap.timeline({ delay, scrollTrigger: { trigger: b, start: 'top 85%', once: true } })
    tl.fromTo(b, { clipPath: START[from] }, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'expo.inOut' })
    tl.from(m, { scale, duration: duration + 0.4, ease: 'expo.out' }, 0)
    return () => {
      tl.scrollTrigger?.kill()
      tl.revert()
    }
  }, [from, scale, duration, delay])
  return (
    <div className={`mk-image ${className}`} style={{ aspectRatio: ratio, background: curtain }} data-mk="image-reveal">
      <div ref={box} className="mk-image-clip" data-mk-pending="">
        <div ref={media} className="mk-image-media">
          {src ? <img src={src} alt={alt} loading={loading} decoding="async" sizes={sizes} srcSet={srcSet} /> : children}
        </div>
      </div>
    </div>
  )
}
