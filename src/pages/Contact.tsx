import { kv, sec } from '../content/copy'
import { SITE } from '../data/site'
import { LineReveal } from '../motion'
import ContactForm from '../components/ContactForm'
import MediaSlot from '../components/MediaSlot'
import { Idx, Rise } from '../components/ui'

export default function Contact() {
  const h = kv(sec('contact', 'hero').lines)
  const f = kv(sec('contact', 'form').lines)
  const next = sec('contact', 'what-happens').lines.filter((l) => /^0\d /.test(l))
  return (
    <>
      <section className="theme-deep" data-theme="dark" aria-labelledby="ct-h">
        <div className="wrap grid12 gap-y-10 pt-[clamp(48px,8vw,128px)] pb-[clamp(56px,7vw,104px)] items-end">
          <div className="col-span-4 sm:col-span-8 lg:col-span-8">
            <Rise immediate className="t-label c-steel mb-8">{h.Eyebrow}</Rise>
            <LineReveal as="h1" immediate className="t-l" id="ct-h">{h.Headline}</LineReveal>
            <Rise immediate delay={0.4} as="p" className="t-lead mt-8 on-dark-mute">{h.Subhead}</Rise>
          </div>
          <div className="col-span-4 sm:col-span-8 lg:col-span-4">
            <MediaSlot variant="inbox" ratio="4 / 3" caption="Fig. 00  Your note, routed" />
          </div>
        </div>
      </section>

      <section className="sec theme-paper" data-theme="light" aria-labelledby="cf-h">
        <div className="wrap grid12 gap-y-14">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7">
            <Idx n="01" label="Write to us" />
            <h2 id="cf-h" className="t-h2 mb-10">{f.Intro}</h2>
            <ContactForm />
          </div>
          <aside className="col-span-4 sm:col-span-8 lg:col-span-4 lg:col-start-9">
            <Idx n="02" label="Prefer email?" />
            <a href={`mailto:${SITE.email}?subject=${encodeURIComponent('Free consultation')}`} className="lnk t-h3 break-all">{SITE.email}</a>
            <p className="t-label c-mute mt-12">Area</p>
            <p className="mt-3 c-mute">{SITE.areaServed}</p>
            <p className="t-label c-mute mt-12">What happens next</p>
            <ol className="mt-4 border-t border-line">
              {next.map((l) => (
                <li key={l} className="grid grid-cols-[40px_1fr] gap-2 border-b border-line py-4">
                  <span className="t-label c-red tnum pt-1">{l.slice(0, 2)}</span>
                  <span>{l.slice(3)}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  )
}
