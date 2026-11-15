import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV, SITE } from '../data/site'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen opaque mobile menu.
 * - focus trap (Tab / Shift+Tab cycle inside the panel + the header toggle)
 * - Escape closes and returns focus to the toggle
 * - scroll lock on <html> (iOS-safe: position fixed + restore scrollY)
 * - <main>/<footer> marked inert while open
 */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const toggle = document.querySelector<HTMLButtonElement>('[aria-controls="mobile-menu"]')
    const y = window.scrollY
    const b = document.body.style
    const prev = { position: b.position, top: b.top, width: b.width }
    b.position = 'fixed'
    b.top = `-${y}px`
    b.width = '100%'
    const outside = Array.from(document.querySelectorAll<HTMLElement>('main, footer'))
    outside.forEach((el) => el.setAttribute('inert', ''))
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      // Manual cycling (also covers Safari/WebKit, which skips links on Tab by default).
      const items = [toggle, ...Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE))].filter(Boolean) as HTMLElement[]
      const i = items.indexOf(document.activeElement as HTMLElement)
      e.preventDefault()
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus()
    }
    // Belt and braces: pull focus back if anything outside receives it.
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Node
      if (panel.current && !panel.current.contains(t) && t !== toggle) panel.current.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocusIn)
      outside.forEach((el) => el.removeAttribute('inert'))
      Object.assign(b, prev)
      window.scrollTo(0, y)
      toggle?.focus({ preventScroll: true })
    }
  }, [open, onClose])

  return (
    <div
      id="mobile-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={!open}
      className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-paper md:hidden"
      style={{ top: 'var(--zw-header-h)' }}
    >
      <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <ul className="border-t border-line">
          {[{ to: '/', label: 'Home' }, ...NAV].map((n, i) => (
            <li key={n.to} className="border-b border-line" style={{ animation: open ? `zw-rise .6s ${80 + i * 50}ms var(--zw-ease-out) both` : undefined }}>
              <NavLink
                to={n.to}
                end={n.to === '/'}
                onClick={onClose}
                className={({ isActive }) => `flex items-baseline justify-between py-5 font-display text-[2rem] font-semibold tracking-[-0.03em] ${isActive ? 'text-red-ink' : 'text-ink'}`}
              >
                {n.label}
                <span aria-hidden className="text-sm font-medium text-mute">0{i + 1}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-10">
          <a href={`mailto:${SITE.email}`} className="text-lg font-medium underline decoration-line underline-offset-4">
            {SITE.email}
          </a>
          <p className="mt-2 text-sm text-mute">{SITE.locality}</p>
        </div>
      </nav>
    </div>
  )
}
