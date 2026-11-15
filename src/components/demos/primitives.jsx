import { motion } from 'framer-motion'

export const INK = '#171717'
export const RED = '#E2000F'
export const LINE = '#d4d4d4'
export const SOFT = '#e5e5e5'
export const MUTED = '#737373'
export const PAPER = '#ffffff'
export const EASE = [0.22, 1, 0.36, 1]

/** Fade + straight rise. Never rotates or skews. */
export function Reveal({ show, delay = 0, rise = 8, children, ...rest }) {
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : rise }}
      transition={{ duration: 0.6, ease: EASE, delay: show ? delay : 0 }}
      {...rest}
    >
      {children}
    </motion.g>
  )
}

/** Hairline path that draws itself. */
export function Draw({ show, d, delay = 0, stroke = INK, width = 1, dash, duration = 0.9 }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash}
      vectorEffect="non-scaling-stroke"
      initial={false}
      animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
      transition={{ duration, ease: EASE, delay: show ? delay : 0 }}
    />
  )
}

/** Small uppercase label. */
export function Label({ x, y, children, fill = MUTED, anchor = 'start' }) {
  return (
    <text x={x} y={y} className="zwd-label" fill={fill} textAnchor={anchor}>
      {children}
    </text>
  )
}

export function Text({ x, y, children, size = 16, fill = INK, weight = 500, anchor = 'start', ...rest }) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} className="zwd-text" {...rest}>
      {children}
    </text>
  )
}

/** Hairline box (square corners, no fill by default). */
export function Box({ x, y, w, h, fill = 'none', stroke = LINE, ...rest }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={1} vectorEffect="non-scaling-stroke" {...rest} />
}

/** Straight check mark (stroke), drawn in. */
export function Tick({ x, y, show, delay = 0, color = RED }) {
  return <Draw show={show} delay={delay} stroke={color} width={1.6} d={`M${x} ${y} l4 4 l8 -9`} duration={0.4} />
}
