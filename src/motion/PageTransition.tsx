import { useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE, prefersReduced, useIsoLayoutEffect } from './env'
import { scrollToTarget } from './SmoothScroll'

type VTDoc = Document & { startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> } }

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof (document as VTDoc).startViewTransition === 'function'
}

/**
 * Run a route change inside the View Transitions API (CSS in motion.css: old page fades + lifts,
 * new page wipes up behind a red hairline - straight motion only). Falls back to a plain update
 * (the <PageTransition> wrapper then animates). Scrolls to top inside the transition.
 *   startPageTransition(() => navigate('/projects'))
 */
export function startPageTransition(update: () => void, { scrollTop = true } = {}): Promise<void> {
  const run = () => {
    flushSync(update)
    if (scrollTop) scrollToTarget(0, true)
  }
  const d = document as VTDoc
  if (!supportsViewTransitions() || prefersReduced()) {
    run()
    return Promise.resolve()
  }
  document.documentElement.classList.add('mk-vt')
  const t = d.startViewTransition!(run)
  return t.finished.finally(() => document.documentElement.classList.remove('mk-vt'))
}

/** For react-router: const go = useTransitionNavigate(useNavigate()); go('/projects') */
export function useTransitionNavigate<T>(navigate: (to: T) => void) {
  return (to: T) => startPageTransition(() => navigate(to))
}

export type PageTransitionProps = {
  /** Changes on every route change (e.g. location.pathname). */
  transitionKey: string
  children: ReactNode
  className?: string
}

/**
 * Fallback wrapper for browsers without View Transitions: AnimatePresence mode="wait" (old page
 * leaves completely before the new one enters => no overlap). With VT support or reduced motion it
 * renders children untouched. Also gives the page a view-transition-name for the main region.
 */
export function PageTransition({ transitionKey, children, className = '' }: PageTransitionProps) {
  const [fallback, setFallback] = useState(false)
  useIsoLayoutEffect(() => setFallback(!supportsViewTransitions() && !prefersReduced()), [])
  if (!fallback)
    return (
      <div className={`mk-page ${className}`} data-mk="page" data-mode="vt">
        {children}
      </div>
    )
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={transitionKey} className={`mk-page ${className}`} data-mk="page" data-mode="fallback"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: EASE }}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
