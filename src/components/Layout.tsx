import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SmoothScroll, ScrollTrigger } from '../motion'
import Seo from '../lib/Seo'
import Footer from './Footer'
import Header from './Header'

/** App shell: skip link, opaque sticky header, <main id="main">, footer, per-route <head>, Lenis. */
export default function Layout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    const l = window.__lenis
    if (l) l.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
    const t = setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return (
    <SmoothScroll anchorOffset={-64}>
      <a href="#main" className="skip-link">Skip to content</a>
      <Seo />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </SmoothScroll>
  )
}
