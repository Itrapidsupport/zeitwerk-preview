import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * Drives a demo as a looping state machine.
 * - Advances phase 0..count-1 only while the figure is in view.
 * - Holds the last phase, then loops.
 * - prefers-reduced-motion: returns the final (complete) phase, static.
 * - `forcePhase` (number) pins a phase (used by tests / screenshots).
 */
export function useDemoSteps(count, { interval = 2300, hold = 3600, forcePhase } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const pinned = typeof forcePhase === 'number' ? forcePhase : null

  useEffect(() => {
    if (pinned !== null || reduced || !inView) return
    const t = setTimeout(
      () => setPhase((p) => (p + 1) % count),
      phase === count - 1 ? hold : interval,
    )
    return () => clearTimeout(t)
  }, [phase, inView, reduced, pinned, count, interval, hold])

  const value = pinned !== null ? pinned : reduced ? count - 1 : phase
  return { ref, phase: value, reduced: !!reduced, interval, hold }
}
