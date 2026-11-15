import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV } from '../data/site'
import { Logo } from './Mark'
import MobileMenu from './MobileMenu'

/**
 * Opaque sticky header (never transparent, no blur). Swaps paper/ink to match the section under it
 * (sections carry data-theme="light|dark"), hides on scroll down after 400px, shows on scroll up,
 * and carries a 2px red page-progress line.
 */
export default function Header() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const bar = useRef<HTMLSpanElement>(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const run = () => {
      raf = 0
      const y = window.scrollY
      const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zw-header-h')) || 64
      const el = document.elementFromPoint(Math.min(40, window.innerWidth / 2), h + 4) as HTMLElement | null
      const t = el?.closest<HTMLElement>('[data-theme]')?.dataset.theme
      setTheme(t === 'dark' ? 'dark' : 'light')
      setScrolled(y > 8)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400)
        last = y
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      bar.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    run()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    const t = setTimeout(run, 300)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [pathname])

  return (
    <header className="hdr" data-theme={open ? 'light' : theme} data-scrolled={scrolled ? '1' : '0'} data-hidden={hidden && !open ? '1' : '0'}>
      <div className="wrap hdr-in">
        <Link to="/" aria-label="Zeitwerk home">
          <Logo dark={theme === 'dark' && !open} />
        </Link>
        <nav aria-label="Primary" className="hdr-nav">
          {NAV.filter((n) => n.to !== '/contact').map((n) => (
            <NavLink key={n.to} to={n.to} className="nav link-u">
              {n.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn">
            Book a consultation
          </Link>
        </nav>
        <button type="button" className="hdr-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 block h-[2px] w-6 bg-current transition-transform duration-300 ${open ? 'top-[5px] rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 block h-[2px] w-6 bg-current transition-transform duration-300 ${open ? 'top-[5px] -rotate-45' : 'top-[10px]'}`} />
          </span>
        </button>
      </div>
      <span ref={bar} className="hdr-progress" aria-hidden />
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  )
}
