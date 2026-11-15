import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gsap, LineReveal, MagneticButton, MaskReveal, prefersReduced, SectionTransition, useIsoLayoutEffect } from '../motion'
import { SITE } from '../data/site'

/** IntersectionObserver flag (true once / while in view). */
export function useInView<T extends HTMLElement>(opts: { once?: boolean; margin?: string; threshold?: number } = {}) {
  const ref = useRef<T>(null)
  const [inView, set] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          set(true)
          if (opts.once !== false) io.disconnect()
        } else if (opts.once === false) set(false)
      },
      { rootMargin: opts.margin ?? '0px 0px -12% 0px', threshold: opts.threshold ?? 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

/** Section index ("01 / Services") on a hairline that draws as the section enters. */
export function Idx({ n, label, className = '' }: { n: string; label: string; className?: string }) {
  const [ref, on] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`idx t-label ${className}`} data-in={on ? '1' : '0'}>
      <b className="tnum">{n}</b>
      <span>/</span>
      <span>{label}</span>
    </div>
  )
}

export const Arrow = () => <span className="arr" aria-hidden>→</span>

/** Headline that rises line by line (straight, masked). Explicit lines via \n. */
export function Head({ children, as = 'h2', className = '', immediate, delay }: { children: string; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string; immediate?: boolean; delay?: number }) {
  return (
    <LineReveal as={as} className={className} immediate={immediate} delay={delay}>
      {children}
    </LineReveal>
  )
}

export function Rise({ children, className = '', delay = 0, as = 'div', immediate }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'p' | 'ul' | 'ol' | 'li'; immediate?: boolean }) {
  // MaskReveal wraps children in an inner span, so layout utilities (flex/grid/gap...) must live on a wrapper inside it
  const isLayout = (c: string) => /^(flex|grid|gap|items-|justify-|grid-cols|flex-)/.test(c) && c !== 'flex-none'
  const cls = className.split(/\s+/)
  const layout = cls.filter(isLayout).join(' ')
  return (
    <MaskReveal as={as} className={cls.filter((c) => !isLayout(c)).join(' ')} delay={delay} variant="rise" immediate={immediate}>
      {layout ? <span className={layout}>{children}</span> : children}
    </MaskReveal>
  )
}

/** The page's single full-bleed red block: headline, body, ink button, logo bars sliding apart on scroll. */
export function CtaBlock({ headline, body, cta = 'Book a free consultation', n = '', to = '/contact' }: { headline: string; body: string; cta?: string; n?: string; to?: string }) {
  const art = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const el = art.current
    if (!el || prefersReduced()) return
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo(el.querySelector('.b1'), { x: 14 }, { x: -18, ease: 'none', scrollTrigger: st })
      gsap.fromTo(el.querySelector('.b2'), { x: -14 }, { x: 18, ease: 'none', scrollTrigger: st })
      gsap.from(el.querySelector('.cn'), { strokeDashoffset: 30, ease: 'none', scrollTrigger: st })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <div data-theme="dark" className="theme-ink-bridge">
    <SectionTransition variant="expand" className="theme-red sec" color="#E2000F">
      <div className="wrap grid12 items-end gap-y-10">
        <div className="col-span-4 sm:col-span-8 lg:col-span-7">
          {n && <Idx n={n} label="Next step" />}
          <Head className="t-l">{headline}</Head>
          <Rise as="p" className="t-lead mt-8 text-white" delay={0.1}>{body}</Rise>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <MagneticButton href={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${to}`} className="btn btn-ink-on-red" onClick={(e: React.MouseEvent) => spaNav(e, to)}>
              {cta} <Arrow />
            </MagneticButton>
            <a href={`mailto:${SITE.email}`} className="lnk text-white">{SITE.email}</a>
          </div>
        </div>
        <div ref={art} className="col-span-4 sm:col-span-8 lg:col-span-5" aria-hidden>
          <svg viewBox="0 0 100 100" className="ml-auto w-[min(62vw,420px)]">
            <path className="cn" d="M55 40 L45 60" stroke="rgba(255,255,255,.55)" strokeWidth="1" strokeDasharray="30" fill="none" />
            <path className="b1" d="M20 20 H60 L50 40 H10 Z" fill="#171717" />
            <path className="b2" d="M50 60 H90 L80 80 H40 Z" fill="#fff" />
          </svg>
        </div>
      </div>
    </SectionTransition>
    </div>
  )
}

/** Client-side navigation for raw <a> (MagneticButton renders <a>). */
export function spaNav(e: React.MouseEvent, to: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  window.dispatchEvent(new CustomEvent('zw:navigate', { detail: to }))
}

export function TextLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`lnk ${className}`}>
      {children} <Arrow />
    </Link>
  )
}
