import { bullets, kv, sec } from '../content/copy'
import { PROCESS, SITE } from '../data/site'
import { LineReveal, PinnedProcess } from '../motion'
import MediaSlot from '../components/MediaSlot'
import { Dial } from '../components/Dial'
import { Gta } from '../components/Schematic'
import { CtaBlock, Head, Idx, Rise } from '../components/ui'

export default function Approach() {
  const h = kv(sec('approach', 'hero').lines)
  const a = sec('approach', 'about').lines
  const ak = kv(a)
  const body = a.filter((l) => l.startsWith('Body: ')).map((l) => l.slice(6))
  const st = kv(sec('approach', 'stages').lines)
  const pr = sec('approach', 'principles').lines
  const cta = kv(sec('approach', 'cta').lines)
  return (
    <>
      <section className="theme-deep" data-theme="dark" aria-labelledby="ah-h">
        <div className="wrap grid12 gap-y-10 pt-[clamp(48px,8vw,128px)] pb-[clamp(56px,8vw,120px)] items-end">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7">
            <Rise immediate className="t-label c-steel mb-8">{h.Eyebrow}</Rise>
            <LineReveal as="h1" immediate className="t-xl" id="ah-h">{h.Headline}</LineReveal>
            <Rise immediate delay={0.4} as="p" className="t-lead mt-8 on-dark-mute">{h.Subhead}</Rise>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <MediaSlot variant="gears" image="about-workbench" ratio="4 / 5" sweep caption="Fig. 00  The movement" />
          </div>
        </div>
      </section>

      <section className="sec theme-paper" data-theme="light" aria-labelledby="ab-h">
        <div className="wrap grid12 gap-y-10">
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <Idx n="01" label={ak.Label} />
            <Head className="t-h1">{ak.Headline}</Head>
            <span id="ab-h" className="sr-only">{ak.Headline}</span>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7 lg:pt-24">
            {body.map((p) => <Rise key={p} as="p" className="t-lead mb-6">{p}</Rise>)}
            <Rise as="p" className="mt-8 border-t border-line pt-5 t-h4">Founded by Nauman Khan, Systems Architect.</Rise>
          </div>
        </div>
      </section>

      <section className="sec theme-white" data-theme="light" aria-labelledby="sg-h">
        <div className="wrap">
          <Idx n="02" label={st.Label} />
          <Head className="t-l">{st.Headline}</Head>
          <span id="sg-h" className="sr-only">{st.Headline}</span>
          <div className="mt-14">
            <PinnedProcess label={st.Headline} steps={PROCESS.map((p, i) => ({ title: p.title, body: `${p.body} You get: ${p.get}`, visual: <Dial step={i} /> }))} />
          </div>
        </div>
      </section>

      <section className="sec theme-dark" data-theme="dark" aria-labelledby="pp-h">
        <div className="wrap">
          <Idx n="03" label={kv(pr).Label} />
          <h2 id="pp-h" className="t-h1 max-w-[18ch]">How we decide.</h2>
          <ol className="mt-14 grid gap-x-10 lg:grid-cols-2">
            {bullets(pr).map((p, i) => {
              const [lead, ...rest] = p.split('. ')
              return (
                <Rise as="li" key={p} delay={(i % 2) * 0.08} className={`border-t border-line-dark py-8 ${i % 2 ? 'lg:mt-20' : ''}`}>
                  <span className="t-label c-red tnum">0{i + 1}</span>
                  <h3 className="t-h3 mt-4">{lead}.</h3>
                  <p className="mt-3 on-dark-mute">{rest.join('. ')}</p>
                </Rise>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="sec theme-paper" data-theme="light" aria-labelledby="ar-h">
        <div className="wrap grid12 gap-y-10 items-center">
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <Idx n="04" label="Area" />
            <Head className="t-h1">On site or remote.</Head>
            <span id="ar-h" className="sr-only">Service area</span>
            <Rise as="p" className="t-lead mt-8 c-mute">{SITE.areaServed}</Rise>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7 aspect-[4/3]"><Gta light /></div>
        </div>
      </section>

      <CtaBlock headline={cta.Headline} body={cta.Body} cta={cta['Primary CTA']} />
    </>
  )
}
