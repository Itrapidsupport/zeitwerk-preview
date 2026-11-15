import { Link, useParams } from 'react-router-dom'
import { ReceptionistDemo, QuoteDemo, InvoiceDemo, InboxDemo, DocumentDemo, ReportingDemo } from '../components/demos'
import { bullets, faqs, kv, links, sec, steps } from '../content/copy'
import { serviceBySlug, SERVICES, SITE } from '../data/site'
import { useState, type ComponentType } from 'react'
import { ImageReveal, LineReveal, MagneticButton, ScrubScene, useMedia, useReducedMotion } from '../motion'
import MediaSlot from '../components/MediaSlot'
import { Arrow, CtaBlock, Head, Idx, Rise, spaNav, TextLink } from '../components/ui'
import NotFound from './NotFound'

const DEMOS = { receptionist: ReceptionistDemo, quote: QuoteDemo, invoice: InvoiceDemo, inbox: InboxDemo, document: DocumentDemo, reporting: ReportingDemo }

export default function ServiceDetail() {
  const { slug } = useParams()
  const s = serviceBySlug(slug)
  if (!s) return <NotFound />
  const id = s.copyId
  const hero = kv(sec(id, 'hero').lines)
  const prob = kv(sec(id, 'problem').lines)
  const pains = bullets(sec(id, 'problem').lines)
  const how = steps(sec(id, 'how').lines)
  const howK = kv(sec(id, 'how').lines)
  const who = kv(sec(id, 'who').lines)
  const whoL = bullets(sec(id, 'who').lines)
  const proof = kv(sec(id, 'proof').lines)
  const fq = faqs(sec(id, 'faq').lines)
  const rel = links(sec(id, 'related').lines)
  const cta = kv(sec(id, 'cta').lines)
  const Demo = DEMOS[s.key]
  const [eyebrowN] = (hero.Eyebrow ?? '').split(' / ')
  return (
    <>
      {/* S1 hero */}
      <section className="theme-paper" data-theme="light" aria-labelledby="sv-h">
        <div className="wrap grid12 gap-y-10 pt-[clamp(40px,7vw,104px)] pb-[clamp(56px,8vw,120px)] items-end">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7">
            <nav aria-label="Breadcrumb" className="t-label c-mute mb-8">
              <Link to="/services" className="link-u">Services</Link> <span aria-hidden>/</span> <span className="c-red tnum">{eyebrowN}</span>
            </nav>
            <LineReveal as="h1" immediate className="t-l" id="sv-h">{hero.Headline}</LineReveal>
            <Rise immediate delay={0.4} as="p" className="t-lead mt-8 c-mute">{hero.Subhead}</Rise>
            <Rise immediate delay={0.6} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <MagneticButton href={`${import.meta.env.BASE_URL}contact`} className="btn btn-red" onClick={(e: React.MouseEvent) => spaNav(e, '/contact')}>
                {hero['Primary CTA']} <Arrow />
              </MagneticButton>
              <a href={`mailto:${SITE.email}`} className="lnk">{SITE.email}</a>
            </Rise>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <ImageReveal ratio="4 / 5" from="up" curtain="#E2000F">
              <MediaSlot variant={s.key} video={`svc-${s.slug}`} image={`svc-${s.slug}`} ratio="fill" className="absolute inset-0 h-full w-full" sweep caption={`Fig. ${s.n}  ${s.name}`} />
            </ImageReveal>
          </div>
        </div>
      </section>

      {/* S2 problem */}
      <section className="sec theme-dark" data-theme="dark" aria-labelledby="pb-h">
        <div className="wrap grid12 gap-y-10">
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <Idx n="01" label={prob['Section label']} />
            <Head className="t-h1" >{prob.Headline}</Head>
            <span id="pb-h" className="sr-only">{prob.Headline}</span>
            <Rise as="p" className="mt-8 on-dark-mute t-body">{prob.Body}</Rise>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7 lg:pt-24">
            <p className="t-label c-steel mb-4">{prob['List label']}</p>
            <ol className="border-t border-line-dark">
              {pains.map((p, i) => (
                <Rise as="li" key={p} delay={i * 0.04} className="grid grid-cols-[44px_1fr] gap-3 border-b border-line-dark py-5">
                  <span className="t-label c-red tnum pt-1">0{i + 1}</span>
                  <span className="t-h4">{p}</span>
                </Rise>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* S3 thesis */}
      <section className="theme-red sec--tight" data-theme="dark">
        <div className="wrap">
          <LineReveal className="t-h1 max-w-[24ch]">{prob.Closer}</LineReveal>
        </div>
      </section>

      {/* S4 how it works + live demo (lane 10) */}
      <section className="sec theme-white" data-theme="light" aria-labelledby="hw-h">
        <div className="wrap">
          <Idx n="02" label={howK['Section label']} />
          <div className="grid12 gap-y-6">
            <Head className="t-h1 col-span-4 sm:col-span-8 lg:col-span-7">{howK.Intro}</Head>
          </div>
          <span id="hw-h" className="sr-only">{howK['Section label']}</span>
          <ol className="mt-14 grid gap-x-8 lg:grid-cols-2">
            {how.map((st, i) => (
              <Rise as="li" key={st.n} delay={(i % 2) * 0.08} className={`border-t border-line py-8 ${i % 2 ? 'lg:mt-24' : ''}`}>
                <span className="t-num c-steel text-[clamp(3rem,5vw,4.5rem)]">{st.n}</span>
                <h3 className="t-h3 mt-5">{st.title}</h3>
                <p className="mt-3 c-mute t-body">{st.body}</p>
              </Rise>
            ))}
          </ol>
        </div>
      </section>

      {/* S4b the service demo (lane 10), staged as a full-bleed pinned scene scrubbed by scroll */}
      <section className="theme-deep sec pb-0" data-theme="dark" aria-labelledby="dm-h">
        <div className="wrap">
          <Idx n="03" label="See it run" />
          <LineReveal className="t-giant" id="dm-h">See it run.</LineReveal>
          <Rise as="p" className="t-lead on-dark-mute mt-8">Scroll to step through the system. Illustrative sample data.</Rise>
        </div>
        <div className="mt-14 lg:mt-20">
          <ScrollDemo Demo={Demo} steps={s.key === 'invoice' ? 5 : 4} />
        </div>
      </section>

      {/* S5 built for + proof */}
      <section className="sec theme-paper" data-theme="light" aria-labelledby="wf-h">
        <div className="wrap grid12 gap-y-12">
          <div className="col-span-4 sm:col-span-8 lg:col-span-6">
            <Idx n="04" label={who['Section label']} />
            <Head className="t-h1">{who.Headline}</Head>
            <span id="wf-h" className="sr-only">{who.Headline}</span>
            <ul className="mt-10 border-t border-line">
              {whoL.map((w, i) => (
                <Rise as="li" key={w} delay={i * 0.05} className="flex gap-4 border-b border-line py-4 t-h4">
                  <span className="red-tick mt-[.7em] flex-none" aria-hidden />
                  {w}
                </Rise>
              ))}
            </ul>
          </div>
          {proof.Title ? (
            <div className="col-span-4 sm:col-span-8 lg:col-span-5 lg:col-start-8 self-end">
              <Link to={proof.Link ?? '/projects'} className="block theme-deep p-8 group">
                <p className="t-label c-steel">{proof.Label}</p>
                <MediaSlot variant={proof.Link?.includes('collections') ? 'sms' : 'map'} ratio="16 / 10" className="mt-6" />
                <h3 className="t-h3 mt-6 group-hover:text-[#ff2a36] transition-colors">{proof.Title}</h3>
                <p className="mt-3 text-white/75">{proof.Line}</p>
                <span className="lnk mt-6">{proof.CTA} <Arrow /></span>
              </Link>
            </div>
          ) : (
            <div className="col-span-4 sm:col-span-8 lg:col-span-5 lg:col-start-8 self-end">
              <MediaSlot variant="gears" ratio="4 / 3" caption="Fig. Mechanism" />
            </div>
          )}
        </div>
      </section>

      {/* S6 FAQ */}
      <section className="sec theme-white" data-theme="light" aria-labelledby="fq-h">
        <div className="wrap grid12 gap-y-10">
          <div className="col-span-4 sm:col-span-8 lg:col-span-4">
            <Idx n="05" label="Questions" />
            <Head className="t-h1">Asked before every project.</Head>
            <span id="fq-h" className="sr-only">Frequently asked questions</span>
          </div>
          <div className="faq col-span-4 sm:col-span-8 lg:col-span-7 lg:col-start-6">
            {fq.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}<span className="pm" aria-hidden /></summary>
                <p className="a">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* S7 related */}
      <section className="sec--tight theme-dark" data-theme="dark" aria-labelledby="rl-h">
        <div className="wrap">
          <p className="t-label c-steel" id="rl-h">Pairs well with</p>
          <ul className="mt-6 border-t border-line-dark">
            {rel.map((r) => {
              const o = SERVICES.find((x) => r.to.endsWith(x.slug))
              return (
                <li key={r.to} className="border-b border-line-dark">
                  <Link to={r.to} className="flex items-baseline justify-between gap-6 py-6 group">
                    <span className="t-h2 group-hover:text-[#ff2a36] transition-colors">{r.label}</span>
                    <span className="t-label c-steel tnum">{o?.n}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-10"><TextLink to="/services" className="text-white">All services</TextLink></div>
        </div>
      </section>

      <CtaBlock headline={cta.Headline} body={cta.Body} cta={cta['Primary CTA']} />
    </>
  )
}

/** Desktop: pinned white stage over ink, the demo's phase is driven by scroll (forcePhase). Touch/reduced: native loop. */
function ScrollDemo({ Demo, steps: n }: { Demo: ComponentType<{ forcePhase?: number }>; steps: number }) {
  const wide = useMedia('(min-width: 1024px)')
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  if (!wide || reduced)
    return (
      <div className="theme-white py-10 demo-wrap">
        <div className="wrap"><Demo /></div>
      </div>
    )
  return (
    <ScrubScene className="theme-white" length={n * 45} label="Service demo" scrub={0.4} onProgress={(p) => setPhase(Math.min(n - 1, Math.floor(p * n * 0.999)))} stageClassName="theme-white">
      <div className="wrap h-full flex flex-col justify-center scene-demo">
        <div className="flex items-center gap-4 mb-2" aria-hidden>
          {Array.from({ length: n }, (_, i) => <span key={i} className="h-[3px] flex-1 transition-colors duration-500" style={{ background: i <= phase ? '#E2000F' : '#e5e5e5' }} />)}
        </div>
        <Demo forcePhase={phase} />
      </div>
    </ScrubScene>
  )
}
