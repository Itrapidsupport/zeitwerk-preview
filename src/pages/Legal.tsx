import legal from '../content/legal.json'
import { kv, page } from '../content/copy'
import { Idx } from '../components/ui'

/** Privacy / Terms: full text ported verbatim from live zeitwerk.ca (curl 2026-11-15); contact email shown as info@zeitwerk.ca per NK. */
export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const L = (legal as Record<string, { updated: string; html: string }>)[kind]
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service'
  void kv
  void page
  return (
    <section className="theme-paper" data-theme="light" aria-labelledby="lg-h">
      <div className="wrap pt-[clamp(48px,7vw,112px)] pb-[clamp(72px,9vw,144px)]">
        <Idx n="00" label="Legal" />
        <h1 id="lg-h" className="t-l">{title}</h1>
        <p className="t-label c-mute mt-6">Last updated: {L.updated}</p>
        <div className="legal mt-14" dangerouslySetInnerHTML={{ __html: L.html }} />
      </div>
    </section>
  )
}
