import { Link } from 'react-router-dom'
import { kv, sec } from '../content/copy'
import { SERVICES } from '../data/site'
import { LineReveal, MagneticButton } from '../motion'
import MediaSlot from '../components/MediaSlot'
import { Arrow, CtaBlock, Idx, Rise, spaNav, TextLink } from '../components/ui'
import { CASES } from '../data/site'

export default function Services() {
  const h = kv(sec('services', 'hero').lines)
  const intro = kv(sec('services', 'intro').lines)
  const area = kv(sec('services', 'area').lines)
  const proof = kv(sec('services', 'proof-strip').lines)
  const cta = kv(sec('services', 'cta').lines)
  return (
    <>
      <section className="theme-deep" data-theme="dark" aria-labelledby="sh-h">
        <div className="wrap grid12 gap-y-10 pt-[clamp(48px,8vw,128px)] pb-[clamp(56px,8vw,120px)] items-end">
          <div className="col-span-4 sm:col-span-8 lg:col-span-8">
            <Rise immediate className="t-label c-steel mb-8">{h.Eyebrow}</Rise>
            <LineReveal as="h1" immediate className="t-l" id="sh-h">{h.Headline}</LineReveal>
            <Rise immediate delay={0.4} as="p" className="t-lead mt-8 on-dark-mute">{h.Subhead}</Rise>
            <Rise immediate delay={0.6} className="mt-10">
              <MagneticButton href={`${import.meta.env.BASE_URL}contact`} className="btn btn-red" onClick={(e: React.MouseEvent) => spaNav(e, '/contact')}>{h['Primary CTA']} <Arrow /></MagneticButton>
            </Rise>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-4">
            <MediaSlot variant="gears" ratio="4 / 5" sweep caption="Fig. 00  Six calibres" />
          </div>
        </div>
      </section>

      <section className="sec theme-paper" data-theme="light" aria-labelledby="si-h">
        <div className="wrap">
          <Idx n="01" label="Index" />
          <Rise as="p" className="t-h3 max-w-[40ch]">{intro.Body}</Rise>
          <h2 id="si-h" className="sr-only">Services</h2>
          <ol className="mt-16">
            {SERVICES.map((s) => (
              <li key={s.slug} className="svc-row">
                <span className="bar" aria-hidden />
                <span className="t-num c-red text-[clamp(2.5rem,4vw,4rem)]">{s.n}</span>
                <div>
                  <h3 className="t-h2"><Link to={`/services/${s.slug}`}>{s.name}</Link></h3>
                  <p className="mt-4 c-mute max-w-[44ch]">{s.promise}</p>
                </div>
                <ul className="t-small">
                  <li className="t-label c-mute mb-3">Removes</li>
                  {s.removes.map((r) => <li key={r} className="border-t border-line py-2">{r}</li>)}
                </ul>
                <div className="hidden lg:block">
                  <MediaSlot variant={s.key} video={`svc-${s.slug}`} image={`svc-${s.slug}`} ratio="4 / 3" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec theme-dark" data-theme="dark" aria-labelledby="sp-h">
        <div className="wrap grid12 gap-y-10 items-end">
          <div className="col-span-4 sm:col-span-8 lg:col-span-6">
            <Idx n="02" label="Proof" />
            <LineReveal className="t-h1" id="sp-h">{proof.Body}</LineReveal>
            <p className="mt-8 on-dark-mute t-body">{area.Body}</p>
            <div className="mt-10"><TextLink to="/projects" className="text-white">{proof.Link}</TextLink></div>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-5 lg:col-start-8 grid gap-6">
            {CASES.map((c) => (
              <Link key={c.slug} to={`/projects/${c.slug}`} className="block border-t border-line-dark pt-5 group">
                <p className="t-label c-steel">{c.sector}</p>
                <p className="t-h3 mt-2 group-hover:text-[#ff2a36] transition-colors">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock headline={cta.Headline} body={cta.Body} cta={cta['Primary CTA']} />
    </>
  )
}
