import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { kv, sec } from '../content/copy'
import { CASES, MORE } from '../data/site'
import { ImageReveal, LineReveal } from '../motion'
import MediaSlot from '../components/MediaSlot'
import ProjectRail from '../components/ProjectRail'
import { CtaBlock, Idx, Rise, TextLink } from '../components/ui'

export default function Projects() {
  const h = kv(sec('projects', 'hero').lines)
  const cta = kv(sec('projects', 'cta').lines)
  const featured = sec('projects', 'featured').items
  const cats = useMemo(() => {
    const m = new Map<string, number>()
    MORE.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1))
    return [...m.entries()]
  }, [])
  const [f, setF] = useState('All')
  const rows = MORE.filter((p) => f === 'All' || p.category === f)
  return (
    <>
      <section className="theme-deep" data-theme="dark" aria-labelledby="ph-h">
        <div className="wrap pt-[clamp(48px,8vw,128px)] pb-[clamp(48px,6vw,96px)]">
          <Rise immediate className="t-label c-steel mb-8">{h.Eyebrow}</Rise>
          <LineReveal as="h1" immediate className="t-xl max-w-[12ch]" id="ph-h">{h.Headline}</LineReveal>
          <div className="grid12 mt-10 gap-y-6">
            <Rise immediate delay={0.4} as="p" className="t-lead on-dark-mute col-span-4 sm:col-span-6 lg:col-span-5">{h.Subhead}</Rise>
            <Rise immediate delay={0.5} as="p" className="t-small c-steel col-span-4 sm:col-span-6 lg:col-span-4 lg:col-start-9 self-end">{h.Footnote}</Rise>
          </div>
        </div>
      </section>

      <section className="sec theme-dark" data-theme="dark" aria-labelledby="pf-h">
        <div className="wrap">
          <Idx n="01" label="Featured" />
          <h2 id="pf-h" className="sr-only">Featured case studies</h2>
          {CASES.map((c, i) => {
            const it = kv(featured[c.name] ?? [])
            return (
              <article key={c.slug} className={`case-row ${i % 2 ? 'case-row--flip' : ''}`}>
                <ImageReveal ratio="3 / 2" from={i % 2 ? 'right' : 'left'} curtain="#E2000F">
                  <MediaSlot variant={c.visual} image={i ? 'case-collections-engine' : 'case-property-intelligence'} ratio="fill" className="absolute inset-0 h-full w-full" caption={`Fig. 0${i + 1}  Illustrative`} />
                </ImageReveal>
                <div>
                  <p className="t-label c-steel">{it.Sector}</p>
                  <h3 className="t-h1 mt-4"><Link to={`/projects/${c.slug}`} className="link-u">{c.name}</Link></h3>
                  <dl className="mt-8 grid gap-4 t-small">
                    <div><dt className="t-label c-steel">Before</dt><dd className="mt-1 text-white/80">{it.Before}</dd></div>
                    <div><dt className="t-label c-steel">Built</dt><dd className="mt-1 text-white/80">{it.Built}</dd></div>
                    <div><dt className="t-label c-steel">Figures</dt><dd className="mt-1 t-h4 tnum">{it.Figures}</dd></div>
                  </dl>
                  <div className="mt-8"><TextLink to={`/projects/${c.slug}`} className="text-white">Read the case study</TextLink></div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="sec theme-paper" data-theme="light" aria-labelledby="pm-h">
        <div className="wrap">
          <Idx n="02" label="More projects" />
          <h2 id="pm-h" className="t-h1">Also in production.</h2>
          <div role="tablist" aria-label="Filter projects" className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-line">
            {[['All', MORE.length] as [string, number], ...cats].map(([c, n]) => (
              <button key={c} role="tab" aria-selected={f === c} onClick={() => setF(c)} className={`relative -mb-px cursor-pointer border-b-2 py-3 font-medium ${f === c ? 'border-[#E2000F] text-ink' : 'border-transparent c-mute'}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)} <span className="tnum t-small c-mute">({n})</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-12" role="tabpanel" key={f}>
          <ProjectRail items={rows} label="More projects" />
        </div>
        <div className="wrap">
          <p className="t-small c-mute mt-8">Figures are estimated annual savings and time saved, as reported for each project.</p>
        </div>
      </section>

      <CtaBlock headline={cta.Headline} body={cta.Body} cta={cta['Primary CTA']} />
    </>
  )
}
