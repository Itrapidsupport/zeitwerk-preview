import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Counter, DrawLine, gsap, HorizontalRail, ImageReveal, LineReveal, MagneticButton, PinnedProcess, prefersReduced, SectionTransition, useIsoLayoutEffect } from '../motion'
import { bullets, kv, sec, steps } from '../content/copy'
import { CASES, MORE, PILLARS, SERVICES, SITE } from '../data/site'
import videos from '../data/videos.json'
import MediaSlot from '../components/MediaSlot'
import ProjectRail from '../components/ProjectRail'
import Video from '../components/Video'
import { Gta, Schematic } from '../components/Schematic'
import { Dial, parseFigure } from '../components/Dial'
import { Arrow, CtaBlock, Head, Idx, Rise, spaNav, TextLink } from '../components/ui'

const HERO_VIDEO = 'hero-escapement' // lane 11 clip (scripts/import-videos.mjs)

function Hero() {
  const h = kv(sec('home', 'hero').lines)
  const copy = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLElement>(null)
  useIsoLayoutEffect(() => {
    if (prefersReduced() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.to(copy.current, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 25%', scrub: 0.6 } })
    }, root)
    return () => ctx.revert()
  }, [])
  const hasVideo = HERO_VIDEO in (videos as object)
  return (
    <section ref={root} className="hero theme-deep" data-theme="dark" aria-labelledby="hero-h">
      <div className="hero-cols" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.05}s` }} />)}
      </div>
      <div className="hero-stage">
        {hasVideo && <div className="hero-film"><Video id={HERO_VIDEO} priority cover /></div>}
        <div className="hero-scrim" />
      </div>
      <div ref={copy} className="hero-copy wrap">
        <Rise immediate className="t-label on-dark-mute mb-6">{h.Eyebrow}</Rise>
        <LineReveal as="h1" immediate delay={0.2} className="t-xl" id="hero-h">
          Automation,<br /> engineered like<br /> <span className="c-red">clockwork.</span>
        </LineReveal>
        <Rise immediate delay={0.55} as="p" className="t-lead mt-8 text-white/80">{h.Subhead}</Rise>
        <Rise immediate delay={0.75} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
          <MagneticButton href={`${import.meta.env.BASE_URL}contact`} className="btn btn-red" onClick={(e: React.MouseEvent) => spaNav(e, '/contact')}>
            {h['Primary CTA']} <Arrow />
          </MagneticButton>
          <TextLink to="/projects" className="text-white ml-2 sm:ml-6">{h['Secondary CTA']}</TextLink>
        </Rise>
      </div>
    </section>
  )
}

function Friction() {
  const pains = SERVICES.map((s) => ({ s, line: bullets(sec(s.copyId, 'problem').lines)[0] ?? '' }))
  const wheel = useRef<SVGGElement>(null)
  const root = useRef<HTMLElement>(null)
  const [on, setOn] = useState(-1)
  useIsoLayoutEffect(() => {
    if (prefersReduced() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.to(wheel.current, { rotate: 216, ease: 'none', transformOrigin: '50% 50%', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
    }, root)
    return () => ctx.revert()
  }, [])
  useEffect(() => {
    const rows = root.current?.querySelectorAll<HTMLElement>('.fr-row')
    if (!rows) return
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setOn(Number((e.target as HTMLElement).dataset.i))), { rootMargin: '-45% 0px -45% 0px' })
    rows.forEach((r) => io.observe(r))
    return () => io.disconnect()
  }, [])
  return (
    <section ref={root} className="sec theme-paper" data-theme="light" aria-labelledby="fr-h">
      <div className="wrap">
        <Idx n="01" label="The friction" />
        <div className="grid12 items-end gap-y-8">
          <div className="col-span-4 sm:col-span-6 lg:col-span-8">
            <Head className="t-l" as="h2">Sound familiar?</Head>
          </div>
          <div className="col-span-4 sm:col-span-2 lg:col-span-4 flex justify-end" aria-hidden>
            <svg viewBox="0 0 120 120" className="w-[88px] lg:w-[150px]" fill="none">
              <g ref={wheel}>
                {Array.from({ length: 15 }, (_, i) => {
                  const a = (i / 15) * Math.PI * 2
                  return <path key={i} d={`M${60 + 40 * Math.cos(a)} ${60 + 40 * Math.sin(a)} L${60 + 56 * Math.cos(a + 0.12)} ${60 + 56 * Math.sin(a + 0.12)} L${60 + 52 * Math.cos(a + 0.3)} ${60 + 52 * Math.sin(a + 0.3)}`} stroke="#171717" />
                })}
                <circle cx="60" cy="60" r="40" stroke="#171717" />
                <path d="M60 60 L60 24" stroke="#E2000F" strokeWidth="3" />
              </g>
              <circle cx="60" cy="60" r="4" fill="#171717" />
            </svg>
          </div>
        </div>
        <ol className="mt-12 lg:mt-16" id="fr-h-list" aria-labelledby="fr-h">
          {pains.map(({ s, line }, i) => (
            <li key={s.slug} className="fr-row" data-i={i} data-on={on === -1 || on === i ? '1' : '0'}>
              <span className="mark" aria-hidden />
              <span className="t-label c-mute tnum">{s.n}</span>
              <Rise as="p" className="t-h3 max-w-[34ch]">{line}</Rise>
              <Link to={`/services/${s.slug}`} className="t-small c-mute link-u hidden lg:block justify-self-end">{s.name}</Link>
            </li>
          ))}
        </ol>
        <span id="fr-h" className="sr-only">Common problems</span>
      </div>
    </section>
  )
}

function Thesis() {
  const closer = kv(sec('service-ai-receptionist', 'problem').lines).Closer
  const [a, b] = closer.split('. ')
  return (
    <div data-theme="dark" className="bg-paper">
      <SectionTransition variant="expand" className="theme-red sec">
        <div className="wrap grid12">
          <div className="col-span-4 sm:col-span-8 lg:col-span-10">
            <Idx n="02" label="The thesis" />
            <LineReveal className="t-l">{a + '.'}</LineReveal>
            <Rise as="p" className="t-h3 mt-10 max-w-[30ch] text-white" delay={0.15}>{b}</Rise>
          </div>
        </div>
      </SectionTransition>
    </div>
  )
}

function ServicesRail() {
  const s = kv(sec('home', 'services').lines)
  const items = SERVICES.map((v) => (
    <article className="rail-card" key={v.slug}>
      <span className="t-num c-steel text-[clamp(3rem,6vw,5.5rem)]">{v.n}</span>
      <MediaSlot variant={v.key} video={`svc-${v.slug}`} image={`svc-${v.slug}`} ratio="4 / 3" caption={`Fig. ${v.n}  ${v.name}`} />
      <h3 className="t-h3">{v.name}</h3>
      <p>{v.short}</p>
      <Link to={`/services/${v.slug}`} className="lnk text-white" aria-label={`${s['Row CTA']}: ${v.name}`}>{s['Row CTA']} <Arrow /></Link>
    </article>
  ))
  return (
    <section className="sec theme-dark" data-theme="dark" aria-labelledby="svc-h" id="services">
      <div className="wrap">
        <Idx n="03" label={s['Section label']} />
        <div className="grid12 gap-y-6">
          <Head className="t-l col-span-4 sm:col-span-8 lg:col-span-7">{s.Headline}</Head>
          <Rise as="p" className="t-lead on-dark-mute col-span-4 sm:col-span-8 lg:col-span-4 lg:col-start-9 self-end">{s.Intro}</Rise>
        </div>
        <span id="svc-h" className="sr-only">{s.Headline}</span>
      </div>
      <div className="mt-14 lg:mt-20">
        <HorizontalRail label="Services" items={items} itemWidth="min(84vw, 460px)" gap="0px" />
      </div>
      <div className="wrap mt-12">
        <TextLink to="/services" className="text-white">{s['Section CTA']}</TextLink>
      </div>
    </section>
  )
}

function Pillars() {
  const root = useRef<HTMLElement>(null)
  useIsoLayoutEffect(() => {
    if (prefersReduced() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.pillar .bar', { scaleX: 0, duration: 1.2, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  const variants = ['inbox', 'reporting', 'gears'] as const
  return (
    <section ref={root} className="sec theme-white" data-theme="light" aria-labelledby="pl-h">
      <div className="wrap">
        <Idx n="04" label={kv(sec('home', 'pillars').lines)['Section label']} />
        <h2 id="pl-h" className="sr-only">What we build</h2>
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          {PILLARS.map((p, i) => (
            <article key={p.label} className="pillar" style={{ marginTop: i === 1 ? 'clamp(0px, 6vw, 96px)' : i === 2 ? 'clamp(0px, 3vw, 48px)' : 0 }}>
              <p className="t-label c-mute">0{i + 1} / {p.label}</p>
              <MediaSlot variant={variants[i]} light ratio="16 / 10" className="mt-6" />
              <span className="bar block" style={{ width: `${[72, 46, 88][i]}%` }} aria-hidden />
              <Head as="h3" className="t-h3 mt-6">{p.headline}</Head>
              <Rise as="p" className="mt-4 c-mute">{p.body}</Rise>
              <ul className="mt-6">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Process() {
  const p = kv(sec('home', 'process').lines)
  const st = steps(sec('home', 'process').lines)
  return (
    <section className="sec theme-paper" data-theme="light" aria-labelledby="pr-h" id="process">
      <div className="wrap">
        <Idx n="05" label={p['Section label']} />
        <div className="grid12 gap-y-6">
          <Head className="t-l col-span-4 sm:col-span-8 lg:col-span-7">{p.Headline}</Head>
          <Rise as="p" className="t-lead c-mute col-span-4 sm:col-span-8 lg:col-span-4 lg:col-start-9 self-end">{p.Intro}</Rise>
        </div>
        <span id="pr-h" className="sr-only">{p.Headline}</span>
        <div className="mt-14">
          <PinnedProcess label={p.Headline} steps={st.map((s, i) => ({ title: s.title, body: s.body, visual: <Dial step={i} /> }))} />
        </div>
        <div className="mt-12"><TextLink to="/approach">{p.CTA}</TextLink></div>
      </div>
    </section>
  )
}

function Band() {
  return (
    <div data-theme="dark" className="theme-deep">
      <SectionTransition variant="expand" className="band">
        <MediaSlot variant="gears" video="band-precision" ratio="fill" className="absolute inset-0 h-full w-full" />
        <div className="band-scrim" aria-hidden />
        <div className="wrap band-copy">
          <p className="t-label on-dark-mute mb-6">Zeitwerk is German for clockwork</p>
          <LineReveal className="t-giant max-w-[14ch] text-white">Engineered with the same care as a fine timepiece.</LineReveal>
        </div>
      </SectionTransition>
    </div>
  )
}

function Figure({ v }: { v: string }) {
  const f = parseFigure(v)
  if (!f) return <>{v}</>
  return <Counter value={f.value} prefix={f.prefix} suffix={f.suffix} source="zeitwerk.ca case study page (live, 2026-11-15)" />
}

function Proof() {
  const s = sec('home', 'proof')
  const head = kv(s.lines)
  const foot = kv(Object.values(s.items)[1] ?? [])
  return (
    <section className="sec theme-deep" data-theme="dark" aria-labelledby="pf-h">
      <div className="wrap">
        <Idx n="06" label={head['Section label']} />
        <Head className="t-l" >{head.Headline}</Head>
        <span id="pf-h" className="sr-only">{head.Headline}</span>
        <div className="mt-12">
          {CASES.map((c, i) => (
            <article key={c.slug} className={`case-row ${i % 2 ? 'case-row--flip' : ''}`}>
              <ImageReveal ratio="3 / 2" from={i % 2 ? 'right' : 'left'} curtain="#E2000F">
                <MediaSlot variant={c.visual} image={i ? 'case-collections-engine' : 'case-property-intelligence'} ratio="fill" className="absolute inset-0 h-full w-full" caption={`Fig. 0${i + 1}  Illustrative`} />
              </ImageReveal>
              <div>
                <p className="t-label c-steel">{c.sector}</p>
                <h3 className="t-h2 mt-4"><Link to={`/projects/${c.slug}`} className="link-u">{c.name}</Link></h3>
                <p className="mt-5 text-white/75 max-w-[48ch]">{c.line}</p>
                <div className="fig-grid">
                  {c.figures.slice(0, 4).map((f) => (
                    <div key={f.label}>
                      <span className="v"><Figure v={f.value} /></span>
                      <span className="k">{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8"><TextLink to={`/projects/${c.slug}`} className="text-white">Read the case study</TextLink></div>
              </div>
            </article>
          ))}
        </div>
        <p className="t-small c-steel mt-4">{foot.Footnote}</p>
      </div>
    </section>
  )
}

function AlsoBuilt() {
  return (
    <section className="sec theme-paper" data-theme="light" aria-labelledby="ab-h">
      <div className="wrap">
        <Idx n="07" label="Also built" />
        <div className="grid12 gap-y-6">
          <Head className="t-l col-span-4 sm:col-span-8 lg:col-span-7">More systems in production.</Head>
          <Rise as="p" className="t-lead c-mute col-span-4 sm:col-span-8 lg:col-span-4 lg:col-start-9 self-end">Each one replaced a manual process. Client details anonymized.</Rise>
        </div>
        <span id="ab-h" className="sr-only">Also built</span>
      </div>
      <div className="mt-14 lg:mt-20">
        <ProjectRail items={MORE} label="More projects" />
      </div>
      <div className="wrap mt-12"><TextLink to="/projects">All projects</TextLink></div>
    </section>
  )
}

function Where() {
  const l = kv(sec('home', 'local').lines)
  return (
    <section className="sec theme-dark" data-theme="dark" aria-labelledby="wh-h">
      <div className="wrap">
        <Idx n="08" label="Where" />
        <div className="grid12 gap-y-12 items-center">
          <div className="col-span-4 sm:col-span-8 lg:col-span-6">
            <Head className="t-h1" >{l.Headline}</Head>
            <span id="wh-h" className="sr-only">{l.Headline}</span>
            <Rise as="p" className="t-lead on-dark-mute mt-8">Zeitwerk is a consulting and implementation firm based in Vaughan, Ontario. {SITE.areaServed}</Rise>
            <ul className="mt-10 border-t border-line-dark">
              {SITE.cities.map((c, i) => (
                <Rise as="li" key={c} delay={i * 0.05} className="flex items-center justify-between border-b border-line-dark py-3">
                  <span className={`t-h4 ${c === 'Vaughan' ? 'c-red' : ''}`}>{c}</span>
                  <span className="t-label c-steel tnum">0{i + 1}</span>
                </Rise>
              ))}
            </ul>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-6">
            <DrawLine mode="scrub" selector=".draw" start="top 85%" end="center 45%">
              <div className="aspect-[4/3] w-full"><Gta /></div>
            </DrawLine>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const c = kv(sec('home', 'cta').lines)
  return (
    <>
      <Hero />
      <Friction />
      <Thesis />
      <ServicesRail />
      <Pillars />
      <Process />
      <Band />
      <Proof />
      <AlsoBuilt />
      <Where />
      <CtaBlock n="09" headline={c.Headline} body={c.Body} cta={c['Primary CTA']} />
    </>
  )
}

export { Schematic }
