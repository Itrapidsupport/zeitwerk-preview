import { Link, useParams } from 'react-router-dom'
import { bullets, kv, kvAll, sec } from '../content/copy'
import { caseBySlug, CASES } from '../data/site'
import { Counter, LineReveal, ScrubScene } from '../motion'
import MediaSlot from '../components/MediaSlot'
import { parseFigure } from '../components/Dial'
import { CtaBlock, Idx, Rise, TextLink } from '../components/ui'
import NotFound from './NotFound'

export default function ProjectDetail() {
  const { slug } = useParams()
  const c = caseBySlug(slug)
  if (!c) return <NotFound />
  const id = c.copyId
  const h = kv(sec(id, 'hero').lines)
  const blocks = (['challenge', 'build', 'result'] as const).map((k) => ({ k, o: kv(sec(id, k).lines), body: kvAll(sec(id, k).lines, 'Body'), list: bullets(sec(id, k).lines) }))
  const stack = sec(id, 'stack').lines.find((l) => l.includes(' / ') && !l.startsWith('Label'))?.split(' / ') ?? []
  const rel = kv(sec(id, 'related').lines)
  const relLinks = (rel.Links ?? '').split(' / ').map((x) => x.split(' -> ')).filter((x) => x.length === 2)
  const cta = kv(sec(id, 'cta').lines)
  const next = CASES.find((x) => x.slug !== c.slug)!
  const i = CASES.indexOf(c)
  return (
    <>
      <section className="theme-deep" data-theme="dark" aria-labelledby="ch-h">
        <div className="wrap pt-[clamp(48px,8vw,128px)] pb-[clamp(40px,5vw,72px)]">
          <Rise immediate className="t-label c-steel mb-8">{h.Eyebrow}</Rise>
          <LineReveal as="h1" immediate className="t-l max-w-[16ch]" id="ch-h">{h.Headline}</LineReveal>
          <div className="grid12 mt-10 gap-y-6">
            <Rise immediate delay={0.4} as="p" className="t-lead on-dark-mute col-span-4 sm:col-span-6 lg:col-span-6">{h.Subhead}</Rise>
            <Rise immediate delay={0.5} as="p" className="t-small c-steel col-span-4 sm:col-span-6 lg:col-span-3 lg:col-start-10 self-end">{h.Footnote}</Rise>
          </div>
        </div>
        {/* C1 cover opens from a red line (scrubbed clip-path) */}
        <ScrubScene length={60} label="Project cover" timeline={(tl, q) => { tl.fromTo(q('.cover'), { clipPath: 'inset(49.6% 0% 49.6% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }) }}>
          <div className="wrap h-full flex items-center">
            <div className="cover relative w-full aspect-[4/5] sm:aspect-[21/9] max-h-[calc(100svh-var(--zw-header-h)-48px)] bg-[#E2000F]">
              <MediaSlot variant={c.visual} image={i ? 'case-collections-engine' : 'case-property-intelligence'} ratio="fill" className="absolute inset-0 h-full w-full" sweep caption="Illustrative visual, not client data" />
            </div>
          </div>
        </ScrubScene>
      </section>

      <section className="sec--tight theme-paper" data-theme="light" aria-label="Figures">
        <div className="wrap">
          <div className="fig-grid lg:!grid-cols-4">
            {c.figures.map((f) => {
              const p = parseFigure(f.value)
              return (
                <div key={f.label}>
                  <span className="v">{p ? <Counter value={p.value} prefix={p.prefix} suffix={p.suffix} source={`zeitwerk.ca/projects/${c.slug}`} /> : f.value}</span>
                  <span className="k">{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="sec theme-white" data-theme="light">
        <div className="wrap grid12 gap-y-12">
          <nav aria-label="On this page" className="col-span-4 sm:col-span-8 lg:col-span-3 hidden lg:block">
            <ol className="sticky-side t-label">
              {blocks.map((b, n) => <li key={b.k} className="border-t border-line py-3"><a href={`#${b.k}`} className="link-u"><span className="c-red tnum">0{n + 1}</span> {b.o.Label}</a></li>)}
            </ol>
          </nav>
          <div className="col-span-4 sm:col-span-8 lg:col-span-8 lg:col-start-5">
            {blocks.map((b, n) => (
              <article key={b.k} id={b.k} className={n ? 'mt-24' : ''}>
                <Idx n={`0${n + 1}`} label={b.o.Label} />
                <LineReveal className="t-h1">{b.o.Headline}</LineReveal>
                {b.body.map((p) => <Rise key={p} as="p" className="mt-6 t-body c-mute">{p}</Rise>)}
                {b.list.length > 0 && (
                  <ul className="mt-8 border-t border-line">
                    {b.list.map((l) => <Rise as="li" key={l} className="flex gap-4 border-b border-line py-4"><span className="red-tick mt-[.7em] flex-none" aria-hidden />{l}</Rise>)}
                  </ul>
                )}
                {n === 1 && <MediaSlot variant={c.visual === 'map' ? 'reporting' : 'receptionist'} ratio="16 / 9" className="mt-12" caption="Illustrative schematic" />}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec--tight theme-paper" data-theme="light" aria-labelledby="st-h">
        <div className="wrap">
          <p className="t-label c-mute mb-5" id="st-h">Technology</p>
          <ul className="stack-list">{stack.map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="mt-10 t-body">{rel.Body}</p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {relLinks.map(([label, to]) => <TextLink key={to} to={to}>{label}</TextLink>)}
          </div>
        </div>
      </section>

      <CtaBlock headline={cta.Headline} body={cta.Body} cta={cta['Primary CTA']} />

      <section className="theme-deep" data-theme="dark">
        <Link to={`/projects/${next.slug}`} className="wrap block py-16 group">
          <p className="t-label c-steel">Next case study</p>
          <p className="t-l mt-4 group-hover:text-[#ff2a36] transition-colors">{next.name}</p>
        </Link>
      </section>
    </>
  )
}
