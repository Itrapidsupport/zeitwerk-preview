import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReduced, useIsoLayoutEffect } from './env'

export type VideoSources = {
  /** 1080p H.264 MP4 (required) */
  mp4: string
  /** 1080p WebM (VP9/AV1) */
  webm?: string
  /** 720p mobile MP4 (<= 3 MB) */
  mp4Mobile?: string
  webmMobile?: string
}

export type InlineVideoProps = {
  sources: VideoSources
  /** Poster frame (shown first, and the ONLY thing shown for reduced-motion / Save-Data / JS off). */
  poster: string
  /** Frame ratio, e.g. '16 / 9'. Reserves space (CLS 0). Use 'auto' only when parent sizes it (cover). */
  ratio?: string
  /** Fill the parent absolutely (hero backgrounds). Default false */
  cover?: boolean
  /** Hero / above the fold: load immediately. Default false (lazy, starts ~300px before view). */
  priority?: boolean
  /** Text alternative. Omit for decorative clips (aria-hidden). */
  label?: string
  /** Mobile breakpoint for the *Mobile sources. Default 767 */
  mobileMax?: number
  className?: string
}

type Conn = { saveData?: boolean; effectiveType?: string }
const lowData = () => {
  const c = (navigator as Navigator & { connection?: Conn }).connection
  return !!c?.saveData || /(^|-)2g$/.test(c?.effectiveType || '')
}

/**
 * Autoplay muted loop playsinline clip for AI-generated footage (lane 11). Lazy-attaches sources
 * near the viewport, picks 720p on phones, plays only while >= 15% visible, pauses off-screen and
 * on tab hide. Reduced motion / Save-Data / 2G / SSR / JS off: poster <img> only, no download.
 */
export function InlineVideo({ sources, poster, ratio = '16 / 9', cover = false, priority = false, label, mobileMax = 767, className = '' }: InlineVideoProps) {
  const box = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<'poster' | 'video'>('poster')
  const [near, setNear] = useState(priority)
  const [mobile, setMobile] = useState(false)
  const [ready, setReady] = useState(false)

  useIsoLayoutEffect(() => {
    if (prefersReduced() || lowData()) return
    setMobile(window.matchMedia(`(max-width: ${mobileMax}px)`).matches)
    setMode('video')
  }, [mobileMax])

  // lazy attach
  useEffect(() => {
    if (mode !== 'video' || near || !box.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px 0px' })
    io.observe(box.current)
    return () => io.disconnect()
  }, [mode, near])

  // play/pause by visibility
  useEffect(() => {
    const v = vid.current
    if (mode !== 'video' || !near || !v || !box.current) return
    let visible = false
    const sync = () => (visible && !document.hidden ? v.play().catch(() => {}) : v.pause())
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() }, { threshold: 0.15 })
    io.observe(box.current)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [mode, near])

  const webm = mobile ? sources.webmMobile || sources.webm : sources.webm
  const mp4 = mobile ? sources.mp4Mobile || sources.mp4 : sources.mp4
  return (
    <div ref={box} className={`mk-video ${cover ? 'mk-video--cover' : ''} ${className}`} style={cover ? undefined : { aspectRatio: ratio }} data-mk="video" data-mode={mode}
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <img className="mk-video-poster" src={poster} alt="" decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />
      {mode === 'video' && near && (
        <video ref={vid} className={`mk-video-el ${ready ? 'is-ready' : ''}`} muted loop playsInline autoPlay preload={priority ? 'auto' : 'metadata'} poster={poster}
          disablePictureInPicture disableRemotePlayback tabIndex={-1} onPlaying={() => setReady(true)}>
          {webm && <source src={webm} type="video/webm" />}
          <source src={mp4} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

export type ScrollVideoProps = Omit<InlineVideoProps, 'cover' | 'priority'> & {
  /** Scroll length in svh while the stage is pinned. Default 200 */
  length?: number
  /** Content laid over the video (headline etc). */
  children?: React.ReactNode
}

/**
 * Pinned stage whose video currentTime is scrubbed by scroll (desktop fine pointer only).
 * ENCODE FOR SEEKING: every frame a keyframe (ffmpeg -g 1 -keyint_min 1), short (<= 6 s), 720-1080p,
 * no audio - otherwise seeks stutter. Touch / reduced / Save-Data: falls back to <InlineVideo>
 * (autoplay loop or poster) in a normal one-screen section.
 */
export function ScrollVideo({ length = 200, children, sources, poster, ratio = '16 / 9', label, className = '' }: ScrollVideoProps) {
  const root = useRef<HTMLElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [on, setOn] = useState(false)
  useIsoLayoutEffect(() => setOn(!prefersReduced() && !lowData() && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches), [])
  useIsoLayoutEffect(() => {
    const r = root.current
    const v = vid.current
    if (!on || !r || !v) return
    let target = 0
    let raf = 0
    const tick = () => {
      if (v.duration && Math.abs(v.currentTime - target) > 0.01) v.currentTime += (target - v.currentTime) * 0.25
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const top = parseFloat(getComputedStyle(r).getPropertyValue('--mk-header-h')) || 72
    const st = ScrollTrigger.create({ trigger: r, start: `top top+=${top}`, end: 'bottom bottom', onUpdate: (s) => (target = s.progress * (v.duration || 0)) })
    return () => {
      cancelAnimationFrame(raf)
      st.kill()
      gsap.killTweensOf(v)
    }
  }, [on])
  if (!on)
    return (
      <section className={`mk-scrollvideo mk-scrollvideo--fallback ${className}`} data-mk="scroll-video" data-mode="inline">
        <div className="mk-scrollvideo-stage" style={{ position: 'relative' }}>
          <InlineVideo sources={sources} poster={poster} ratio={ratio} label={label} />
          {children && <div className="mk-scrollvideo-overlay">{children}</div>}
        </div>
      </section>
    )
  return (
    <section ref={root} className={`mk-scrollvideo ${className}`} data-mk="scroll-video" data-mode="scrub" style={{ height: `calc(${length}svh + 100svh - var(--mk-header-h, 72px))` }}>
      <div className="mk-scrollvideo-stage mk-scrollvideo-stage--pinned">
        <video ref={vid} className="mk-scrollvideo-el" muted playsInline preload="auto" poster={poster} aria-label={label} aria-hidden={label ? undefined : true}>
          {sources.webm && <source src={sources.webm} type="video/webm" />}
          <source src={sources.mp4} type="video/mp4" />
        </video>
        {children && <div className="mk-scrollvideo-overlay">{children}</div>}
      </div>
    </section>
  )
}
