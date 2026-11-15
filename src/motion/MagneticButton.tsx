import { useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useFinePointer, useReducedMotion } from './env'

type Common = {
  children: ReactNode
  /** Pull strength 0..1 (fraction of pointer offset). Default 0.3 */
  strength?: number
  className?: string
}
export type MagneticButtonProps =
  | (Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'>)
  | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>)

/**
 * Square-edged CTA that leans toward the pointer (spring), label leans a little further.
 * Only on hover-capable fine pointers and when motion is allowed; otherwise a normal link/button.
 * Renders <a> when href is set, else <button type="button">. Styling via className / .mk-magnetic.
 */
export function MagneticButton({ children, strength = 0.3, className = '', ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const on = fine && !reduce
  const cfg = { stiffness: 220, damping: 18, mass: 0.35 }
  const x = useSpring(0, cfg)
  const y = useSpring(0, cfg)
  const lx = useSpring(0, cfg)
  const ly = useSpring(0, cfg)
  const move = (e: React.PointerEvent) => {
    if (!on || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    x.set(dx * strength)
    y.set(dy * strength)
    lx.set(dx * strength * 0.35)
    ly.set(dy * strength * 0.35)
  }
  const leave = () => [x, y, lx, ly].forEach((m) => m.set(0))
  const inner = (
    <motion.span className="mk-magnetic-label" style={on ? { x: lx, y: ly } : undefined}>
      {children}
    </motion.span>
  )
  const cls = `mk-magnetic ${className}`
  return (
    <motion.span ref={ref} className="mk-magnetic-wrap" style={on ? { x, y } : undefined} onPointerMove={move} onPointerLeave={leave} data-mk="magnetic">
      {'href' in rest && rest.href !== undefined ? (
        <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={cls}>
          {inner}
        </a>
      ) : (
        <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cls}>
          {inner}
        </button>
      )}
    </motion.span>
  )
}
