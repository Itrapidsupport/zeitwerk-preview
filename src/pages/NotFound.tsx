import { Link } from 'react-router-dom'
import { kv, sec } from '../content/copy'
import MediaSlot from '../components/MediaSlot'
import { Arrow, TextLink } from '../components/ui'

export default function NotFound() {
  const m = kv(sec('404', 'main').lines)
  return (
    <section className="theme-deep" data-theme="dark" aria-labelledby="nf-h">
      <div className="wrap grid12 gap-y-10 items-center pt-[clamp(48px,8vw,128px)] pb-[clamp(72px,9vw,144px)] min-h-[calc(100svh-var(--zw-header-h))]">
        <div className="col-span-4 sm:col-span-8 lg:col-span-7">
          <p className="t-label c-red tnum">{m.Eyebrow}</p>
          <h1 id="nf-h" className="t-l mt-6">{m.Headline}</h1>
          <p className="t-lead on-dark-mute mt-8">{m.Body}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link to="/" className="btn btn-red">{m['Primary CTA']} <Arrow /></Link>
            <TextLink to="/services" className="text-white">{m['Secondary CTA']}</TextLink>
            <TextLink to="/contact" className="text-white">{m['Tertiary link']}</TextLink>
          </div>
        </div>
        <div className="col-span-4 sm:col-span-8 lg:col-span-5">
          <MediaSlot variant="gears" ratio="1 / 1" caption="Out of sync" />
        </div>
      </div>
    </section>
  )
}
