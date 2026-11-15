import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NAV, SERVICES, SITE } from '../data/site'
import { gsap, prefersReduced, useIsoLayoutEffect } from '../motion'
import { Mark } from './Mark'

function TorontoClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const tick = () => setT(f.format(new Date()))
    tick()
    if (prefersReduced()) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tnum" suppressHydrationWarning>{t || '--:--:--'}</span>
}

export default function Footer() {
  const word = useRef<HTMLDivElement>(null)
  useIsoLayoutEffect(() => {
    const el = word.current?.firstElementChild
    if (!el || prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.from(el, { yPercent: 102, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: word.current, start: 'top 98%', once: true } })
    })
    return () => ctx.revert()
  }, [])
  return (
    <footer className="ftr" data-theme="dark">
      <div className="ftr-gridlines" aria-hidden />
      <div className="wrap relative">
        <div className="ftr-grid">
          <div>
            <Mark size={44} dark />
            <p className="t-h3 mt-6 max-w-[22ch]">Automation, engineered like clockwork.</p>
            <a href={`mailto:${SITE.email}`} className="lnk mt-8 text-lg">{SITE.email}</a>
            <p className="t-small on-dark-mute mt-5 max-w-[46ch]">{SITE.areaServed}</p>
          </div>
          <div>
            <h2>Services</h2>
            <ul>{SERVICES.map((s) => <li key={s.slug}><Link className="l link-u" to={`/services/${s.slug}`}>{s.name}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>{NAV.map((n) => <li key={n.to}><Link className="l link-u" to={n.to}>{n.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Toronto time</h2>
            <p className="t-h4"><TorontoClock /></p>
            <h2 className="mt-8">Legal</h2>
            <ul>
              <li><Link className="l link-u" to="/privacy">Privacy</Link></li>
              <li><Link className="l link-u" to="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="ftr-word" ref={word} aria-hidden>
          <span>Zeitwerk<i>.</i></span>
        </div>
        <div className="ftr-base">
          <p>© 2026 Zeitwerk. {SITE.tagline}.</p>
          <p>Zeitwerk is German for clockwork.</p>
        </div>
      </div>
    </footer>
  )
}
